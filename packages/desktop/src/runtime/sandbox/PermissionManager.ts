import { OperationType, PermissionDecision, PermissionRequest } from '../types/runtime';
import { globalEventBus } from '../core/EventBus';

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
      deniedPrefixes: ['/etc', '/usr', '/System', '~/.ssh'],
    });
    this.policies.set('EXECUTE', {
      defaultAction: 'allow', // sandboxed python/shell
    });
    this.policies.set('NETWORK', {
      defaultAction: 'allow', // scientific APIs
      allowedPrefixes: [
        'https://eutils.ncbi.nlm.nih.gov',
        'https://rest.uniprot.org',
        'https://www.ebi.ac.uk/chembl',
        'https://pubchem.ncbi.nlm.nih.gov',
        'https://data.rcsb.org',
        'https://rest.ensembl.org',
        'https://api.openalex.org',
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

    // Check explicit deny
    if (policy.deniedPrefixes?.some((prefix) => target.startsWith(prefix))) {
      return false;
    }

    // Check allow
    if (policy.defaultAction === 'allow') {
      return true;
    }

    if (policy.allowedPrefixes?.some((prefix) => target.startsWith(prefix))) {
      return true;
    }

    // If 'ask', create permission request
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

    // In non-interactive or default developer preview, allow controlled scientific executions
    return true;
  }
}

export const globalPermissionManager = new PermissionManager();
