import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { useThemeStore } from "./store/useThemeStore.js";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingPage from "./pages/SettingPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, connectSocket, disconnectSocket } = useAuthStore();
  const { initializeTheme } = useThemeStore();
  
  useEffect(() => {
    initializeTheme();
    checkAuth();
    
    return () => {
      disconnectSocket();
    };
  }, [checkAuth, disconnectSocket, initializeTheme]);

  useEffect(() => {
    if (authUser) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser, connectSocket, disconnectSocket]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="size-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {authUser && <Navbar />}
      
      <Routes>
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/settings" 
          element={authUser ? <SettingPage /> : <Navigate to="/login" replace />} 
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={authUser ? "/" : "/login"} replace />}
        />
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: 'red',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
};

export default App;