/**
 * Mini-bundle ES embebido — último recurso si el servicio de i18n (backend)
 * no responde ni siquiera para el manifest de idiomas. El login es la
 * pantalla más crítica de HCE: nadie debe quedar sin poder loguearse por
 * una caída puntual de ese servicio. Cubre TODAS las keys que Login.tsx /
 * errorCodes.tsx referencian, incluidas un par que hoy faltan también en
 * el bundle "oficial" (errors.networkError, errors.sessionExpired) --
 * ver auth.json real para el contenido versionado y mantenido.
 */
export const FALLBACK_AUTH_ES = {
  login: {
    title: "Iniciar sesión",
    descriptionTitle: "Inicia sesión para acceder",
    CompanySelect: "Empresa",
    usernameInput: "Usuario",
    usernamePlaceholder: "Ingrese usuario",
    passwordInput: "Contraseña",
    passwordPlaceholder: "Ingrese contraseña",
    submitButton: "Ingresar",
    msgLoading: "Verificando credenciales ...",
  },
  errors: {
    missingFields: "Ingresa usuario y contraseña",
    accountBlockedTitle: "Su cuenta ha sido bloqueada",
    invalidCredentials: "Usuario o contraseña incorrectos",
    userNotFound: "El usuario no existe en el AD",
    sessionExpired: "Tu sesión ha expirado. Vuelve a iniciar sesión.",
    accountBlocked: "Estimado usuario, se ha excedido el número máximo de intentos de ingreso, por favor contactar con mesa de ayuda.",
    serviceUnavailable: "Servicio de autenticación no disponible. Intenta en unos momentos.",
    networkError: "No se pudo conectar con el servidor. Verifica tu conexión.",
    timeout: "El servidor tardó demasiado en responder. Intenta nuevamente.",
    generic: "Ocurrió un error inesperado.",
  },
};
