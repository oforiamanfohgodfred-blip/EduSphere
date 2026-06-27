import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Assignments() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [assignments, setAssignments] = useState([]);

  const handleUpload = () => {
    if (!title || !description || !dueDate) {
      alert("Please fill all fields");
      return;
    }

    const newAssignment = {
      id: Date.now(),
      title,
      description,
      dueDate,
    };

    setAssignments([...assignments, newAssignment]);

    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const handleDelete = (id) => {
    setAssignments(
      assignments.filter(
        (assignment) => assignment.id !== id
      )
    );
  };

  return (
    <DashboardLayout role="teacher">
      <h1>Assignments</h1>

      <div className="assignment-form">
        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <textarea
          placeholder="Assignment Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
        />

        <button
          className="action-btn"
          onClick={handleUpload}
        >
          Upload Assignment
        </button>
      </div>

      <div className="section-card">
        <h2>Uploaded Assignments</h2>

        {assignments.length === 0 ? (
          <p>No assignments uploaded yet.</p>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="assignment-item"
            >
              <h3>{assignment.title}</h3>

              <p>{assignment.description}</p>

              <small>
                Due: {assignment.dueDate}
              </small>

              <br />

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(assignment.id)
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

export default Assignments;