export type ApiErrorCode = string | number;

// Códigos funcionales compartidos del backend. Agregar aquí los códigos
// documentados por los endpoints de mf-clinical-record.
export const API_ERROR_CODES: Record<string, string> = {};

export const HTTP_ERROR_CODES: Record<number, string> = {
  400: "errors.invalidRequest",
  401: "errors.unauthorized",
  403: "errors.forbidden",
  404: "errors.notFound",
  409: "errors.conflict",
  422: "errors.invalidRequest",
  500: "errors.serverError",
  502: "errors.network",
  503: "errors.serviceUnavailable",
  504: "errors.timeout",
};

export class ApiError extends Error {

  public readonly code: ApiErrorCode | undefined;

  public readonly status: number;

  constructor(

    code: ApiErrorCode | undefined,

    status: number,

  ) {

    super("API request failed");

    this.name = "ApiError";

    this.code = code;

    this.status = status;

  }

}

export function resolveApiError(
  error: unknown,
  fallbackKey = "errors.generic",
): string {
  if (!(error instanceof ApiError)) return fallbackKey;

  if (error.code !== undefined) {
    const codeKey = API_ERROR_CODES[String(error.code)];
    if (codeKey) return codeKey;
  }

  return HTTP_ERROR_CODES[error.status] ?? fallbackKey;
}
