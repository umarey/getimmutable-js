export declare class ImmutableError extends Error {
    readonly statusCode: number;
    readonly responseBody: unknown;
    constructor(message: string, statusCode: number, responseBody?: unknown);
}
//# sourceMappingURL=errors.d.ts.map