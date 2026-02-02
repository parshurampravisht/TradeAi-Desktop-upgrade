import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import electron from "electron";
import { iiflUrlkey } from "../../../constant/constant";
const ipcRenderer = electron.ipcRenderer || false;
const Store = require("electron-store");
const store = new Store();
import {
  IconTrash,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import {
  Button,
  Checkbox,
  Col,
  Row,
  Text,
  Tooltip,
  Image,
} from "@nextui-org/react";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { toast } from "react-toastify";
import { useGlobalContext } from "../../../context/GlobalContext";
import LiveDataConnectModal from "./component/liveDataConnect";
import FullPageLoader from "../../common/FullPageLoader";
import { LoginStatus } from "../../../constant/constant";
import {
  deleteClientsbyId,
  deleteSingleClient,
  updateClientsbyId,
} from "../../../../services/transactions/transactions.service";

const ClientCredsTable = ({
  updateGroupClientsDeletionHandler,
  loginAllClients,
  activeWebSocketBroker,
  setActiveWebSocketBroker,
  isReadyToWebSocketConnection,
  setIsReadyToWebSocketConnection,
  rowData,
  setRowData,
}) => {
  const {
    clientCreds,
    setClientCreds,
    setGroup_Clients,
    setUser,
    logginClients,
    selectedClientLtp,
    deleteCheckboxClients,
    setDeleteCheckboxClients,
    currentSocketItem,
    setCurrentSocketBroker,
    setCurrentSocketItem,
    liveDataProcess,
    currentSocketBroker,
    liveDataProcessIIFLSMC,
    setIsLiveDataConnected,
    setClientsData,
    liveDataModal,
    setLiveDataModal,
  } = useGlobalContext();
  const gridRef = useRef();
  // const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientLogin, setClientLogin] = useState("");
  const [ClientIDItem, setClientIDItem] = useState("");
  const [livedataClient, setlivedataClient] = useState("");
  const [SocketItemData, setSocketItemData] = useState("");
  const [selectedGridNode, setSelectedGridNode] = useState("");

  var updateIndex = -1;

  //for checking the live data checkbox on first render
  const onFirstDataRendered = useCallback((params) => {
    const nodesToSelect = [];
    gridRef.current.api.forEachNode((node) => {
      if (node.data && node.data["Client ID"] === selectedClientLtp.current) {
        nodesToSelect.push(node);
        node.setDataValue("loginStatus", LoginStatus.WEBSOCKET_CONNECTED);
      }
    });
    // gridRef.current.api.setNodesSelected({
    //   nodes: nodesToSelect,
    //   newValue: true,
    // });
  }, []);

  //for filtering the selectable rows for ltp connection
  const isRowSelectable = useMemo(() => {
    return (params) => {
      // return !!params.data && params.data.Broker === "MOSWAL";
      return true;
    };
  }, []);

  // function closeIIFLSMC() {
  //   if (liveDataProcessIIFLSMC) {
  //     liveDataProcessIIFLSMC.kill();
  //     // liveDataProcessIIFLSMC = null;
  //   }
  // }

  // Function to close the Motilal Oswal WebSocket process
  // function closeMotilalOswal() {
  //   if (liveDataProcess) {
  //     liveDataProcess.kill();
  //     // liveDataProcess = null;
  //   }
  // }

  // if (currentSocketBroker === "MOSWAL") {
  //   setTimeout(() => {
  //     // Close the IIFLSMC WebSocket
  //     // closeIIFLSMC();
  //     // Connect to Motilal Oswal WebSocket
  //     liveDataProcess = cp.fork(
  //       `${electronDrirecctory}\\websocket\\motilal-oswal\\broadcast.js`
  //     );
  //   }, 5000);
  // }
  // if (
  //   currentSocketBroker === "IIFL" ||
  //   currentSocketBroker === "SMC" ||
  //   currentSocketBroker === "FPAISA"
  // ) {
  //   setTimeout(() => {
  //     closeMotilalOswal();
  //     liveDataProcessIIFLSMC = cp.fork(
  //       `${electronDrirecctory}\\websocket\\smc-iifl\\xstmarketdataApi.js`
  //     );
  //   }, 5000);
  // }

  function showhashHelper(data, st, setSt) {
    return (
      <Row justify="space-between">
        <Text css={{ display: "inline", fontSize: "$xs" }}>
          {st ? data : "........"}
        </Text>
        <Tooltip onClick={() => setSt(!st)}>
          {st ? (
            <IconEye
              className="cursor-pointer"
              height={20}
              width={20}
              strokeWidth={1}
              color={"#000"}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <IconEyeOff
              className="cursor-pointer"
              height={20}
              width={20}
              strokeWidth={1}
              color={"#000"}
              style={{ cursor: "pointer" }}
            />
          )}
        </Tooltip>
      </Row>
    );
  }

  //------------password hash--------------------
  function passwordHashSecretKey(params) {
    const secretKey = params.data.secretKey;
    var [st, setSt] = useState(false);
    return showhashHelper(secretKey, st, setSt);
  }

  function passwordHashAPiKey(params) {
    const apiKey = params.data.apiKey;
    var [st, setSt] = useState(false);
    return showhashHelper(apiKey, st, setSt);
  }

  /// ---- totp key handler ---- ///
  function totpKeyHandler(params) {
    const totpKey = params.data.totp;
    var [st, setSt] = useState(false);
    return showhashHelper(totpKey, st, setSt);
  }

  function passwordHandler(params) {
    const password = params.data.password;
    var [st, setSt] = useState(false);
    return showhashHelper(password, st, setSt);
  }

  ///------------delete and update store--------------------
  //function to set client login status
  const setDeletedUpdatedClientStatus = async (
    clientId,
    broker,
    data,
    action
  ) => {
    var clientStatus = await ipcRenderer.invoke(
      "readMemory-ipc",
      "clientStatus"
    );

    if (action == "delete") {
      clientStatus = clientStatus?.filter(
        (clientData) =>
          clientData["name"] !== clientId || clientData["broker"] !== broker
      );
      try {
        const deleteResult = await deleteSingleClient(clientId || broker);
        await updateGroupClientsDeletionHandler([clientId]);
        setClientCreds((prev) => {
          const filterData =
            prev.filter((item) => item["Client ID"] !== clientId) || [];
          setData(filterData);
          return filterData;
        });
      } catch (error) {
        console.log("delete client error", error);
      }
    }

    if (action == "update") {
      const clStatusIdx = clientStatus.findIndex((clientData, index) => {
        return clientData["name"] == clientId && clientData["broker"] == broker;
      });

      if (clStatusIdx != -1) {
        clientStatus[clStatusIdx] = {
          id: clStatusIdx + 1,
          name: data["Client ID"],
          broker: data["Broker"],
          action: false,
          status: "failure",
        };
      }
    }

    setUser(clientStatus);

    var ipcReqBody = {
      field: "clientStatus",
      subField: "All",
      data: clientStatus,
    };
    var result = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
  };

  const deleteEditGroupStore = async (clientId, data, action) => {
    //note: clientId contains old value, data contains updated value

    //reading group from electron store
    var groupData = await ipcRenderer.invoke("readMemory-ipc", "group");
    var groupName = null;

    if (typeof groupData !== "object" || groupData === null) {
      console.error("Error: Invalid group data structure.");
      return null; // or handle the error appropriately
    }

    //client id is not updated
    if (action === "update" && clientId === data["Client ID"]) {
      return groupData;
    }

    //searching group name  for the client which is deleted
    Object.keys(groupData).forEach((group) => {
      if (groupData[group].includes(clientId)) {
        groupName = group;
      }
    });

    //deleting client from the group
    if (groupName) {
      groupData[groupName] = groupData[groupName].filter(
        (client) => client !== clientId
      );
    }

    //client id is updated :> replace client id in it's group
    if (action === "update" && clientId !== data["Client ID"]) {
      groupData[groupName].push(data["Client ID"]);
    }

    //deleting group from electron store

    var ipcReqBody = {
      field: "group",
      subField: "All",
      data: groupData,
    };
    var result2 = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
    return groupData;
  };

  const editContextStoreClient = async (updatedData, action) => {
    // var clientCreds = await ipcRenderer.invoke("readMemory-ipc", "clientCreds"); //for rows

    const clientId = updatedData["Client ID"];
    const broker = updatedData["Broker"];

    if (action === "delete") {
      // // Remove from rows array
      // clientCreds.rows = clientCreds.rows.filter(
      //   (row) => row["Client ID"] !== clientId
      // );

      // // Remove from apiBody
      // if (clientCreds.apiBody[broker]) {
      //   clientCreds.apiBody[broker] = clientCreds.apiBody[broker].filter(
      //     (client) => client.client_code !== clientId
      //   );

      //   // Remove broker key if there are no clients left
      //   if (clientCreds.apiBody[broker].length === 0) {
      //     delete clientCreds.apiBody[broker];
      //   }
      // }

      try {
        const result = await deleteClientsbyId(clientId);
        if (result) {
          toast.success(result.message);
        }
      } catch (error) {
        console.log("delete single client error", error);
      }
    } else if (action === "update") {
      // // /Update rows array
      // const rowIndex = clientCreds.rows.findIndex(
      //   (row) => row["Client ID"] === clientId
      // );
      // if (rowIndex !== -1) {
      //   clientCreds.rows[rowIndex] = updatedData;
      // }
      // // Update apiBody
      // if (clientCreds.apiBody[broker]) {
      //   const apiIndex = clientCreds.apiBody[broker].findIndex(
      //     (client) => client.client_code === clientId
      //   );
      //   if (apiIndex !== -1) {
      //     Object.keys(clientCreds.apiBody[broker][apiIndex]).forEach((key) => {
      //       if (updatedData.hasOwnProperty(key)) {
      //         clientCreds.apiBody[broker][apiIndex][key] = updatedData[key];
      //       }
      //     });
      //   }
      // }

      try {
        const updatedResponse = await updateClientsbyId(clientId, updatedData);
        if (updatedResponse && updatedResponse?.updated_data) {
          setClientCreds((prev) =>
            prev.map((item) =>
              item["Client ID"] === clientId
                ? updatedResponse.updated_data
                : item
            )
          );
        } else {
          toast.error(updatedResponse.message);
        }
      } catch (error) {
        console.log("error in client update", error);
      }
    }

    // //3.calling ipc to save clientCreds into electron store
    // var ipcReqBody = {
    //   field: "clientCreds",
    //   subField: "All",
    //   data: clientCreds,
    // };
    // var result1 = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);

    const groupData = await deleteEditGroupStore(clientId, updatedData, action);
    setGroup_Clients(groupData);

    //5. setting client status for left sider in dashboard
    await setDeletedUpdatedClientStatus(clientId, broker, updatedData, action);
    //6.setting hook to display the data for client creds table
    // if (action !== "delete") {
    // setClientCreds(clientCreds.rows);
    // }

    const clientsDetails = clientCreds.map((item) => ({
      clientId: item["Client ID"] || "",
      clientName: item.ClientName || "",
      email: item.email || "",
      userId: item.userId || "",
    }));

    setClientsData(clientsDetails);

    await loginAllClients();
    setLoading(false);
  };

  const [state, setState] = useState({
    modules: [ClientSideRowModelModule],
    // columnDefs: [
    //   {
    //     headerName: "",
    //     field: "DeleteOne",
    //     floatingFilter: true,
    //     flex: 0.5,
    //     // width: 150,
    //     // editor: "input", //to change input from the table
    //     cellRenderer: (params) => {
    //       return (
    //         <>
    //           <Checkbox onChange={() => handlerDeleteClients(params.data)} />
    //         </>
    //       );
    //     },
    //   },
    //   {
    //     field: "id",
    //     hide: true,
    //   },
    //   {
    //     headerName: "Client ID",
    //     field: "Client ID",
    //     floatingFilter: true,
    //     filter: "agTextColumnFilter",
    //     flex: 1.5,
    //     // width: 150,
    //     // editor: "input", //to change input from the table
    //   },
    //   {
    //     headerName: "Broker",
    //     field: "Broker",
    //     floatingFilter: true,
    //     filter: true,
    //     flex: 1.5,
    //     // width: 150,
    //   },
    //   // {
    //   //   headerName: "n",
    //   //   field: "email",
    //   //   floatingFilter: true,
    //   //   filter: true,
    //   //   flex: 1.5,
    //   //   // width: 150,
    //   // },
    //   {
    //     headerName: "Password",
    //     field: "password",
    //     width: 100,
    //     flex: 1,
    //     cellRenderer: passwordHandler,
    //   },
    //   {
    //     headerName: "API Key",
    //     field: "apiKey",
    //     // width: 120,
    //     flex: 1,
    //     cellRenderer: passwordHashAPiKey,
    //   },
    //   {
    //     headerName: "Secret Key",
    //     field: "secretKey",
    //     // width: 120,
    //     flex: 1,
    //     cellRenderer: passwordHashSecretKey,
    //   },
    //   {
    //     headerName: "TOTP Key",
    //     field: "totp",
    //     // width: 120,
    //     flex: 1,
    //     cellRenderer: totpKeyHandler,
    //   },

    //   {
    //     headerName: "Status",
    //     field: "loginStatus",
    //     cellRenderer: statusCellRenderer,
    //     editable: false,
    //     width: 60,
    //     flex: 1.5,
    //     cellStyle: {
    //       textAlign: "center", // Center horizontally
    //       display: "flex",
    //       alignItems: "center", // Center vertically
    //       justifyContent: "center", // Center horizontally (for flexbox)
    //     },
    //   },
    //   // {
    //   //   headerName: "Live Data",
    //   //   field: "liveData",
    //   //   flex: 1,
    //   //   editable: false,
    //   //   showDisabledCheckboxes: true,
    //   //   cellRenderer: (params) => {
    //   //     var demoChecked = localStorage.getItem("myClientLive");
    //   //     const isChecked = params.data["Client ID"] == demoChecked;
    //   //     return (
    //   //       <>
    //   //         <Checkbox
    //   //           isSelected={isChecked}
    //   //           onChange={() => handleWebsocketChange(params)}
    //   //         />
    //   //       </>
    //   //     );
    //   //   },
    //   // },

    //   {
    //     headerName: "Actions",
    //     field: "Actions",
    //     cellRenderer: actionCellRenderer,
    //     editable: false,
    //     colId: "action",
    //     // width: 100,
    //     flex: 1,
    //   },
    // ],
    defaultColDef: { sortable: true, editable: true },
    rowData: null,
  });

  const MemoizedStatusCellRenderer = useMemo(
    () => statusCellRenderer,
    [activeWebSocketBroker]
  );

  const MemoizedActionCellRenderer = useMemo(
    () => actionCellRenderer,
    [activeWebSocketBroker]
  );

  const MemoizedCheckBoxCellRenderer = useMemo(
    () => checkBoxCellRenderer,
    [deleteCheckboxClients]
  );

  const columnDefs = [
    {
      headerName: "",
      field: "DeleteOne",
      floatingFilter: true,
      flex: 0.5,
      width: 100,
      // editor: "input", //to change input from the table
      cellRenderer: MemoizedCheckBoxCellRenderer,
      cellClass: "first-column-cell-client-login",
    },
    // {
    //   field: "id",
    //   hide: true,
    // },
    {
      headerName: "Client ID",
      field: "Client ID",
      floatingFilter: true,
      filter: "agTextColumnFilter",
      flex: 1.5,
      // width: 150,
      // editor: "input", //to change input from the table
    },
    {
      headerName: "Broker",
      field: "Broker",
      floatingFilter: true,
      filter: true,
      flex: 1.5,
      // width: 150,
    },
    // {
    //   headerName: "n",
    //   field: "email",
    //   floatingFilter: true,
    //   filter: true,
    //   flex: 1.5,
    //   // width: 150,
    // },
    {
      headerName: "Password",
      field: "password",
      width: 100,
      flex: 1,
      cellRenderer: passwordHandler,
    },
    {
      headerName: "API Key",
      field: "apiKey",
      // width: 120,
      flex: 1,
      cellRenderer: passwordHashAPiKey,
    },
    {
      headerName: "Secret Key",
      field: "secretKey",
      // width: 120,
      flex: 1,
      cellRenderer: passwordHashSecretKey,
    },
    {
      headerName: "TOTP Key",
      field: "totp",
      // width: 120,
      flex: 1,
      cellRenderer: totpKeyHandler,
    },
    {
      headerName: "Status",
      field: "loginStatus",
      cellRenderer: MemoizedStatusCellRenderer,
      editable: false,
      width: 30,
      flex: 1.5,
      cellStyle: {
        textAlign: "center", // Center horizontally
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally (for flexbox)
      },
    },
    // {
    //   headerName: "Live Data",
    //   field: "liveData",
    //   flex: 1,
    //   editable: false,
    //   showDisabledCheckboxes: true,
    //   cellRenderer: (params) => {
    //     var demoChecked = localStorage.getItem("myClientLive");
    //     const isChecked = params.data["Client ID"] == demoChecked;
    //     return (
    //       <>
    //         <Checkbox
    //           isSelected={isChecked}
    //           onChange={() => handleWebsocketChange(params)}
    //         />
    //       </>
    //     );
    //   },
    // },

    {
      headerName: "Actions",
      field: "Actions",
      cellRenderer: MemoizedActionCellRenderer,
      editable: false,
      colId: "action",
      // width: 100,
      flex: 1,
    },
    {
      headerName: "IP Address", //--- temporary commented this, coming soon ---//
      field: "proxy_ip",
      floatingFilter: true,
      filter: true,
      flex: 1.5,
      width: 50,
      cellRenderer: (params) => {
        return <span> {params.data.proxy_ip}</span>;
      },
      // width: 150,
    },
  ];

  useEffect(() => {
    setSocketItemData(currentSocketItem);
    // Force a re-render if necessary
    // setState((prevState) => ({
    //   ...prevState,
    //   columnDefs: [...prevState.columnDefs],
    // }));
    setlivedataClient(ClientIDItem);
  }, [currentSocketItem, rowData, ClientIDItem]);

  function actionCellRenderer(params) {
    const [showDelConfirm, setShowDelConfirm] = useState(false);
    let actionbuttons = null;

    let editingCells = params.api.getEditingCells();
    // checks if the rowIndex matches in at least one of the editing cells
    let isCurrentRowEditing = editingCells.some((cell) => {
      return cell.rowIndex === params.node.rowIndex;
    });

    if (isCurrentRowEditing | showDelConfirm) {
      actionbuttons = (
        <>
          <Row justify="center">
            {/* <button data-action="update"> */}
            <IconCheck
              style={{ cursor: "pointer" }}
              type="button"
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={!showDelConfirm ? "update" : "delete"}
            />
            {/* </button> */}
            <IconX
              style={{ cursor: "pointer" }}
              type="button"
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={!showDelConfirm ? "cancel" : "dont-delete"}
              onClick={() => setShowDelConfirm(false)}
            />
          </Row>
        </>
      );
    } else {
      actionbuttons = (
        <>
          <Row justify="center">
            {/* <button> */}
            <IconPencil
              style={{ cursor: "pointer" }}
              type="button"
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action="edit"
            />
            {/* </button> */}

            {/* <button data-action="delete"> */}
            <IconTrash
              style={{ cursor: "pointer" }}
              height={20}
              width={20}
              color={"#000"}
              strokeWidth={1}
              data-action={showDelConfirm ? "delete" : "confirm-delete"}
              onClick={() => setShowDelConfirm(true)}
            />
            {/* </button> */}
          </Row>
        </>
      );
    }

    return actionbuttons;
  }

  const [data, setData] = useState(clientCreds);

  //for new data to re render
  useEffect(() => {
    setData(clientCreds);
  }, [clientCreds]);

  const getIndex = (data) => {
    const clientId = data["Client ID"];
    const broker = data["Broker"];
    const idx = clientCreds.findIndex(
      (clientItem) =>
        clientItem["Client ID"] == clientId && clientItem["Broker"] == broker
    );
    if (idx != -1) {
      updateIndex = idx;
    }
  };

  const handleToGetWebsoketConnectionStatus = (isWsConnected) => {
    if (window.gridApi && isWsConnected === "Success") {
      window.gridApi.forEachNode((node) => {
        node.setDataValue(
          "loginStatus",
          node.data["loginStatus"] == LoginStatus.LOGGED_OUT
            ? LoginStatus.LOGGED_OUT
            : LoginStatus.LOGGED_IN
        );
      });
      if (gridRef.current) {
        const rowNode = gridRef?.current?.api?.getRowNode(selectedGridNode);
        if (rowNode) {
          rowNode?.setDataValue("loginStatus", LoginStatus.WEBSOCKET_CONNECTED);
        }
      }
    }
  };

  const alignDob = (dobStr) => {
    dobStr = String(dobStr);
    var newDobStr = "";
    for (let i = 0; i < dobStr.length; i++) {
      if (i == 2 || i == 4) {
        newDobStr += "/" + dobStr[i];
      } else {
        newDobStr += dobStr[i];
      }
    }

    return newDobStr;
  };

  const handleConnectLiveData = async () => {
    const settings = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totp: activeWebSocketBroker["totp"],
      }),
    };

    try {
      const reqData = {};

      if (activeWebSocketBroker["Broker"] === "MOSWAL") {
        const fetchResponse = await fetch(
          "http://127.0.0.1:6001/api/prod/client/totp/",
          settings
        );
        const data = await fetchResponse.json();
        reqData["ApiKey"] = activeWebSocketBroker["apiKey"];
        reqData["ClientCode"] = activeWebSocketBroker["Client ID"];
        reqData["Password"] = activeWebSocketBroker["password"];
        reqData["PanOrDOB"] = alignDob(activeWebSocketBroker["dob"]);
        reqData["totp"] = data.data;
        liveDataProcess &&
          liveDataProcess?.send({
            action: "initiate",
            data: reqData,
          });

        setCurrentSocketBroker("MOSWAL");
        setCurrentSocketItem(activeWebSocketBroker["Client ID"]);
        localStorage.setItem(
          "myClientLive",
          activeWebSocketBroker["Client ID"]
        );
      }
      setIsLiveDataConnected(true);
      await ipcRenderer.invoke("set-liveData-props", {
        broker: activeWebSocketBroker["Broker"],
        data: reqData,
        clientId: activeWebSocketBroker["Client ID"],
      }); //store details of last connected live data

      const updateActiveWebSocketBroker = {
        ...activeWebSocketBroker,
        loginStatus:
          LoginStatus.WEBSOCKET_CONNECTED ??
          activeWebSocketBroker["loginStatus"],
      };
      const ipcReqBody = {
        field: "activeWebsocketBroker",
        subField: "All",
        data: updateActiveWebSocketBroker,
      };
      await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
      setActiveWebSocketBroker(updateActiveWebSocketBroker);

      setIsReadyToWebSocketConnection(false);
      console.log("moswal data", data);
      return data;
    } catch (e) {
      console.log("error in socket connection", e);
      return e;
    }
  };

  const handleConnectIIFLLiveData = async () => {
    try {
      const BrokerData = {
        ApiKey: activeWebSocketBroker["marketApiKey"],
        secretKey: activeWebSocketBroker["marketSecretKey"],
        url: iiflUrlkey,
      };

      if (["IIFL", "SMC", "FPAISA"].includes(activeWebSocketBroker["Broker"])) {
        liveDataProcessIIFLSMC &&
          liveDataProcessIIFLSMC?.send({
            action: "initiate",
            data: BrokerData,
          });
        setCurrentSocketBroker("IIFL");
        setCurrentSocketItem(activeWebSocketBroker["Client ID"]);
        localStorage.setItem(
          "myClientLive",
          activeWebSocketBroker["Client ID"]
        );
      }
      // props?.setLiveDataModal(false);
      setIsLiveDataConnected(true);

      await ipcRenderer.invoke("set-liveData-props", {
        broker: activeWebSocketBroker["Broker"],
        data: BrokerData,
        clientId: activeWebSocketBroker["Client ID"],
      }); //store details of last connected live data

      const updateActiveWebSocketBroker = {
        ...activeWebSocketBroker,
        loginStatus:
          LoginStatus.WEBSOCKET_CONNECTED ??
          activeWebSocketBroker["loginStatus"],
      };
      const ipcReqBody = {
        field: "activeWebsocketBroker",
        subField: "All",
        data: updateActiveWebSocketBroker,
      };
      await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
      setActiveWebSocketBroker(updateActiveWebSocketBroker);
      setIsReadyToWebSocketConnection(false);
      // return data;
    } catch (e) {
      console.log("error in socket connection", e);
      return e;
    }
  };

  // function handleWebsocketChange(params) {
  //   setClientIDItem(params?.data["Client ID"]);
  //   if (!params || !params.data) {
  //     return;
  //   }
  //   const newClientID = params?.data["Client ID"];
  //   //if (!newClientID || newClientID === selectedClientLtp.current) return;
  //   setClientIDItem(newClientID);
  //   setCurrentSocketItem(newClientID);
  //   setLiveDataModal(true);
  //   setRowData(params.data);
  //   setClientLogin(newClientID);
  //   const id = params?.data["id"];
  //   setSelectedGridNode(id);
  // }

  async function handleWebsocketChange() {
    const newClientID = activeWebSocketBroker["Client ID"];
    setClientIDItem(newClientID);
    setCurrentSocketItem(newClientID);
    // setLiveDataModal(true);
    // setRowData(activeWebSocketBrokerData);
    setClientLogin(newClientID);
    const id = activeWebSocketBroker["id"];
    setSelectedGridNode(id);
    if (["IIFL", "SMC", "FPAISA"].includes(activeWebSocketBroker["Broker"])) {
      await handleConnectIIFLLiveData();
    } else {
      await handleConnectLiveData();
    }
  }

  useEffect(() => {
    if (!isReadyToWebSocketConnection) return;

    handleWebsocketChange();
  }, [isReadyToWebSocketConnection]);

  function statusCellRenderer(params) {
    const loginStatus = params.data.loginStatus;
    return (
      <>
        {(loginStatus == LoginStatus.LOGGED_IN && logginClients.current) ||
        (loginStatus == LoginStatus.WEBSOCKET_CONNECTED &&
          logginClients.current) ? (
          <>
            <Image
              src={`images/status/${
                activeWebSocketBroker["Client ID"] ===
                  params.data["Client ID"] &&
                activeWebSocketBroker.loginStatus ===
                  LoginStatus.WEBSOCKET_CONNECTED
                  ? "green-circle-tick"
                  : "green-circle"
                // params.value == LoginStatus.LOGGED_IN
                //   ? "green-circle"
                //   : "green-circle-tick"
              }.png`}
              width={15}
              // style={{ cursor: "pointer" }}
              // onClick={() => {
              //   handleWebsocketChange(params);
              // }}
              className={
                activeWebSocketBroker["Client ID"] ===
                  params.data["Client ID"] &&
                activeWebSocketBroker.loginStatus ===
                  LoginStatus.WEBSOCKET_CONNECTED
                  ? "greenWebsocket"
                  : "clientStatus"
                // params.value == LoginStatus.LOGGED_IN
                //   ? "clientStatus"
                //   : "greenWebsocket"
              }
            ></Image>
          </>
        ) : loginStatus === true ? (
          <span title={params.data?.description}>
            <Image
              src="images/status/green-circle.png"
              width={15}
              className="clientStatus"
            />
          </span>
        ) : (
          <>
            <span title={params.data?.description}>
              <Image
                src="images/status/red-circle.png"
                width={15}
                className="clientStatus"
              ></Image>
            </span>
          </>
        )}
      </>
    );
  }

  function checkBoxCellRenderer(params) {
    const handlerDeleteClients = (clientData) => {
      setDeleteCheckboxClients((prevData) => {
        const exists = prevData.some(
          (item) => item["Client ID"] === clientData["Client ID"]
        );

        return exists
          ? prevData.filter(
              (item) => item["Client ID"] !== clientData["Client ID"]
            )
          : [...prevData, clientData];
      });
    };

    return (
      <>
        <Checkbox
          isSelected={deleteCheckboxClients
            .map((item) => item["Client ID"])
            .includes(params.data["Client ID"])}
          onChange={() => handlerDeleteClients(params.data)}
        />
      </>
    );
  }

  async function onCellClicked(params) {
    gridRef.current?.api?.showLoadingOverlay();
    setLoading(true);
    // Handle click event for action cells

    //
    if (
      params.column.colId === "action" &&
      params.event.target.dataset.action
    ) {
      let action = params.event.target.dataset.action;

      if (action === "edit") {
        //index to update
        getIndex(params.data);
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex,
          // gets the first columnKey
          colKey: params.columnApi.getDisplayedCenterColumns()[0].colId,
        });
      }

      if (action === "delete") {
        if (params.data["Client ID"] === activeWebSocketBroker["Client ID"])
          store.delete("activeWebsocketBroker");
        await editContextStoreClient(params.data, "delete");
        // await editDeleteContextStoreClient(params.data, "delete");
        params.api.applyTransaction({
          remove: [params.node.data],
        });
        toast.success("User is deleted!");
      }

      if (action === "update") {
        params.api.stopEditing(false);
        await editContextStoreClient(params.data, "update");

        toast.success("User is Updated!");
      }

      if (action === "cancel") {
        params.api.stopEditing(true);
      }
    }
    setLoading(false);
    gridRef.current?.api?.hideOverlay();
  }

  function onRowEditingStarted(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }
  function onRowEditingStopped(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }

  const getRowId = useCallback((params) => {
    return params?.data?.id;
  }, []);

  return (
    <>
      <LiveDataConnectModal
        liveDataModal={liveDataModal}
        setLiveDataModal={setLiveDataModal}
        rowData={rowData}
        setRowData={setRowData}
        onConnected={handleToGetWebsoketConnectionStatus}
        handleConnectLiveData={handleConnectLiveData}
        handleConnectIIFLLiveData={handleConnectIIFLLiveData}
        activeWebSocketBroker={activeWebSocketBroker}
      />
      <Col>
        <div
          className="ag-theme-balham"
          style={{ height: 350, width: "100%", marginBottom: "10px" }}
        >
          <FullPageLoader show={loading} />
          <AgGridReact
            ref={gridRef}
            onRowEditingStopped={onRowEditingStopped}
            onRowEditingStarted={onRowEditingStarted}
            onCellClicked={onCellClicked}
            editType="fullRow"
            suppressClickEdit={true}
            modules={state.modules}
            columnDefs={columnDefs}
            // columnDefs={state.columnDefs}
            floatingFilter={true}
            defaultColDef={state.defaultColDef}
            sizeColumnsToFit={true}
            rowData={data}
            // isRowSelectable={isRowSelectable}
            // onRowSelected={handleWebsocketChange}
            onFirstDataRendered={onFirstDataRendered}
            overlayLoadingTemplate={"<div></div>"}
            onGridReady={(event) => {
              // Store the grid API for later use
              window.gridApi = event.api;
            }}
            getRowId={getRowId}
          />
        </div>
      </Col>
    </>
  );
};

export default ClientCredsTable;
