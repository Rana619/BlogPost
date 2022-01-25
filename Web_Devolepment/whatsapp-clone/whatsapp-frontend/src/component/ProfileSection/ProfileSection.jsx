import React from "react";
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import{ Avatar, IconButton } from "@material-ui/core"
import "./ProfileSection.css"


function ProfileSection(){
    return(
        <div className="sidebar_headre">
            <IconButton>
               <Avatar src="\imag\IMG_20190911_205004.jpg" />
            </IconButton>
            <h4>Rana Debnath</h4>
                <div className="sidebar_headerRight" >
                  <IconButton>
                  <DonutLargeIcon />
                  </IconButton>
                  <IconButton>
                  <ChatIcon />
                  </IconButton>
                  <IconButton>
                  <MoreVertIcon />
                  </IconButton>
                </div>
        </div>
    )
}

export default ProfileSection;