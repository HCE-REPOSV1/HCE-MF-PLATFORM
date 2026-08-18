export const TRIAGE_ERROR_CODES: Record<number, string> = {
  3: 'errors.invalidCredentials',
  // TODO: agregar el código real que devuelve el backend para "usuario no
  // existe en AD", ej:
  // 5: 'errors.userNotFound',
  12: 'errors.sessionExpired',
};

// Fallback cuando no hay codigo (o no está mapeado), basado en el status HTTP.
export function resolveStatusError(status?: number): string {
  if (status === 503) return 'errors.serviceUnavailable';
  if (status === 504) return 'errors.timeout';
  return 'errors.generic';
}