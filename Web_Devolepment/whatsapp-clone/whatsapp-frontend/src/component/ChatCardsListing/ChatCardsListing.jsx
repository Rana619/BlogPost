import React from "react";
import{ Avatar, IconButton } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import "./ChatCardsListing.css"
import { contactList } from "../../mockData";

function ChatCardsListing(props){
    return(
        <div className="sideBarChats" >
      {contactList.map((contact)=>(
        <div key={contact.id} className="sidebarChat" onClick={() => props.setChat(contact)} >
        <Avatar src={contact.profilePic} />
        <div className="sidebarChat_info">
          <h2>{contact.name}</h2>
          <p>{contact.lastText}</p>  
          <p className="timeStamp" >{contact.lastTextTime}</p>
          <div className="action-btn" >
            <IconButton>
             <ExpandMoreIcon />
            </IconButton>
          </div>
        </div>
        </div>
      ))}

    </div>
    )
}

export default ChatCardsListing;