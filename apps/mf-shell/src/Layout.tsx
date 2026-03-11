import "./layout.css"

import Header from "header/Header"
import Navigation from "navigation/Navigation"
import Home from "home/Home"
import Patient from "patient/Patient"
import { Routes, Route } from "react-router-dom"

export default function Layout() {
  return (
    <div className="app-layout">

      <div className="app-header">
        <Header />
      </div>

      <div className="app-nav">
        <Navigation />
      </div>

      <div className="app-content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/patient" element={<Patient />} />
        </Routes>
      </div>

    </div>
  )
}