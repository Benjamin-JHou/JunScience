import { HookDefinition, HookContext, StopPayload, HookResult } from '../types.js';

export class EvidenceCompletenessHook {
  public getDefinition(): HookDefinition {
    return {
      id: 'evidence-completeness-check',
      name: 'Evidence Completeness & Citation Integrity Check',
      description: 'Verifies at task completion that every [Evidence: EV-xxx] citation in the report exists in the immutable EvidenceTracker and that no broken evidence chains remain.',
      events: ['Stop'],
      priority: 50,
      enabled: true,
      handler: async (context: HookContext, payload: StopPayload): Promise<HookResult> => {
        const { finalContent, evidenceTracker } = payload;
        const issues: string[] = [];

        // Match all EV references like [Evidence: EV-1], [EV-2], EV-3
        const evMatches = finalContent.matchAll(/(?:\[Evidence:\s*|\[|\b)(EV-\d+)(?:\]|\b)/gi);
        const citedEvIds = new Set<string>();

        for (const match of evMatches) {
          if (match[1]) {
            citedEvIds.add(match[1].toUpperCase());
          }
        }

        // Cross-reference with EvidenceTracker records
        const recordedList = evidenceTracker.list();
        const recordedIds = new Set(recordedList.map((e) => e.id.toUpperCase()));

        for (const citedId of citedEvIds) {
          if (!recordedIds.has(citedId)) {
            issues.push(`Dangling citation: "${citedId}" is referenced in the synthesis report but was never recorded in EvidenceTracker.`);
          }
        }

        // Check for unresolved FLAGGED evidence items
        const flaggedWithoutWarning = recordedList.filter((e) => e.verificationResult?.verdict === 'FLAGGED_WITH_WARNING');
        if (flaggedWithoutWarning.length > 0) {
          // Verify that the report contains warning notes or caveats
          for (const flagged of flaggedWithoutWarning) {
            if (!finalContent.toLowerCase().includes('warning') && !finalContent.toLowerCase().includes('caution') && !finalContent.toLowerCase().includes('flagged')) {
              issues.push(`Unacknowledged flagged evidence: ${flagged.id} (${flagged.summary}) was flagged with warning during verification but synthesized without caveats.`);
            }
          }
        }

        if (issues.length > 0) {
          return {
            proceed: true, // Report issues but allow inspection
            verdict: 'FLAGGED',
            message: `[EvidenceCompleteness Warning]: ${issues.length} citation integrity issue(s) detected: ${issues.join('; ')}`,
            issues,
          };
        }

        return {
          proceed: true,
          verdict: 'PASSED',
          message: `Evidence completeness verified: All ${citedEvIds.size} cited evidence anchors exist in EvidenceTracker.`,
        };
      },
    };
  }
}
