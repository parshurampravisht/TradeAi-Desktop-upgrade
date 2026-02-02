import { Global } from "@emotion/react";
import { useCallback, useReducer } from "react";
// import { getTabledata } from "../APIS/TTapis";
import {
  ExchangeFullName,
  LoginStatus,
  fullExchangeType,
  indexes,
  subscribe_exchange,
} from "../constant/constant";
import {
  AllClientData,
  BasketInstance,
  clientBrokerConnection,
  clientInvestedMarginData,
  getAllWatchlistByUser,
  getBasketDetails,
  getBaskets,
  getClientData,
  getLTPService,
  GetOfflineClientAll,
  getOptionChainExpiry,
  getUploadedAllClients,
  getWatchistDetailsByID,
  reconnectAllClients,
} from "../../services/transactions/transactions.service";
var liveDataProcess = null;
var liveDataProcessIIFLSMC = null;
var liveDataProvider = null;
var prevCloseProcess = null;
var niftyPrevClosePrice = null;
var bankNiftyPrevClosePrice = null;
var sensexPrevClosePrice = null;
var crudeOilPrevClosePrice = null;
var goldPrevClosePrice = null;
var silverPrevClosePrice = null;
var electronDrirecctory = null;
var cp = require("child_process");

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { clientsState } from "../../main/logic/envLogic";

//creating global context for all the pages
const GlobalContext = createContext({});

//providing the global context to all the pages
export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalContextprovider = ({ children }) => {
  //for admin page! contains clients credentials and clolumns which is displayed in the client table
  const [clientCreds, setClientCreds] = useState([]);
  const [clientCredsAllData, setClientCredsAllData] = useState([]);
  const selectedClientLtp = useRef("");
  //for Login of users
  const [loginData, setLoginData] = useState({});
  const [symbolDropdown, setSymbolDropdown] = useState({});
  //for signup of new user
  const [SignUpData, setSignUpData] = useState({});
  //loggin status for clients in brokers
  const logginClients = useRef(false);
  //for broker health
  const [brokersHealth, setBrokersHealth] = useState({});
  const [clientIds, setClientIds] = useState([]);
  const [DataClientStatus, setDataClientStatus] = useState([]);

  //for left-sider table
  const [user, setUser] = useState([]);
  //for left sider, for filtering the clients or selected clients
  const [isLiveDataConnected, setIsLiveDataConnected] = useState(false);
  const [currentSocketBroker, setCurrentSocketBroker] = useState(null);
  const [offlineRowData, setOfflineRowData] = useState([]);
  const [gridRefreshCounter, setGridRefreshCounter] = useState(0);
  const [liveData, setLiveData] = useState({});
  const [loginClientUserData, setLoginClientUserData] = useState({});
  const [fnoBasketData, setFnoBasketData] = useState([]);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [fnoBasketRowData, setFnoBasketRowData] = useState([]);
  const [recordsLimit, setRecordsLimit] = useState(() => {
    if (typeof window !== "undefined") {
      return +localStorage.getItem("records_limit") || 30;
    }
    return 30;
  });
  const [subscribeExchangeFlag, setSubscribeExchangeFlag] = useState(false);
  const [liveDataModal, setLiveDataModal] = useState(false);

  //initial state for reducer
  const initialState = [];
  const [currentMonthCrudeOilScripCode, setCurrentMonthCrudeOilScripCode] =
    useState(null);
  //logic to filter clients on the table
  const reducer = (state, action) => {
    return action;
  };

  const [cl, fixClient] = useReducer(reducer, initialState);
  //for right sider and watchlist!
  const [loadSymbols, setLoadSymbols] = useState([
    "NIFTY",
    "BANKNIFTY",
    "FINNIFTY",
    "MIDCPNIFTY",
    "SENSEX",
    "CRUDEOIL",
    "GOLD",
    "SILVER",
  ]); //list of symbols

  const [refreshToken, setRefreshToken] = useState(Math.random()); // for refresh every interval for ltps
  const [refreshTokenTable, setRefreshTokenTable] = useState(Math.random()); // for refresh every interval for ltps
  const [qty, setQty] = useState(0);
  const watchlistSymbols = useRef({}); //keeps track of symbols with respect to their watch list
  const [selectedWatchlist, setSelectedWatchlist] = useState(
    new Set(["empty"]) //current watchlist --> ayush dev
  ); //state for dropdown button

  const [selectedCurrentWatchlist, setSelectedCurrentWatchlist] =
    useState(null);
  const [shares, setshares] = useState(); //contains all the data for the watchlist

  //to handle rerendering due to flow of the shares
  const flowLtpShares = useRef(true);
  const gridRef = useRef();
  const fullGridRef = useRef(null);

  //---------
  const [reqShares, setReqShares] = useState({}); //to show watchlist
  //watch list categories -> ayush dev
  const [watchlists, setWatchlists] = useState([]); //state to add watchlist name to the array for dropdown
  const [watchlistMasterData, setWatchlistMasterData] = useState([]);
  const [selectedWatchlistSymbolData, setSelectedWatchlistSymbolData] =
    useState([]);

  const watchlistSelectedValue = useMemo(
    () => Array.from(selectedWatchlist).join(", ").replaceAll("_", " "),
    [selectedWatchlist]
  ); //persists selected watchlist

  //to switch between admin components
  const [adminComponent, setAdminComponent] = useState("clients");
  const [clientData, setClientData] = useState("");
  const [equityBasketType, setEquityBasketType] = useState("BUY");
  const [holdingsData, setHoldingsData] = useState([]);

  //place order modal

  //to switch b/w groups and clients
  const [switch_GpCl, setswitch_GpCl] = useState("client");
  //to switch b/w OPT and FUT
  const [switch_Options, setSwitch_Options] = useState("OPT");

  const [selectedSymbol, setSelectedSymbol] = useState(new Set(["Symbol"]));
  const [cashSymbol, setCashSymbol] = useState({});

  //memo for selected symbol
  const selectedValueSymbol = useMemo(
    () => Array.from(selectedSymbol).join(", ").replaceAll("_", " "),
    [selectedSymbol]
  );

  const [stepOrderVisible, setStepOrderVisible] = useState(false); //for step order modal
  const [placeOrderVisible, setPlaceOrderVisible] = useState(false); //state for buy sell modal

  const [LTPData, setLTPData] = useState("");

  const [basketData, setbasketData] = useState("");

  const [addToCart, setAddToCart] = useState([]); //we always should same data type to escape error

  const [initialArray, setInitialArray] = useState([]);
  const [InputWebhook, setInputWebhook] = useState([]);
  const [groupInputWebhook, setGroupInputWebhook] = useState([]);
  const [groupClientsData, setGroupClientsData] = useState([]);
  const [webhookGroupDefaultQuantity, setWebhookGroupDefaultQuantity] =
    useState(1);

  const [deleteCheckboxClients, setDeleteCheckboxClients] = useState([]);
  const [currentSocketItem, setCurrentSocketItem] = useState(null);
  const [tableDataItem, setTabledataItem] = useState("");
  const [InstanceData, setInstanceData] = useState([]);

  ///-------useState for select all and bulk square off order in holdings and net positions -----///
  const [
    selectedCheckboxSquareOffHoldings,
    setSelectedCheckboxSquareOffHoldings,
  ] = useState([]);
  const [
    selectedCheckboxSquareOffNetPositions,
    setSelectedCheckboxSquareOffNetPositions,
  ] = useState([]);
  const [holdingsBulkSquareOff, setHoldingsBulkSquareOff] = useState([]);
  const [cloneHoldingsBulkSquareOff, setCloneHoldingsBulkSquareOff] = useState([]);
  const [holdingsFilteredbody, setHoldingsFilteredbody] = useState([]);
  const [cloneHoldingsFilteredbody, setCloneHoldingsFilteredbody] = useState([]);
  const [netPositionsBulkSquareOff, setNetPositionsBulkSquareOff] = useState(
    []
  );
  const [cloneNetPositionsBulkSquareOff, setCloneNetPositionsBulkSquareOff] =
    useState([]);
  const [modifyOrderData, setModifyOrderData] = useState([]);
  const [cancelOrderData, setCancelOrderData] = useState([]);
  const [holdingsSelectAll, setHoldingsSelectAll] = useState(false);
  const [netPositionsSelectAll, setNetPositionsSelectAll] = useState(false);
  const [equityQty, setEquityQty] = useState();
  const [isIndexesSubscribed, setIsIndexesSubscribed] = useState(false);
  const [exchangeDetails, setExchangeDetails] = useState([]);

  const symbolNames = useRef([
    "INFY",
    "TCS",
    "HINDALCO",
    "CIPLA",
    "ONGC",
    "BHARTIARTL",
    "SONY",
    "ASIANPAINT",
    "AXISBANK",
    "HDFCBANK",
  ]);
  const allSymbols = useRef([]);
  const symbolNamesNSE = useRef([]);
  const symbolNamesBSE = useRef([]);
  const symbolNamesOptions = useRef([]);
  const symbolNamesFutures = useRef([]);
  const StrikeRateDropDown = useRef([]);
  const ExpiryDropdown = useRef([]);
  const optionIndexesDropdown = useRef([]);
  const optionSymbolsDropdown = useRef([]);
  //to store single ltp value
  const [singleLtp, setSingleLtp] = useState(null);

  //listed clients and selected clients from multiselect
  const clients = useRef({
    data: {},
    clients: [],
    selectedClients: [],
  });
  //apiBody to place order
  const apiBody = useRef({
    BuySell: "B",
    sym: null,
    disclose_qty: null,
    price: 0,
    intraday: false,
    sl_price: 0,
    exch: null,
    LotSize: null,
    Scripcode: null,
    exch_id: null,
    clients: [],
    SelectValue: {},
  });

  //to show input list for placing order : clients manual entry from multiselect
  const [clientInputList, setClientInputList] = useState(null);
  //place order groups

  //storing stocks symbol data
  const [groupInputList, setGroupInputList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(new Set(["Groups"]));

  const selectedValueGroup = useMemo(
    () => Array.from(selectedGroup).join(", ").replaceAll("_", " "),
    [selectedGroup]
  );

  //for finone and tradetez
  const [checked, setChecked] = useState("TradeTez");
  const exchangeScrpCode = [];

  const [primaryNav, setPrimaryNav] = useState([
    {
      name: "Admin",
      path: "/admin",
      icon: "admin.svg",
      isVisible: true,
    },
    {
      name: "Dashboard",
      path: "/equity",
      icon: "dashboard.png",
      isVisible: true,
    },
    {
      name: "Logout",
      path: "/home",
      icon: "logout.png",
      isVisible: false,
    },
  ]);

  //contains details about groups
  const [group_Clients, setGroup_Clients] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [gridSize, setGridSize] = useState({
    height: "68vh",
    width: "auto",
    overflowX: "auto",
  });
  const [openModelFull, setopenModelFull] = useState(false);

  const [currentState, setCurrentState] = useState("");

  const [openModelPreview, setopenModelPreview] = useState(true);
  const [ClientBrokerData1, setClientBrokerData1] = useState("");

  const [liveStoreData, setliveStoreData] = useState("");
  const [size, setSize] = useState("md");
  const [ClientDataValue, setClientDataValue] = useState("");
  const [tradeExcelFile, setTradeExcelFile] = useState(null);
  const [excelOrderItems, setExcelOrderItems] = useState([]);
  const [eventId, setEventId] = useState("")
  // const [isUploadTradeExcel, setIsUploadTradeExcel] = useState(true);
  // eg: {
  //   'g1': ['c1', 'c2', 'c3'],
  //   'g2':['c4','c5','c6']
  // }
  //adding clients from groups: group1 contains nidhi,ramesh

  //state variables for terminal
  const currentCommand = useRef("");
  const commandEntries = useRef([]);
  //variable to find out for rendere if prod or dev is running
  const envData = useRef({});

  const resetClientCheckboxHandler = () => {
    if (selectedCheckboxSquareOffHoldings.length)
      setSelectedCheckboxSquareOffHoldings([]);

    if (selectedCheckboxSquareOffNetPositions.length)
      setSelectedCheckboxSquareOffNetPositions([]);

    if (holdingsBulkSquareOff.length) setHoldingsBulkSquareOff([]);
    if (netPositionsBulkSquareOff.length) setNetPositionsBulkSquareOff([]);
    if (cancelOrderData.length) setCancelOrderData([]);
    if (modifyOrderData.length) setModifyOrderData([]); //
  };

  const addWebHooksGroupsClients = () => {
    const tempList = [];
    const defaultQuantity = [];
    group_Clients[selectedValueGroup].forEach((item, index) => {
      const clData = clients.current["data"][item];

      defaultQuantity.push(webhookGroupDefaultQuantity);

      const matchedObj = clientsData.find(
        (item) => item.clientId === clData.ClientId
      );

      const tableFormat = {
        value: clData?.ClientId,
        clientName: matchedObj ? matchedObj.clientName : "-",
        label: `${matchedObj && matchedObj.clientName
          ? `${clData?.ClientId} (${matchedObj?.clientName})`
          : `${clData?.ClientId}`
          }`,
        client_id: clData?.ClientId,
        status: "initiated",
      };
      tempList.push(tableFormat);
    });

    setGroupInputWebhook(defaultQuantity);
    setGroupClientsData(tempList);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        setRecordsLimit(+localStorage.getItem("records_limit") || 30);
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  const addClients = () => {
    const tempList = [];
    group_Clients[selectedValueGroup].forEach((item, index) => {
      const clData = clients.current["data"][item];
      tempList.push(clData);
    });

    setGroupInputList(tempList || []);
  };

  const addClientsOptions = () => {
    const tempList = [];
    group_Clients[selectedValueGroup].forEach((item, index) => {
      const clData = clients.current["data"][item];
      tempList.push({ ...clData, Quantity: apiBody.current.qty });
    });

    setGroupInputList(tempList || []);
  };

  useEffect(() => {
    window.addEventListener("online", () => {
      window.localStorage.setItem("IsOnline", "YES");
    });
    window.addEventListener("offline", () => {
      window.localStorage.setItem("IsOnline", "NO");
    });
  });

  const handleResize = () => {
    if (typeof window !== "undefined") {
      setGridSize({
        height: `${window.innerHeight}px`,
        width: `${window.innerWidth}px`,
      });
      if (gridRef.current) {
        gridRef.current.api.sizeColumnsToFit();
      }
    }
  };

  const resetSelectAllHandler = () => {
    setSelectedCheckboxSquareOffHoldings([]);
    setSelectedCheckboxSquareOffNetPositions([]);
    setHoldingsBulkSquareOff([]);
    setCloneHoldingsBulkSquareOff([]);
    setNetPositionsBulkSquareOff([]);
    setCloneNetPositionsBulkSquareOff([]);
    setHoldingsSelectAll(false);
    setNetPositionsSelectAll(false);
  };

  useEffect(() => {
    const resizeListener = () => {
      if (typeof window !== "undefined") {
        setGridSize({
          height: `${window.innerHeight}px`,
          width: `${window.innerWidth}px`,
        });
        if (gridRef.current) {
          gridRef.current.api.sizeColumnsToFit();
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", resizeListener);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", resizeListener);
      }
    };
  }, []);

  const getAllClientItem = async () => {
    try {
      const ClientItemdata = await AllClientData();
      const Client_Data =
        ClientItemdata?.data.length > 0
          ? ClientItemdata.data.map((element) => element.client_code)
          : "";
      setClientDataValue(Client_Data);
    } catch (error) {
      console.log("error in get login users", error);
    }
    // return Client_Data;
  };

  useEffect(() => {
    (async () => {
      getAllClientItem();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!Object.keys(loginData).length) return;

        const clientDataResult = await getClientData();
        setLoginClientUserData(clientDataResult.data);
      } catch (error) {
        console.log("clientdataResult error", error);
      }
    })();
  }, [loginData]);

  async function limitOrderScheduler() {
    try {
      const FnoBasketResult = await getBaskets("futureAndOptions");
      if (FnoBasketResult.length) {
        const filterBasket = FnoBasketResult.filter(
          (item) => item.status === "pending" && item?.is_spread_limit_set
        );
        const updatedBasket = await Promise.all(
          filterBasket.map(async (item) => {
            try {
              const res = await getBasketDetails(item.id);
              if (res && res?.data && res?.data?.basket_stock?.length) {
                return { ...item, basket_stock: res.data.basket_stock };
              }
            } catch (error) {
              console.error(
                `Error fetching details for basket ID ${item.id}:`,
                error
              );
            }
            return item;
          })
        );

        setFnoBasketData(updatedBasket);
        localStorage.setItem("fnoBasket_data", updatedBasket);
      }
    } catch (error) {
      console.log("fno basket scheduler error", error);
    }
  }

  //taking data from electron store and initializing it
  useEffect(async () => {
    // const data = await ipcRenderer.invoke("readMemory-ipc", "All");

    if (!Object.keys(loginData).length) return;

    const data = window?.electronAPI && window.electronAPI?.readMemory
      ? await window.electronAPI?.readMemory("all")
      : {};

    electronDrirecctory = data.electronDir;
    if (data.watchlist) {
      setSelectedWatchlist(new Set([data.watchlist.currentWatchlist]));
      setLoadSymbols(data.watchlist.symbols);
      watchlistSymbols.current = data.watchlist.watchlistAndSymbols;
      setWatchlists(Object.keys(watchlistSymbols.current));
    }
    if (data.clientCredentials) {
      // const colnKeys = data?.clientCredentials?.columns?.map((item, index) => ({
      //   name: item,
      //   uid: item,
      // }));
      // const clientsDetails = data?.clientCredentials?.rows.map((item) => ({
      //   clientId: item["Client ID"] || "",
      //   clientName: item.ClientName || "",
      //   email: item.email || "",
      //   userId: item.userId || "",
      // }));
      // setClientsData(clientsDetails || []);
      // setClientCreds(data.clientCredentials.rows);
      // connectToLastClients({ clientCreds: data?.clientCredentials?.rows });
      // setTimeout(() => {
      //   console.log("setTimeout is run");
      //   //code to execute after 3 sec as this is being over written by cli.exe command when app is initiated
      //   // connectToLastClients({ clientCreds: data?.clientCredentials?.rows });
      // }, 3000);
    }

    if (data.group) {
      setGroup_Clients(data.group);
    }
    if (data.clientStatus) {
      const ids = data?.clientStatus?.map((element) => element.name);
      setClientIds(ids);
      setUser(data.clientStatus);
      setTabledataItem(data.clientStatus);
    }

    optionIndexesDropdown.current = indexes; //

    if (data.symbolDropdown) {
      setSymbolDropdown(data.symbolDropdown);
      allSymbols.current = [
        ...data.symbolDropdown.NSE,
        ...data.symbolDropdown.BSE,
      ].sort((a, b) => {
        const nameA = a.value.toUpperCase();
        const nameB = b.value.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
      symbolNamesNSE.current = data.symbolDropdown.NSE;
      symbolNamesBSE.current = data.symbolDropdown.BSE;
      symbolNamesOptions.current = data.symbolDropdown.OptionsList;
      symbolNamesFutures.current = data.symbolDropdown.FuturesList;
      StrikeRateDropDown.current = data.symbolDropdown.StrikeRateDropDown;

      ExpiryDropdown.current = data.symbolDropdown.ExpiryDropdown;
      optionSymbolsDropdown.current = data.symbolDropdown.optionSymbolsDropdown;
      const symbolList = [];
      symbolNamesBSE.current.forEach((item) => symbolList.push(item.label));
      symbolNames.current = symbolList; //for multiselect dropdown for watchlist
    }

    envData.current["envType"] = data.envType;

    prevCloseProcess = cp.fork(
      `${data.electronDir}\\websocket\\yahoo-finance\\yahoo-finance.js`
    );
    liveDataProcess = cp.fork(
      `${data.electronDir}\\websocket\\motilal-oswal\\broadcast.js`
    );
    liveDataProcessIIFLSMC = cp.fork(
      `${data.electronDir}\\websocket\\smc-iifl\\xstmarketdataApi.js`
    );

    if (data.watchlist == null) {
      let param = { type: "other", payload: loadSymbols };
      prevCloseProcess.send(param);
    } else {
      let param = {
        type: "other",
        payload: loadSymbols.concat(data.watchlist.symbols),
      };
      prevCloseProcess.send(param);
    }

    prevCloseProcess.on("message", (msg) => {
      if (msg.type === "other") {
        niftyPrevClosePrice = msg.data["NIFTY"]["Prev_Close"];
        bankNiftyPrevClosePrice = msg.data["BANKNIFTY"]["Prev_Close"];
        sensexPrevClosePrice = msg.data["SENSEX"]["Prev_Close"];
        crudeOilPrevClosePrice = msg.data["CRUDEOIL"]["Prev_Close"];
        goldPrevClosePrice = msg.data["GOLD"]["Prev_Close"];
        silverPrevClosePrice = msg.data["SILVER"]["Prev_Close"]; // new inhancement
        setshares(msg.data);
      }
    });
    if (data.lastLiveDataProps) {
      await invokeLiveDataConnect(data.lastLiveDataProps);
    }
  }, [loginData]);

  useEffect(() => {
    if (Array.isArray(clientCreds)) {
      setClientIds(
        (prev) => clientCreds.map((item) => item["Client ID"]) || prev
      );
    }
  }, [clientCreds]);

  //This function is written to register the symbols to get live market data
  const registerSymbolForLiveData = async (
    actionType,
    stockData,
    isPlaceOrderSymbol
  ) => {
    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.send({
        action: actionType,
        data: stockData,
        placeOrderSymbol: isPlaceOrderSymbol || true,
      });
    } else {
      liveDataProcessIIFLSMC.send({
        action: actionType,
        data: stockData,
        placeOrderSymbol: isPlaceOrderSymbol || true,
      });
    }
  };

  useEffect(() => {
    (async () => {
      if (!Object.keys(loginData).length) return;
      try {
        const watchlistData = await getAllWatchlistByUser(loginData?.user_id);
        if (Array.isArray(watchlistData) && watchlistData?.length) {
          setWatchlistMasterData(watchlistData);
          setSelectedCurrentWatchlist(watchlistData[0]);
        }
      } catch (error) {
        console.log("watchlist data error", error);
      }
    })();
  }, [loginData]);

  async function getSymbolLtpHandler(symbolData) {
    const ltpPayload = symbolData?.map((item) => {
      const exch =
        item.exchange === "N"
          ? item.exchangeType === "D"
            ? "NSEFO"
            : "NSE"
          : item.exchange === "B"
            ? "BSE"
            : item.exchange
              ? "MCX"
              : "NSE";
      return { [exch]: +item.scripCode };
    });

    let updatedSymbolLtpData = [];
    try {
      const ltp = await getLTPService({
        scripcodes: ltpPayload,
      });

      if (Array.isArray(ltp)) {
        const ltpMap = new Map(
          ltp?.map((elem) => [String(elem.scripcode), elem.ltp])
        );

        updatedSymbolLtpData = symbolData.map((item) => {
          const ltpValue = ltpMap.get(String(item.scripCode));

          const formattedLtp = ltpValue !== undefined ? ltpValue.toFixed(2) : 0;
          return { ...item, LTP: formattedLtp };
        });

        return updatedSymbolLtpData;
      }
    } catch (error) {
      console.log("ltp error", error);
      const updatedSymbolLtpData = symbolData.map((item) => ({
        ...item,
        LTP: 0,
      }));

      return updatedSymbolLtpData;
    }
  }

  const selectedCurrentWatchlistSymbolHandler = async () => {
    if (
      selectedCurrentWatchlist &&
      Object.keys(selectedCurrentWatchlist).length
    ) {
      try {
        const watchlistByIdResponse = await getWatchistDetailsByID(
          selectedCurrentWatchlist.watchlistId
        );

        const registerPayload = watchlistByIdResponse.map((item) => ({
          value: item.symbolName,
          Scripcode: +item.scripCode,
          Exch: ExchangeFullName[item.exchange],
          ExchType: fullExchangeType[item.exchangeType] || item.exchangeType,
        }));

        await registerSymbolForLiveData("register", registerPayload, true);
        let result = [];
        try {
          result = await getSymbolLtpHandler(watchlistByIdResponse);
        } catch (error) {
          console.log("error in ltp api", error);
        }
        setSelectedWatchlistSymbolData(result || []);
      } catch (error) {
        console.log("watchlilst symbol data error", error);
      }
    }
  };

  useEffect(() => {
    selectedCurrentWatchlistSymbolHandler();
  }, [selectedCurrentWatchlist]);

  useEffect(() => {
    if (!fnoBasketData.length) return;

    for (let items of fnoBasketData) {
      const basketStockData =
        items?.basket_stock?.map((item) => ({
          value: item.item_symbol,
          Scripcode: item.item_scrip_code,
          Exch: item.item_exchange,
          ExchType: "DERIVATIVES",
        })) || [];

      if (basketStockData.length) {
        setIsSubscribe(true);
        registerSymbolForLiveData("register", basketStockData, true);
      }
    }
  }, [fnoBasketData]);

  const fetchScripCodeHandler = async () => {
    let exchange_data = [];

    for (let exch_Name of subscribe_exchange) {
      try {
        const res = await getOptionChainExpiry({
          exch: "M",
          exch_type: "D",
          full_name: exch_Name,
          cp_type: "XX",
        });

        const optionExpiryList = res?.data ?? [];

        if (Array.isArray(optionExpiryList) && optionExpiryList.length > 0) {
          exchange_data.push(optionExpiryList[0]);
        }
      } catch (error) {
        console.log("error exchange", error);
      }
    }

    const exchangeData =
      exchange_data.map((item) => ({
        value: item?.label?.split(" ")?.[0] ?? "",
        Scripcode: item?.Scripcode,
        Exch: item?.Exch,
        ExchType: item?.ExchType || "DERIVATIVES",
      })) || [];

    if (exchangeData.length) {
      localStorage.setItem("exchange_details", JSON.stringify(exchangeData));
      setExchangeDetails(exchangeData);
    }
  };


  useEffect(() => {
    // if (!Object.keys(loginData).length) return;
    fetchScripCodeHandler();

    const storedExchangeData = localStorage.getItem("exchange_details");
    const localExchangeData = storedExchangeData && storedExchangeData !== "undefined" && storedExchangeData !== "null" ? JSON.parse(storedExchangeData) : []

    if (!localExchangeData.length) return;

    setExchangeDetails((prev) => (!prev.length ? localExchangeData : []));
  }, []);

  const subcribeDefaultInstrument = useCallback(async () => {
    if (!isIndexesSubscribed) return;
    setIsIndexesSubscribed(false);
    let isExist = false;
    exchangeDetails.map((item) => {
      if (exchangeScrpCode.includes(item.ScripCode)) {
        isExist = true;
      }
      exchangeScrpCode.push(item.Scripcode);
    });
    if (!isExist) {
      registerSymbolForLiveData("register", exchangeDetails, true);
    }
  }, [isIndexesSubscribed, exchangeDetails]);

  useEffect(() => {
    subcribeDefaultInstrument();
  }, [isIndexesSubscribed]);

  useEffect(() => {
    if (!exchangeDetails.length) return;

    const handleMessage = (msg) => {
      if (msg.type == "connectionConfirmation") {
        setIsIndexesSubscribed(true);

      }
    };

    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.on("message", handleMessage);
    } else if (
      currentSocketBroker === "IIFL" ||
      currentSocketBroker === "SMC"
    ) {
      liveDataProcessIIFLSMC.on("message", handleMessage);
    }

    return () => {
      liveDataProcess?.off("message", handleMessage);
      liveDataProcessIIFLSMC?.off("message", handleMessage);
      registerSymbolForLiveData("unregister", exchangeDetails, true);
    };
  }, [exchangeDetails, currentSocketBroker]);

  const exchangeLiveDataHandler = () => {
    if (!exchangeDetails.length) return;

    console.log("socket");

    registerSymbolForLiveData("register", exchangeDetails, true);
  };

  useEffect(() => {
    try {
      if (currentSocketBroker === "MOSWAL") {
        liveDataProcess?.on("message", (msg) => {
          if (msg.type === "LIVE_DATA") {
            handleLiveData(msg);
          }
        });
      } else if (
        currentSocketBroker === "IIFL" ||
        currentSocketBroker === "SMC"
      ) {
        liveDataProcessIIFLSMC.on("message", (msg) => {
          handleLiveData(msg);
        });
      }
    } catch (e) { }
  }, [currentSocketBroker, isSubscribe]);

  const handleSpreadLimitFnoBasket = async (stockData) => {
    if (!fnoBasketData.length) return;

    for (let basketItem of fnoBasketData) {
      let totalLtp = 0;
      for (let stockItem of basketItem?.basket_stock || []) {
        if (stockItem?.item_scrip_code === stockData?.scripCode) {
          if (stockItem?.item_order_side === "BUY") {
            totalLtp += +stockData?.ltp;
          } else if (stockItem?.item_order_side === "SELL") {
            totalLtp -= +stockData?.ltp;
          }
        }
      }
      if (totalLtp >= basketItem?.spread_limit) {
        let basketPayload = {
          is_excute: 0,
          basket_id: basketItem?.id,
        };
        try {
          // const res = await BasketInstance(basketPayload);
          console.log("order placed response", res);
        } catch (e) {
          console.log("fno basket order save issue", e);
        }
        console.log(
          "it's time to place order",
          totalLtp,
          basketItem?.spread_limit
        );
      } else {
        console.log("it's not time", totalLtp, basketItem?.spread_limit);
      }
      totalLtp = 0;
    }
  };

  const handleLiveData = (param) => {
    try {
      let tick = param.data;
      let broker = param.broker;
      if (broker === "MOSWAL") {
        let data = liveData;
        switch (tick.Type) {
          case "Index":
            if (!data[tick.ScripCode]) data[tick.ScripCode] = {}; //
            data[tick.ScripCode].LTP = tick.Rate;
            break;
          case "LTP":
            handleSpreadLimitFnoBasket({
              scripCode: tick.ScripCode,
              ltp: tick.LTP_Rate,
            });
            if (!data[tick.ScripCode]) data[tick.ScripCode] = {};
            data[tick.ScripCode].LTP = tick.LTP_Rate;
            data[tick.ScripCode].LTT = tick.Time;
            data[tick.ScripCode].Time = tick.Time?.split(" ")[1];
            data[tick.ScripCode].LTQ = tick.LTP_Qty;
            data[tick.ScripCode].Volume = tick.LTP_Cumulative_Qty;
            data[tick.ScripCode].Average = tick.LTP_AvgTradePrice;
            data[tick.ScripCode].OpenInterest = tick.LTP_Open_Interest;
            break;
          case "MarketDepth":
            if (!data[tick.ScripCode]) data[tick.ScripCode] = {};
            if (typeof data[tick.ScripCode].BidAsk === "undefined")
              data[tick.ScripCode].BidAsk = [];
            data[tick.ScripCode].BidAsk.push({
              BidRate: tick.BidRate,
              BidQty: tick.BidQty,
              BidOrder: tick.BidOrder,
              OfferRate: tick.OfferRate,
              OfferQty: tick.OfferQty,
              OfferOrder: tick.OfferOrder,
              Level: tick.Level,
            });
            if (data[tick.ScripCode].BidAsk.length > 5)
              data[tick.ScripCode].BidAsk.splice(0, 1);
            break;
          case "DayOHLC":
            if (!data[tick.ScripCode]) data[tick.ScripCode] = {};
            data[tick.ScripCode].Open = tick.Open;
            data[tick.ScripCode].High = tick.High;
            data[tick.ScripCode].Low = tick.Low;
            data[tick.ScripCode].PrevDayClose = tick.PrevDayClose;
            break;
          case "DPR":
            if (!data[tick.ScripCode]) data[tick.ScripCode] = {};
            data[tick.ScripCode].UpperCktLimit = tick.UpperCktLimit;
            data[tick.ScripCode].LowerCktLimit = tick.LowerCktLimit;
            break;
          case "OpenInterest":
            break;
        }
        setLiveData(data);
      } else if (broker === "IIFL") {
        let data = liveData;
        switch (tick.Type) {
          case "MarketDepth":
            if (!data[tick.ScripCode]) data[tick.ScripCode] = {};
            data[tick.ScripCode].LTP = tick.LTP;
            data[tick.ScripCode].LTT = tick.LTT;
            data[tick.ScripCode].Time = tick.Time;
            data[tick.ScripCode].LTQ = tick.LTQ;
            data[tick.ScripCode].Volume = tick.Volume;
            data[tick.ScripCode].Average = tick.Average;

            data[tick.ScripCode].Open = tick.Open;
            data[tick.ScripCode].High = tick.High;
            data[tick.ScripCode].Low = tick.Low;
            data[tick.ScripCode].PrevDayClose = tick.PrevDayClose;

            if (typeof data[tick.ScripCode].BidAsk === "undefined")
              data[tick.ScripCode].BidAsk = [];
            data[tick.ScripCode].BidAsk.push({
              BidRate: tick.BidRate.toFixed(2),
              BidQty: tick.BidQty,
              BidOrder: tick.BidOrder,
              OfferRate: tick.OfferRate.toFixed(2),
              OfferQty: tick.OfferQty,
              OfferOrder: tick.OfferOrder,
            });
            if (data[tick.ScripCode].BidAsk.length > 5)
              data[tick.ScripCode].BidAsk.splice(0, 1);
            break;
          case "OpenInterest":
            data[tick.ScripCode].OpenInterest = tick.OpenInterest;
            break;
        }
        setLiveData(data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  //fetching margins for all clients and storing in the context
  const setMargins = async (data) => {
    // let [, marginData] = await getTabledata("margin");  //TODO
    if (marginData.length == 0) return data;

    marginData.forEach((item) => {
      if (item["Broker"]) {
        let clId = item["ClientID"];
        data[clId]["CashMargin"] = parseFloat(
          item["Net Margin"] ? item["Net Margin"] : 0
        );
      }
    });

    return data;
  };

  const getClientsIds = async () => {
    //getting loaded clients details
    // var clientsLoginStatus = await ipcRenderer.invoke(
    //   "readMemory-ipc",
    //   "clientStatus"
    // );

    const clientsLoginStatus = window?.electronAPI
      ? await window.electronAPI.readMemory("clientStatus")
      : null;


    const userId = localStorage.getItem("user_id");
    const listOffline = await GetOfflineClientAll(userId);

    let ClientMerge = [
      ...(clientsLoginStatus || []),
      ...(listOffline?.clients || []),
    ];
    //temp arrays for brokers and clients
    var data = {};
    if (ClientMerge) {
      ClientMerge.forEach((item, index) => {
        const clientId = String(item["name"]);
        const broker = String(item["broker"]);
        data[clientId] = {
          ClientId: clientId,
          Broker: broker,
          Quantity: clients?.current["data"][clientId]?.Quantity
            ? clients.current["data"][clientId].Quantity
            : 1,
          CashMargin: item?.is_offline === true ? "NA" : 0,
          CapsPerSymbol: 0,
        };
      });
    }
    data = await setMargins(data);
    clients.current["data"] = data; //conatins data of all clients
    clients.current["clients"] = Object.keys(data); //contains name of all clients
    // clients.current["selectedClients"] = []; //array of only selected clients from multiselect
  };

  const getClientsInvestedMargin = async () => {
    try {
      const payload = {
        ltp: null,
        Percentage: 1,
        client_ids: clientIds.length ? clientIds : [],
      };
      const res = await clientInvestedMarginData(payload);
      return res.data || [];
    } catch (err) {
      console.log("error invested Margin", err);
      return [];
    }
  };

  const setSymbolApi = (symbol) => {
    setCashSymbol(symbol);
    setSelectedSymbol(new Set([symbol.label]));
    setSingleLtp(null);
    apiBody.current = {
      ...apiBody.current,
      sym: symbol.label,
      LotSize: symbol.LotSize,
      Scripcode: symbol.Scripcode,
      Exchange: symbol.Exch,
    };
  };

  //adding clients from multiselect
  const addDynamicInputs = async () => {
    const tempList = [];

    clients.current["selectedClients"].forEach((item, index) => {
      const clData = clients.current["data"][item];
      tempList.push(clData);
    });
    setClientInputList(tempList);
  };

  //adding cliets on selecting the excel sheet
  const validateCredsOrderSheet = (clientOrders, data) => {
    //loaded using client clreds excel sheet in admin page
    var loadedClients = Object.keys(data).map((item) => item.toLowerCase());
    //clients from order sheet
    var orderedClients = Object.keys(clientOrders).map((item) =>
      item.toLowerCase()
    );
    const tempList = [];
    const marginsCl = [10000, 100000, 50000, 100000, 40000, 600000];
    orderedClients.forEach((item, index) => {
      if (loadedClients.includes(item)) {
        const key = item.toUpperCase();

        const clientData = data[key];
        //
        //
        const capitalPerSymbol = clientOrders[key]["Capital Per Symbol"];

        clientData["CapsPerSymbol"] = capitalPerSymbol;
        clientData["Quantity"] = Math.floor(
          capitalPerSymbol / singleLtp[selectedValueSymbol]["Price"]
        );
        //include cash margin later from api
        clientData["CashMargin"] = marginsCl[index];
        tempList.push(clientData);
      }
    });

    setClientInputList(tempList);
  };

  //to upload excel and fill data for placing order
  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const name = e.target.files[0].name;
      const path = e.target.files[0].path;

      const ipcReqBody = {
        filename: file.name,
        filePath: file.path,
      };

      if (!file || path == null || path == undefined) {
        return;
      }

      //getting data from uploaded excel
      // const clientOrder = await ipcRenderer.invoke(
      //   "parse-clientOrders-ipc",
      //   ipcReqBody
      // );

      // NEW (correct - use window.electronAPI):
      const clientOrder = await window.electronAPI.parseClientOrders(ipcReqBody);

      //client oredrs: data from csv file for placing order
      //clients.current["data"] : data of clients when uploaded from clients creds
      validateCredsOrderSheet(clientOrder, clients.current["data"]);
    }
  };

  const invokeLiveDataConnect = async (liveData) => {
    let broker = liveData.broker;
    let props = liveData.data;
    if (broker === "MOSWAL") {
      liveDataProcess?.send({
        action: "initiate",
        data: props,
      });
      setCurrentSocketBroker("MOSWAL");
    } else {
      liveDataProcessIIFLSMC?.send({
        action: "initiate",
        data: props,
      });
      setCurrentSocketBroker("IIFL");
    }
    selectedClientLtp.current = liveData.clientId;
    let refreshCounter = 0;
    setInterval(() => {
      setGridRefreshCounter(refreshCounter);
      refreshCounter++;
    }, 20000);
  };

  const clientApiBodyFormatHandler = (apiBody) => {
    const updatedBrokers = Object.fromEntries(
      Object.entries(apiBody).map(([brokerName, clients]) => [
        brokerName,
        clients.map(({ "Client ID": clientCode, ...rest }) => ({
          client_code: clientCode,
          ...rest,
        })),
      ])
    );
    return updatedBrokers;
  };

  const connectToLastClients = async (result, userId = "") => {
    if (result?.apiBody && Object.keys(result.apiBody).length) {
      //adding dealerID
      result.apiBody["DEALERID"] = loginData["user_id"] || userId;

      const { DEALERID, ...rest } = result.apiBody;

      const updatedApiBody = clientApiBodyFormatHandler(rest);

      let apiStatus;
      try {
        const res = await clientBrokerConnection({
          DEALERID,
          ...updatedApiBody,
        });
        console.log("new res", res);
        apiStatus = [] //clientsState(res.data);TODO

        //calling clients login api for all brokers present in the excel sheet
        if (apiStatus.length) {
          await window.electronAPI.setClientStatusApiRes({
            apiStatus: apiStatus,
          });
        }
      } catch (error) {
        console.log("error broker client", error);
      }
      setUser(apiStatus);

      //it will make loggin status to green from red in "Login Status" and "broker health" column
      logginClients.current = true;

      const storeClientCredRows = result.rows;
      let santisedArrayWithStatus = [];
      let error = [];
      storeClientCredRows?.forEach((item) => {
        if (Array.isArray(apiStatus)) {
          const filteredObject = apiStatus?.filter((obj) => {
            return obj.name === item["Client ID"] && obj.broker === item.Broker;
          });
          //adding column for login status in the table (client credentials)
          santisedArrayWithStatus.push({
            ...item,
            loginStatus:
              filteredObject[0]?.status === "success"
                ? LoginStatus.LOGGED_IN
                : LoginStatus.LOGGED_OUT,
          });
        } else {
          error.push(item);
        }
      });
      result["rows"] = santisedArrayWithStatus;
    }
  };

  // const connectToLastClients = async (params, userId = "") => {
  //   const result = await ipcRenderer.invoke("readMemory-ipc", "clientCreds");

  //   if (result && params?.clientCreds?.length) {
  //     console.log("params", params);
  //     //adding dealerID
  //     result.apiBody["DEALERID"] = loginData["user_id"] || userId;

  //     let apiStatus;
  //     try {
  //       const res = await clientBrokerConnection(result.apiBody);
  //       console.log("res", res);
  //       apiStatus = clientsState(res.data);

  //       //calling clients login api for all brokers present in the excel sheet
  //       if (apiStatus.length) {
  //         await ipcRenderer.invoke("set-clientStatusApiRes", {
  //           apiStatus: apiStatus,
  //         });
  //       }
  //     } catch (error) {
  //       console.log("error broker client", error);
  //     }
  //     setUser(apiStatus);

  //     //it will make loggin status to green from red in "Login Status" and "broker health" column
  //     logginClients.current = true;

  //     const storeClientCredRows = result.rows;
  //     let santisedArrayWithStatus = [];
  //     let error = [];
  //     storeClientCredRows?.forEach((item) => {
  //       if (Array.isArray(apiStatus)) {
  //         const filteredObject = apiStatus?.filter((obj) => {
  //           return obj.name === item["Client ID"] && obj.broker === item.Broker;
  //         });
  //         //adding column for login status in the table (client credentials)
  //         santisedArrayWithStatus.push({
  //           ...item,
  //           loginStatus:
  //             filteredObject[0]?.status === "success"
  //               ? LoginStatus.LOGGED_IN
  //               : LoginStatus.LOGGED_OUT,
  //         });
  //       } else {
  //         error.push(item);
  //       }
  //     });
  //     result["rows"] = santisedArrayWithStatus;
  //   }
  // };

  useEffect(() => {
    if (!Object.keys(loginData).length) return;
    (async () => {
      try {
        const getAllUploadedClientRes = await reconnectAllClients();

        // try {
        //   await reconnectAllClients(); ///--  need to change with get upload clients ---- //
        // } catch (error) {
        //   console.log("error", error);
        // }

        if (Object.keys(getAllUploadedClientRes).length) {
          if (Array.isArray(getAllUploadedClientRes?.rows)) {
            setClientCreds(getAllUploadedClientRes.rows);
            setClientCredsAllData(getAllUploadedClientRes);
            const clientsDetails = getAllUploadedClientRes.rows.map((item) => ({
              clientId: item["Client ID"] || "",
              clientName: item.ClientName || "",
              email: item.email || "",
              userId: item.userId || "",
            }));
            setClientsData(clientsDetails || []);
          }
          connectToLastClients(getAllUploadedClientRes);
        }
      } catch (error) {
        console.log("error of get login clients", error);
      }
    })();
  }, [loginData]);

  useEffect(() => {
    if (!clientCreds.length || !Object.keys(loginData).length) return;
    // connectToLastClients({ clientCreds: clientCreds });
  }, [clientCreds, loginData]);

  return (
    <GlobalContext.Provider
      value={{
        clientCreds,
        setClientCreds,
        clientCredsAllData,
        setClientCredsAllData,
        selectedClientLtp,
        loadSymbols,
        setLoadSymbols,
        watchlistSymbols,
        selectedWatchlist,
        setSelectedWatchlist,
        shares,
        setshares,
        reqShares,
        setReqShares,
        watchlists,
        setWatchlists,
        watchlistMasterData,
        setWatchlistMasterData,
        selectedWatchlistSymbolData,
        setSelectedWatchlistSymbolData,
        selectedCurrentWatchlist,
        setSelectedCurrentWatchlist,
        watchlistSelectedValue,
        checked,
        setChecked,
        primaryNav,
        setPrimaryNav,
        // secondaryNav,

        adminComponent,
        setAdminComponent,
        selectedSymbol,
        setSelectedSymbol,
        selectedValueSymbol,
        symbolNames,
        singleLtp,
        setSingleLtp,
        switch_GpCl,
        setswitch_GpCl,
        switch_Options,
        setSwitch_Options,
        clients,
        getClientsIds,
        setSymbolApi,
        apiBody,
        addDynamicInputs,
        clientInputList,
        setClientInputList,
        handleFileChange,
        selectedGroup,
        setSelectedGroup,
        selectedValueGroup,
        addClients,
        addClientsOptions,
        addWebHooksGroupsClients,
        groupInputList,
        setGroupInputList,
        flowLtpShares,
        stepOrderVisible,
        setStepOrderVisible,
        group_Clients,
        setGroup_Clients,
        clientsData,
        setClientsData,
        loginData,
        symbolDropdown,
        setLoginData,
        setSymbolDropdown,
        SignUpData,
        setSignUpData,
        cl,
        fixClient,
        refreshToken,
        setRefreshToken,
        refreshTokenTable,
        setRefreshTokenTable,
        allSymbols,
        symbolNamesNSE,
        symbolNamesBSE,
        brokersHealth,
        setBrokersHealth,
        liveDataProcess,
        liveDataProcessIIFLSMC,
        prevCloseProcess,
        liveDataProvider,
        currentSocketBroker,
        setCurrentSocketBroker,
        currentCommand,
        commandEntries,
        envData,
        niftyPrevClosePrice,
        bankNiftyPrevClosePrice,
        sensexPrevClosePrice,
        crudeOilPrevClosePrice,
        goldPrevClosePrice,
        silverPrevClosePrice,
        symbolNamesFutures,
        symbolNamesOptions,
        StrikeRateDropDown,
        user,
        setUser,
        placeOrderVisible,
        setPlaceOrderVisible,
        logginClients,
        ExpiryDropdown,
        optionIndexesDropdown,
        optionSymbolsDropdown,
        electronDrirecctory,
        isLiveDataConnected,
        setIsLiveDataConnected,
        LTPData,
        setLTPData,
        basketData,
        setbasketData,
        addToCart,
        setAddToCart,
        currentMonthCrudeOilScripCode,
        setInitialArray,
        initialArray,
        InputWebhook,
        setInputWebhook,
        groupInputWebhook,
        setGroupInputWebhook,
        webhookGroupDefaultQuantity,
        setWebhookGroupDefaultQuantity,
        groupClientsData,
        setGroupClientsData,
        deleteCheckboxClients,
        setDeleteCheckboxClients,
        gridRef,
        fullGridRef,
        handleResize,
        gridSize,
        setopenModelFull,
        openModelFull,
        openModelPreview,
        setopenModelPreview,
        size,
        setSize,
        clientData,
        setClientData,
        currentSocketItem,
        setCurrentSocketItem,
        setCurrentState,
        currentState,
        setOfflineRowData,
        offlineRowData,
        ClientBrokerData1,
        setClientBrokerData1,
        cashSymbol,
        setCashSymbol,
        tableDataItem,
        setTabledataItem,
        ClientDataValue,
        setClientDataValue,
        clientIds,
        setClientIds,
        qty,
        setQty,
        gridRefreshCounter,
        registerSymbolForLiveData,
        liveData,
        loginClientUserData,
        setLoginClientUserData,
        selectedCheckboxSquareOffHoldings,
        setSelectedCheckboxSquareOffHoldings,
        selectedCheckboxSquareOffNetPositions,
        setSelectedCheckboxSquareOffNetPositions,
        holdingsBulkSquareOff,
        setHoldingsBulkSquareOff,
        cloneHoldingsBulkSquareOff,
        setCloneHoldingsBulkSquareOff,
        netPositionsBulkSquareOff,
        setNetPositionsBulkSquareOff,
        cloneNetPositionsBulkSquareOff,
        setCloneNetPositionsBulkSquareOff,
        holdingsSelectAll,
        setHoldingsSelectAll,
        netPositionsSelectAll,
        setNetPositionsSelectAll,
        resetSelectAllHandler,
        getClientsInvestedMargin,
        equityBasketType,
        setEquityBasketType,
        holdingsData,
        setHoldingsData,
        fnoBasketRowData,
        setFnoBasketRowData,
        getSymbolLtpHandler,
        modifyOrderData,
        setModifyOrderData,
        cancelOrderData,
        setCancelOrderData,
        recordsLimit,
        setRecordsLimit,
        equityQty,
        setEquityQty,
        subscribeExchangeFlag,
        setSubscribeExchangeFlag,
        InstanceData,
        setInstanceData,
        exchangeDetails,
        setIsIndexesSubscribed,
        exchangeLiveDataHandler,
        getAllClientItem,
        connectToLastClients,
        liveDataModal,
        setLiveDataModal,
        selectedCurrentWatchlist,
        selectedCurrentWatchlistSymbolHandler,
        resetClientCheckboxHandler,
        clientApiBodyFormatHandler,
        tradeExcelFile,
        setTradeExcelFile,
        excelOrderItems,
        setExcelOrderItems,
        eventId,
        setEventId,
        // isUploadTradeExcel,
        // setIsUploadTradeExcel,
        holdingsFilteredbody,
        setHoldingsFilteredbody,
        cloneHoldingsFilteredbody,
        setCloneHoldingsFilteredbody,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
