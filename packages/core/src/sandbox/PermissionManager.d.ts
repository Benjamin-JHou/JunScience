import { OperationType, PermissionDecision, PermissionRequest } from '../types/runtime';
export interface PermissionPolicy {
    defaultAction: PermissionDecision;
    allowedPrefixes?: string[];
    deniedPrefixes?: string[];
}
export declare class PermissionManager {
    private policies;
    private pendingRequests;
    private customResolver?;
    constructor();
    private initDefaultPolicies;
    setCustomResolver(resolver: (request: PermissionRequest) => Promise<boolean>): void;
    checkPermission(sessionId: string, operation: OperationType, target: string, reason: string): Promise<boolean>;
}
export declare const globalPermissionManager: PermissionManager;
//# sourceMappingURL=PermissionManager.d.ts.map