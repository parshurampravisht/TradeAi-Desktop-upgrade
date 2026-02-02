import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const ErrorBoundaryComponent = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      setHasError(true);
      setError({ error, errorInfo });
    };

    const unhandledRejectionHandler = (event) => {
      setHasError(true);
      setError({ error: event.reason });
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", unhandledRejectionHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener(
        "unhandledrejection",
        unhandledRejectionHandler
      );
    };
  }, []);

  useEffect(() => {
    let log = {
      filename: error?.error?.filename,
      message: error?.error?.message,
    };
    // OLD (incorrect):
    // ipcRenderer.invoke("register_log", log);

    // NEW (correct - use window.electronAPI):
    window.electronAPI.registerLog?.(log).catch((err) => {
      console.error("Failed to register log:", err);
    });
    
  }, [error]);

  let navigate = () => {
    router.push("/dashboardTablesAction");
  };
  if (hasError) {
    return (
      <div style={{ position: "absolute", top: "40vh", left: "35vw" }}>
        <h2 style={{ color: "red" }}>Oops! something went wrong.</h2>
        <h3>Please close the application and restart again.</h3>
        <div style={{ textAlign: "center" }}>
          {/* <button onClick={navigate}>Go To Dashboard</button> */}
        </div>
        {/* <p>{error && error?.error?.message}</p> */}
      </div>
    );
  }

  try {
    return children;
  } catch (error) {
    setHasError(true);
    setError({ error });
    return (
      <div>
        <h2>Something went wrong during rendering.</h2>
        <p>{error && error.toString()}</p>
      </div>
    );
  }
};

export default ErrorBoundaryComponent;
