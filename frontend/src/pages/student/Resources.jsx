import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaDownload } from "react-icons/fa";

function Resources() {
  const resources = [
    {
      id: 1,
      title: "Web Development Notes",
      type: "PDF Document",
      icon: <FaFilePdf />,
    },
    {
      id: 2,
      title: "Database Systems Slides",
      type: "PowerPoint",
      icon: <FaFilePowerpoint />,
    },
    {
      id: 3,
      title: "Assignment Template",
      type: "Word Document",
      icon: <FaFileWord />,
    },
  ];

  return (
    <DashboardLayout role="student">
      <h1>Learning Resources</h1>

      <div className="resources-container">
        {resources.map((resource) => (
          <div className="resource-card" key={resource.id}>
            <div className="resource-icon">
              {resource.icon}
            </div>

            <h3>{resource.title}</h3>

            <p>{resource.type}</p>

            <button className="download-btn">
              <FaDownload /> Download
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Resources;