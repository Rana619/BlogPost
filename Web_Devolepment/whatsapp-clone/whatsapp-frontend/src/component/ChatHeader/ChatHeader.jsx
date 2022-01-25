import React from 'react'
import { Avatar,IconButton } from '@material-ui/core'
import { MoreVert, SearchOutlined } from '@material-ui/icons'
import "./ChatHeader.css"

function ChatHeader(props) {
  const { selectedChat } = props;
    return (
             <div className="chat_headerk" >
            <IconButton>
              <Avatar src={selectedChat.profilePic} />
            </IconButton>
             <div className="chat_headerInfo" >
             <h3>{selectedChat.name}</h3>
             <p>Last seen at...</p>
            </div>
            <div className="chat_headerRight" >
                 <IconButton>
                  <SearchOutlined />
                  </IconButton>
                  <IconButton>
                  <MoreVert />
                  </IconButton>
            </div>
            </div> 
    )
}

export default ChatHeader
