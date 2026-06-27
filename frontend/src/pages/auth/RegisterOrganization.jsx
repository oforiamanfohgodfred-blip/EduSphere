import { useState } from "react";
import axios from "axios";

function RegisterOrganization() {
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("School");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/organizations/register",
        {
          organization_name: organizationName,
          organization_type: organizationType,
          country,
          email,
          password,
        }
      );

      alert(
        `Organization Registered!\n\nOrganization Code: ${res.data.organization_code}`
      );

      setOrganizationName("");
      setCountry("");
      setEmail("");
      setPassword("");
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

        <h2>Register Your Organization</h2>

        <div className="input-group">
          <label>Organization Name</label>
          <input
            type="text"
            value={organizationName}
            onChange={(e) =>
              setOrganizationName(e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Organization Type</label>

          <select
            value={organizationType}
            onChange={(e) =>
              setOrganizationType(e.target.value)
            }
          >
            <option>School</option>
            <option>University</option>
            <option>Academy</option>
            <option>Study Group</option>
            <option>Training Center</option>
          </select>
        </div>

        <div className="input-group">
          <label>Country</label>

          <input
            type="text"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <button
          className="login-btn"
          onClick={handleRegister}
        >
          Register Organization
        </button>
      </div>
    </div>
  );
}

export default RegisterOrganization;