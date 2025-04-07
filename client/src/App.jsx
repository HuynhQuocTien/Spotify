"use client"

import { useState } from "react"
import Sidebar from "./components/Sidebar"
import AppHeader from "./components/AppHeader"
import Player from "./components/Player"
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext"
import AppRoutes from "./routes"
import "./App.css"

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <MusicPlayerProvider>
      <div className="app-container">
        <div className="app-content">
          <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <main className="main-content">
            <AppHeader />
            <div className="page-content">
              <AppRoutes />
            </div>
          </main>
        </div>
        <Player />
      </div>
    </MusicPlayerProvider>
  )
}

export default App
