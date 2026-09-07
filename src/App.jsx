import { useState } from "react";
import { sendMessage } from "./services/chatApi";

function App() {
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const data = await sendMessage(
        message,
        threadId
      );

      setAnswer(data.answer);
      setThreadId(data.thread_id);

      console.log(
        "Thread ID:",
        data.thread_id
      );
    } catch (error) {
      console.error(error);
      setAnswer(
        `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Serendib Routes AI</h1>

      <input
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Ask about Sri Lanka..."
      />

      <button
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <hr />

      <p>{answer}</p>
    </div>
  );
}

export default App;