import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation, LANG_QUERY_PARAM } from "@hce/i18n-core"

/**
 * Mantiene ?lang= presente en la URL en TODA ruta, sin importar cuál sea.
 *
 * Por qué hace falta: el idioma activo vive en memoria (en el singleton de
 * i18next), no en la URL — se lee de ?lang= una sola vez al arrancar
 * (ver @hce/i18n-core, initI18n()). Como react-router arma las URLs nuevas
 * al navegar sin preservar el query string existente, ?lang= puede
 * "desaparecer" visualmente de la barra de direcciones aunque el idioma
 * activo no haya cambiado.
 *
 * Este componente corrige eso: en cada cambio de ruta, si el ?lang= de la
 * URL actual no coincide con el idioma activo real, lo reescribe.
 *
 * Usa navigate(..., { replace: true }) para no ensuciar el historial del
 * navegador.
 *
 * Debe montarse UNA sola vez, dentro de <BrowserRouter> y por encima de
 * <Routes>.
 */
export function LangUrlSync() {
  const location = useLocation()
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const currentParam = params.get(LANG_QUERY_PARAM)

    if (currentParam === i18n.language) return

    params.set(LANG_QUERY_PARAM, i18n.language)
    navigate(
      { pathname: location.pathname, search: params.toString(), hash: location.hash },
      { replace: true, state: location.state },
    )
  }, [location.pathname, location.search, location.hash, i18n.language, navigate])

  return null
}