import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"

import HomeLayout from "./HomeLayout"
import AppLayout  from "./Layout"

const Login       = lazy(() => import("auth/Login"))
const Home        = lazy(() => import("home/Home"))
const Emergency   = lazy(() => import("emergency/Emergency"))
const Hospital    = lazy(() => import("hospital/Hospital"))
const Ambulatorio = lazy(() => import("ambulatorio/Ambulatorio"))
const Auditoria   = lazy(() => import("auditoria/Auditoria"))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Hub — header sin sidebar */}
        <Route element={<HomeLayout />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Módulos — header + sidebar dinámico */}
        <Route element={<AppLayout />}>
          <Route path="/emergency/*"   element={<Emergency />} />
          <Route path="/hospital/*"    element={<Hospital />} />
          <Route path="/ambulatorio/*" element={<Ambulatorio />} />
          <Route path="/auditoria/*"   element={<Auditoria />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
