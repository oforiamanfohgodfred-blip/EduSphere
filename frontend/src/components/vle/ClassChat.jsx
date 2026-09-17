import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/class-chat.css";

function ClassChat({ classId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef(null);
  const activeRef = useRef(true);

  const loadMessages = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get(`/vle/classes/${classId}/chat?limit=100`);
      if (activeRef.current) {
        setMessages(Array.isArray(response.data) ? response.data : []);
        setError("");
      }
    } catch (requestError) {
      if (activeRef.current) setError(requestError.response?.data?.message || "Unable to load class chat.");
    } finally {
      if (activeRef.current && showLoading) setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    activeRef.current = true;
    loadMessages(true);
    const interval = window.setInterval(() => loadMessages(false), 5000);
    return () => {
      activeRef.current = false;
      window.clearInterval(interval);
    };
  }, [loadMessages]);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const submitMessage = async (event) => {
    event?.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setError("");
      const response = await api.post(`/vle/classes/${classId}/chat`, { message: text });
      setMessages((current) => [...current, response.data].slice(-100));
      setMessage("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send your message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(event);
    }
  };

  return (
    <section className="class-chat-card" aria-label="Class chat">
      <div className="class-chat-header">
        <div>
          <span className="class-chat-kicker">Class collaboration</span>
          <h2>Class Chat</h2>
          <p>Talk with the people connected to this class.</p>
        </div>
        <span className="class-chat-live">● Live</span>
      </div>

      {error && <div className="class-chat-error" role="alert">{error}</div>}

      <div className="class-chat-messages" ref={messagesRef} aria-live="polite">
        {loading ? (
          <div className="class-chat-empty">Loading class chat...</div>
        ) : messages.length === 0 ? (
          <div className="class-chat-empty">
            <strong>Start the conversation.</strong>
            <span>Ask a question, share an update, or help a classmate.</span>
          </div>
        ) : (
          messages.map((item) => {
            const isMine = item.sender_role === user?.role && Number(item.sender_reference_id) === Number(user?.reference_id);
            return (
              <article key={item.id} className={`chat-message ${isMine ? "mine" : ""}`}>
                <div className="chat-message-bubble">
                  <div className="chat-message-meta">
                    <strong>{isMine ? "You" : item.sender_name || "EduSphere member"}</strong>
                    <span>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p>{item.message}</p>
                </div>
              </article>
            );
          })
        )}
      </div>

      <form className="class-chat-composer" onSubmit={submitMessage}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, 2000))}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          aria-label="Write a class chat message"
          rows={2}
          maxLength={2000}
        />
        <div className="class-chat-composer-footer">
          <span>{message.length}/2000 · Enter to send</span>
          <button type="submit" className="login-btn" disabled={!message.trim() || sending}>
            {sending ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ClassChat;
