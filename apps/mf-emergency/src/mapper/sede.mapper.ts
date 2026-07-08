export const getSede = (id:string): string => {
 
  if (id === "1") return "Jesus María"
  if (id === "2") return "La Molina"
  if (id === "3") return "Camacho"

  // if (item.location_id) {
  //   return `TP${String(item.location_id).padStart(2, "0")}`
  // }

  return "-"
}