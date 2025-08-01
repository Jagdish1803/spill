import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="size-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold mt-2 text-gray-800">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Email</span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center justify-start focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Password</span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center justify-start focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  className="flex items-center p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-gray-400" />
                  ) : (
                    <Eye className="size-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              disabled={isLoggingIn}
            >
              {isLoggingIn && <Loader2 className="size-5 animate-spin" />}
              <span>{isLoggingIn ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Welcome back"
        subtitle="Sign in to continue your conversations and catch up with your messages"
      />
    </div>
  );
};

export default LoginPage;