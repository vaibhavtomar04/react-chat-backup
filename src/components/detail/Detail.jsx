import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db, storage } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import "./detail.css";

const Detail = () => {
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
        useChatStore();
    const { currentUser } = useUserStore();
    const [imageUrls, setImageUrls] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!chatId) return;

            try {
                const listRef = ref(storage, `chats/${chatId}/img`);
                const res = await listAll(listRef);
                const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
                setImageUrls(urls);
            } catch (err) {
                console.log(err);
            }
        };

        fetchImages();
    }, [chatId]);


    const handleBlock = async () => {
        if (!user) return;

        const userDocRef = doc(db, "users", currentUser.id);

        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock();
        } catch (err) {
            console.log(err);
        }
    };

    const handleLogout = () => {
        auth.signOut();
        resetChat()
    };


    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2>{user?.username}</h2>
                <p></p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Shared photos</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                    <div className="photos">
                        {imageUrls.map((url, index) => (
                            <div className="photoItem" key={index}>
                                <div className="photoDetail">
                                    <img src={url} alt={`shared-img-${index}`} />
                                    <span>photo.png</span>
                                </div>
                                <img src="./download.png" alt="" className="icon" />
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={handleBlock}>
                    {isCurrentUserBlocked
                        ? "You are Blocked!"
                        : isReceiverBlocked
                            ? "User blocked"
                            : "Block User"}
                </button>
                <button className="logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Detail;