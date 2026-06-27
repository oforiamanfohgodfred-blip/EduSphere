import DashboardLayout from "../../components/layout/DashboardLayout";

function Announcements() {
  const announcements = [
    {
      id: 1,
      title: "Mid-Semester Break",
      date: "10 Nov 2025",
      message:
        "The university will be on a one-week mid-semester break beginning Monday.",
    },
    {
      id: 2,
      title: "Project Submission",
      date: "18 Nov 2025",
      message:
        "All final year project proposals must be submitted before 5:00 PM.",
    },
    {
      id: 3,
      title: "Library Notice",
      date: "22 Nov 2025",
      message:
        "The library will operate extended hours during the examination period.",
    },
  ];

  return (
    <DashboardLayout role="student">
      <h1>Announcements</h1>

      <div className="announcement-container">
        {announcements.map((item) => (
          <div className="announcement-card" key={item.id}>
            <h3>{item.title}</h3>

            <small>{item.date}</small>

            <p>{item.message}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Announcements;