declare module "shell/ApiClient" {
  export class SessionExpiredError extends Error {}
  export function apiFetch(url: string, options?: RequestInit): Promise<Response>
}