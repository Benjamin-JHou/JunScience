import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { PythonRunnerTool } from '../execution/PythonRunnerTool.js';
import { globalClinicalDataGate } from '../../privacy/ClinicalDataGate.js';
import fs from 'node:fs';

export interface ClinicalNlpInput {
  clinicalText: string;
  extractEntities?: boolean;
  detectNegation?: boolean;
}

export const ClinicalNlpTool: ToolDefinition<ClinicalNlpInput> = {
  name: 'clinical_nlp_analyze',
  description: 'Process unstructured clinical records, discharge summaries, or EHR notes strictly within the local Python sandbox. Performs clinical Named Entity Recognition (NER), Negation Detection (e.g. distinguishing "denies chest pain" from "active chest pain"), and structured assertion status mapping.',
  category: 'medical',
  requiredPermission: 'READ',
  inputSchema: {
    type: 'object',
    properties: {
      clinicalText: { type: 'string', description: 'De-identified clinical narrative text (e.g. MTSamples excerpt)' },
      extractEntities: { type: 'boolean', description: 'Extract medical entities (diseases, drugs, anatomy)' },
      detectNegation: { type: 'boolean', description: 'Detect clinical negation and assertion status' },
    },
    required: ['clinicalText'],
  },
  async execute(input: ClinicalNlpInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawText = input.clinicalText.trim();
    context.reportProgress('Executing local Clinical NLP and Negation analysis inside Python Sandbox...', 20);

    const pythonScript = `
import json
import re

text = """${rawText.replace(/"""/g, '\\"\\"\\"')}"""

# Clinical entity dictionary patterns (Lightweight CPU regex-based medical NER)
ENTITY_PATTERNS = {
    "CONDITION": [
        r"\\b(?:lupus|psoriasis|hypertension|diabetes|pneumonia|nephritis|cardiomyopathy|arrhythmia|stroke|infarction|edema|rash|fever|dyspnea|chest pain|cough)\\b"
    ],
    "MEDICATION": [
        r"\\b(?:deucravacitinib|hydroxychloroquine|prednisone|methotrexate|aspirin|lisinopril|metformin|atorvastatin|ibuprofen|acetaminophen|amoxicillin)\\b"
    ],
    "ANATOMY": [
        r"\\b(?:kidney|renal|lung|cardiac|heart|skin|cutaneous|liver|hepatic|joint|articular|brain|coronary)\\b"
    ]
}

NEGATION_TRIGGERS = [
    r"\\bno\\b", r"\\bdenies\\b", r"\\bdenied\\b", r"\\bwithout\\b", r"\\bnegative for\\b",
    r"\\bruled out\\b", r"\\bno evidence of\\b", r"\\bfree of\\b", r"\\bnot present\\b"
]

sentences = re.split(r'[.\\n]+', text)
extracted_entities = []

for sent in sentences:
    clean_sent = sent.strip()
    if not clean_sent:
        continue
    
    # Check if sentence contains negation trigger
    is_negated = any(re.search(trig, clean_sent, re.IGNORECASE) for trig in NEGATION_TRIGGERS)
    
    for category, patterns in ENTITY_PATTERNS.items():
        for pat in patterns:
            for match in re.finditer(pat, clean_sent, re.IGNORECASE):
                entity_text = match.group(0)
                extracted_entities.append({
                    "entity": entity_text,
                    "category": category,
                    "assertion": "ABSENT / NEGATED" if is_negated else "PRESENT / POSITIVE",
                    "contextSentence": clean_sent[:120]
                })

# Deduplicate
unique_entities = []
seen = set()
for item in extracted_entities:
    key = (item["entity"].lower(), item["category"], item["assertion"])
    if key not in seen:
        seen.add(key)
        unique_entities.append(item)

result = {
    "totalSentences": len(sentences),
    "totalEntities": len(unique_entities),
    "entities": unique_entities,
    "hasNegatedEntities": any(e["assertion"] == "ABSENT / NEGATED" for e in unique_entities)
}

with open("clinical_nlp_summary.json", "w") as f:
    json.dump(result, f, indent=2)

print(f"Processed {len(sentences)} sentences, extracted {len(unique_entities)} medical entities.")
`;

    const runnerRes = await PythonRunnerTool.execute(
      {
        scriptContent: pythonScript,
        scriptName: 'local_clinical_nlp.py',
      },
      context
    );

    if (!runnerRes.success) {
      return {
        success: false,
        output: null,
        error: `Clinical NLP sandbox execution failed: ${runnerRes.error}`,
        execution: runnerRes.execution,
      };
    }

    let parsedOutput: any = { entities: [] };
    const summaryArtifact = runnerRes.artifacts?.find((a) => a.title.includes('clinical_nlp_summary.json'));
    const filePath = summaryArtifact?.metadata?.Path;
    if (filePath && fs.existsSync(filePath)) {
      try {
        parsedOutput = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch {
        // fallback
      }
    }

    const presentCount = parsedOutput.entities?.filter((e: any) => e.assertion.includes('PRESENT')).length || 0;
    const negatedCount = parsedOutput.entities?.filter((e: any) => e.assertion.includes('NEGATED')).length || 0;
    const summary = `Local Clinical NLP Extracted ${parsedOutput.totalEntities || 0} entities (${presentCount} present, ${negatedCount} negated) in local sandbox.`;

    context.reportProgress(summary, 100);

    return {
      success: true,
      output: {
        totalEntities: parsedOutput.totalEntities || 0,
        entities: parsedOutput.entities || [],
        sandboxIsolation: runnerRes.output?.sandboxMode || 'Enforced',
      },
      artifacts: runnerRes.artifacts,
      execution: {
        id: '',
        toolName: 'clinical_nlp_analyze',
        category: 'medical',
        description: 'Analyzed clinical text locally with entity & negation extraction',
        status: 'completed',
        resultSummary: summary,
        logs: [
          `Isolation: ${runnerRes.output?.sandboxMode}`,
          `Stdout: ${runnerRes.output?.stdout?.trim()}`,
          `Entities: ${parsedOutput.entities?.map((e: any) => `${e.entity} [${e.category}: ${e.assertion}]`).join(', ')}`,
        ],
      },
    };
  },
};
