import { Col, Row, Modal, Text } from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react";
// import electron from "electron";
// const ipcRenderer = electron.ipcRenderer || false;

import { useGlobalContext } from "../../../context/GlobalContext";
import { useHealthContext } from "../../../context/healthContext";
import {
  getBrokerHealthStatus,
  getClientsLoginStatus,
} from "../../../../services/transactions/transactions.service";
import Image from "next/image";
import { brokerLogoFormatHandler } from "../../../constant/constant";

const logoutClientHeader = [
  {
    id: 1,
    header: "Client ID",
    width: 200,
  },
  {
    id: 2,
    width: "auto",
    header: "Client Name",
  },
];

const BrokerHealth = () => {
  const { user, logginClients, offlineRowData, clientsData } =
    useGlobalContext();
  const [brokersHealth, setBrokersHealth] = useState({});
  const [clientLoginStatus, setClientLoginStatus] = useState([]);
  const [toggle, setToggle] = useState(true);
  const brokersHealthRef = useRef({});
  const timeoutRef = useRef(null);
  const [healthColor, setHealthColor] = useState(null);
  const brokerNamesRef = useRef([]); // useRef to store broker names

  const healthCheck = async () => {
    try {
      /**This line of code is written to get logged in client staus */
      let clientLoginStatusRes = await getClientsLoginStatus();
      clientLoginStatusRes = await clientLoginStatusRes.json();
      if (clientLoginStatusRes.message === "Success") {
        let loggedOutClients = clientLoginStatusRes.data.filter(
          (i) => i.status === false
        );
        setClientLoginStatus(loggedOutClients);
        if (loggedOutClients.length && !timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            setToggle(true);
            timeoutRef.current = null;
          }, 30 * 60 * 1000);
        }
      }

      /**This line of code is written to get broker healt status */
      let healthData = await getBrokerHealthStatus();
      healthData = await healthData.json();
      let retrunBody = { data: {}, message: "" };

      /** To check internet is working or not */
      if (healthData.data && logginClients.current) {
        healthData.data.forEach((item) => {
          let brokername = Object.keys(item)[0];
          let isOnline = window.localStorage.getItem("IsOnline");
          let healthPoints = isOnline === "YES" ? item[brokername] : 0;
          let color = "red";
          if (healthPoints > 0 && healthPoints <= 1) {
            color = "green";
          } else if (healthPoints > 1 && healthPoints <= 3) {
            color = "orange";
          }

          retrunBody.data[brokername] = { healthPoints, color };
        });
      } else {
        brokerNamesRef.current.forEach((brokername) => {
          retrunBody.data[brokername] = { color: "grey" };
        });
      }

      if (offlineRowData?.length > 0) {
        offlineRowData.forEach((brokername) => {
          retrunBody.data[brokername?.brokerName] = { color: "none" };
        });
      }

      setHealthColor(retrunBody);
      return retrunBody;
    } catch (e) { }
  };

  const getUniqBrokers = async () => {
    // OLD (incorrect):
    // const clientStatus = await ipcRenderer.invoke(
    //   "readMemory-ipc",
    //   "clientStatus"
    // );

    // NEW (correct - use window.electronAPI):
    const clientStatus = await window.electronAPI.readMemory(
      "clientStatus"
    );

    const uniqueOnlineBrokers = [
      ...new Set((clientStatus || []).map((cl) => cl.broker.toUpperCase())),
    ];

    const offlineBrokers =
      offlineRowData?.length > 0
        ? offlineRowData?.map((current) => current.brokerName) || []
        : "";
    const uniqueOfflineBroker = [...new Set(offlineBrokers)];
    const mergedClient = [...uniqueOnlineBrokers, ...uniqueOfflineBroker];

    if (mergedClient.join(",") !== brokerNamesRef.current.join(",")) {
      brokerNamesRef.current = mergedClient;
      const tempBrokerHealth = {};

      mergedClient.forEach((broker) => {
        tempBrokerHealth[broker] = {
          brokerName: broker.toUpperCase(),
          logoLink: brokerLogoFormatHandler(broker),
          health: "$gray300",
        };
      });

      brokersHealthRef.current = tempBrokerHealth;
      setBrokersHealth(tempBrokerHealth);
    }
  };

  const closeHandler = () => {
    setToggle(false);
  };

  useEffect(() => {
    getUniqBrokers();
  }, [user]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await healthCheck();
      } catch (e) { }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const Broker = ({ brokerName, logoLink, health }) => {
    const { name } = useHealthContext();
    const brokerNameLength = brokerName.length >= 6 ? "140px" : "101px";

    return (
      <div>
        <Row>
          <Col>
            <Row justify="center">
              {logginClients.current && healthColor ? (
                <img
                  src={logoLink}
                  width={18}
                  style={{ marginTop: "0px" }}
                  className={`${healthColor["data"]?.[brokerName]?.["color"]}HealthImg`}
                  title={brokerName}
                />
              ) : (
                ""
              )}
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <>
      <Row css={{ maxWidth: "650px" }}>
        {Object.keys(brokersHealth).map((key) => (
          <Col key={key} css={{ m: "$2" }}>
            <Broker
              brokerName={brokersHealth[key].brokerName}
              logoLink={brokersHealth[key].logoLink}
              health={brokersHealth[key].health}
            />
          </Col>
        ))}
      </Row>
      <Modal
        scroll
        preventClose
        open={clientLoginStatus.length && toggle}
        closeButton
        onClose={closeHandler}
        width="500px"
        css={{ height: "fit-content", maxHeight: "600px" }}
      >
        <Modal.Header style={{ fontSize: "22px", padding: "0 0 10px 0" }}>
          Client logged out
        </Modal.Header>
        <Modal.Body>
          <Text> All following clients are logged out. </Text>
        </Modal.Body>

        <div
          style={{
            paddingLeft: "35px",
            paddingRight: "35px",
            paddingBottom: "10px",
          }}
        >
          <Row
            style={{ marginTop: "20px" }}
            className="flex-row justify-start align-center"
          >
            {logoutClientHeader.map((item) => {
              return (
                <Text
                  key={item.id.toString()}
                  h5
                  css={{
                    width: item.width,
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontWeight: "700",
                    margin: "0px",
                    letterSpacing: "0.4px",
                  }}
                >
                  {item.header}
                </Text>
              );
            })}
          </Row>
          <div
            className="flex-col"
            style={{
              overflowX: "hidden",
              overflowX: "auto",
              maxHeight: "450px",
              marginTop: "5px",
              rowGap: "3px",
              marginBottom: "15px",
            }}
          >
            {clientLoginStatus.map((item) => {
              const brokerLowerCase = item.broker.toLowerCase();
              const clientNameObj = clientsData.find(
                (elem) => elem.clientId == item.client_code
              );
              return (
                <Row
                  className="flex-row justify-start align-center"
                  style={{ width: "100%" }}
                  key={item.client_code.toString()}
                >
                  <div
                    className="flex-row justify-start align-center"
                    style={{ width: "200px" }}
                  >
                    <Image
                      style={{ margin: "0px" }}
                      src={brokerLogoFormatHandler(brokerLowerCase)}
                      width={20}
                      height={20}
                      alt={item.label}
                    />
                    <h6
                      style={{
                        marginBottom: "0px",
                        marginLeft: "5px",
                      }}
                      className="flex-row justify-center align-center"
                    >
                      {item.client_code}
                    </h6>
                  </div>
                  <h6 style={{ width: "auto", marginBottom: "0px" }}>
                    {clientNameObj?.clientName}
                  </h6>
                </Row>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default React.memo(BrokerHealth);
