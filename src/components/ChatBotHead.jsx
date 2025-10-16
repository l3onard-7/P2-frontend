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
    <div className={styles.chat_header}>
      {/* Close button */}
      <button
        onClick={() => setShowChatbot(prev => !prev)}
        className={`${styles.close_button} material-symbols-rounded`}
        aria-label="Toggle chatbot"
      >
        Keyboard_arrow_down
      </button>

      <div className={styles.header_info}>
        <ChatIcon />
        <h2>SunireChatBot</h2>
      </div>

      {/* Only show disclaimer if in widget mode */}
      {isWidget && (
        <p className={styles.disclaimer}>
          the content is for informational and educational purposes not for personalized medical advice.
        </p>
      )}
    </div>
  );
}

export default ChatBotHead;
