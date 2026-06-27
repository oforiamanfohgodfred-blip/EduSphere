import { Link } from "react-router-dom";

function RegisterChoice() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="logo">EduSphere</h1>
        <p className="tagline">Learn. Share. Achieve.</p>

        <h2>Get Started</h2>

        <p style={{ textAlign: "center", marginBottom: "30px" }}>
          Choose how you want to join EduSphere.
        </p>

        <Link to="/register-organization">
          <button className="login-btn">
            🏢 Register an Organization
          </button>
        </Link>

        <div style={{ height: "15px" }}></div>

        <Link to="/join-organization">
          <button className="login-btn">
            👨‍🎓 Join an Organization
          </button>
        </Link>

        <p style={{ marginTop: "25px", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterChoice;