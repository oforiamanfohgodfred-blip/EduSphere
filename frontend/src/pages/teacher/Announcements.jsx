import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  const handlePost = () => {
    if (!title || !message) {
      alert("Please fill all fields");
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title,
      message,
      date: new Date().toLocaleDateString(),
    };

    setAnnouncements([newAnnouncement, ...announcements]);

    setTitle("");
    setMessage("");
  };

  const handleDelete = (id) => {
    setAnnouncements(
      announcements.filter(
        (announcement) => announcement.id !== id
      )
    );
  };

  return (
    <DashboardLayout role="teacher">
      <h1>Announcements</h1>

      <div className="assignment-form">
        <input
          type="text"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Announcement Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          className="action-btn"
          onClick={handlePost}
        >
          Post Announcement
        </button>
      </div>

      <div className="section-card">
        <h2>Published Announcements</h2>

        {announcements.length === 0 ? (
          <p>No announcements posted yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="assignment-item"
            >
              <h3>{announcement.title}</h3>

              <p>{announcement.message}</p>

              <small>
                Posted: {announcement.date}
              </small>

              <br />

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(announcement.id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

export default Announcements;