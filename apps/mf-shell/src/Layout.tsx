import "./layout.css"

import Header from "header/Header"
import Navigation from "navigation/Navigation"
import {  Outlet, useNavigate } from "react-router-dom"

export default function Layout() {
  const navigate = useNavigate()
  return (
    <div className="app-layout">

      <div className="app-header">
        <Header />
      </div>

      <div className="app-nav">
        <Navigation
          onNavigate={(path) => navigate(path)}
        />
      </div>

      <div className="app-content">
        <Outlet />
      </div>

    </div>
  )
}