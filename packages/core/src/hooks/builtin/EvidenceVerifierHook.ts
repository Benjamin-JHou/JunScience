import { HookDefinition, HookContext, PostToolUsePayload, HookResult } from '../types.js';
import { EvidenceVerifier, globalEvidenceVerifier } from '../../research-loop/EvidenceVerifier.js';

export class EvidenceVerifierHook {
  private verifier: EvidenceVerifier;

  constructor(verifier: EvidenceVerifier = globalEvidenceVerifier) {
    this.verifier = verifier;
  }

  public getDefinition(): HookDefinition {
    return {
      id: 'evidence-verifier',
      name: 'Evidence Verifier Gate',
      description: 'Enforces physics boundaries (p in [0,1], IC50 > 0, HU in [-1024,3071]) and NaN/ZeroDivision anomaly filters on tool outputs before evidence adoption.',
      events: ['PostToolUse'],
      priority: 10,
      enabled: true,
      handler: async (context: HookContext, payload: PostToolUsePayload): Promise<HookResult> => {
        const { toolName, toolArguments, result, artifacts, citations } = payload;

        const queryStr =
          toolArguments?.query ||
          toolArguments?.accessionOrGene ||
          toolArguments?.targetOrCompound ||
          toolArguments?.compoundNameOrCID ||
          toolArguments?.pdbIdOrUniProt ||
          toolArguments?.scriptName ||
          JSON.stringify(toolArguments || {});

        const verification = this.verifier.verify(
          toolName,
          result.execution?.category || 'databases',
          String(queryStr),
          result.output,
          artifacts,
          citations
        );

        if (verification.verdict === 'REJECTED') {
          return {
            proceed: false,
            verdict: 'REJECTED',
            message: `[Evidence Verification REJECTED]: ${verification.reasonSummary}. ${verification.suggestedCorrection}`,
            evidenceVerification: verification,
          };
        }

        return {
          proceed: true,
          verdict: verification.verdict === 'FLAGGED_WITH_WARNING' ? 'FLAGGED' : 'ADOPTED',
          message: verification.reasonSummary,
          evidenceVerification: verification,
        };
      },
    };
  }
}
