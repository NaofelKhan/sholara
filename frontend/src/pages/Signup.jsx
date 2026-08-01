import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import "../styles/signup.css";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [, navigate] = useLocation();
  const { register } = useAuth();

const [form, setForm] = useState({
  fullName: "",
  email: "",
  role: "student",
  university: "",
  department: "",
  studentId: "",
  password: "",
  confirmPassword: ""
});

 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");



if (!form.fullName ||
    !form.email ||
    !form.password ||
    !form.confirmPassword) {

    setError("Please complete all required fields.");
    return;
}

    if(form.password !== form.confirmPassword){
        setError("Passwords do not match.");
        return;
    }

    if(form.password.length < 8){
        setError("Password must be at least 8 characters.");
        return;
    }
    if (!agree) {
      setError("Please accept the Terms and Privacy Policy.");
      return;
    }
    try {
      setLoading(true);

      await register(form);

      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
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

                <h1 className="brand-heading">
                Empower Your
                <br />
                Intellectual Journey.
                </h1>

                <p className="brand-description">
                Join a global network of researchers, students, and faculty.
                Scholara Intelligence System provides the tools you need to
                excel in modern academia.
                </p>

    
                <div className="stats">

                <div className="stat-card">
                    <h3>150K+</h3>
                    <span>ACTIVE SCHOLARS</span>
                </div>

                <div className="stat-card">
                    <h3>900+</h3>
                    <span>INSTITUTIONS</span>
                </div>

                </div>

                <div className="brand-bottom">

                <div className="avatars">

                    <div className="avatar">
                    <img src="/images/researcher1.jpg" alt="Researcher" />
                    </div>

                    <div className="avatar">
                    <img src="/images/researcher2.jpg" alt="Student" />
                    </div>

                    <div className="avatar">
                    <img src="/images/researcher3.jpg" alt="Scientist" />
                    </div>

                </div>

                <p className="brand-quote">
                    "Connecting minds across the globe."
                </p>

                </div>
                </div>
                </section> 
          

                {/* Right Side */}

            <section className="login-panel">

            <div className="login-container signup-container">

                <h1 className="login-title">
                Create your Scholara Account
                </h1>

                <p className="login-description">
                Complete the form below to join our academic community.
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

        <div className="section">

        <h2 className="section-title">
            Personal Information
        </h2>

        <div className="field-group">

            <label className="field-label">
            Full Name
            </label>

            <div className="input-wrapper">

            <input
                className="input"
                type="text"
                name="fullName"
                placeholder="e.g. John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
            />

            </div>

        </div>

        <div className="field-group">

            <label className="field-label">
            Email Address
            </label>

            <div className="input-wrapper">

            <input
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

        </div>

        <div className="section">

        <h2 className="section-title">
            Select Your Role
        </h2>

        <div className="role-buttons">

        <button
        type="button"
        className={`role-button ${form.role === "student" ? "active" : ""}`}
        onClick={() => setForm({ ...form, role: "student" })}
        >
        <svg
            className="role-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 10L12 5 2 10l10 5 10-5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>

        <span>Student</span>
        </button>

        <button
        type="button"
        className={`role-button ${form.role === "faculty" ? "active" : ""}`}
        onClick={() => setForm({ ...form, role: "faculty" })}
        >
        <svg
            className="role-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8z"/>
            <path d="M4 21a8 8 0 0116 0"/>
        </svg>

        <span>Faculty</span>
        </button>

        <button
        type="button"
        className={`role-button ${form.role === "admin" ? "active" : ""}`}
        onClick={() => setForm({ ...form, role: "admin" })}
        >
        <svg
            className="role-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/>
            <path d="M9 12l2 2 4-4"/>
        </svg>

        <span>Admin</span>
        </button>

        </div>
        </div>
        <div className="section">

            <h2 className="section-title">
                Academic Details
            </h2>

            <div className="field-group">

                <label className="field-label">
                University / Institution
                </label>

                <div className="input-wrapper">

                <input
                    className="input"
                    type="text"
                    name="university"
                    placeholder="Your University"
                    value={form.university}
                    onChange={handleChange}
                />

                </div>

            </div>

            <div className="field-group">

                <label className="field-label">
                Department
                </label>

                <div className="input-wrapper">

                <input
                    className="input"
                    type="text"
                    name="department"
                    placeholder="Computer Science"
                    value={form.department}
                    onChange={handleChange}
                />

                </div>

            </div>

            <div className="field-group">

                <label className="field-label">
                Student ID / Faculty Code
                </label>

                <div className="input-wrapper">

                <input
                    className="input"
                    type="text"
                    name="studentId"
                    placeholder="SCH-2026-001"
                    value={form.studentId}
                    onChange={handleChange}
                    required
                />

                </div>

            </div>

            

        </div>
        <div className="section">

  <h2 className="section-title">
    Security
  </h2>

  <div className="field-group">

    <label className="field-label">
      Password
    </label>

    <div className="input-wrapper">

      <input
        className="input"
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Minimum 8 characters"
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

  <div className="field-group">

    <label className="field-label">
      Confirm Password
    </label>

    <div className="input-wrapper">

      <input
        className="input"
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />
        <button
        type="button"
        className="password-toggle"
        onClick={() =>
            setShowConfirmPassword(!showConfirmPassword)
        }
        >
        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    </div>

  </div>

</div>

<label className="remember-row">

  <input
    type="checkbox"
    checked={agree}
    onChange={() => setAgree(!agree)}
  />

<span>
  I agree to the
  <a href="#"> Terms of Service </a>
  and
  <a href="#"> Privacy Policy</a>
</span>

</label>

<button
  className="login-button"
  type="submit"
  disabled={loading}
>
  {loading ? "Creating Account..." : "Create Account"}
</button>

<p className="signup-text">

  Already have an account?{" "}

  <button
    type="button"
    className="signup-button"
    onClick={() => navigate("/")}
  >
    Log In
  </button>

</p>

</form>

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

export default Signup;