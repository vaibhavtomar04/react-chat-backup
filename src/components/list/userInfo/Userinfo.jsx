import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useState } from "react";
import { auth } from "../../../lib/firebase";

const Userinfo = () => {

    const { currentUser } = useUserStore();
    const [showLogout, setShowLogout] = useState(false); // State to toggle logout option visibility

const handleToggleLogout = () => {
        setShowLogout(!showLogout);  // Toggle the logout option visibility
    };

    const handleLogout = () => {
        auth.signOut();  // Sign out the user
    };


    return (
        < div className='userInfo' >
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="icons">
                <img src="./more.png" alt="" onClick={handleToggleLogout} />
                {showLogout && ( 
                    <button onClick={handleLogout}>Logout</button>
                )}
                <img src="./video.gif" alt="" />
                <img src="./edit.png" alt="" />
            </div>
        </div >
    )
}

export default Userinfo