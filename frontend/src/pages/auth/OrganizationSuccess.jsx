import { useLocation, useNavigate } from "react-router-dom";

function OrganizationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const { organizationName, organizationCode } = location.state || {};

  return (
    <div className="login-page">
      <div className="login-card">

        <h1 className="logo">EduSphere</h1>

        <h2>🎉 Organization Registered!</h2>

        <p>
          Congratulations! Your organization has been created successfully.
        </p>

        <br />

        <h3>{organizationName}</h3>

        <p>
          <strong>Organization Code:</strong>
        </p>

        <h2>{organizationCode}</h2>

        <p style={{ color: "red" }}>
          Save this code. Your teachers and students will need it to join your organization.
        </p>

        <button
          className="login-btn"
          onClick={() => navigate("/organization/dashboard")}
        >
          Continue
        </button>

      </div>
    </div>
  );
}

export default OrganizationSuccess;