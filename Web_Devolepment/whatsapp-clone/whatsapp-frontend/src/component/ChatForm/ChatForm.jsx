import React, { useState } from 'react'
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic"
import { AttachFile } from '@material-ui/icons'
import "./ChatForm.css"
import Picker from 'emoji-picker-react';

function ChatForm(props) { 
 
    const [text, setText] = useState("");
    const [emojiPickerToggal, setEmojiPickerToggal] = useState(false);        

    const onEmojiClick = (event, emojiObject) => {
      setText(text+emojiObject.emoji);
      setEmojiPickerToggal(false);
    };
    const addNewMassage = (event)=>{
        event.preventDefault();
        if(text != "")
          props.getInput(text);
        setText("");
    }

    return (
        <div className="chat_footer" >
         { emojiPickerToggal && <Picker 
           pickerStyle={{ position:"absolute", bottom:"78px", width:"62%"}}
           onEmojiClick={onEmojiClick} 
           />}
           <InsertEmoticonIcon onClick={()=>setEmojiPickerToggal(!emojiPickerToggal)} />
           <AttachFile /> 
        <form onSubmit={addNewMassage} >
            <input 
            placeholder="Type a message" 
            type="text" 
            value={text}
            onChange = { (e)=>setText(e.target.value)}
            />
            <button type="submit" >send</button>
        </form>
        <MicIcon />
     </div>
    )
}

export default ChatForm
 