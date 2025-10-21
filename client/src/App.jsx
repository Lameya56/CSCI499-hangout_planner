import { useState } from 'react'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import './App.css'
import { useRoutes } from 'react-router-dom'
import { Link } from 'react-router-dom'
import AppSideBar from './components/AppSidebar.jsx'
import Navbar from './components/Navbar.jsx'
import { SidebarProvider } from './components/ui/sidebar.jsx'
import { createCookieSessionStorage } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Plan from './pages/Plan.jsx'
import Calendar from './pages/Calendar.jsx'
import ProtectedLayout from './components/ProtectedLayout.jsx'
import { AuthProvider } from './AuthContext.jsx'
import Respond from './pages/Respond.jsx'
import Reacthook from './pages/Reacthook.jsx'

function AppRoutes() {
  let element = useRoutes([
    // Public routes
    { path: "/", element: <SignUp /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/login", element: <Login /> },
    { path: "/respond/:token", element: <Respond /> },
    
    // Protected routes nested under a layout
    {
      path: "/",
      element: <ProtectedLayout />,
      children: [
        { path: "/home", element: <Home /> },
        { path: "/plan", element: <Plan /> },
        { path: "/calendar", element: <Calendar /> },
        // { path: "/groups", element:<Groups />},
        // { path: "/memories", element: <Memories/>}
        // ... add other protected routes here
      ]
    }
  ]);

  return element;
}


function App() {
  return (
    <>
     <AuthProvider>
        <AppRoutes />
    </AuthProvider>            
    </>
  )
}

export default App
