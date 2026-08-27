import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function JoinOrganization() {
  const navigate = useNavigate();
  const [organizationCode, setOrganizationCode] = useState("");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const lookupClasses = async () => {
    setError("");
    setMessage("");
    setClasses([]);
    setClassId("");

    if (!organizationCode.trim()) {
      setError("Enter your organization code first.");
      return;
    }

    if (role !== "student") {
      setMessage("Teacher accounts can be created by the organization administrator.");
      return;
    }

    try {
      setLoadingClasses(true);
      const response = await api.get(`/organizations/public/${encodeURIComponent(organizationCode.trim())}/classes`);
      setClasses(Array.isArray(response.data) ? response.data : []);
      if (!response.data?.length) setMessage("No classes are currently available for this organization.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to find that organization.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (role === "student" && !classId) {
      setError("Select your class.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register-member", {
        organizationCode: organizationCode.trim(),
        role,
        name: name.trim(),
        email: email.trim(),
        password,
        classId: role === "student" ? Number(classId) : undefined,
      });

      setMessage(response.data?.message || "Account created successfully. You can now log in.");
      setTimeout(() => navigate("/"), 800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="logo">EduSphere</h1>
        <p className="tagline">Learn. Share. Achieve.</p>
        <h2>Join an Organization</h2>

        {error && <div className="error-message" role="alert">{error}</div>}
        {message && <div className="success-message" role="status">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="join-code">Organization Code</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input id="join-code" value={organizationCode} onChange={(e) => setOrganizationCode(e.target.value)} placeholder="e.g. ORG001" required />
              <button type="button" className="login-btn" onClick={lookupClasses} disabled={loadingClasses}>
                {loadingClasses ? "Checking..." : "Find"}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="join-role">Account Type</label>
            <select id="join-role" value={role} onChange={(e) => { setRole(e.target.value); setClasses([]); setClassId(""); }}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="join-name">Full Name</label>
            <input id="join-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </div>

          <div className="input-group">
            <label htmlFor="join-email">Email</label>
            <input id="join-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>

          <div className="input-group">
            <label htmlFor="join-password">Password</label>
            <input id="join-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </div>

          {role === "student" && (
            <div className="input-group">
              <label htmlFor="join-class">Class</label>
              <select id="join-class" value={classId} onChange={(e) => setClassId(e.target.value)} required>
                <option value="">Select your class</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default JoinOrganization;
