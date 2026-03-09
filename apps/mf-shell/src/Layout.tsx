import Header from "header/Header"
import Navigation from "navigation/Navigation"
import Home from "home/Home"
import Patient from "patient/Patient"
import { Routes, Route } from "react-router-dom"

export default function Layout() {

  return (
    <div>

      <Header />

      <div style={{ display: "flex" }}>

        <Navigation />

        <div style={{ padding: 20, flex: 1 }}>

          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/patient" element={<Patient />} />
          </Routes>

        </div>

      </div>

    </div>
  )
}