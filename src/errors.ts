export class ImmutableError extends Error {
  public readonly statusCode: number;
  public readonly responseBody: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.name = 'ImmutableError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}
