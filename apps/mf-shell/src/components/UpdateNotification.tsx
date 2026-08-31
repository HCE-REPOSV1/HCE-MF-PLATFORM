import { useState, useEffect }  from "react"
import { HceUpdateBanner }      from "@hce/design-system"
import { useVersionChecker }    from "../hooks/useVersionChecker"

const COUNTDOWN_SECONDS = 10

/**
 * Orquesta la detección de versión nueva y la cuenta regresiva.
 * La presentación (modal) vive en HceUpdateBanner (@hce/design-system).
 */
export function UpdateNotification() {
  const { updateAvailable } = useVersionChecker()
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (!updateAvailable) return

    setSeconds(COUNTDOWN_SECONDS)

    const id = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(id)
          window.location.replace(
            window.location.origin + window.location.pathname + "?_v=" + Date.now()
          )
          return 0
        }
        return prev - 1
      })
    }, 1_000)

    return () => clearInterval(id)
  }, [updateAvailable])

  return (
    <HceUpdateBanner
      open={updateAvailable}
      seconds={seconds}
      onReloadNow={() =>
        window.location.replace(
          window.location.origin + window.location.pathname + "?_v=" + Date.now()
        )
      }
      testId="mf-shell-update-banner"
    />
  )
}
