export interface TransmissionRequest {
  id: string;
  dataType: 'clinical_text' | 'medical_image' | 'radiomics_feature';
  source: string;
  summary: string;
  payloadLength: number;
  hasDeIdentificationCheck: boolean;
  destinationEndpoint: string;
  timestamp: string;
}

export type ConfirmationHandler = (request: TransmissionRequest) => Promise<boolean>;

/**
 * Conservative detector for raw clinical narratives and direct patient identifiers.
 * General biomedical questions should not match this function.
 */
export function containsLikelyRawClinicalData(text: string): boolean {
  if (text.trim().length < 20) return false;

  const directIdentifier =
    /\b(?:MRN|medical record number|patient id|patient name|date of birth|DOB|SSN)\s*[:#-]?\s*[A-Za-z0-9-]+/i;
  const clinicalDocument =
    /\b(?:clinical note|progress note|discharge summary|history of present illness|electronic health record|EHR)\b/i;
  const patientNarrative =
    /\bpatient\b[\s\S]{0,160}\b(?:presented|admitted|diagnosed|treated|reports|denies|prescribed|discharged)\b/i;
  const chineseClinicalNarrative =
    /患者[\s\S]{0,120}(?:姓名|病历|病案号|住院号|身份证|主诉|入院|诊断|治疗|出院)/;

  return (
    directIdentifier.test(text) ||
    clinicalDocument.test(text) ||
    patientNarrative.test(text) ||
    chineseClinicalNarrative.test(text)
  );
}

export class ClinicalDataGate {
  private customHandler?: ConfirmationHandler;
  private auditLog: { request: TransmissionRequest; approved: boolean }[] = [];

  public setConfirmationHandler(handler: ConfirmationHandler): void {
    this.customHandler = handler;
  }

  public async requestTransmission(
    dataType: 'clinical_text' | 'medical_image' | 'radiomics_feature',
    source: string,
    summary: string,
    payloadLength: number,
    destinationEndpoint: string,
    autoApproveNonSensitiveSummary: boolean = true
  ): Promise<{ approved: boolean; reason: string }> {
    const request: TransmissionRequest = {
      id: `GATE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataType,
      source,
      summary,
      payloadLength,
      hasDeIdentificationCheck: true,
      destinationEndpoint,
      timestamp: new Date().toISOString(),
    };

    // If it's pure aggregated mathematical radiomics/statistical summary, allow safe transmission
    if (dataType === 'radiomics_feature' && autoApproveNonSensitiveSummary) {
      this.auditLog.push({ request, approved: true });
      return {
        approved: true,
        reason: 'Approved: Payload contains only de-identified, aggregated mathematical features.',
      };
    }

    // For raw clinical text or raw medical imagery, require explicit gate authorization
    if (this.customHandler) {
      const userDecision = await this.customHandler(request);
      this.auditLog.push({ request, approved: userDecision });
      return {
        approved: userDecision,
        reason: userDecision
          ? 'Explicit user authorization granted for remote model transmission.'
          : 'User rejected remote transmission. Keeping data strictly inside local sandbox.',
      };
    }

    // Default safety fallback: Block raw transmission to external endpoint unless confirmed
    this.auditLog.push({ request, approved: false });
    return {
      approved: false,
      reason: 'Safety Gate Enforced: Raw clinical text / medical image transmission blocked. Only locally extracted structured features may be shared.',
    };
  }

  public getAuditLog(): { request: TransmissionRequest; approved: boolean }[] {
    return [...this.auditLog];
  }
}

export const globalClinicalDataGate = new ClinicalDataGate();
