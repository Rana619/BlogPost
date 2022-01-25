import React from 'react';
import "./placeHolder.css";
import LaptopMacIcon from '@material-ui/icons/LaptopMac';

function placeHolder() {
    return (
        <div className="placeHolder" >
             <img src="\imag\placeholder.jpeg"/>
             <h4>Keep your phone connected</h4>
             <p>WhatsApp connects to your phone to sync messages. to reduce data</p>
             <p>usage, connect your phone to Wi-Fi</p> 
             <div className="midBar" ></div>
             <p><LaptopMacIcon className="laptop" /> WhatsApp is available for Windows. <span>Get it here</span></p>
             <div className="footer" ></div>
        </div>
    )
}

export default placeHolder
 