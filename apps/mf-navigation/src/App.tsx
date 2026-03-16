/**
 * App del microfrontend navigation
 * (modo standalone para desarrollo)
 */

import Navigation from "./Navigation"

export default function App() {

  const handleNavigate = (path: string) => {
    console.log("navigate to:", path)
  }

  return (
    <Navigation onNavigate={handleNavigate} />
  )
}