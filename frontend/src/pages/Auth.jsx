import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [, navigate] = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(form.email, form.password);

      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page">
        <main className="content">

          {/* Left Side */}

          <section className="brand-panel" aria-label="About Scholara">

            <div className="brand-content">

              <div className="brand-logo">

                <span className="logo-icon">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    <path d="M22 10v6" />
                  </svg>

                </span>

                <span className="brand-name">
                  Scholara
                </span>

              </div>

              <p className="brand-tagline">
                Empowering the next generation of academic intelligence.
              </p>

              <p className="brand-description">
                Scholara integrates peer-to-peer skill exchange with rigorous
                academic standards to accelerate your learning journey.
              </p>

              <div className="social-proof">

                <div className="avatars">

                  <div className="avatar">
                    <img
                      src="/images/researcher1.jpg"
                      alt="Researcher"
                    />
                  </div>

                  <div className="avatar">
                    <img
                      src="/images/researcher2.jpg"
                      alt="Student"
                    />
                  </div>

                  <div className="avatar">
                    <img
                      src="/images/researcher3.jpg"
                      alt="Scientist"
                    />
                  </div>

                </div>

                <div>

                  <p className="proof-title">
                    Join 15,000+ researchers
                  </p>

                  <p className="proof-subtitle">
                    Scholara Intelligence System
                  </p>

                </div>

              </div>

            </div>

          </section>

                {/* Right Side */}

<section className="login-panel" aria-labelledby="login-title">

  <div className="login-container">

    <h1 id="login-title" className="login-title">
      Welcome back
    </h1>

    <p className="login-description">
      Enter your academic credentials to access your unified learning
      workspace.
    </p>

    {error && (
      <p
        style={{
          color: "#dc2626",
          marginTop: "15px",
          fontSize: "14px",
        }}
      >
        {error}
      </p>
    )}

    <form className="login-form" onSubmit={handleSubmit}>

      <div className="field-group">

        <label htmlFor="email" className="field-label">
          Email Address
        </label>

        <div className="input-wrapper">

            <input
            id="email"
            className="input"
            type="email"
            name="email"
            placeholder="name@university.edu"
            value={form.email}
            onChange={handleChange}
            required
            />

        </div>

      </div>


        <div className="field-group">

        <label className="field-label">
            Password
        </label>

            <div className="input-wrapper">

        <input
            className="input"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
        />

        <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        </div>
      </div>

        <button
            type="button"
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
        >
            Forgot Password?
        </button>

        


   


      <label className="remember-row">

        <input
          className="remember-checkbox"
          type="checkbox"
          checked={remember}
          onChange={() => setRemember(!remember)}
        />

        <span>
          Keep me signed in on this device
        </span>

      </label>

      <button
        className="login-button"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging In..." : "Log In"}
      </button>

    </form>

    <div className="divider">

      <span className="divider-line"></span>

      <span className="divider-text">
        OR CONTINUE WITH
      </span>

      <span className="divider-line"></span>

    </div>

    <div className="social-buttons">

    <button
        type="button"
        className="social-button"
    >
        <svg
        className="social-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        >
        <path
            fill="#4285F4"
            d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.8Z"
        />
        <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.08 7.95-2.93l-3.87-3c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
        />
        <path
            fill="#FBBC05"
            d="M5.27 14.26a7.2 7.2 0 0 1 0-4.52V6.65H1.28a12 12 0 0 0 0 10.7l3.99-3.09Z"
        />
        <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.42C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.65l3.99 3.09C6.22 6.89 8.87 4.75 12 4.75Z"
        />
        </svg>

        <span>Google</span>
    </button>

    <button
        type="button"
        className="social-button"
    >
        <svg
        className="social-icon"
        viewBox="0 0 24 24"
        fill="#0A66C2"
        aria-hidden="true"
        >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.36-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
        </svg>

        <span>LinkedIn</span>
    </button>

    </div>

    <p className="signup-text">

      Don't have an account?{" "}

      <button
         type="button"
         className="signup-button"
         onClick={() => navigate("/signup")}
      >
         Sign Up
      </button>

    </p>

  </div>

</section>

        </main>

        <footer className="footer">

          <div className="footer-content">

            <span className="footer-brand">
              Scholara
            </span>

            <nav className="footer-navigation">

              <a href="#" className="footer-link">
                Privacy Policy
              </a>

              <a href="#" className="footer-link">
                Terms of Service
              </a>

              <a href="#" className="footer-link">
                Security
              </a>

              <a href="#" className="footer-link">
                Contact Support
              </a>

            </nav>

            <p className="copyright">
              © 2026 Scholara Intelligence System. All rights reserved.
            </p>

          </div>

        </footer>

      </div>

    </>
  );
};

export default Auth;
