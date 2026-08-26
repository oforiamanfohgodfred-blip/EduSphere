import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";

function ChatPanel({ type = "class", classId, title, subtitle }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const endpoint = type === "staff" ? "/chat/staff" : `/chat/classes/${classId}`;
      const response = await api.get(endpoint);
      setMessages(response.data.messages || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load chat.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [classId, type]);

  useEffect(() => {
    if (type === "class" && !classId) return;
    loadMessages();
    const interval = window.setInterval(() => loadMessages(true), 5000);
    return () => window.clearInterval(interval);
  }, [classId, loadMessages, type]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const value = message.trim();
    if (!value || sending) return;

    setSending(true);
    try {
      const endpoint = type === "staff" ? "/chat/staff" : `/chat/classes/${classId}`;
      await api.post(endpoint, { message: value });
      setMessage("");
      await loadMessages(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="vle-chat-card">
      <div className="vle-chat-header">
        <div>
          <span className="section-kicker">{type === "staff" ? "STAFF COMMUNICATION" : "CLASS COMMUNICATION"}</span>
          <h2>{title || (type === "staff" ? "Teachers & Staff Chat" : "Class Chat")}</h2>
          <p>{subtitle || "Talk with the people who belong to this learning space."}</p>
        </div>
        <span className="chat-live-dot">Live</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="vle-chat-messages" aria-live="polite">
        {loading ? (
          <div className="vle-chat-empty">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="vle-chat-empty">
            <strong>No messages yet</strong>
            <span>Start the conversation.</span>
          </div>
        ) : (
          messages.map((item) => (
            <article key={item.id} className="vle-chat-message">
              <div className="vle-chat-avatar">{(item.sender_name || "U").charAt(0).toUpperCase()}</div>
              <div className="vle-chat-bubble">
                <div className="vle-chat-meta">
                  <strong>{item.sender_name || item.sender_email || "User"}</strong>
                  <small>{new Date(item.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</small>
                </div>
                <p>{item.message}</p>
              </div>
            </article>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {type !== "staff" || classId ? (
        <form className="vle-chat-composer" onSubmit={send}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={type === "staff" ? "Message teachers and staff..." : "Message your class..."}
            maxLength={5000}
          />
          <button type="submit" disabled={sending || !message.trim()}>{sending ? "Sending..." : "Send"}</button>
        </form>
      ) : null}
    </section>
  );
}

export default ChatPanel;
