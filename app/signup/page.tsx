"use client";

import Link from "next/link";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function SignupPage() {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // role matches Laravel enum: 'innovator' | 'investor'
  const [role, setRole] = useState<"innovator" | "investor">("innovator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        role,
      });
      router.push("/feed");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      {/* Header Section */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <Link href="/" className="header-logo-link">
              <h1 className="header-logo">VENTURA</h1>
            </Link>
          </div>
          <div className="header-center">
            <Link href="/" className="header-options-link">
              <h1 className="header-options">Home</h1>
            </Link>
            <Link href="/#for-innovators" className="header-options-link">
              <h1 className="header-options">Platform</h1>
            </Link>
            <Link href="/#meet-creators" className="header-options-link">
              <h1 className="header-options">Contact</h1>
            </Link>
          </div>
          <div className="header-right">
            <Link href="/login" className="btn-login">
              Log In
            </Link>
            <Link href="/signup" className="btn-signup">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <Link href="/" className="auth-logo">
            <h1 className="auth-logo-img">VENTURA</h1>
          </Link>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join VENTURA today</p>

          {error && <p className="error-msg">{error}</p>}

          {/* Role Selection */}
          <div className="role-select-group">
            <button
              type="button"
              onClick={() => setRole("innovator")}
              className={`role-btn ${role === "innovator" ? "active" : ""}`}
            >
              Innovator
            </button>
            <button
              type="button"
              onClick={() => setRole("investor")}
              className={`role-btn ${role === "investor" ? "active" : ""}`}
            >
              Investor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required /> I agree to the{" "}
                <Link href="/terms" className="auth-link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="auth-link">
                  Privacy Policy
                </Link>
              </label>
            </div>
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
