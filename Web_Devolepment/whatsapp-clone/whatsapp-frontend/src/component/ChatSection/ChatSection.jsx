import React, { useState } from 'react'
import ChatHeader from '../ChatHeader/ChatHeader'
import Chat  from '../Chat/Chat'
import ChatFrom from  "../ChatForm/ChatForm"
import "./ChatSection.css"
import { messagesList } from "../../mockData"

function ChatSection(props) {

    const [messageListkk, setMessageList] = useState(messagesList)

    function getInput(massage){
      const messages = [...messageListkk]
        messages.push({
            id: 2,
            messageType: "TEXT",
            text: massage,
            senderID: 0,
            addedOn: "12:01 PM",
        });
        setMessageList(messages);
    }
console.log(messageListkk);
    return (
        <div className="ChatCont" >
            <ChatHeader selectedChat={props.selectedChat} />
            <Chat messagesList={messageListkk} />
            <ChatFrom getInput={getInput} />
        </div>
    )
}

export default ChatSection
