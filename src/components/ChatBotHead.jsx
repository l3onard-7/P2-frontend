import React from "react";
import styles from "../styles/chatbothead.module.css"
import ChatIcon from "./ChatIcon";

function ChatBotHead({ setShowChatbot }) {
  return (
    <div className={styles.chat_header}>
      {/* keep the close button but absolutely position it so header content can be centered */}
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

      <p className={styles.disclaimer}>
        the content is for informational and educational purposes not for personalized medical advice.
      </p>
    </div>
  );
}

export default ChatBotHead;
