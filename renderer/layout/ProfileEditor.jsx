import React, { useState } from "react";
import { Navbar, Row, Avatar, Col, Button, Modal } from "@nextui-org/react";
import { useRouter } from "next/router";
import Image from "next/image";
import SubscriptionScreenModal from "../component/mainView/SubscriptionScreenModal";

function ProfileEditor({ loginData, loginClientUserData }) {
  const [isActive, setIsActive] = useState(false);
  const [isHover, setIsHover] = useState(0);
  const [isExpiredPlanScreen, setIsExpiredPlanScreen] = useState(false);

  return (
    <div className="position-relative">
      <Navbar.Item
        className="cursor-pointer"
        onClick={() => setIsActive((prev) => !prev)}
        style={{ width: "45px" }}
      >
        {/* <Avatar
          bordered
          as="button"
          color="secondary"
          size="md"
          src="images/user.png"
        /> */}
        <Image
          src={"/images/profileEditor/Avatar.png"}
          width={45}
          height={45}
        />
      </Navbar.Item>
      <SubscriptionScreenModal
        toggle={isExpiredPlanScreen}
        setToggle={setIsExpiredPlanScreen}
      />
      {isActive && (
        <DropdownWrapper
          setIsActive={setIsActive}
          loginData={loginData}
          loginClientUserData={loginClientUserData}
          setIsExpiredPlanScreen={setIsExpiredPlanScreen}
          setIsHover={setIsHover}
          isHover={isHover}
        />
      )}
    </div>
  );
}

export default ProfileEditor;

function DropdownWrapper({
  loginData,
  setIsActive,
  loginClientUserData,
  setIsExpiredPlanScreen,
  setIsHover,
  isHover,
}) {
  const router = useRouter();

  const navigationHandler = (route) => {
    setIsActive(false);
    router.push(`/${route}`);
  };

  return (
    <div className="backdrop" onClick={() => setIsActive(false)}>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          width: "330px",
          right: "2%",
          top: "7.5%",
          zIndex: 100,
          // right: "0px",
          // top: "52px",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          borderTopRightRadius: "0px",
          borderTopLeftRadius: "0px",
          border: "1px solid #F5F5F5",
        }}
        className="position-absolute border-radius"
      >
        <Row
          style={{
            padding: "15px 20px",
            backgroundColor:
              isHover === 1 ? "rgba(60, 87, 162, 0.1)" : "transparent",
          }}
          className="flex-row align-center column-gap-10 cursor-pointer"
          onClick={() => {
            setIsActive(false);
            setIsHover(0);
            router.push({
              pathname: `/admin`,
              query: { state: `userInfo` },
            });
          }}
          onMouseEnter={() => setIsHover(1)}
          onMouseLeave={() => setIsHover(0)}
        >
          <Image
            src={"/images/profileEditor/Avatar.png"}
            width={40}
            height={40}
          />
          <div className="flex-col row-gap-3">
            <Row style={{ color: "#00000", fontSize: "18px", fontWeight: 600 }}>
              {`${loginData?.firstname
                  ? loginData?.firstname[0].toUpperCase() +
                  loginData?.firstname.slice(1)
                  : ""
                } ${loginData?.lastname
                  ? loginData?.lastname[0].toUpperCase() +
                  loginData?.lastname.slice(1)
                  : ""
                }`}
            </Row>
            <Row
              style={{ color: "#8E8E93", fontSize: "14px", fontWeight: 500 }}
            >
              {`ID: ${loginData.user_id ? loginData.user_id : ""} (${loginData?.is_sub_broker ? "Sub Broker" : "Dealer"
                })`}
            </Row>
          </div>
        </Row>
        <Col
          className="flex-col"
          style={{
            backgroundColor: "#f7f6f9",
            // backgroundColor: "#F5F5F5",
            padding: "15px 20px",
            rowGap: "10px",
          }}
        >
          <div
            style={{
              border: "1px solid #F5F5F5",
              backgroundColor: "#F0F9FF",
              padding: "5px 10px",
            }}
            className="flex-row justify-between align-center border-radius"
          >
            <div style={{ fontWeight: 600 }} className="primary-text-color">
              Current plan:
            </div>
            <div style={{ fontWeight: 700 }} className="primary-text-color">
              {loginClientUserData?.subscription?.plan_name}
            </div>
          </div>
          <div
            style={{ color: "#333333", fontWeight: 500, fontSize: "15px" }}
            className=""
          >
            Plan will expire in
            <span style={{ color: "#EB5757", fontWeight: 700 }}>
              {" "}
              {loginClientUserData?.subscription?.days_left
                ? `${loginClientUserData?.subscription?.days_left} days`
                : ""}
            </span>
          </div>
          {/* <Button
            className="primary-button border-radius-8"
            style={{
              fontWeight: 500,
              fontSize: "16px",
              letterSpacing: "0.5px",
            }}
            onClick={() => {
              setIsExpiredPlanScreen(true);
              setIsActive(false);
            }}
          >
            Renew
          </Button> */}
        </Col>

        <Row
          className="flex-row align-center cursor-pointer column-gap-10"
          onMouseEnter={() => setIsHover(2)}
          onMouseLeave={() => setIsHover(0)}
          onClick={(e) => {
            setIsHover(0);
            e.stopPropagation();
            navigationHandler("home");
          }}
          style={{
            padding: "15px 20px",
            backgroundColor: isHover === 2 ? "#AC393933" : "transparent",
          }}
        >
          <Image
            src={"/images/profileEditor/logout.svg"}
            width={30}
            height={30}
          />
          <div style={{ color: "#EB5757", fontSize: "18px", fontWeight: 500 }}>
            Log Out
          </div>
        </Row>
      </div>
    </div>
  );
}
