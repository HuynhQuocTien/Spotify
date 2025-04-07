"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./AppHeader.css"

const AppHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchPage, setIsSearchPage] = useState(false)

  useEffect(() => {
    setIsSearchPage(location.pathname === "/search")

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [location, scrolled])

  const handleBack = () => {
    navigate(-1)
  }

  const handleForward = () => {
    navigate(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)

    // If not already on search page, navigate there
    if (!isSearchPage) {
      navigate("/search")
    }
  }

  return (
    <header className={`app-header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-left">
        <div className="navigation-buttons">
          <button className="nav-button" onClick={handleBack}>
            <svg viewBox="0 0 16 16" className="nav-icon">
              <path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0z"></path>
            </svg>
          </button>
          <button className="nav-button" onClick={handleForward}>
            <svg viewBox="0 0 16 16" className="nav-icon">
              <path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8 6.03.47a.75.75 0 0 0-1.06 0z"></path>
            </svg>
          </button>
        </div>

        {isSearchPage && (
          <div className="search-input-container">
            <svg viewBox="0 0 16 16" className="search-icon">
              <path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search-button" onClick={() => setSearchQuery("")}>
                <svg viewBox="0 0 16 16" className="clear-icon">
                  <path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"></path>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="header-right">
        <button className="upgrade-button">Upgrade</button>

        <div className="user-menu">
          <button className="user-menu-button">
            <div className="user-avatar">
              <svg viewBox="0 0 16 16" className="user-icon">
                <path d="M6.233.371a4.388 4.388 0 0 1 5.002 1.052c.421.459.713.992.904 1.554.143.421.263 1.173.22 1.894-.078 1.322-.638 2.408-1.399 3.316l-.127.152a.75.75 0 0 0 .201 1.13l2.209 1.275a4.75 4.75 0 0 1 2.375 4.114V16H.382v-1.143a4.75 4.75 0 0 1 2.375-4.113l2.209-1.275a.75.75 0 0 0 .201-1.13l-.126-.152c-.761-.908-1.322-1.994-1.4-3.316-.043-.721.077-1.473.22-1.894a4.346 4.346 0 0 1 .904-1.554c.411-.448.91-.807 1.468-1.052zM8 1.5a2.888 2.888 0 0 0-2.13.937 2.85 2.85 0 0 0-.588 1.022c-.077.226-.175.783-.143 1.323.054.921.44 1.712 1.051 2.442l.002.001.127.153a2.25 2.25 0 0 1-.603 3.39l-2.209 1.275A3.25 3.25 0 0 0 1.902 14.5h12.196a3.25 3.25 0 0 0-1.605-2.457l-2.209-1.275a2.25 2.25 0 0 1-.603-3.39l.127-.153.002-.001c.612-.73.997-1.52 1.052-2.442.032-.54-.067-1.097-.144-1.323a2.85 2.85 0 0 0-.588-1.022A2.888 2.888 0 0 0 8 1.5z"></path>
              </svg>
            </div>
            <span className="user-name">User</span>
            <svg viewBox="0 0 16 16" className="dropdown-icon">
              <path d="m14 6-6 6-6-6h12z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader

