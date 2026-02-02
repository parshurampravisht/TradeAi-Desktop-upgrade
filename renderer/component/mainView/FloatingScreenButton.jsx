import React, { useMemo, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import SubscriptionScreenModal from "./SubscriptionScreenModal";
import { useGlobalContext } from "../../context/GlobalContext";

function FloatingScreenButton() {
  const [isExpiredPlanScreen, setIsExpiredPlanScreen] = useState(false);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({
    // x: window.innerWidth - 475, ///default position of float button
    // y: 56,
    x: 180, ///default position of float button
    y: 0,
    // y: window.innerHeight - 60,
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const { loginClientUserData } = useGlobalContext();
  const {
    subscription: {
      days_left = 1,
      plan_name = "",
      plan_duration_in_days = 2,
    } = {},
  } = loginClientUserData;

  const handleMouseDown = (e) => {
    const buttonRect = buttonRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - buttonRect.left,
      y: e.clientY - buttonRect.top,
    });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const buttonRect = buttonRef.current.getBoundingClientRect();

      // Calculate new X and Y positions
      let newX = e.clientX - offset.x;
      let newY = e.clientY - offset.y;

      // Ensure the button doesn't go out of bounds horizontally
      if (newX < 0) newX = 0;
      if (newX + buttonRect.width > window.innerWidth) {
        newX = window.innerWidth - buttonRect.width;
      }

      // Ensure the button doesn't go out of bounds vertically
      if (newY < 0) newY = 0;
      if (newY + buttonRect.height > window.innerHeight) {
        newY = window.innerHeight - buttonRect.height;
      }

      setPosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = (e) => {
    if (dragging) {
      e.stopPropagation();
    }
    setDragging(false);
  };

  if (
    !Object.keys(loginClientUserData).length &&
    loginClientUserData?.subscription &&
    !Object.keys(loginClientUserData?.subscription).length
  )
    return null;

  const percentage = useMemo(() => {
    return Math.floor((days_left / plan_duration_in_days) * 100);
  }, [days_left, plan_duration_in_days]);

  return (
    <div style={{ zIndex: 999 }} className="position-relative">
      <div
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-row align-center justify-center"
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging ? "none" : "top 0.3s ease, left 0.3s ease",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 1000,
            animation: "3s 1 forwards",
            background: `radial-gradient(closest-side, #FFF2E8 80%, transparent 25px 101%, white 0),
    conic-gradient(#DE6508 calc(${percentage} * 1%), #FFF2E8 0)`,
          }}
          onClick={() => setIsExpiredPlanScreen(true)}
        >
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
              width: "fit-content",
              height: "20px",
              color: "#DE6508",
              fontWeight: "800",
            }}
          >
            {days_left < 10 ? `0${days_left}` : days_left}
          </span>
        </div>
        <div
          className="flex-col align-center justify-center position-absolute"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.4px",
            // top: "7px",
            left: "40px",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              background: "#192C54",
              borderTopRightRadius: "8px",
              padding: "3px 8px 3px 22px",
              minWidth: "92px",
            }}
            className=""
          >
            Days Left
          </div>
          <div
            style={{
              color: "#192C54",
              background: "#FFF2E8",
              borderBottomRightRadius: "8px",
              padding: "3px 8px 3px 22px",
              minWidth: "92px",
            }}
            className=""
          >
            {`${
              plan_name?.toLowerCase() === "Trial".toLowerCase()
                ? "Trial"
                : "Plan"
            } Ends`}
          </div>
        </div>
      </div>
      <SubscriptionScreenModal
        toggle={isExpiredPlanScreen}
        setToggle={setIsExpiredPlanScreen}
      />
    </div>
  );
}

export default FloatingScreenButton;
