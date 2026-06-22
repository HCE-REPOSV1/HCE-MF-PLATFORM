declare module "shell/AuthService" {
  export interface LoginResult {
    ok:     boolean
    status: number
    data:   any
  }
  export function login(usuario: string, password: string): Promise<LoginResult>
}
