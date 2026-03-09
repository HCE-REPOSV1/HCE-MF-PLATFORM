import React from "react"

declare module "header/Header" {
  const Header: React.ComponentType<any>
  export default Header
}

declare module "navigation/Navigation" {
  const Navigation: React.ComponentType<any>
  export default Navigation
}

declare module "home/Home" {
  const Home: React.ComponentType<any>
  export default Home
}

declare module "patient/Patient" {
  const Patient: React.ComponentType<any>
  export default Patient
}