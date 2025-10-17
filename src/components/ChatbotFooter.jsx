import React from "react";
import styles from "../styles/chatfooter.module.css"
import { useRef } from "react";

function ChatBotFooter({setChatHistory , getModelResponse, chatHistory}) 
{
   const inputRef = useRef()
   
   const handleFromSumnit = (e) => {
      e.preventDefault();
      const userMessage = inputRef.current.value.trim();
      if(!userMessage) return;
      inputRef.current.value = "";
      getModelResponse(userMessage);
   }
   
   return(
      <div className={styles.chat_footer}>
         <form action="#"  
         onSubmit={handleFromSumnit} 
         className={styles.chat_form}>
            <input 
               ref={inputRef} 
               type="text" 
               placeholder="Question?"  
               className={styles.chat_input} 
               required 
               autoComplete="off"
            />
            <button 
               type="submit"
               className="material-symbols-rounded">
               arrow_right
            </button>
         </form>
      </div>
   )
}

export default ChatBotFooter
