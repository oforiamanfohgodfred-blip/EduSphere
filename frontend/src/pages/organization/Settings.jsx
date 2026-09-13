import { useAuth } from "../../context/AuthContext";

function Settings() {
  const { user } = useAuth();
  const organizationName = user?.organization_name || user?.name || "Organization";

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Organization Settings</h1>
          <p>Review the organization account currently signed in to EduSphere.</p>
        </div>
      </div>
      <section className="dashboard-card">
        <h2>{organizationName}</h2>
        <p><strong>Organization code:</strong> {user?.organization_code || "Available from your registration record."}</p>
        <p><strong>Email:</strong> {user?.email || "—"}</p>
        <p><strong>Organization ID:</strong> {user?.organization_id || "—"}</p>
        <p><strong>Account role:</strong> {user?.role || "organization"}</p>
      </section>
      <section className="dashboard-card">
        <h2>Account responsibilities</h2>
        <p>Organization accounts control teachers, students, classes and subjects. Teacher accounts are created by the organization, while students can join using the organization code and an available class.</p>
      </section>
    </div>
  );
}

export default Settings;
