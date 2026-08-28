import {
  ArXivTool,
  BioRxivTool,
  PapersWithCodeTool,
  HuggingFaceHubTool,
  ClinicalNlpTool,
  MedicalImagingTool,
  globalClinicalDataGate,
  OpenAIProtocol,
  AnthropicProtocol,
  ModelProfile,
  ModelRequest,
  ToolContext,
} from '../src/index.js';

const dummyContext: ToolContext = {
  sessionId: `test-multimodal-${Date.now()}`,
  agentId: 'research',
  turnIndex: 0,
  reportProgress: (log: string) => {},
};

async function testMedicalAiAndMultimodal() {
  console.log('=== Running Medical AI & Multimodal Test Suite ===\n');

  // 1. Task A1: arXiv Tool
  console.log('[Test 1/7] Live ArXivTool (Medical AI & Vision-Language Papers)');
  const arxivRes = await ArXivTool.execute({ query: 'medical vision language foundation model', maxResults: 2 }, dummyContext);
  if (!arxivRes.success || !arxivRes.output.papers || arxivRes.output.papers.length === 0) {
    throw new Error(`ArXivTool failed: ${JSON.stringify(arxivRes)}`);
  }
  console.log(`  ✔ Found ${arxivRes.output.papers.length} arXiv papers (Top: [${arxivRes.output.papers[0].id}] ${arxivRes.output.papers[0].title})`);

  // 2. Task A2: bioRxiv / medRxiv Tool
  console.log('\n[Test 2/7] Live BioRxivTool (Clinical AI Preprints)');
  const biorxivRes = await BioRxivTool.execute({ queryOrDoi: 'multimodal clinical deep learning', limit: 2 }, dummyContext);
  if (!biorxivRes.success || !biorxivRes.output.preprints || biorxivRes.output.preprints.length === 0) {
    throw new Error(`BioRxivTool failed: ${JSON.stringify(biorxivRes)}`);
  }
  console.log(`  ✔ Found ${biorxivRes.output.preprints.length} preprints (Top: [${biorxivRes.output.preprints[0].server}] ${biorxivRes.output.preprints[0].title.slice(0, 50)}...)`);

  // 3. Task A3: Papers With Code Tool
  console.log('\n[Test 3/7] Live PapersWithCodeTool (Medical AI Tasks & SOTA Benchmarks)');
  const pwcRes = await PapersWithCodeTool.execute({ taskOrDataset: 'chest x-ray', limit: 2 }, dummyContext);
  if (!pwcRes.success || (!pwcRes.output.tasks?.length && !pwcRes.output.papers?.length)) {
    throw new Error(`PapersWithCodeTool failed: ${JSON.stringify(pwcRes)}`);
  }
  console.log(`  ✔ Resolved ${pwcRes.output.tasks.length} task(s) and ${pwcRes.output.papers.length} paper(s) on Papers With Code (Top: ${pwcRes.output.tasks[0]?.name || pwcRes.output.papers[0]?.title})`);

  // 4. Task A4: Hugging Face Hub Tool
  console.log('\n[Test 4/7] Live HuggingFaceHubTool (Medical Models & Datasets)');
  const hfRes = await HuggingFaceHubTool.execute({ query: 'biomedclip', limit: 2 }, dummyContext);
  if (!hfRes.success || hfRes.output.totalModels === 0) {
    throw new Error(`HuggingFaceHubTool failed: ${JSON.stringify(hfRes)}`);
  }
  console.log(`  ✔ Found ${hfRes.output.totalModels} medical model(s) on HF Hub (Top: ${hfRes.output.models[0].id}, Downloads: ${hfRes.output.models[0].downloads})`);

  // 5. Task B1: Local Clinical NLP in Python Sandbox
  console.log('\n[Test 5/7] Local Clinical NLP in Sandbox (NER + Negation Detection)');
  const sampleNote = `
Patient presents with cutaneous lupus and plaque psoriasis. 
Denies chest pain, fever, and dyspnea. 
Currently prescribed deucravacitinib and hydroxychloroquine. 
Kidney biopsy showed no evidence of nephritis.
`;
  const nlpRes = await ClinicalNlpTool.execute({ clinicalText: sampleNote }, dummyContext);
  if (!nlpRes.success || !nlpRes.output.entities || nlpRes.output.entities.length === 0) {
    throw new Error(`ClinicalNlpTool failed: ${JSON.stringify(nlpRes)}`);
  }
  const entities = nlpRes.output.entities;
  const lupus = entities.find((e: any) => e.entity.toLowerCase().includes('lupus'));
  const chestPain = entities.find((e: any) => e.entity.toLowerCase().includes('chest pain'));
  console.log(`  ✔ Local Sandbox NLP extracted ${entities.length} entities under [${nlpRes.output.sandboxIsolation}]`);
  console.log(`    - Positive Condition: ${lupus?.entity} -> assertion: ${lupus?.assertion}`);
  console.log(`    - Negated Symptom  : ${chestPain?.entity} -> assertion: ${chestPain?.assertion}`);
  if (!lupus || !chestPain || chestPain.assertion !== 'ABSENT / NEGATED') {
    throw new Error('Clinical NLP negation detection assertion failed');
  }

  // 6. Task B2: Local Medical Imaging & Radiomics in Sandbox
  console.log('\n[Test 6/7] Local Medical Imaging & Radiomics in Sandbox');
  const imgRes = await MedicalImagingTool.execute({ modality: 'CT', extractRadiomics: true }, dummyContext);
  if (!imgRes.success || !imgRes.output.radiomicsFeatures) {
    throw new Error(`MedicalImagingTool failed: ${JSON.stringify(imgRes)}`);
  }
  const rad = imgRes.output.radiomicsFeatures;
  console.log(`  ✔ Extracted Radiomics inside [${imgRes.output.sandboxIsolation}] without outbound network:`);
  console.log(`    - First-order: Mean = ${rad.firstOrderStatistics.mean} HU, Std = ${rad.firstOrderStatistics.stdDev}`);
  console.log(`    - Shape      : Volume = ${rad.shapeFeatures.voxelVolumeMm3} mm³, Sphericity = ${rad.shapeFeatures.sphericity}`);
  console.log(`    - Texture    : GLCM Homogeneity = ${rad.glcmTextureFeatures.homogeneity}`);

  // 7. Task B3: Patient Data Privacy Gate & Multimodal Model Protocol
  console.log('\n[Test 7/7] Patient Privacy Gate & Multimodal Image Protocol');
  // Privacy Gate check
  const blockedRaw = await globalClinicalDataGate.requestTransmission(
    'clinical_text',
    'Patient-1234.txt',
    'Raw un-anonymized clinical narrative',
    1024,
    'https://api.openai.com/v1'
  );
  console.log(`  ✔ Privacy Gate Blocked Raw Transmission: approved = ${blockedRaw.approved} (${blockedRaw.reason.slice(0, 50)}...)`);

  const approvedFeatures = await globalClinicalDataGate.requestTransmission(
    'radiomics_feature',
    'stats_summary.json',
    'Aggregated mathematical feature table',
    120,
    'https://api.openai.com/v1'
  );
  console.log(`  ✔ Privacy Gate Allowed Aggregated Features: approved = ${approvedFeatures.approved}`);

  if (blockedRaw.approved || !approvedFeatures.approved) {
    throw new Error('ClinicalDataGate security policy failed');
  }

  // Multimodal Protocol serialization check
  const profile: ModelProfile = {
    id: 'test-vlm',
    name: 'Vision-Model',
    protocol: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  };

  const dummyImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
  const vlmRequest: ModelRequest = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this chest CT axial slice:' },
          { type: 'image_url', image_url: { url: dummyImageBase64 } },
        ],
      },
    ],
  };

  const openaiPayload = OpenAIProtocol.buildPayload(vlmRequest);
  const anthropicPayload = AnthropicProtocol.buildPayload(vlmRequest);

  if (!Array.isArray(openaiPayload.messages[0].content) || openaiPayload.messages[0].content[1].type !== 'image_url') {
    throw new Error('OpenAIProtocol multimodal image block formatting failed');
  }
  if (!Array.isArray(anthropicPayload.messages[0].content) || anthropicPayload.messages[0].content[1].type !== 'image') {
    throw new Error('AnthropicProtocol multimodal image block formatting failed');
  }
  console.log('  ✔ OpenAIProtocol multimodal payload verified:', openaiPayload.messages[0].content.map((p: any) => p.type).join(' + '));
  console.log('  ✔ AnthropicProtocol multimodal payload verified:', anthropicPayload.messages[0].content.map((p: any) => p.type).join(' + '));

  console.log('\n✔ ALL MEDICAL AI & MULTIMODAL TESTS PASSED (100% SUCCESS)\n');
}

testMedicalAiAndMultimodal().catch((err) => {
  console.error('\n✖ Medical AI & Multimodal test failed:', err);
  process.exit(1);
});
