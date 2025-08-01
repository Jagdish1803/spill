import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (formData.fullname.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return false;
    }
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
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signup(formData);
    } catch (error) {
      console.error("Signup failed:", error);
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
              <h1 className="text-2xl font-bold mt-2 text-gray-800">Create Account</h1>
              <p className="text-gray-600">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Full Name</span>
              </label>
              <div className="flex border border-gray-300 p-3 rounded-md items-center justify-start focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  placeholder="John Doe"
                  className="outline-none bg-transparent pl-2 w-full text-gray-800"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  disabled={isSigningUp}
                />
              </div>
            </div>

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
                  disabled={isSigningUp}
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
                  disabled={isSigningUp}
                />
                <button
                  type="button"
                  className="flex items-center p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningUp}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-gray-400" />
                  ) : (
                    <Eye className="size-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              disabled={isSigningUp}
            >
              {isSigningUp && <Loader2 className="size-5 animate-spin" />}
              <span>{isSigningUp ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones"
      />
    </div>
  );
};

export default SignUpPage;