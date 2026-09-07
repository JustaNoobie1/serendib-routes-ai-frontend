import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import brandMark from "./assets/brand-mark.png";
import { sendMessage as sendChatMessage } from "./services/chatApi";

import "./app.css";


const WELCOME_MESSAGE = {
  id: 1,
  role: "assistant",
  text:
    "Ayubowan! I'm SerenAI, your Sri Lanka travel concierge. How can I help you plan your journey?",
};


export default function SerenAIChat() {

  const [messages, setMessages] = useState(() => {
    const savedMessages =
      sessionStorage.getItem("serenai_messages");

    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch {
        return [WELCOME_MESSAGE];
      }
    }

    return [WELCOME_MESSAGE];
  });

  const createThreadId = () => crypto.randomUUID();
  const [threadId, setThreadId] = useState(() => {
  const savedThreadId =
    sessionStorage.getItem("serenai_thread_id");

  if (savedThreadId) {
    return savedThreadId;
  }

  const newThreadId = createThreadId();

  sessionStorage.setItem(
    "serenai_thread_id",
    newThreadId
  );

  return newThreadId;
});


  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [latestId, setLatestId] = useState(null);


  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const nextId = useRef(
    messages.length + 1
  );


  /* -----------------------------
     Save conversation locally
  ----------------------------- */

  useEffect(() => {

    sessionStorage.setItem(
      "serenai_messages",
      JSON.stringify(messages)
    );

  }, [messages]);


  /* -----------------------------
     Auto scroll
  ----------------------------- */

  const scrollToBottom = () => {

    if (scrollRef.current) {

      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;

    }

  };


  useEffect(() => {

    scrollToBottom();

  }, [messages, isTyping]);


  /* -----------------------------
     Auto-growing textarea
  ----------------------------- */

  const autoGrow = (element) => {

    element.style.height = "auto";

    element.style.height =
      Math.min(
        element.scrollHeight,
        140
      ) + "px";

  };


  const handleInputChange = (event) => {

    setInput(event.target.value);

    autoGrow(event.target);

  };


  /* -----------------------------
     Enter to send
     Shift + Enter for new line
  ----------------------------- */

  const handleKeyDown = (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  };


  /* -----------------------------
     Send message to FastAPI
  ----------------------------- */

  const sendMessage = async () => {

    const text = input.trim();

    if (!text || isTyping) {
      return;
    }


    const userMessage = {
      id: nextId.current++,
      role: "user",
      text,
    };


    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);


    setInput("");
    setLatestId(null);
    setIsTyping(true);


    if (textareaRef.current) {

      textareaRef.current.style.height =
        "auto";

    }


    try {

      const data =
        await sendChatMessage(
          text,
          threadId
        );


      /*
        Backend response:
        {
          answer: "...",
          thread_id: "uuid..."
        }
      */


      if (
        data.thread_id &&
        data.thread_id !== threadId
      ) {

        setThreadId(
          data.thread_id
        );

        sessionStorage.setItem(
          "serenai_thread_id",
          data.thread_id
        );

      }


      const replyId =
        nextId.current++;


      setLatestId(replyId);


      setMessages((previous) => [
        ...previous,
        {
          id: replyId,
          role: "assistant",
          text: data.answer,
        },
      ]);


    } catch (error) {

      console.error(
        "SerenAI request failed:",
        error
      );


      const errorId =
        nextId.current++;


      setLatestId(errorId);


      setMessages((previous) => [
        ...previous,
        {
          id: errorId,
          role: "assistant",
          text:
            "Sorry, I couldn't reach the travel assistant right now. Please try again in a moment.",
        },
      ]);


    } finally {

      setIsTyping(false);

    }

  };


  /* -----------------------------
     New conversation
  ----------------------------- */

  const handleNewChat = () => {
  const newThreadId = createThreadId();

  setThreadId(newThreadId);

  sessionStorage.setItem(
    "serenai_thread_id",
    newThreadId
  );

  setMessages([WELCOME_MESSAGE]);
  setInput("");
  setIsTyping(false);
  setLatestId(null);

  nextId.current = 2;

  sessionStorage.removeItem(
    "serenai_messages"
  );

  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
  }
};


  /* -----------------------------
     UI
  ----------------------------- */

  return (

    <div className="app">

      {/* HEADER */}

      <div className="header">

        <div className="brand">

          <img
            className="brand-mark"
            src={brandMark}
            alt="Serendib Routes"
          />

          <div className="brand-text">

            <h1>SerenAI</h1>

            <p>
              Sri Lanka Travel Concierge
            </p>

          </div>

        </div>


        <button
          className="new-chat-button"
          onClick={handleNewChat}
          disabled={isTyping}
        >
          New conversation
        </button>

      </div>


      {/* CHAT */}

      <div
        className="chat-container"
        ref={scrollRef}
      >

        <div className="messages">

          {messages.map((msg) => (

            <div
              key={msg.id}
              className={
                "message-row " +
                (
                  msg.role === "user"
                    ? "user-row"
                    : "assistant-row"
                ) +
                (
                  msg.id === latestId
                    ? " is-latest"
                    : ""
                )
              }
            >

              <div className="row-meta">

                {msg.role ===
                "assistant" ? (

                  <span className="name">
                    SerenAI
                  </span>

                ) : (

                  <span>
                    You
                  </span>

                )}

              </div>


              <div className="message-bubble">

                {msg.role ===
                "assistant" ? (

                  <ReactMarkdown
                    remarkPlugins={[
                      remarkGfm
                    ]}
                  >
                    {msg.text}
                  </ReactMarkdown>

                ) : (

                  <p>{msg.text}</p>

                )}

              </div>

            </div>

          ))}


          {/* TYPING INDICATOR */}

          {isTyping && (

            <div className="message-row assistant-row typing-row">

              <div className="row-meta">

                <span className="name">
                  SerenAI
                </span>

              </div>


              <div className="message-bubble">

                <div className="typing">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* INPUT */}

      <div className="input-area">

        <div className="input-wrapper">

          <textarea
            ref={textareaRef}
            value={input}
            onChange={
              handleInputChange
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Ask about Sri Lanka…"
            rows={1}
            disabled={isTyping}
          />


          <button
            className="send-button"
            onClick={sendMessage}
            disabled={
              input.trim().length === 0 ||
              isTyping
            }
            aria-label="Send message"
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
            >

              <path
                d="M4 12h15M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </button>

        </div>


        <p className="disclaimer">
          SerenAI can make mistakes.
          Current prices, availability
          and policies may require
          confirmation.
        </p>

      </div>

    </div>

  );

}