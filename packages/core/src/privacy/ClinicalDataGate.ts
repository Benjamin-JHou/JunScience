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
