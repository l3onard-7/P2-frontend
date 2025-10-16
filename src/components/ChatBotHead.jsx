import React from "react";
import styles from "../styles/chatbothead.module.css";
import ChatIcon from "./ChatIcon";

function ChatBotHead({ setShowChatbot }) {
  // Detect widget mode via URL param or iframe
  const urlParams = (typeof window !== "undefined") ? new URLSearchParams(window.location.search) : null;
  const isWidget = Boolean(
    (urlParams && urlParams.get('widget') === 'true') ||
    (typeof window !== "undefined" && window.self !== window.top)
  );

  return (
    <div className={`${styles.chat_header} ${isWidget ? styles.widget : ""}`}>
      {/* Close button */}
      <button
        onClick={() => setShowChatbot(prev => !prev)}
        className={`${styles.close_button} material-symbols-rounded`}
        aria-label="Toggle chatbot"
      >
        Keyboard_arrow_down
      </button>

      {/* Header info */}
      <div className={styles.header_info}>
        <ChatIcon />
        <h2>SunireChatBot</h2>
      </div>

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        {isWidget
          ? "The content is for informational and educational purposes, not personalized medical advice."
          : "Welcome to SunireChatBot – chat with AI for information and tips."}
      </p>
    </div>
  );
}

export default ChatBotHead;
