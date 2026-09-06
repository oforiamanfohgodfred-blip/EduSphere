import { useEffect, useState } from "react";
import api from "../../services/api";

function NotificationsPanel() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/vle/notifications").then(({ data }) => {
      if (active) setItems(Array.isArray(data) ? data : []);
    }).catch(() => {
      if (active) setError("Unable to load notifications.");
    });
    return () => { active = false; };
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/vle/notifications/${id}/read`);
      setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
    } catch {
      setError("Unable to update notification.");
    }
  };

  return <section className="section-card" aria-label="Notifications">
    <h2>Notifications</h2>
    {error && <p className="error-message" role="alert">{error}</p>}
    {!items.length ? <p>No notifications.</p> : items.map((item) => <article key={item.id} style={{ opacity: item.read_at ? 0.65 : 1 }}>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <small>{new Date(item.created_at).toLocaleString()}</small>
      {!item.read_at && <button type="button" className="action-btn" onClick={() => markRead(item.id)}>Mark as read</button>}
      <hr />
    </article>)}
  </section>;
}

export default NotificationsPanel;
