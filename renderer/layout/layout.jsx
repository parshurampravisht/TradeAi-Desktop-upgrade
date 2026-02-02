"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import FloatingScreenButton from "../component/mainView/FloatingScreenButton";
import { useGlobalContext } from "../context/GlobalContext";
import SubscriptionScreenModal from "../component/mainView/SubscriptionScreenModal";
import { useRouter } from "next/router";

const NavBarWithNoSSR = dynamic(import("./nav"), {
  ssr: false,
});
const Layout = ({ children }) => {
  const router = useRouter();
  const currentRoute = router.pathname;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPlanExpiry, setShowPlanExipry] = useState(false);

  const authState = useSelector((state) => {
    return state.auth?.authState;
  });

  let [appInfo, setAppInfo] = useState({
    app_copyright: "Wealthwisers",
    app_version: "v1.0.0",
  });
  let [message, setMessage] = useState();
  let [isActive, setIsActive] = useState(false);
  let [isRestartBtnActive, setIsRestartBtnActive] = useState(false);

  const { loginClientUserData } = useGlobalContext();

  useEffect(() => {
    if (authState) {
      setIsLoggedIn(authState);
      fetchAppInfo();
    }
  }, [authState]);

  // useEffect(() => {
  //   ipcRenderer.on("update_available", () => {
  //     ipcRenderer.removeAllListeners("update_available");
  //     setMessage("A new update is available. Downloading now...");
  //     setIsActive(true);
  //   });
  //   ipcRenderer.on("update_downloaded", () => {
  //     ipcRenderer.removeAllListeners("update_downloaded");
  //     setMessage(
  //       "Update Downloaded. It will be installed on restart. Restart now?"
  //     );
  //     setIsRestartBtnActive(true);
  //     setIsActive(true);
  //   });
  // }, [authState]);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setMessage("A new update is available. Downloading now...");
      setIsActive(true);
    };

    const handleUpdateDownloaded = () => {
      setMessage(
        "Update Downloaded. It will be installed on restart. Restart now?"
      );
      setIsRestartBtnActive(true);
      setIsActive(true);
    };

    // ipcRenderer.on("update_available", handleUpdateAvailable);
    // ipcRenderer.on("update_downloaded", handleUpdateDownloaded);

    return () => {
      // ipcRenderer.removeAllListeners("update_available");
      // ipcRenderer.removeAllListeners("update_downloaded");
    };
  }, [authState]);

  function closeNotification() {
    setIsActive(false);
    setMessage("");
  }
  function restartApp() {
    // ipcRenderer.send("restart_app");
  }

  const fetchAppInfo = async () => {
    // try {
    //   ipcRenderer.on("env-variables", (event, envData) => {
    //     setAppInfo(envData);
    //   });
    //   await ipcRenderer.invoke("get-env");
    // } catch (error) {
    //   console.error("Error fetching environment variables:", error);
    // }
  };

  const checkPlanExpiry = (planData) => {
    if (planData?.plan_name?.toLowerCase() === "Trial".toLowerCase())
      return true;

    /// check plan expiry for 5 days
    if (planData?.days_left <= 5) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    setShowPlanExipry(checkPlanExpiry(loginClientUserData?.subscription));
  }, [loginClientUserData?.subscription]);

  return (
    <>
      <div>{isLoggedIn && <NavBarWithNoSSR />}</div>
      <div style={{ paddingTop: "54px" }}>{children}</div>
      <div id="notification" className={isActive ? "" : "hidden"}>
        <p>{message}</p>
        <button onClick={closeNotification}>Close</button> &nbsp; &nbsp;
        <button
          onClick={restartApp}
          className={isRestartBtnActive ? "" : "hidden"}
        >
          Restart
        </button>
      </div>
      {isLoggedIn && (
        <div id="appInfo">
          Copyright &copy; {new Date().getFullYear()} {appInfo?.app_copyright} -
          Version {appInfo?.app_version}
        </div>
      )}
      {
        // false &&
        currentRoute === "/equity" &&
        isLoggedIn &&
        loginClientUserData?.subscription &&
        showPlanExpiry && ( /// false condition only add for progressing feature
          <>
            {loginClientUserData?.subscription?.is_active ? (
              <FloatingScreenButton />
            ) : (
              <SubscriptionScreenModal toggle={true} setToggle={() => { }} />
            )}
          </>
        )
      }
    </>
  );
};

export default Layout;
