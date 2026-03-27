export class ImmutableError extends Error {
    statusCode;
    responseBody;
    constructor(message, statusCode, responseBody) {
        super(message);
        this.name = 'ImmutableError';
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}
//# sourceMappingURL=errors.js.map