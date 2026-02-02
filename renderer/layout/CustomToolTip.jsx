import React from "react";

const positionStyles = {
  top_center: { top: "-45px", left: "30%", transform: "translateX(-50%)" },
  top: { top: "-40px", left: "50%", transform: "translateX(-50%)" },
  left: { top: "-35px", left: "-160px", transform: "translateY(-50%)" },
  right: { top: "50%", left: "150px", transform: "translateY(-50%)" },
  bottom: { top: "40px", left: "50%", transform: "translateX(-50%)" },
  left_0: { top: "-35px", left: "-200px", transform: "translateY(-50%)" },
};

function CustomToolTip({ children, toolTipText, position = "top" }) {
  return (
    <div
      className="tooltip-container position-relative"
      style={{ display: "inline-block" }}
    >
      {children}
      <div
        className="tooltip-text position-absolute"
        style={{
          fontSize: "12px",
          whiteSpace: "nowrap",
          ...positionStyles[position], // Dynamically set the position
        }}
      >
        {toolTipText}
      </div>
    </div>
  );
}

export default CustomToolTip;
