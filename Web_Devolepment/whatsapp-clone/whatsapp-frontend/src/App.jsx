import React, {useState} from "react";
import './App.css';
import ProfileSection from "./component/ProfileSection/ProfileSection";
import SearchPeople from "./component/SearchPeople/SearchPeople";
import ChatCardsListing from "./component/ChatCardsListing/ChatCardsListing";
import ChatSection from "./component/ChatSection/ChatSection"
import PlaceHolder from "./component/placeHolder/placeHolder";
import "./App.css";

function App(){

  const [selectedChat, setSelectChat] = useState();

  return(
   <div className="App" >
    <div className="uperPart" ></div>
    <div className="lowerPart" ></div>
    <div className="mainCont" >

    <div className="App_body" >
       <div className="left-side" >
          <ProfileSection />
          <SearchPeople />
          <ChatCardsListing setChat={setSelectChat} />
       </div>
         { selectedChat ? <ChatSection selectedChat={selectedChat} /> : <PlaceHolder />}
       </div>

    </div>
   </div>
  )
}

export default App;
