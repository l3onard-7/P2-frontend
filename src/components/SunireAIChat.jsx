import React, { useState, useEffect } from "react";
import ChatBotHead from "./ChatBotHead";
import ChatBotBody from "./ChatBotBody";
import ChatBotFooter from "./ChatbotFooter";
import styles from "../styles/sunireaichat.module.css"

function SunireAIChat() {
   const [chatHistory, setChatHistory] = useState([]);
   const [showChatbot, setShowChatbot] = useState(false);
   const [isAnimating, setIsAnimating] = useState(false);
   const [response, setResponse] = useState(null);

   // Check if running in widget mode
   const urlParams = new URLSearchParams(window.location.search);
   const isWidget = urlParams.get('widget') === 'true';
   const backendUrl = urlParams.get('backend') || import.meta.env.VITE_BACKEND_URL || "https://prj1-648397338052.europe-west2.run.app";
   const theme = urlParams.get('theme') || 'default';
   const widgetId = urlParams.get('widgetId') || 'default';

   const HTTP = backendUrl + "/chat";

   // Widget-specific styles and behavior
   useEffect(() => {
      if (isWidget) {
         // Remove default margins/padding for widget mode
         document.body.style.margin = '0';
         document.body.style.padding = '0';
         document.body.style.background = 'transparent';
         
         // Notify parent window about size changes
         const notifyResize = () => {
            const container = document.querySelector(`.${styles.container}`);
            if (container && window.parent !== window) {
               window.parent.postMessage({
                  type: 'SUNIRE_WIDGET_RESIZE',
                  width: showChatbot ? 400 : 60,
                  height: showChatbot ? 650 : 60 // Increased from 600 to 650 to fit disclaimer + footer
               }, '*');
            }
         };

         notifyResize();
         window.addEventListener('resize', notifyResize);
         
         return () => {
            window.removeEventListener('resize', notifyResize);
         };
      }
   }, [isWidget, showChatbot]);

   const toggleChatbot = () => {
      if (showChatbot) {
         setIsAnimating(true);
         setTimeout(() => {
           setShowChatbot(false);
           setIsAnimating(false);
         }, 300);
       } else {
         setShowChatbot(true);
       }
    };

   const getModelResponse = async (userMessage) => {
      const currentChatHistory = [...chatHistory, {role:"user", text:userMessage}];
      setChatHistory(currentChatHistory);
      setChatHistory((prev) =>[...prev, {role:"model", text:"Thinking.." }]);

      const historyForBackend = currentChatHistory.map(({role,text}) =>({role,content:{text}}));
      const mostrecentchat = historyForBackend[historyForBackend.length - 1];
      const user_prompt = mostrecentchat["content"]["text"];   
      
      const requestSever = {
         method: "POST",
         headers: {
            'Content-type': 'application/json; charset=UTF-8',
         },
         body: JSON.stringify({
            prompt: user_prompt
         })
      }
      
      try {
         let response = await fetch(HTTP, requestSever);
         if(!response.ok) throw new Error(response.statusText || "An Error has Occurred");
         
         const reader = response.body.getReader();
         const decoder = new TextDecoder("utf-8");
         let result = "";
         
         while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            result += decoder.decode(value, { stream: true });

            setChatHistory((prev) => {
                const filtered = prev.filter(msg => msg.text !== "Thinking..");
                if (filtered.length > 0 && filtered[filtered.length - 1].role === "model") {
                    return [
                        ...filtered.slice(0, -1),
                        { role: "model", text: result.trim() }
                    ];
                }
                return [
                    ...filtered,
                    { role: "model", text: result.trim() }
                ];
            });
        }
        
        console.log("Final result:", result);
      } catch(error) {
         console.log(error);
      }
   }

   // Widget-specific container styles
   const containerStyles = isWidget ? {
      position: 'fixed',
      bottom: '0',
      right: '0',
      background: 'transparent'
   } : {};

   return(
      <>
      <div className={styles.container} style={containerStyles}>
         <div className={styles.chat_container}>
         {showChatbot && (
            <div className={`${!isAnimating ? styles.chatbot_popup : styles.showpop_up}`} >
             
            <ChatBotHead setShowChatbot={setShowChatbot}/>
            <ChatBotBody chatHistory={chatHistory}/>
            <ChatBotFooter setChatHistory={setChatHistory} getModelResponse={getModelResponse} chatHistory={chatHistory}/>
                </div>)}
            
            <button onClick={toggleChatbot} id={`${showChatbot ? styles.mini : ""}`} className={styles.chat_toggler}>
                  <span 
                  className="material-symbols-rounded">
                  { showChatbot ? "close" : "mode_comment"}
               </span >
            </button>
         </div>
      </div>
      
      {!isWidget && response && (
         <div>
            <div>{response.generation}</div>
            {response.urls && response.urls.length > 0 && (
               <div>
                  <strong>References:</strong>
                  <ul>
                     {response.urls.map((url, idx) => (
                        <li key={idx}>
                           <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </div>
      )}
      </>
   )
}

export default SunireAIChat
