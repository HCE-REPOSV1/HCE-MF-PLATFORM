export function getFormattedDateTime(): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
  return formatter.format(now).toUpperCase()
}
export function getShortDateTime() {

  const now = new Date()

  return now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit"
  })

}