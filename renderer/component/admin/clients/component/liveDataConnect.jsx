import { Modal, Button, Text, Input, Loading, Row } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../../context/GlobalContext";

const LiveDataConnectModal = (props) => {
  const {
    handleConnectLiveData,
    handleConnectIIFLLiveData,
    activeWebSocketBroker,
  } = props;

  const {
    liveDataProcess,
    liveDataProcessIIFLSMC,
    currentSocketBroker,
    setCurrentSocketBroker,
    selectedClientLtp,
    setIsLiveDataConnected,
    setClientData,
    setCurrentSocketItem,
    exchangeLiveDataHandler,
  } = useGlobalContext();
  const [status, setStatus] = useState("not connected");
  const [IIFLdata, setIIFLdata] = useState(false);

  useEffect(() => {
    const checkLiveData = () => {
      if (currentSocketBroker === "MOSWAL") {
        liveDataProcess.on("message", (msg) => {
          if (msg.type == "connectionConfirmation") {
            setClientData(activeWebSocketBroker?.Broker);
            // setClientData(props?.rowData?.Broker);
            if (msg.data === "Success") {
              setStatus("connected");
              // exchangeLiveDataHandler();
            }
            if (msg.data === "Failed") {
              setStatus("Failed");
            }
            props.onConnected(msg.data);
          }
        });
      } else if (
        currentSocketBroker === "IIFL" ||
        currentSocketBroker === "SMC"
      ) {
        liveDataProcessIIFLSMC?.on("message", (msg) => {
          if (msg.type == "connectionConfirmation") {
            setClientData(activeWebSocketBroker?.Broker);
            // setClientData(props?.rowData?.Broker);
            if (msg.data === "Success") {
              setStatus("connected");
              setIIFLdata(true);
            }
            if (msg.data === "Failed") {
              setStatus("Failed");
              setIIFLdata(true);
            }
            props.onConnected(msg.data);
          }
        });
      }
    };

    checkLiveData();
  }, [currentSocketBroker, liveDataProcessIIFLSMC]);

  const getComponent = () => {
    switch (status) {
      case "not connected":
        return (
          <>
            <label>Click on connect to connect to live data </label>
          </>
        );

      case "connecting":
        return (
          <>
            <Row justify="center">
              <Loading type="spinner" size="md" />
            </Row>

            <Row justify="center">
              <Text h5>Connecting..</Text>
            </Row>
          </>
        );

      case "connected":
        return (
          <>
            <Row justify="center">
              <Text h5>Connected</Text>
            </Row>
          </>
        );

      case "failed":
        return (
          <>
            <Row justify="center">Failed</Row>
          </>
        );
    }
  };

  // const getIIFLComponent = () => {
  //   switch (status) {
  //     case "not connected":
  //       return (
  //         <>
  //           <div style={{ display: "flex" }}>
  //             <label style={{ marginRight: "1rem", minWidth: "100px" }}>
  //               Secret Key:
  //             </label>
  //             <Input
  //               bordered
  //               borderWeight="light"
  //               fullWidth
  //               name="secretKey"
  //               onChange={(e) => setSecretKey(e.target.value)}
  //             />
  //           </div>
  //           <div style={{ display: "flex" }}>
  //             <label style={{ marginRight: "1rem", minWidth: "100px" }}>
  //               XTS API Key:
  //             </label>
  //             <Input
  //               bordered
  //               borderWeight="light"
  //               fullWidth
  //               name="appKey"
  //               onChange={(e) => setApiKey(e.target.value)}
  //             />
  //           </div>

  //           <div style={{ display: "flex" }}>
  //             <label style={{ marginRight: "1rem", minWidth: "100px" }}>
  //               URL:
  //             </label>
  //             <Input
  //               bordered
  //               borderWeight="light"
  //               fullWidth
  //               name="url"
  //               onChange={(e) => setUrlKey(e.target.value)}
  //               initialValue={iiflUrlkey}
  //             />
  //           </div>
  //         </>
  //       );

  //     case "connecting":
  //       return (
  //         <>
  //           <Row justify="center">
  //             <Loading type="spinner" size="md" />
  //           </Row>

  //           <Row justify="center">
  //             <Text h5>Connecting..</Text>
  //           </Row>
  //         </>
  //       );

  //     case "connected":
  //       return (
  //         <>
  //           <Row justify="center">
  //             <Text h5>Connected</Text>
  //           </Row>
  //         </>
  //       );

  //     case "Failed":
  //       return (
  //         <>
  //           <Row justify="center">Wrong Crenditials</Row>
  //         </>
  //       );
  //   }
  // };

  // const alignDob = (dobStr) => {
  //   dobStr = String(dobStr);
  //   var newDobStr = "";
  //   for (let i = 0; i < dobStr.length; i++) {
  //     if (i == 2 || i == 4) {
  //       newDobStr += "/" + dobStr[i];
  //     } else {
  //       newDobStr += dobStr[i];
  //     }
  //   }

  //   return newDobStr;
  // };

  // const handleConnectLiveData = async (data) => {
  //   const settings = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       totp: props.rowData["totp"],
  //     }),
  //   };

  //   try {
  //     const reqData = {};

  //     if (props.rowData["Broker"] === "MOSWAL") {
  //       const fetchResponse = await fetch(
  //         "http://127.0.0.1:6001/api/prod/client/totp/",
  //         settings
  //       );
  //       const data = await fetchResponse.json();
  //       reqData["ApiKey"] = props.rowData["apiKey"];
  //       reqData["ClientCode"] = props.rowData["Client ID"];
  //       reqData["Password"] = props.rowData["password"];
  //       reqData["PanOrDOB"] = alignDob(props.rowData["dob"]);
  //       reqData["totp"] = data.data;
  //       liveDataProcess &&
  //         liveDataProcess?.send({
  //           action: "initiate",
  //           data: reqData,
  //         });

  //       setCurrentSocketBroker("MOSWAL");
  //       setCurrentSocketItem(props.rowData["Client ID"]);
  //       localStorage.setItem("myClientLive", props.rowData["Client ID"]);
  //     }
  //     setIsLiveDataConnected(true);
  //     await ipcRenderer.invoke("set-liveData-props", {
  //       broker: props.rowData["Broker"],
  //       data: reqData,
  //       clientId: props.rowData["Client ID"],
  //     }); //store details of last connected live data

  //     return data;
  //   } catch (e) {
  //     return e;
  //   }
  // };

  // const handleConnectIIFLLiveData = async (data) => {
  //   try {
  //     const BrokerData = {
  //       ApiKey: props.rowData["marketApiKey"],
  //       secretKey: props.rowData["marketSecretKey"],
  //       url: iiflUrlkey,
  //     };

  //     if (["IIFL", "SMC", "FPAISA"].includes(props.rowData["Broker"])) {
  //       liveDataProcessIIFLSMC &&
  //         liveDataProcessIIFLSMC?.send({
  //           action: "initiate",
  //           data: BrokerData,
  //         });
  //       setCurrentSocketBroker("IIFL");
  //       setCurrentSocketItem(props.rowData["Client ID"]);
  //       localStorage.setItem("myClientLive", props.rowData["Client ID"]);
  //     }
  //     // props?.setLiveDataModal(false);
  //     setIsLiveDataConnected(true);
  //     await ipcRenderer.invoke("set-liveData-props", {
  //       broker: props.rowData["Broker"],
  //       data: BrokerData,
  //       clientId: props.rowData["Client ID"],
  //     }); //store details of last connected live data
  //     return data;
  //   } catch (e) {
  //     return e;
  //   }
  // };

  const isSpecialBroker = ["IIFL", "SMC", "FPAISA"].includes(
    activeWebSocketBroker?.["Broker"]
  );
  const connectHandler = isSpecialBroker
    ? handleConnectIIFLLiveData
    : handleConnectLiveData;

  const handleClose = () => {
    props.setLiveDataModal(false);
    props.setRowData(null);
    if (isSpecialBroker) setIIFLdata(false);
    setTimeout(() => {
      setStatus("not connected");
    }, 200);
  };

  return (
    <>
      <Modal
        width={"300px"}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={props.liveDataModal}
        preventClose
      >
        <Modal.Body style={{ display: "flex", flexDirection: "column" }}>
          {getComponent()}
        </Modal.Body>

        <Modal.Footer>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            color={!isSpecialBroker ? "error" : undefined}
            onPress={handleClose}
          >
            Close
          </Button>

          {status === "not connected" && (
            <Button
              className="primary-button border-radius-8 cursor-pointer"
              auto
              css={{ background: "$blue600", color: "White", mr: "$9" }}
              onPress={() => {
                connectHandler();
                setStatus("connecting");
                selectedClientLtp.current = activeWebSocketBroker["Client ID"];
                // selectedClientLtp.current = props?.rowData["Client ID"];
              }}
            >
              Connect
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LiveDataConnectModal;
