import {
  Text,
  Avatar,
  Dropdown,
  Image,
  Col,
  Navbar,
  Spacer,
  Row,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useMemo } from "react";
import { IoTerminalOutline } from "react-icons/io5";
import BrokerHealth from "../component/dashboard/indicator/brokerHealth";
import { useGlobalContext } from "../context/GlobalContext";
import ProfileEditor from "./ProfileEditor";

export default function Nav() {
  const router = useRouter();
  const currentRoute = router.pathname;
  const {
    loginData,
    primaryNav,
    setPlaceOrderVisible,
    setCashSymbol,
    setSymbolApi,
    setClientInputList,
    loginClientUserData,
  } = useGlobalContext();

  const handleRunCli = async () => {
    try {
      // console.log("CLI open:");
      // const response = await ipcRenderer.invoke("runCli-ipc");
      // console.log("CLI executed successfully:", response, response.message);
    } catch (error) {
      // Log the error object and its properties
      console.error("Error invoking remote method:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
  };

  const handleNavClick = () => {
    if (currentRoute === "/equity") {
      setPlaceOrderVisible(false);
    }
    setCashSymbol({});
    setSymbolApi("");
    setClientInputList(null);
  };

  const handleData = () => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowFeatures = `width=${screenWidth},height=${screenHeight}`;
    window.open("../images/User_manual_TradeTez.pdf", "_blank", windowFeatures);
  };

  const handleWebHook = () => {
    router.push("/Webhook");
  };

  const navItems = useMemo(() => {
    return primaryNav
      .filter((item) => item.isVisible)
      .map((item) => (
        <div
          key={item.path}
          style={{ display: "flex", transform: "translate(2.7rem, 0px)" }}
        >
          <Link href={item.path} legacyBehavior passHref>
            <Navbar.Link
              isActive={currentRoute === item.path}
              onClick={handleNavClick}
            >
              <div>
                <Image
                  src={`/images/${item.icon}`}
                  alt={item.name}
                  width={30}
                  height={30}
                  style={{ width: "80%" }}
                />
              </div>
              &nbsp;
              <div>
                <Text
                  className={`${currentRoute === item.path
                      ? `primary-text-color primary-active-border`
                      : `black-text-color`
                    }`}
                  size={"$md"}
                  css={{ fontFamily: "$sans", mt: "$2" }}
                >
                  {item.name}
                </Text>
              </div>
            </Navbar.Link>
          </Link>
        </div>
      ));
  }, [primaryNav, currentRoute, handleNavClick]);

  return (
    <Navbar
      className="web-menu-header"
      variant="static"
      isCompact={true}
      borderWeight="light"
      css={{
        borderColor: "transparent",
        position: "fixed",
      }}
    >
      <Navbar.Brand css={{ maxWidth: "100%" }}>
        <Col style={{ padding: "5px" }}>
          <Image
            // src={checked === "TradeTez" ? "images/logo.svg" : "images/finone-logo.svg"}
            src={"images/logo.svg"}
            height={50}
          />
        </Col>
        <Spacer x={0.8} />
      </Navbar.Brand>

      <Navbar.Content variant="default">
        <BrokerHealth />
        <Spacer x={1} />
        {/* <Row
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            width: "fit-content",
            marginLeft: "35px",
            marginRight: "-35px",
          }}
          onClick={async () => {
            await handleRunCli();
          }}
          className="flex align-center cursor-pointer"
        >
          <Image src="images/cli_icon.svg" width={30} />
          <p
            style={{
              marginLeft: "12px",
              letterSpacing: "0.3px",
            }}
          >
            CLI
          </p>
        </Row> */}
        {navItems}
        <Spacer x={1} />

        <img
          src="../images/ph_webhooks.png"
          onClick={handleWebHook}
          style={{ cursor: "pointer", width: "3%", marginTop: "5px" }}
          title="Help"
        />
        <p
          onClick={handleWebHook}
          className={`${currentRoute === "/Webhook"
              ? `primary-text-color primary-active-border`
              : `black-text-color`
            }`}
          style={{ cursor: "pointer", marginLeft: "-19px", marginTop: "3px" }}
        >
          Webhook
        </p>

        <img
          src="../images/help_icon.png"
          width={30}
          onClick={handleData}
          style={{ cursor: "pointer", marginTop: "3px" }}
          title="Help"
        />

        <p
          onClick={handleData}
          style={{ cursor: "pointer", marginLeft: "-19px", marginTop: "3px" }}
        >
          Help
        </p>
        <Navbar.Content
          css={{
            "@xs": {
              w: "12%",
              jc: "flex-end",
            },
          }}
        >
          <ProfileEditor
            loginData={loginData}
            loginClientUserData={loginClientUserData}
          />

          {/* <Dropdown placement="bottom-right">
            <Navbar.Item>
              <Dropdown.Trigger>
                <Avatar
                  bordered
                  as="button"
                  color="secondary"
                  size="md"
                  src="images/user.png"
                />
              </Dropdown.Trigger>
            </Navbar.Item>
            <Dropdown.Menu
              aria-label="User menu actions"
              color="secondary"
              className="custom-dropdown-wrapper"
              onAction={(actionKey) => {
                if (actionKey !== "profile")
                  router.push({
                    pathname: `/${actionKey}`,
                    query: { state: `userInfo` },
                  });
              }}
            >
              <Dropdown.Item key="admin" css={{ height: "$18" }}>
                <Text
                  classsName="primary-text-color"
                  b
                  color="inherit"
                  css={{ d: "flex" }}
                >
                  Signed in as{" "}
                  {loginData?.is_sub_broker ? "Sub Broker" : "Dealer"}
                </Text>
                <Text color="inherit" css={{ d: "flex" }}>
                  {`${
                    loginData?.firstname
                      ? loginData?.firstname[0].toUpperCase() +
                        loginData?.firstname.slice(1)
                      : ""
                  } ${
                    loginData?.lastname
                      ? loginData?.lastname[0].toUpperCase() +
                        loginData?.lastname.slice(1)
                      : ""
                  } (${loginData.user_id ? loginData.user_id : ""})`}
                </Text>
              </Dropdown.Item>
              <Dropdown.Item key="plan_name">
                Plan Name :
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    marginLeft: "5px",
                  }}
                >
                  {loginClientUserData?.subscription?.plan_name}
                </span>
              </Dropdown.Item>
              <Dropdown.Item
                className="flex-row align-center"
                key="plan_duration_in_days"
              >
                Remaining Days :
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    marginLeft: "5px",
                  }}
                >
                  {loginClientUserData?.subscription?.days_left}
                </span>
              </Dropdown.Item>
              <Dropdown.Item key="home" withDivider color="error">
                Log Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
        </Navbar.Content>
      </Navbar.Content>
    </Navbar>
  );
}
