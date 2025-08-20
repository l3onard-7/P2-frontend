import React, { useState } from "react";
import ChatBotHead from "./ChatBotHead";
import ChatBotBody from "./ChatBotBody";
import ChatBotFooter from "./ChatbotFooter";
import styles from "../styles/sunnireaichat.module.css";

function SunireAIChat() 
{
   const [chatHistory,setChatHistory] = useState([])
   const [showChatbot,setShowChatbot] = useState(false)
   const [isAnimating, setIsAnimating] = useState(false);
   const [response, setResponse] = useState(null);
   // Use environment variable or fallback to Render URL
   const HTTP = import.meta.env.VITE_BACKEND_URL || "https://p2-z4vm.onrender.com/chat";

   const toggleChatbot = () => {
      if (showChatbot) {
         // Start hiding animation
         setIsAnimating(true);
         setTimeout(() => {
           setShowChatbot(false);
           setIsAnimating(false);
         }, 300); // Match CSS transition duration (0.3s)
       } else {
         setShowChatbot(true);
       }
    };

   const getModelResponse = async (history) =>
   {
      console.log(history);
      history = history.map(({role,text}) =>({role,content:{text}}));

      const user_messages = history.filter(msg => msg.role !== "model");
      console.log(user_messages);
      const mostrecentchat = history[history.length - 1];
      const user_prompt = mostrecentchat["content"]["text"];   
      
      const requestSever ={
         method: "POST",
         headers: {
            'Content-type': 'application/json; charset=UTF-8',
         },
         body: JSON.stringify({
            prompt:{user_prompt}
         })
      }
      try{
         let response = await fetch(HTTP, requestSever);
         if(!response.ok) throw new Error(response.statusText || "An Error has Occurred"); // Fixed error handling
         // Handle the response as a stream
         const reader = response.body.getReader();
         const decoder = new TextDecoder("utf-8");
         let result = "";
         while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode and append the streamed data
            result += decoder.decode(value, { stream: true });

            // Update the last model message in chatHistory
            setChatHistory((prev) => {
                // Remove "Thinking.." if present
                const filtered = prev.filter(msg => msg.text !== "Thinking..");
                // If last message is from model, update its text
                if (filtered.length > 0 && filtered[filtered.length - 1].role === "model") {
                    return [
                        ...filtered.slice(0, -1),
                        { role: "model", text: result.trim() }
                    ];
                }
                // Otherwise, add a new model message
                return [
                    ...filtered,
                    { role: "model", text: result.trim() }
                ];
            });
        }
        
            console.log("Final result:",result);
      }catch(error)
      {
         console.log(error);
      }
      
   }

   return(
      <>
      <div className={styles.container} >
         <div className={styles.chat_container}>
         {showChatbot && (
            <div className={`${!isAnimating ? styles.chatbot_popup : styles.showpop_up}`} >
             
            {/* Chatbot Header*/}
            <ChatBotHead setShowChatbot={setShowChatbot}/>
             {/* Chatbot Body*/}
             <ChatBotBody chatHistory={chatHistory}/>
             {/* Chatbot footer*/}
             <ChatBotFooter setChatHistory={setChatHistory} getModelResponse={getModelResponse} chatHistory={chatHistory}/>
                </div>)}
            
            
            <button onClick={toggleChatbot} id={`${showChatbot ?  styles.mini : ""}`} className={styles.chat_toggler}>
                  <span 
                  className="material-symbols-rounded">
                  { showChatbot ?  "close" : "mode_comment"}
               </span >
               
            </button>
         </div>
      </div>
      {response && (
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