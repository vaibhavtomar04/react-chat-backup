import { useEffect, useRef } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  const isTabRefreshed = useRef(false); // Ref to track tab refresh

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    // Listen for tab close or refresh
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      unSub();
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [fetchUserInfo]);

  const handleTabClose = (event) => {
    event.preventDefault();
    // Check if the tab is being refreshed
    if (!isTabRefreshed.current) {
      signOut(auth); // Logout only if the tab is closing, not refreshing
    }
  };

  // Detect tab refresh and set the flag
  useEffect(() => {
    const handleRefresh = () => {
      isTabRefreshed.current = true;
    };

    window.addEventListener("beforeunload", handleRefresh);

    return () => {
      window.removeEventListener("beforeunload", handleRefresh);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
