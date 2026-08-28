export function normalizeBaseUrl(url) {
    let cleaned = (url || '').trim();
    if (!cleaned)
        return '';
    if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = 'https://' + cleaned;
    }
    // Trim trailing slashes
    return cleaned.replace(/\/+$/, '');
}
export function validateProfile(profile) {
    const errors = [];
    if (!profile.name || !profile.name.trim()) {
        errors.push('Profile name is required.');
    }
    if (!profile.baseUrl || !profile.baseUrl.trim()) {
        errors.push('API Base URL is required.');
    }
    else {
        try {
            new URL(normalizeBaseUrl(profile.baseUrl));
        }
        catch {
            errors.push('API Base URL must be a valid URL.');
        }
    }
    if (!profile.model || !profile.model.trim()) {
        errors.push('Model name is required.');
    }
    if (profile.protocol && !['openai-compatible', 'anthropic-compatible', 'custom'].includes(profile.protocol)) {
        errors.push('Protocol must be openai-compatible, anthropic-compatible, or custom.');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
export function createDefaultProfile(override) {
    return {
        id: override?.id || `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: override?.name || 'Primary Model',
        protocol: override?.protocol || 'openai-compatible',
        baseUrl: normalizeBaseUrl(override?.baseUrl || 'https://api.openai.com/v1'),
        model: override?.model || 'gpt-4o',
        contextWindow: override?.contextWindow || 128000,
        temperature: override?.temperature ?? 0.2,
        maxTokens: override?.maxTokens || 4096,
        streaming: override?.streaming ?? true,
        toolCalling: override?.toolCalling ?? true,
        headers: override?.headers || {},
        apiKey: override?.apiKey,
        isDefault: override?.isDefault ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=ModelConfig.js.map