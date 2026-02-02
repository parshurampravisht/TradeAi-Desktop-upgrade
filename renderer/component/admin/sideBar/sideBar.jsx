import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "next/link";
import { useEffect, useState } from "react";
import {
  RiHome4Line,
  RiTeamLine,
  RiCalendar2Line,
  RiFolder2Line,
  RiUserFollowLine,
  RiPlantLine,
  RiStackLine,
  RiUserUnfollowLine,
} from "react-icons/ri";

import { useGlobalContext } from "../../../context/GlobalContext";

import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi/";

const SidebarComp = ({ state }) => {
  const { adminComponent, setAdminComponent, loginData } = useGlobalContext();

  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [isActiveTab, setIsActiveTab] = useState(adminComponent || "clients");

  const handleCollapsedChange = () => {
    setCollapsed(!collapsed);
  };

  const handleToggleSidebar = (value) => {
    setToggled(value);
  };

  const tabSelectorHandler = (tabName) => {
    setAdminComponent(tabName);
    setIsActiveTab(tabName);
  };

  useEffect(() => {
    if (!state) return;
    setIsActiveTab(state);
  }, [state]);

  return (
    <>
      <div className="sidebar-container" style={{ backgroundColor: "#fff" }}>
        <Sidebar
          className={`app ${toggled ? "toggled" : ""}`}
          style={{ height: "100%" }}
          collapsed={collapsed}
          toggled={toggled}
          handleToggleSidebar={handleToggleSidebar}
          handleCollapsedChange={handleCollapsedChange}
        >
          <main style={{ backgroundColor: "#fff" }}>
            <Menu>
              {collapsed ? (
                <MenuItem
                  icon={<FiChevronsRight />}
                  onClick={handleCollapsedChange}
                ></MenuItem>
              ) : (
                <MenuItem
                  // suffix={<FiChevronsLeft />}
                  onClick={handleCollapsedChange}
                >
                  <div className="pageHeader">ADMIN</div>
                </MenuItem>
              )}
              <hr />
            </Menu>

            <Menu>
              {/* <MenuItem>Dashboard</MenuItem> */}

              {/* <SubMenu label={"Management"}> */}
              {/* <MenuItem onClick={() => setAdminComponent("clients")}>
                  Client management
                </MenuItem>
                <MenuItem onClick={() => setAdminComponent("groups")}>
                  Group Management
                </MenuItem> */}

              {/* </SubMenu> */}
              <MenuItem
                style={{
                  backgroundColor: isActiveTab === "userInfo" ? "#f3f3f3" : "",
                }}
                className={`menu-item ${
                  adminComponent === "userInfo" ? "active" : ""
                } ${
                  isActiveTab === "userInfo"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                key="userInfo"
                onClick={() => tabSelectorHandler("userInfo")}
              >
                User Information
              </MenuItem>
              <MenuItem
                style={{
                  backgroundColor: isActiveTab === "clients" ? "#f3f3f3" : "",
                }}
                className={`menu-item ${
                  adminComponent === "clients" ? "active" : ""
                } ${
                  isActiveTab === "clients"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                key="clients"
                onClick={() => tabSelectorHandler("clients")}
              >
                Client Management
              </MenuItem>
              <MenuItem
                style={{
                  backgroundColor: isActiveTab === "groups" ? "#f3f3f3" : "",
                }}
                className={`menu-item ${
                  adminComponent === "groups" ? "active" : ""
                } ${
                  isActiveTab === "groups"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                key="groups"
                onClick={() => tabSelectorHandler("groups")}
              >
                Group Management
              </MenuItem>
              <MenuItem
                style={{
                  backgroundColor:
                    isActiveTab === "smtpConfig" ? "#f3f3f3" : "",
                }}
                className={`${
                  isActiveTab === "smtpConfig"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                onClick={() => tabSelectorHandler("smtpConfig")}
              >
                Email Configuration
              </MenuItem>
              {/* <MenuItem onClick={() => setAdminComponent("marketData")}>
                MarketData Connection
              </MenuItem> */}
              {loginData?.is_sub_broker ? (
                <MenuItem
                  style={{
                    backgroundColor: isActiveTab === "dealers" ? "#f3f3f3" : "",
                  }}
                  className={`menu-item ${
                    adminComponent === "dealers" ? "active" : ""
                  } ${
                    isActiveTab === "dealers"
                      ? `primary-text-color font-weight-500`
                      : `black-text-color`
                  }`}
                  key="dealers"
                  onClick={() => tabSelectorHandler("dealers")}
                >
                  Dealers Management
                </MenuItem>
              ) : null}

              <MenuItem
                style={{
                  backgroundColor: isActiveTab === "settings" ? "#f3f3f3" : "",
                }}
                className={`${
                  isActiveTab === "settings"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                onClick={() => tabSelectorHandler("settings")}
              >
                Settings
              </MenuItem>
              <MenuItem
                style={{
                  backgroundColor: isActiveTab === "FAQ" ? "#f3f3f3" : "",
                }}
                className={`menu-item ${
                  adminComponent === "FAQ" ? "active" : ""
                } ${
                  isActiveTab === "FAQ"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                key="FAQ"
                onClick={() => tabSelectorHandler("FAQ")}
              >
                FAQ
              </MenuItem>
              <MenuItem
                style={{
                  backgroundColor: isActiveTab === "board" ? "#f3f3f3" : "",
                }}
                className={`${
                  isActiveTab === "board"
                    ? `primary-text-color font-weight-500`
                    : `black-text-color`
                }`}
                onClick={() => tabSelectorHandler("board")}
              >
                Clear All
              </MenuItem>
            </Menu>
          </main>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarComp;
