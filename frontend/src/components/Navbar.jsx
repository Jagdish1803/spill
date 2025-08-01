import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useLocation } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActivePath = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home", icon: MessageSquare },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="size-5 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Spill</h1>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(link.to)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent className="size-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-8 rounded-full object-cover border-2 border-gray-200"
                />
                <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                  {authUser?.fullname || "User"}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="size-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mb-3">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-10 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {authUser?.fullname || "User"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {authUser?.email}
                  </p>
                </div>
              </div>

              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActivePath(link.to)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="size-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;