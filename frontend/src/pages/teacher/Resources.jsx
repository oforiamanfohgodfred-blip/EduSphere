import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Resources() {
  const [resourceTitle, setResourceTitle] = useState("");
  const [resources, setResources] = useState([]);

  const handleUpload = () => {
    if (!resourceTitle) {
      alert("Please enter a resource title");
      return;
    }

    const newResource = {
      id: Date.now(),
      title: resourceTitle,
      uploadedAt: new Date().toLocaleDateString(),
    };

    setResources([newResource, ...resources]);
    setResourceTitle("");
  };

  const handleDelete = (id) => {
    setResources(
      resources.filter((resource) => resource.id !== id)
    );
  };

  return (
    <DashboardLayout role="teacher">
      <h1>Resources</h1>

      <div className="assignment-form">
        <input
          type="text"
          placeholder="Resource Title"
          value={resourceTitle}
          onChange={(e) =>
            setResourceTitle(e.target.value)
          }
        />

        <input type="file" />

        <button
          className="action-btn"
          onClick={handleUpload}
        >
          Upload Resource
        </button>
      </div>

      <div className="section-card">
        <h2>Uploaded Resources</h2>

        {resources.length === 0 ? (
          <p>No resources uploaded yet.</p>
        ) : (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="assignment-item"
            >
              <h3>{resource.title}</h3>

              <small>
                Uploaded: {resource.uploadedAt}
              </small>

              <br />

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(resource.id)
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

export default Resources;