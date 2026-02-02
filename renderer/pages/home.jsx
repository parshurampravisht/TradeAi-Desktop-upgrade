import React, { useEffect } from "react";
import AuthBase from "../component/auth/authBase";
import { useGlobalContext } from "../context/GlobalContext";

function Home() {
  const { setAdminComponent } = useGlobalContext();

  useEffect(() => {
    setAdminComponent("clients");
  }, [setAdminComponent]);

  return <AuthBase />;
}

export default Home;
