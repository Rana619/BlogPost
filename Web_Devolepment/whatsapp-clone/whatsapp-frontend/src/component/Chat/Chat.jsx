import React, { useEffect, useRef } from 'react'
import "./Chat.scss"
 
function Chat(props) {
   const {messagesList} = props;

   const messagesEndRef = useRef(null);

   useEffect(() => {
    if (messagesEndRef) {
        messagesEndRef.current.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [])

    return (
        <div className="Chat_section" ref={messagesEndRef} >
          {messagesList.map((message)=>(
            <div key={message.text} className={`chat ${message.senderID === 0 ? "me" : "you"}`} >
               <p className="msg" >{message.text} <span className="time" >{message.addedOn}</span></p>
               {/* <span className="time" >{message.addedOn}</span> */}
            </div>
          ))}
        </div>
    )
}

export default Chat
