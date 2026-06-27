import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleRegister = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          fullname,
          email,
          password,
          role,
        }
      );

      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration failed."
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="logo">EduSphere</h1>
        <p className="tagline">Learn. Share. Achieve.</p>

        <h2>Create Account</h2>

        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Register As</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <button
          className="login-btn"
          onClick={handleRegister}
        >
          Create Account
        </button>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;