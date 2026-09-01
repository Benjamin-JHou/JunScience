import { OperationType, PermissionDecision, PermissionRequest } from '../types/runtime.js';
import { globalEventBus } from '../core/EventBus.js';

export interface PermissionPolicy {
  defaultAction: PermissionDecision;
  allowedPrefixes?: string[];
  deniedPrefixes?: string[];
}

export class PermissionManager {
  private policies: Map<OperationType, PermissionPolicy> = new Map();
  private pendingRequests: Map<string, PermissionRequest> = new Map();
  private customResolver?: (request: PermissionRequest) => Promise<boolean>;

  constructor() {
    this.initDefaultPolicies();
  }

  private initDefaultPolicies(): void {
    this.policies.set('READ', { defaultAction: 'allow' });
    this.policies.set('WRITE', {
      defaultAction: 'allow',
      deniedPrefixes: ['/etc', '/usr', '/System', '~/.ssh', 'C:\\Windows'],
    });
    this.policies.set('EXECUTE', {
      defaultAction: 'allow',
    });
    this.policies.set('NETWORK', {
      defaultAction: 'ask',
      allowedPrefixes: [
        'https://eutils.ncbi.nlm.nih.gov',
        'https://rest.uniprot.org',
        'https://www.ebi.ac.uk/chembl',
        'https://pubchem.ncbi.nlm.nih.gov',
        'https://data.rcsb.org',
        'https://rest.ensembl.org',
        'https://api.openalex.org',
        'https://clinicaltrials.gov',
        'https://api.fda.gov',
        'https://rxnav.nlm.nih.gov',
        'https://dailymed.nlm.nih.gov',
        'https://api.semanticscholar.org',
        'https://europepmc.org',
      ],
      deniedPrefixes: [
        'http://', // Disallow unencrypted plain HTTP for biomedical data
      ],
    });
    this.policies.set('INSTALL', { defaultAction: 'ask' });
    this.policies.set('DELETE', { defaultAction: 'ask' });
  }

  public setCustomResolver(resolver: (request: PermissionRequest) => Promise<boolean>): void {
    this.customResolver = resolver;
  }

  public async checkPermission(
    sessionId: string,
    operation: OperationType,
    target: string,
    reason: string
  ): Promise<boolean> {
    const policy = this.policies.get(operation) || { defaultAction: 'ask' };

    // 1. Explicit denial checks
    if (policy.deniedPrefixes?.some((prefix) => target.startsWith(prefix))) {
      return false;
    }

    // 2. Explicit whitelist checks
    if (policy.allowedPrefixes?.some((prefix) => target.startsWith(prefix))) {
      return true;
    }

    // 3. Default action checks
    if (policy.defaultAction === 'allow') {
      return true;
    }
    if (policy.defaultAction === 'deny') {
      return false;
    }

    // 4. Ask user / custom resolver
    const requestId = `perm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const request: PermissionRequest = {
      id: requestId,
      operation,
      target,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.pendingRequests.set(requestId, request);

    globalEventBus.emit({
      type: 'permission.requested',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: {
        permissionId: requestId,
        operation,
        target,
        reason,
      },
    });

    if (this.customResolver) {
      const allowed = await this.customResolver(request);
      request.decision = allowed ? 'allow' : 'deny';
      this.pendingRequests.delete(requestId);
      return allowed;
    }

    return true;
  }
}

export const globalPermissionManager = new PermissionManager();
