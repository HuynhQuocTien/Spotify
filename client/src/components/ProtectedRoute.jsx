"use client"

import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"

// This is a simplified version - in a real app, you would use your auth context
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Set to true for development

  useEffect(() => {
    // Simulate checking authentication
    const checkAuth = async () => {
      // In a real app, you would check if the user is logged in
      // For now, we'll just simulate a delay and set isAuthenticated to true
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsAuthenticated(true)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute

