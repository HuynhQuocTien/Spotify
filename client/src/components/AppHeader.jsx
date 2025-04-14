"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../services/api"
import "./AppHeader.css"
import LoginPage from "../pages/LoginPage"

const AppHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchPage, setIsSearchPage] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"))
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userData, setUserData] = useState(null)
  const userMenuRef = useRef(null)

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const response = await api.getUserProfile()
          setUserData(response.data)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        }
      }
      fetchUserData()
    }
  }, [isAuthenticated])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
    if (!isSearchPage) {
      navigate("/search")
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    setIsAuthenticated(false)
    setUserData(null)
    setShowUserMenu(false)
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <>
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
          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button className="user-menu-button" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  {userData?.images?.[0]?.url ? (
                    <img 
                      src={userData.images[0].url} 
                      alt={userData.display_name} 
                      className="user-avatar-image"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" className="user-icon">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                    </svg>
                  )}
                </div>
                <span className="user-name">{userData?.display_name || "User"}</span>
                <svg viewBox="0 0 16 16" className="dropdown-icon">
                  <path d="M14 6l-6 6-6-6h12z"></path>
                </svg>
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {userData?.images?.[0]?.url ? (
                        <img 
                          src={userData.images[0].url} 
                          alt={userData.display_name} 
                          className="dropdown-avatar-image"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="dropdown-user-icon">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                        </svg>
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{userData?.display_name || "User"}</div>
                      <div className="dropdown-user-email">{userData?.email || ""}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item">
                    <span>Profile</span>
                  </button>
                  <button className="dropdown-item">
                    <span>Changes password</span>
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-button" onClick={() => setShowLoginModal(true)}>
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal-content">
            <LoginPage onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  )
}

export default AppHeader