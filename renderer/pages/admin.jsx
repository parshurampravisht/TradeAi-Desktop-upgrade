import electron from "electron";
import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

const ipcRenderer = electron.ipcRenderer || false;

import {
  Container,
  Card,
  Row,
  Column,
  Text,
  Col,
  Spacer,
  Button,
  Grid,
  Input,
  Image,
  Modal,
  Loading,
} from "@nextui-org/react";
import { useRouter } from "next/router";

import SidebarComp from "../component/admin/sideBar/sideBar";
import ClientBase from "../component/admin/clients/clientBase";
import GroupBase from "../component/admin/groups/groupBase";
import SmtpConfig from "../component/admin/email/smtpConfig";
import EmailTemplate from "../component/admin/email/emailTemplate";
import ProfileBase from "../component/admin/profile/ProfileBase";
import SubscriptionBase from "../component/admin/subscription/subscriptionBase";
import Board from "../component/admin/board/board";
import { useGlobalContext } from "../context/GlobalContext";
import FAQ from "../component/admin/FAQ/faq";
import SignUp from "../component/auth/signup/signUp";
import DealersListingPage from "../component/admin/dealers/dealers";
import MarketDataBase from "../component/admin/marketData/marketDataBase";
import SettingsTemplate from "../component/admin/settings/SettingsTemplate";
import RiskModal from "../component/auth/login/Modal";

const getAdminComponent = (adminComponent) => {
  switch (adminComponent) {
    case "userInfo":
      return <ProfileBase />;
    case "subscription":
      return <SubscriptionBase />;
    case "clients":
      return <ClientBase />;
    case "groups":
      return <GroupBase />;
    case "smtpConfig":
      return <SmtpConfig />;
    case "emailTemplate":
      return <EmailTemplate />;
    case "dealers":
      return <DealersListingPage />;
    case "board":
      return <Board />;
    case "FAQ":
      return <FAQ />;
    case "marketData":
      return <MarketDataBase />;
    case "settings":
      return <SettingsTemplate />;
    default:
      return <ProfileBase />;
  }
};

const breadCrumbHeader = {
  userInfo: "User",
  clients: "Clients",
  groups: "Groups",
  smtpConfig: "Email",
  dealers: "Dealers",
  FAQ: "FAQ",
  board: "Board",
  settings: "Settings",
};

const Admin = () => {
  const router = useRouter();
  const { state } = router?.query;
  const [showModal, setShowModal] = useState(false);

  const { adminComponent, setAdminComponent, loginData } = useGlobalContext();

  useEffect(() => {
    if (!state) return;
    setAdminComponent(state);
  }, [state]);

  useEffect(() => {
    //event-listener to main process to logout explicitly
    ipcRenderer.on("logout.signal", (event, data) => {
      router.push("/home");
    });
  }, [router]);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");

    if (!hasVisited) {
      setShowModal(true);
    }
  }, []);

  return (
    <>
      <Grid.Container gap={1} css={{ m: 0 }}>
        <Spacer x={1}></Spacer>
        <SidebarComp state={state} />
        {showModal && <RiskModal toggle={showModal} setToggle={setShowModal} />}

        <Grid
          css={{
            // background: "#E3F0FF",
            height: "calc(100vh - 65px)",
            // width:"75%",
            width: "calc(100vw - 300px)",
            "@media (min-width: 1920px)": {
              width: "84%",
            },

            "@media (max-width: 1360px)": {
              width: "75%",
            },
          }}
        >
          <Container
            css={{
              marginBottom: "20px",
              "@media (max-width: 1920px)": {
                height: "100%",
              },
            }}
          >
            <Spacer y={0.1}></Spacer>
            <Row>
              <Row>
                <div span className="pageHeader">
                  {`ADMIN / ${breadCrumbHeader[adminComponent]}`}
                </div>
              </Row>
            </Row>
            <Spacer y={1}></Spacer>
            <Row>{getAdminComponent(adminComponent)}</Row>
            <Spacer y={1}></Spacer>
            <Row
              justify="center"
              align="center"
              style={{ marginTop: "auto" }}
            ></Row>
          </Container>
        </Grid>
      </Grid.Container>
    </>
  );
};

export default Admin;
