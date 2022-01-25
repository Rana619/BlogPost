import React from "react"
import { SearchOutlined } from '@material-ui/icons';
import "./SearchPeople.css"

function SearchPeople(){
    return(
        <div className="sidebar_search" >
          <div className="sidebar_searchContainer" >
            <SearchOutlined />
            <input placeholder="Search or start new chat" type="text" />
          </div>
        </div>
    )
}

export default SearchPeople;