import { HookDefinition, HookContext, PreToolUsePayload, HookResult } from '../types.js';
import {
  ClinicalDataGate,
  containsLikelyRawClinicalData,
  globalClinicalDataGate,
} from '../../privacy/ClinicalDataGate.js';

export class ClinicalDataGateHook {
  private gate: ClinicalDataGate;

  constructor(gate: ClinicalDataGate = globalClinicalDataGate) {
    this.gate = gate;
  }

  public getDefinition(): HookDefinition {
    return {
      id: 'clinical-data-gate',
      name: 'Clinical Data Privacy Gate',
      description: 'Prevents raw patient EHR text and raw medical pixel arrays from being transmitted to external endpoints without explicit user authorization.',
      events: ['PreToolUse'],
      priority: 20,
      enabled: true,
      handler: async (context: HookContext, payload: PreToolUsePayload): Promise<HookResult> => {
        const { toolName, toolArguments, isExternalApi } = payload;

        if (toolName === 'model_provider_request' && isExternalApi) {
          const outboundPayload = JSON.stringify(toolArguments?.messages || toolArguments || {});
          if (containsLikelyRawClinicalData(outboundPayload)) {
            const decision = await this.gate.requestTransmission(
              'clinical_text',
              'model_provider_request',
              `Transmission of likely raw clinical content (${outboundPayload.length} chars) to external model endpoint`,
              outboundPayload.length,
              'external_model_provider',
              false
            );

            if (!decision.approved) {
              return {
                proceed: false,
                verdict: 'BLOCKED',
                message: `[ClinicalDataGate BLOCKED]: ${decision.reason}`,
              };
            }
          }
        }

        // Check if invoking clinical tools with raw sensitive content
        if (toolName === 'clinical_nlp_analyze') {
          const rawClinicalText = toolArguments?.clinicalNoteText || toolArguments?.text || '';
          if (rawClinicalText.length > 50 && isExternalApi) {
            const decision = await this.gate.requestTransmission(
              'clinical_text',
              'clinical_nlp_analyze',
              `Transmission of raw clinical text (${rawClinicalText.length} chars) to external model endpoint`,
              rawClinicalText.length,
              'external_api',
              false
            );

            if (!decision.approved) {
              return {
                proceed: false,
                verdict: 'BLOCKED',
                message: `[ClinicalDataGate BLOCKED]: ${decision.reason}`,
              };
            }
          }
        }

        if (toolName === 'medical_imaging_process') {
          const isRawDicom = toolArguments?.modality === 'CT' || toolArguments?.modality === 'MRI';
          if (isRawDicom && isExternalApi) {
            const decision = await this.gate.requestTransmission(
              'medical_image',
              'medical_imaging_process',
              `Transmission of raw DICOM ${toolArguments?.modality} volume to external endpoint`,
              1024 * 1024,
              'external_api',
              false
            );

            if (!decision.approved) {
              return {
                proceed: false,
                verdict: 'BLOCKED',
                message: `[ClinicalDataGate BLOCKED]: ${decision.reason}`,
              };
            }
          }
        }

        return {
          proceed: true,
          verdict: 'PASSED',
        };
      },
    };
  }
}
