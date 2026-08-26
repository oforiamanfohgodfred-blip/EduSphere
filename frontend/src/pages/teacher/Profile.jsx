import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/vle.css";

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user?.profile || null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: user?.profile?.full_name || "",
    email: user?.profile?.email || "",
    subject: user?.profile?.subject || "",
    phone: user?.profile?.phone || "",
  });

  useEffect(() => {
    if (!profile && user?.profile) {
      setProfile(user.profile);
      setForm({
        full_name: user.profile.full_name || "",
        email: user.profile.email || "",
        subject: user.profile.subject || "",
        phone: user.profile.phone || "",
      });
    }
  }, [profile, user]);

  const handleChange = (e) =>
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    if (!profile?.id) return;
    try {
      setSaving(true);
      setError("");
      const response = await api.put(`/teachers/${profile.id}`, {
        ...form,
        class_ids: (profile.classes || []).map((item) => item.id),
      });
      const updated = { ...profile, ...response.data };
      setProfile(updated);
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        storedUser.profile = updated;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="vle-page-shell">
        <div className="page-header">
          <div>
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1>Teacher Profile</h1>
            <p>Your identity comes from the teacher account created by your organization.</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-card profile-vle-card">
          {!profile ? (
            <div className="empty-state"><strong>Profile unavailable</strong><span>Please sign out and sign in again.</span></div>
          ) : editing ? (
            <div className="class-form-grid">
              <label>Full name<input name="full_name" value={form.full_name} onChange={handleChange} /></label>
              <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
              <label>Subject<input name="subject" value={form.subject} onChange={handleChange} /></label>
              <label>Phone<input name="phone" value={form.phone} onChange={handleChange} /></label>
              <div className="form-action">
                <button type="button" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
                <button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-vle-content">
              <div className="profile-vle-avatar">{profile.full_name?.charAt(0)?.toUpperCase() || "T"}</div>
              <div className="profile-vle-main">
                <span className="person-id">{profile.teacher_id}</span>
                <h2>{profile.full_name}</h2>
                <p>{profile.subject || "Teaching Staff"}</p>
                <div className="profile-detail-grid">
                  <span><strong>Email</strong>{profile.email}</span>
                  <span><strong>Phone</strong>{profile.phone || "Not provided"}</span>
                  <span><strong>Classes</strong>{(profile.classes || []).map((item) => item.name).join(", ") || "None assigned"}</span>
                </div>
                <button type="button" className="primary-button" onClick={() => setEditing(true)}>Edit Profile</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
