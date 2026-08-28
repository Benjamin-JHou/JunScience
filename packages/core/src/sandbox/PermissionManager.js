import { globalEventBus } from '../core/EventBus';
export class PermissionManager {
    policies = new Map();
    pendingRequests = new Map();
    customResolver;
    constructor() {
        this.initDefaultPolicies();
    }
    initDefaultPolicies() {
        this.policies.set('READ', { defaultAction: 'allow' });
        this.policies.set('WRITE', {
            defaultAction: 'allow',
            deniedPrefixes: ['/etc', '/usr', '/System', '~/.ssh'],
        });
        this.policies.set('EXECUTE', {
            defaultAction: 'allow',
        });
        this.policies.set('NETWORK', {
            defaultAction: 'allow',
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
    setCustomResolver(resolver) {
        this.customResolver = resolver;
    }
    async checkPermission(sessionId, operation, target, reason) {
        const policy = this.policies.get(operation) || { defaultAction: 'ask' };
        if (policy.deniedPrefixes?.some((prefix) => target.startsWith(prefix))) {
            return false;
        }
        if (policy.defaultAction === 'allow') {
            return true;
        }
        if (policy.allowedPrefixes?.some((prefix) => target.startsWith(prefix))) {
            return true;
        }
        const requestId = `perm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const request = {
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
//# sourceMappingURL=PermissionManager.js.map