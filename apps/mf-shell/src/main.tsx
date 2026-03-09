import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { DSProvider } from "@jarvis/design-system/provider/ThemeProvider"

import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(

 <DSProvider>

   <BrowserRouter>
     <App />
   </BrowserRouter>

 </DSProvider>

)