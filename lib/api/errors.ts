export class ApiHttpError extends Error {
  readonly status: number;
  readonly errorCode?: string | null;
  readonly errors?: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number,
    options?: { errorCode?: string | null; errors?: Record<string, string[]> | null }
  ) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.errorCode = options?.errorCode;
    this.errors = options?.errors;
  }
}
