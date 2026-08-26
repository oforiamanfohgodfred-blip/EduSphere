import DashboardLayout from "../../components/layout/DashboardLayout";
import ChatPanel from "../../components/vle/ChatPanel";

function StaffChat() {
  return (
    <DashboardLayout role="teacher">
      <div className="vle-page-shell">
        <ChatPanel
          type="staff"
          title="Teachers & Staff Chat"
          subtitle="A private communication space for teachers and authorized organization staff. Students cannot access this chat."
        />
      </div>
    </DashboardLayout>
  );
}

export default StaffChat;
