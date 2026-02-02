import electron from "electron";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../../../context/GlobalContext";
const ipcRenderer = electron.ipcRenderer || false;
const Store = require("electron-store");
const store = new Store();
import SubmitModal from "./submitModal";
import ConnectModal from "../loader/connect-modal";
import {
  Card,
  Col,
  Image,
  Input,
  Row,
  Spacer,
  Text,
  Button,
  Tooltip,
  Navbar,
} from "@nextui-org/react";
import ClientCredsTable from "./clientCredsTable";
import AddClientModal from "./AddClientModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OfflineClientTable from "./OfflineClientTable";
import ModalBulkHolding from "./ModalBulkHolding";
import {
  MutlipleDeleteHoldingHandler,
  GetOfflineClient,
  clientBrokerConnection,
  deleteAllOnlineClients,
  deleteSingleClient,
  uploadClients,
  deleteClientsbyId,
  deleteAllClients,
  reconnectAllClients, //
} from "../../../../services/transactions/transactions.service";
import AddSingleOfflineClient from "./AddSingleOfflineClient";
import { LoginStatus, warnMessage } from "../../../constant/constant";
import { clientsState } from "../../../../main/logic/envLogic";
import FullPageLoader from "../../common/FullPageLoader";
import CommonConfirmationModal from "../../common/CommonConfirmationModal";

const ClientBase = () => {
  const {
    clientCreds,
    setClientCreds,
    loginData,
    logginClients,
    setUser,
    setIsLiveDataConnected,
    selectedClientLtp,
    user,
    deleteCheckboxClients,
    setDeleteCheckboxClients,
    offlineRowData,
    setOfflineRowData,
    setOfflinebroker,
    setClientsData,
    setGroup_Clients,
    group_Clients,
    exchangeLiveDataHandler,
    setLiveDataModal,
    clientApiBodyFormatHandler,
  } = useGlobalContext();
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState({});
  const [submitVisible, setSubmitVisible] = useState(false);
  const [connectVisible, setConnectVisible] = useState(false);
  const [validSheet, setValidSheet] = useState(true);
  const [resStatus, setResStatus] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const handler = () => setSubmitVisible(true);

  const [isFiltering, setIsFiltering] = useState(false);

  const [switch_GpCl, setswitch_GpCl] = useState("Online");
  const [fileOffline, setfileOffline] = useState(null);
  const [BulkHolding, setBulkHolding] = useState(false);
  const [BulkMOdalScreen, setBulkMOdalScreen] = useState("");
  const [SignleOfflineClient, setSignleOfflineClient] = useState(false);
  const [activeWebSocketBroker, setActiveWebSocketBroker] = useState({});
  const [isReadyToWebSocketConnection, setIsReadyToWebSocketConnection] =
    useState(false);
  const [rowData, setRowData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (group_Clients?.length === 0 && store.get("clientCreds")) {
      const clientsArr = groupClientsInit(store.get("clientCreds")?.rows);
      const groupData = { default: clientsArr };
      setGroup_Clients(groupData);
    }
  }, []);

  const updateGroupClientsDeletionHandler = async (clientCredsIds) => {
    if (clientCredsIds.length) {
      const groupData = await ipcRenderer.invoke("readMemory-ipc", "group");

      Object.keys(groupData).forEach((key) => {
        groupData[key] = groupData[key].filter(
          (item) => !clientCredsIds.includes(item)
        );
      });

      const ipcReqBody = {
        field: "group",
        subField: "All",
        data: groupData,
      };
      setGroup_Clients(groupData);
      var memoryResult = await ipcRenderer.invoke(
        "updateMemory-ipc",
        ipcReqBody
      );
    }
  };

  useEffect(() => {
    setDeleteCheckboxClients((prev) =>
      switch_GpCl === "Offline" ? [] : [...prev]
    );
    return () => {
      setDeleteCheckboxClients([]);
    };
  }, [switch_GpCl]);

  //loggin all the clients
  const uploadLoginAllClients = async (reconnectResponse) => {
    try {
      // const reconnectResponse = await reconnectAllClients();
      if (reconnectResponse && Array.isArray(reconnectResponse?.rows)) {
        //adding dealerID
        reconnectResponse.apiBody["DEALERID"] = loginData["user_id"];

        setClientCreds(reconnectResponse.rows || []);

        const { DEALERID, ...rest } = reconnectResponse.apiBody;

        const updatedApiBody = clientApiBodyFormatHandler(rest);

        let apiStatus;
        try {
          const res = await clientBrokerConnection({
            DEALERID,
            ...updatedApiBody,
          });
          console.log("res", res);
          apiStatus = clientsState(res?.data);

          //calling clients login api for all brokers present in the excel sheet
          if (apiStatus?.length) {
            await ipcRenderer.invoke("set-clientStatusApiRes", {
              apiStatus: apiStatus,
            });
          }
        } catch (error) {
          console.log("error broker client", error);
        }
        setUser(apiStatus);
        //it will make loggin status to green from red in "Login Status" and "broker health" column
        logginClients.current = true;
        // const storeClientCredRows = result.rows;
        // let santisedArrayWithStatus = [];
        // const failed = [];
        // storeClientCredRows?.forEach((item) => {
        //   if (Array.isArray(apiStatus)) {
        //     const filteredObject = apiStatus?.filter((obj) => {
        //       return (
        //         obj.name === String(item["Client ID"]) && obj.broker === item.Broker
        //       );
        //     });
        //     //adding column for login status in the table (client credentials)
        //     santisedArrayWithStatus.push({
        //       ...item,
        //       loginStatus:
        //         filteredObject[0]?.status === "success"
        //           ? LoginStatus.LOGGED_IN
        //           : LoginStatus.LOGGED_OUT,
        //       description: filteredObject[0]?.description,
        //     });
        //     if (filteredObject[0]?.status !== "success")
        //       failed.push(item["Client ID"]);
        //   } else {
        //     failed.push(item["Client ID"]);
        //   }
        // });
        // if (failed.length)
        //   toast.error(`${failed.join()} Login failed, Please try again!`);

        // result["rows"] = santisedArrayWithStatus;
        // var memoryResult = await ipcRenderer.invoke("updateMemory-ipc", {
        //   field: "clientCreds",
        //   subField: "All",
        //   data: result,
        // });
        //loader while fetching response on loading the clients
        setResStatus(false);
        //logging status for cliets and brokers if logged in or not for the firs time
        if (apiStatus == "error") setLoadError(true);
        //state variables for displaying table of client credentials
        // setClientCredsCols(colnKeys);
        // setClientCreds(santisedArrayWithStatus);
        /// --- old way --- ///
        // let activeWebSocketFound = false;
        // for (let item of reconnectResponse?.rows) {
        //   if (item.isActiveWebSocket) {
        //     activeWebSocketFound = true;
        //     setActiveWebSocketBroker(item);
        //     setIsReadyToWebSocketConnection(true);
        //     break;
        //   }
        // }
        // if (!activeWebSocketFound) {
        //   for (let item of reconnectResponse?.rows) {
        //     if (
        //       ["MOSWAL", "IIFL"].includes(item.Broker) &&
        //       item["loginStatus"] === LoginStatus.LOGGED_IN
        //     ) {
        //       setActiveWebSocketBroker(item);
        //       setIsReadyToWebSocketConnection(true);
        //       break;
        //     }
        //   }
        // }

        /// --- new way --- ///

        const rows = reconnectResponse?.rows || [];

        const primary = rows.find((item) => item.isActiveWebSocket);
        const fallback = rows.find(
          (item) =>
            ["MOSWAL"].includes(item.Broker) &&
            item.loginStatus === LoginStatus.LOGGED_IN
        );

        const activeBroker = primary || fallback;

        if (activeBroker) {
          setActiveWebSocketBroker(activeBroker);
          setIsReadyToWebSocketConnection(true);
        }
      }
    } catch (error) {
      console.log("error of reconnect client", error);
    }
  };

  const loginAllClients = async () => {
    try {
      const reconnectResponse = await reconnectAllClients();
      if (reconnectResponse && Array.isArray(reconnectResponse?.rows)) {
        //adding dealerID
        reconnectResponse.apiBody["DEALERID"] = loginData["user_id"];

        setClientCreds(reconnectResponse.rows || []);

        const { DEALERID, ...rest } = reconnectResponse.apiBody;

        const updatedApiBody = clientApiBodyFormatHandler(rest);

        let apiStatus;
        try {
          const res = await clientBrokerConnection({
            DEALERID,
            ...updatedApiBody,
          });
          apiStatus = clientsState(res?.data);

          //calling clients login api for all brokers present in the excel sheet
          if (apiStatus?.length) {
            await ipcRenderer.invoke("set-clientStatusApiRes", {
              apiStatus: apiStatus,
            });
          }
        } catch (error) {
          console.log("error broker client", error);
        }
        setUser(apiStatus);
        //it will make loggin status to green from red in "Login Status" and "broker health" column
        logginClients.current = true;
        // const storeClientCredRows = result.rows;
        // let santisedArrayWithStatus = [];
        // const failed = [];
        // storeClientCredRows?.forEach((item) => {
        //   if (Array.isArray(apiStatus)) {
        //     const filteredObject = apiStatus?.filter((obj) => {
        //       return (
        //         obj.name === String(item["Client ID"]) && obj.broker === item.Broker
        //       );
        //     });
        //     //adding column for login status in the table (client credentials)
        //     santisedArrayWithStatus.push({
        //       ...item,
        //       loginStatus:
        //         filteredObject[0]?.status === "success"
        //           ? LoginStatus.LOGGED_IN
        //           : LoginStatus.LOGGED_OUT,
        //       description: filteredObject[0]?.description,
        //     });
        //     if (filteredObject[0]?.status !== "success")
        //       failed.push(item["Client ID"]);
        //   } else {
        //     failed.push(item["Client ID"]);
        //   }
        // });
        // if (failed.length)
        //   toast.error(`${failed.join()} Login failed, Please try again!`);

        // result["rows"] = santisedArrayWithStatus;
        // var memoryResult = await ipcRenderer.invoke("updateMemory-ipc", {
        //   field: "clientCreds",
        //   subField: "All",
        //   data: result,
        // });
        //loader while fetching response on loading the clients
        setResStatus(false);
        //logging status for cliets and brokers if logged in or not for the firs time
        if (apiStatus == "error") setLoadError(true);
        //state variables for displaying table of client credentials
        // setClientCredsCols(colnKeys);
        // setClientCreds(santisedArrayWithStatus);
        /// --- old way --- ///
        // let activeWebSocketFound = false;
        // for (let item of reconnectResponse?.rows) {
        //   if (item.isActiveWebSocket) {
        //     activeWebSocketFound = true;
        //     setActiveWebSocketBroker(item);
        //     setIsReadyToWebSocketConnection(true);
        //     break;
        //   }
        // }
        // if (!activeWebSocketFound) {
        //   for (let item of reconnectResponse?.rows) {
        //     if (
        //       ["MOSWAL", "IIFL"].includes(item.Broker) &&
        //       item["loginStatus"] === LoginStatus.LOGGED_IN
        //     ) {
        //       setActiveWebSocketBroker(item);
        //       setIsReadyToWebSocketConnection(true);
        //       break;
        //     }
        //   }
        // }

        /// --- new way --- ///

        const rows = reconnectResponse?.rows || [];

        const primary = rows.find((item) => item.isActiveWebSocket);
        const fallback = rows.find(
          (item) =>
            ["MOSWAL"].includes(item.Broker) &&
            item.loginStatus === LoginStatus.LOGGED_IN
        );

        const activeBroker = primary || fallback;

        if (activeBroker) {
          setActiveWebSocketBroker(activeBroker);
          setIsReadyToWebSocketConnection(true);
        }
      }
    } catch (error) {
      console.log("error of reconnect client", error);
    }
  };

  const handleFileChange = (e) => {
    if (loginData && clientCreds.length >= loginData?.allowed_clients) {
      toast.warn(warnMessage.client_limit);
      return;
    }

    if (e.target.files[0]) {
      setFile(e.target.files[0]);

      handler();
    }
  };

  const groupClientsInit = (clientRows) => {
    const clients = [];
    clientRows.forEach((item) => {
      clients.push(item["Client ID"]);
    });
    return clients;
  };

  // const uploadedClientsCSVHandler = async () => {
  //   if (!file || file.path == null || file.path == undefined) {
  //     return;
  //   }
  //   setConnectVisible(true);

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("allowed_clients", loginData?.allowed_clients);
  //   formData.append("availed_clients", clientCreds.length);

  //   try {
  //     const uploadedResponse = await uploadClients(formData);
  //     console.log("uploadedResponse", uploadedResponse);
  //     if (uploadedResponse && Array.isArray(uploadedResponse.rows)) {
  //       toast.success(uploadedResponse.message);
  //       setClientCreds(uploadedResponse.rows);
  //     }
  //   } catch (error) {
  //     console.log("error in upload clients", error);
  //   } finally {
  //     setConnectVisible(false);
  //   }
  // };

  const uploadedClientsCSVHandler = async () => {
    if (!file || file.path == null || file.path == undefined) {
      return;
    }
    setConnectVisible(true);

    var ipcReqBody = {
      filename: file.name,
      filePath: file.path,
      allowed_clients: loginData?.allowed_clients,
    };

    // //ipc to convert
    // var [validUpload, result, isAllowedWarn = false] = await ipcRenderer.invoke(
    //   "parse-clientcreds-ipc",
    //   ipcReqBody
    // );

    // if (isAllowedWarn) {
    //   setResStatus(false);
    //   setConnectVisible(false);
    //   toast.warn(warnMessage.client_limit);
    //   return;
    // }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("allowed_clients", loginData?.allowed_clients);
    formData.append("availed_clients", clientCreds.length);
    formData.append("dealer_id", loginData.user_id);
    let clientUploadedResponse = {
      rows: [],
      columns: [],
      apiBody: {},
    };
    try {
      const uploadedResponse = await uploadClients(formData);
      if (uploadedResponse && Array.isArray(uploadedResponse.rows)) {
        clientUploadedResponse = {
          rows: uploadedResponse?.rows,
          columns: uploadedResponse?.columns,
          apiBody: { ...uploadedResponse?.apiBody },
        };
        toast.success(uploadedResponse?.message);
        setClientCreds(uploadedResponse.rows);
      } else {
        toast.error(uploadedResponse.message);
      }
    } catch (error) {
      console.log("error in upload clients", error);
    }

    //saving xlsx into cli exe path
    // ipcReqBody = {
    //   rows: clientUploadedResponse?.rows,
    // };
    // const resSheet = await ipcRenderer.invoke("ipc-saveSheetToCliDir",ipcReqBody); //to create a csv for cmd
    // initializing default groups after uploading client creds
    const clientsArr = groupClientsInit(clientUploadedResponse?.rows);

    const existedGroupData = await ipcRenderer.invoke(
      "readMemory-ipc",
      "group"
    );

    const groupData = { ...existedGroupData, default: clientsArr };
    setValidSheet(true);
    ipcReqBody = {
      field: "group",
      subField: "All",
      data: groupData,
    };
    setGroup_Clients(groupData);
    var memoryResult = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);

    //adding uid
    // const colnKeys = result["columns"].map((item, index) => {
    //   return {
    //     name: item,
    //     uid: item,
    //   };
    // });
    // await handleDeleteAll();

    const clientsDetails = clientUploadedResponse?.rows.map((item) => ({
      clientId: item["Client ID"] || "",
      clientName: item.ClientName || "",
      email: item.email || "",
      userId: item.userId || "",
    }));

    setClientsData(clientsDetails);

    await uploadLoginAllClients(clientUploadedResponse);
  };

  const setDeletedUpdatedClientStatus = async (clientId, broker, data) => {
    var clientStatus = await ipcRenderer.invoke(
      "readMemory-ipc",
      "clientStatus"
    );

    clientStatus = clientStatus?.filter(
      (clientData) =>
        clientData["name"] !== clientId || clientData["broker"] !== broker
    );
    setUser(clientStatus);

    var ipcReqBody = {
      field: "clientStatus",
      subField: "All",
      data: clientStatus,
    };
    var result = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);

    const clientsDetails =
      result?.rows?.map((item) => ({
        clientId: item["Client ID"] || "",
        clientName: item.ClientName || "",
        email: item.email || "",
        userId: item.userId || "",
      })) || [];

    setClientsData(clientsDetails);
  };

  const getCredApi = async (data, clientCreds) => {
    const broker = data["Broker"];
    const clientId = data["Client ID"];
    for (const client of deleteCheckboxClients) {
      // await setDeletedUpdatedClientStatus(client["Client ID"],client["Broker"] , data);
      if (clientCreds.apiBody[broker]) {
        clientCreds.apiBody[client["Broker"]] = clientCreds.apiBody[
          client["Broker"]
        ].filter((clientApi) => clientApi["client_code"] !== client["Broker"]);
      }
    }
  };

  const getCredRows = async (data, clientCreds) => {
    // var rows = data.rows;

    //removing clientID from the data
    for (const client of deleteCheckboxClients) {
      clientCreds.rows = clientCreds.rows.filter(
        (clientData, index) => clientData["Client ID"] !== client["Client ID"]
      );
    }
  };

  function deleteSelectedClientsHandler(data, clientIdsToRemove) {
    data.rows = data.filter(
      (row) => !clientIdsToRemove.includes(row["Client ID"])
    );

    // Update apiBody by removing entries where Client ID matches
    for (const broker in data.apiBody) {
      if (data.apiBody.hasOwnProperty(broker)) {
        if (Array.isArray(data.apiBody[broker])) {
          data.apiBody[broker] = data.apiBody[broker].filter(
            (entry) => !clientIdsToRemove.includes(entry.client_code)
          );
        }
      }
    }

    return data;
  }

  const deleteSelectedClientsStoreHandler = async (selectedClients) => {
    const clientIds = selectedClients.map((item) => item["Client ID"]);

    if (clientIds.length) {
      setDeleteCheckboxClients([]);
      setClientCreds((prev) =>
        prev.filter((item) => !clientIds.includes(item["Client ID"]))
      );
      setClientsData((prev) =>
        prev.filter((item) => !clientIds.includes(item.clientId))
      );
      setUser((prev) => prev.filter((item) => !clientIds.includes(item.name)));

      let clientStatus = await ipcRenderer.invoke(
        "readMemory-ipc",
        "clientStatus"
      );

      if (Object.keys(activeWebSocketBroker).length) {
        for (let clientId of clientIds) {
          if (activeWebSocketBroker["Client ID"] === clientId) {
            store.delete("activeWebsocketBroker");
            setActiveWebSocketBroker({});
            break;
          }
        }
      }

      ///---- udpate the groupclients that clients is selected for delete in groups
      await updateGroupClientsDeletionHandler(clientIds);

      // const updatedClientStatus = clientCreds.filter(
      //   (item) => !clientIds.includes(item.name)
      // );
      const updatedClientStatus = clientStatus.filter(
        (item) => !clientIds.includes(item.name)
      );

      var ipcReqBody = {
        field: "clientStatus",
        subField: "All",
        data: updatedClientStatus,
      };

      await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);

      // const updatedClientsData = deleteSelectedClientsHandler(
      //   clientCreds,
      //   clientIds
      // );
      // const updatedClientsData = deleteSelectedClientsHandler(
      //   clientCredentials,
      //   clientIds
      // );
      // var ipcReqBody = {
      //   field: "clientCreds",
      //   subField: "All",
      //   data: updatedClientsData,
      // };

      for (let clientId of clientIds) {
        try {
          await deleteSingleClient(clientId);
          const res = await deleteClientsbyId(clientId);
        } catch (error) {
          console.log("delete client error", error);
        }
      }

      toast.success(`All Selected Clients deleted successfully.`);
      // await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
      await loginAllClients();
      setLoading(false);
      // try {
      //   var result = await ipcRenderer.invoke("readMemory-ipc", "clientCreds");
      //   if (result) {
      //     await loginAllClients(result);
      //   }
      // } catch (error) {
      //   console.log("error in login", error);
      // }
    }
  };

  const processRef = useRef(false)
  const handleDeleteAll = async () => {
    if (processRef.current) return;
    processRef.current = true;
    setLoading(true);
    if (!deleteCheckboxClients.length) {
      // if (Array.isArray(DeleteOneData) && DeleteOneData.length === 0) {
      setClientCreds([]);
      setUser([]);
      setGroup_Clients([]);
      store.delete("clientStatus");
      store.delete("activeWebsocketBroker");
      // store.delete("clientCreds");
      store.delete("group");
      // Unsubscribe live data
      store.delete("liveData");
      try {
        const res = await deleteAllClients();
        if (res) {
          toast.success(res.message);
        }
      } catch (error) {
        console.log("delete all online clients in db", error);
      }
      try {
        await deleteAllOnlineClients();
      } catch (error) {
        console.log("delete all online clients error", error);
      }
      setIsLiveDataConnected(false);
      setClientsData([]);
      selectedClientLtp.current = "";
      setLoading(false);
    } else {
      await deleteSelectedClientsStoreHandler(deleteCheckboxClients);
      // await editDeleteContextStoreClient(DeleteOneData, deleteCheckboxClients);
    }
    processRef.current = false;
    setIsOpen(false);
  };

  const handleDownloadUploadedCients = async () => {
    // Triggering a file download for the sample file
    const result = "uploaded_clients_set";
    // var clientCreds = await ipcRenderer.invoke("readMemory-ipc", "clientCreds");
    if (clientCreds.length) {
      toast.success("File Download is complete , Check your download folder!");
      await ipcRenderer.invoke(
        "ipc-saveUploadedClientsCSV",
        result,
        clientCreds
      );
    }
  };

  const handleDownloadSampleFile = async () => {
    // Triggering a file download for the sample file
    const result = "set1";
    toast.success("File Download is complete , Check your download folder!");
    await ipcRenderer.invoke("ipc-saveSampleCSV", result);
  };

  const handleDownloadOfflineSampleFile = async () => {
    const result = "Offline";
    toast.success("File Download is complete , Check your download folder!");
    await ipcRenderer.invoke("ipc-saveSampleCSV", result);
  };

  const BulkHoldingHandler = (holding) => {
    setBulkHolding(true);
    setBulkMOdalScreen(holding);
  };

  const handleSingleDeleteHandler = async (data) => {
    const userId = localStorage.getItem("user_id");
    const res = await MutlipleDeleteHoldingHandler(userId);
    handleOfflineData();
    toast.success(res?.Message);
    setOfflineRowData([]);
    // localStorage.removeItem("offlineClient");
  };

  const handleOfflineData = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const list = await GetOfflineClient(userId);
      localStorage.setItem("offlineClient", JSON.stringify(list?.clients));
      setOfflineRowData(list?.clients || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleOfflineData();
  }, [switch_GpCl]);

  const AddsingleClientHandler = () => {
    setSignleOfflineClient(true);
  };

  const showHandler = () => {
    setVisible(true);
  };

  const WebSocketConnectHandler = async () => {
    const activeWebSocketBrokerData = await ipcRenderer.invoke(
      "readMemory-ipc",
      "activeWebsocketBroker"
    );
    setActiveWebSocketBroker((prev) => activeWebSocketBrokerData ?? prev);
    // const rows = clientCreds || [];

    // const primary = rows.find((item) => item.isActiveWebSocket);
    // const fallback = rows.find(
    //   (item) =>
    //     ["MOSWAL"].includes(item.Broker) &&
    //     item.loginStatus === LoginStatus.LOGGED_IN
    // );

    // const activeBroker = primary || fallback;

    // if (activeBroker) {
    //   // setActiveWebSocketBroker(activeBroker);
    //   // setIsReadyToWebSocketConnection(true);
    // }
    // if (!activeWebSocketBrokerData) {
    // for (let item of clientCreds) {
    //   if (
    //     ["MOSWAL", "IIFL"].includes(item.Broker) &&
    //     item["loginStatus"] === LoginStatus.LOGGED_IN
    //   ) {
    //     // setRowData(item);
    //     setActiveWebSocketBroker(item);
    //     break;
    //   }
    // }
    // }
    setLiveDataModal(true);
  };

  const reconnectClientsHandler = async () => {
    // const result = await reconnectAllClients();
    // if (result) {
    // toast.success(result?.message);
    exchangeLiveDataHandler();
    try {
      await loginAllClients();
    } catch (error) {
      console.log("error loginclients", error);
    } finally {
      setConnectVisible(false);
    }
  };

  useEffect(() => {
    (async () => {
      const activeWebSocketBrokerData = await ipcRenderer.invoke(
        "readMemory-ipc",
        "activeWebsocketBroker"
      );
      setActiveWebSocketBroker((prev) => activeWebSocketBrokerData ?? prev);
    })();
  }, []);

  return (
    <>
      <FullPageLoader show={loading} />
      <SubmitModal
        submitVisible={submitVisible}
        setSubmitVisible={setSubmitVisible}
        file={file}
        ipcReadCSV={uploadedClientsCSVHandler}
      // ipcReadCSV={ipcReadCSV}
      ></SubmitModal>
      <CommonConfirmationModal
        isOpen={isOpen}
        title={`Delete Clients Confirmation`}
        handleClose={() => setIsOpen(false)}
        handleConfirm={handleDeleteAll}
      />
      <AddClientModal toggle={visible} setToggle={setVisible} />
      <ConnectModal
        connectVisible={connectVisible}
        setConnectVisible={setConnectVisible}
        resStatus={resStatus}
        setResStatus={setResStatus}
        validSheet={validSheet}
        setValidSheet={setValidSheet}
        loadError={loadError}
        setLoadError={setLoadError}
      />
      <Card css={{ height: "72vh" }}>
        {/* <Card.Header>
          {" "}
          <Row justify="space-between" align="center">
            <Col>
              <Text h4>Client Credentials</Text>
            </Col>
          </Row>
        </Card.Header> */}
        <Card.Body css={{ p: "$7", overflowY: "" }}>
          <Row justify="space-between">
            <Navbar.Content
              variant={"highlight"}
              style={{ border: "1px solid #ECEEF0", borderRadius: "8px" }}
            >
              <Row justify="center" align="center">
                <div style={{ display: "flex" }}>
                  <Navbar.Link
                    isActive={switch_GpCl == "Online"}
                    onPress={() => setswitch_GpCl("Online")}
                    className={`${switch_GpCl === "Online" ? `nav-primary-button` : ""
                      }`}
                    style={{
                      borderRadius:
                        switch_GpCl === "Online" ? "8px 0px 0px 8px" : "",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: "10px",
                      }}
                    >
                      Online Clients
                    </p>
                  </Navbar.Link>
                  <div>
                    <Navbar.Link
                      className={`${switch_GpCl === "Offline" ? `nav-primary-button` : ""
                        }`}
                      isActive={switch_GpCl == "Offline"}
                      onPress={() => setswitch_GpCl("Offline")}
                      style={{
                        // backgroundColor:
                        //   switch_GpCl === "Offline" ? "#4680C2" : "",
                        // color: switch_GpCl === "Offline" ? "white" : "",
                        borderRadius:
                          switch_GpCl === "Offline" ? "0px 8px 8px 0px" : "",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "16px",
                          textAlign: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingTop: "10px",
                        }}
                      >
                        Offline Clients
                      </p>
                    </Navbar.Link>
                  </div>
                </div>
              </Row>
            </Navbar.Content>
            <div style={{ alignContent: "right", display: "flex" }}>
              {switch_GpCl === "Online" ? (
                <>
                  {!!clientCreds.length && (
                    <Col css={{ width: "fit-content" }}>
                      <Button
                        auto
                        flat
                        onClick={async () =>
                          await handleDownloadUploadedCients()
                        }
                        css={{
                          marginRight: "-$5",
                          marginLeft: "-$5",
                          width: "20px",
                          height: "30px",
                          color: "White",
                          background: "#fff",
                          transform: "rotate(180deg)",
                        }}
                        title="Download clients"
                      >
                        <Image src="./images/export_fill_icon.svg" width={30} />
                      </Button>
                    </Col>
                  )}
                  <Button
                    auto
                    flat
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    onPress={() => {
                      if (!clientCreds?.length) return;
                      // handleDeleteAll();
                      setIsOpen(true);
                    }}
                    // disabled={clientCreds?.length ? false : true}
                    title="Delete All"
                  >
                    <Image src="images/DeleteOffline.svg" width={30}></Image>
                  </Button>
                  <Col css={{ width: "fit-content" }}>
                    <Button
                      auto
                      flat
                      onPress={async () => await handleDownloadSampleFile()}
                      css={{
                        marginRight: "-$5",
                        marginLeft: "-$5",
                        width: "20px",
                        height: "30px",
                        color: "White",
                        background: "#fff",
                      }}
                      title="Download Sample file"
                    >
                      {" "}
                      <Image src="./images/download.svg" width={30} />
                    </Button>
                  </Col>

                  <Button
                    flat
                    auto
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    title="Relogin All Accounts"
                    // disabled={clientCreds.length <= 0}
                    onPress={async () => {
                      if (!clientCreds.length) return;
                      setResStatus(true);
                      setConnectVisible(true);
                      setValidSheet(true);

                      // var result = await ipcRenderer.invoke(
                      //   "readMemory-ipc",
                      //   "clientCreds"
                      // );
                      await reconnectClientsHandler();
                    }}
                  >
                    {""}
                    <Image src="images/reconnect.svg" width={100}></Image>
                  </Button>

                  {!!clientCreds.filter(
                    (item) =>
                      ["MOSWAL"].includes(item.Broker) &&
                      (item["loginStatus"] === LoginStatus.LOGGED_IN ||
                        item["loginStatus"] === LoginStatus.WEBSOCKET_CONNECTED)
                  ).length && (
                      <Button
                        flat
                        auto
                        onPress={() => WebSocketConnectHandler()}
                        css={{
                          marginRight: "-$5",
                          marginLeft: "-$5",
                          width: "20px",
                          height: "30px",
                          color: "White",
                          background: "#fff",
                        }}
                        title="WebSocket Connection"
                      >
                        <Image src="./images/Web_Socket.svg" width={30} />
                      </Button>
                    )}

                  <Button
                    flat
                    auto
                    onPress={showHandler}
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    title="Add Single Client"
                  >
                    <Image src="./images/ClientOfflineimage.svg" width={30} />
                  </Button>

                  <Button
                    flat
                    auto
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    title="Upload Online Clients"
                  >
                    <label style={{ cursor: "pointer" }}>
                      <Image src="images/UploadClient.svg" width={30}></Image>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        id="TT"
                        name="TTFile"
                        accept=".xlsx"
                        hidden
                        value={""}
                      />
                    </label>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    auto
                    flat
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    onClick={handleSingleDeleteHandler}
                    // disabled={clientCreds?.length ? false : true}
                    title="Delete All"
                  >
                    {""}
                    <Image src="images/DeleteOffline.svg" width={30}></Image>
                  </Button>

                  <Button
                    flat
                    auto
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    title="Upload Client's Holding"
                    // disabled={clientCreds.length <= 0}
                    onPress={async () => {
                      BulkHoldingHandler("holding");
                    }}
                  >
                    {""}
                    <Image src="images/HolidingData.svg" width={30}></Image>
                  </Button>

                  <Button
                    flat
                    auto
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    title="Add Single Client"
                    // disabled={clientCreds.length <= 0}
                    onPress={async () => {
                      AddsingleClientHandler();
                    }}
                  >
                    {""}
                    <Image
                      src="images/ClientOfflineimage.svg"
                      width={30}
                    ></Image>
                  </Button>

                  <Button
                    flat
                    auto
                    css={{
                      marginRight: "-$5",
                      marginLeft: "-$5",
                      width: "20px",
                      height: "30px",
                      color: "White",
                      background: "#fff",
                    }}
                    title="Upload Offline Clients"
                    // disabled={clientCreds.length <= 0}
                    onPress={async () => {
                      BulkHoldingHandler("Client");
                    }}
                  >
                    <Image src="images/UploadClient.svg" width={30}></Image>
                  </Button>
                </>
              )}
            </div>
          </Row>{" "}
          {switch_GpCl === "Online" ? (
            <Row justify="center" align="center" style={{ marginTop: "10px" }}>
              <ClientCredsTable
                updateGroupClientsDeletionHandler={
                  updateGroupClientsDeletionHandler
                }
                loginAllClients={loginAllClients}
                isFiltering={isFiltering}
                setIsFiltering={setIsFiltering}
                switch_GpCl={switch_GpCl}
                rowData={rowData}
                setRowData={setRowData}
                activeWebSocketBroker={activeWebSocketBroker}
                setActiveWebSocketBroker={setActiveWebSocketBroker}
                isReadyToWebSocketConnection={isReadyToWebSocketConnection}
                setIsReadyToWebSocketConnection={
                  setIsReadyToWebSocketConnection
                }
              />
            </Row>
          ) : (
            <>
              <Row
                justify="center"
                align="center"
                style={{ marginTop: "10px" }}
              >
                <OfflineClientTable
                  switch_GpCl={switch_GpCl}
                  handleOfflineData={handleOfflineData}
                  offlineRowData={offlineRowData}
                  setOfflineRowData={setOfflineRowData}
                />
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
      <ModalBulkHolding
        setBulkHolding={setBulkHolding}
        BulkHolding={BulkHolding}
        BulkMOdalScreen={BulkMOdalScreen}
        handleDownloadOfflineSampleFile={handleDownloadOfflineSampleFile}
        handleOfflineData={handleOfflineData}
      />
      <AddSingleOfflineClient
        SignleOfflineClient={SignleOfflineClient}
        setSignleOfflineClient={setSignleOfflineClient}
        handleOfflineData={handleOfflineData}
        fileOffline={fileOffline}
      />
    </>
  );
};

export default ClientBase;
