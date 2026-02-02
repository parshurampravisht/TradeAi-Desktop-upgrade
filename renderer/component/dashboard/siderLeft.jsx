import { Card, Row, Col, Link, Navbar } from "@nextui-org/react";
import { useState, useRef, memo } from "react";
import Groups from "./L-sider-comp/group";
import ClientStatusSelector from "./L-sider-comp/clientStatusSelector";
import Sidebar from "react-sidebar";

function SiderLeft(props) {
  const [showGrpClient, setShowGrpClient] = useState(true);
  const [selectedClients, setSelectedClients] = useState([]);

  const originalUsers = useRef([]); // storing clients data from the user

  return (
    <>
      <Sidebar
        sidebar={
          <>
            <div style={{ height: "calc(100vh - 650px)" }}>
              <Row css={{ minHeight: "36rem" }}>
                <Card
                  variant="bordered"
                  css={{
                    height: "55%",
                    overflow: "hidden",
                    borderColor: "transparent",

                    ml: "-$5",
                    "@media (min-width: 1920px)": {
                      height: "127%",
                    },
                    "@media (min-width: 1366px)": {
                      height: "95%",
                    },
                  }}
                >
                  <Card.Header>
                    <Row justify="left">
                      <Navbar.Content
                        // hideIn="xs"
                        variant={"highlight-solid"}
                      >
                        <Row justify="left" align="left">
                          <Row
                            justify="center"
                            align="center"
                            css={{ p: "$3" }}
                          >
                            <Navbar.Link
                              className={`${
                                showGrpClient === true ? `primary-button` : ``
                              } border-radius-8`}
                              variant={"highlight"}
                              isActive={showGrpClient}
                              css={{
                                minWidth: "80px",
                                justifyContent: "center",
                              }}
                              onPress={() => setShowGrpClient(true)}
                            >
                              Clients
                            </Navbar.Link>
                            <Navbar.Link
                              variant={"highlight"}
                              className={`${
                                showGrpClient === false ? `primary-button` : ``
                              } border-radius-8`}
                              isActive={!showGrpClient}
                              css={{
                                minWidth: "80px",
                                justifyContent: "center",
                              }}
                              onPress={() => setShowGrpClient(false)}
                            >
                              Groups
                            </Navbar.Link>
                            <Col css={{ width: "fit-content" }}></Col>
                          </Row>
                        </Row>
                      </Navbar.Content>
                    </Row>
                    <Link
                      auto
                      flat
                      onClick={() => props?.setCollapsed(!props?.collapsed)}
                    >
                      <img src="../images/arrow.svg" width={20} id="svgImage" />
                    </Link>
                  </Card.Header>

                  <Card.Body css={{ p: "$0", overflow: "hidden" }}>
                    {" "}
                    <Row justify="center" align="center">
                      {showGrpClient ? (
                        <ClientStatusSelector
                          selectedClients={selectedClients}
                          setSelectedClients={setSelectedClients}
                          originalUsers={originalUsers}
                        />
                      ) : (
                        <Groups />
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </Row>
            </div>
          </>
        }
        open={props.collapsed}
        // onSetOpen={onSetSidebarOpen}
        sidebarClassName="custom-sidebar-class" // Custom class for sidebar styles (optional)
        overlayClassName="custom-overlay-class" // Custom class for overlay styles (optional)
        styles={{
          sidebar: {
            background: "white", // Custom sidebar background color
            width: "300px", // Example of custom width
            zIndex: 1000, // Ensure sidebar is above other content
            boxShadow: "none", // Remove any box shadow
            height: "71.8%",
            overflowY: "hidden",
            borderRadius: "0px 15px 15px 0px",
            position: "fixed",
            left: "0%",
            top: "20%",
          },
          overlay: {
            display: "none", // Hide the overlay when sidebar is open
          },
        }}
      ></Sidebar>
    </>
  );
}

export default memo(SiderLeft);
