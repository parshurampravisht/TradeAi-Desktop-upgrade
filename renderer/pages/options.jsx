import React, { useCallback, useState, useMemo } from "react";
import {
  Text,
  Row,
  Col,
  Grid,
  Navbar,
  Spacer,
  Input,
  Button,
  Radio,
  Switch,
} from "@nextui-org/react";
import moment from "moment";
import { useGlobalContext } from "../context/GlobalContext";
import Multiselect from "multiselect-react-dropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import { OptionsColumns } from "../component/options/BasketColumnDefs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useRef } from "react";
import { useEffect } from "react";
import SubmitModal from "../component/options/submitModal";
import { useRouter } from "next/router";
import { blockInvalidChar } from "../component/dashboard/watchlist/order/orderComponents/blockInputChars";
import ClientTable from "../component/options/components/clientTable";
import { IconPlus } from "@tabler/icons-react";
import {
  getLTPService,
  getOptionChainData,
  getOptionChainExpiry,
} from "../../services/transactions/transactions.service";
import { placeOrder_api } from "../../main/logic/clientAPI";
import SubmitOptionModel from "../component/options/SubmitOptionModel";
import OrderInputGroups from "../component/dashboard/watchlist/order/groups/OrderInputGroups";
import {
  ExchangeNameDerivatives,
  ExchangeShortName,
  indexes,
  liveDataParam,
  warnMessage,
} from "../constant/constant";
import TopRightNavigationButton from "../component/common/TopRightNavigationButton";
import CustomSelect from "../layout/customSelect";
import { formatSymbolWithPrice } from "../component/dashboard/dashboardTables/helpers";
import useFetchOptions from "../component/hooks/useFetchOption";
//mock derivatives response
// var mockOptions = require('../component/options/optionsMock.json');
const customStyles = {
  control: (provided) => ({
    ...provided,
    // width: "270px",
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "16px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, // Apply high z-index to the menu
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

export default function Options() {
  //const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR",});
  const [selectedClients, setSelectedClients] = useState([]);
  const [activeTabs, setActiveTabs] = useState(false); //active fno
  const [qty, setQty] = useState(0);
  const [optDropdown, setOptDropdown] = useState([]);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [deliveryType, setDeliveryType] = useState("MKT");
  const [lotSize, setLotSize] = useState(0);
  const [Ltp, setLtp] = useState(0);
  const [isSelectedSymbolFlagData, setIsSelectedSymbolFlagData] = useState({});
  const atmScriptCode = useRef();
  const [clientTableData, setClientTableData] = useState([]);
  const isLastBid = useRef(false);
  const selectedScriptCode = useRef();
  const selectedOption = useRef(null);
  const selectedSymbolVal = useRef(null);
  const [selectedStrikeVal, setSelectedStrikeVal] = useState(null);
  const [selectedExpiryVal, setSelectedExpiryVal] = useState(null);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [isSubscribeLTP, setIsSubscribeLTP] = useState(false);

  const [selectedSymbol, setSelectedSymbol] = useState([]);
  const [exchange, setExchange] = useState("NSE");
  const [modelOption, setModelOption] = useState(false);
  const filters = useRef({
    symbol: "",
    strike: "",
    expiry: "",
  });
  const router = useRouter();
  const selectedSharePrice = useRef();
  const [atmPrice, setATMPrice] = useState();
  const [product, setProduct] = useState("NRML");
  const [currentData, setCurrentData] = useState();
  const [LTPDataValue, setLTPDataValue] = useState("");
  const [SelectFOItem, setSelectFOItem] = useState([]);
  const [BuyData, setBuyData] = useState("");
  const showCurrentOptions = useRef([]);
  const showPreviousOptions = useRef([]);
  const gridRef = useRef();
  const gridRefLastBid = useRef();
  const isFuture = useRef(false);
  const addClientRef = useRef(false);
  const [GroupData, setGroupData] = useState("client");
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState({
    cellValueClicked: true,
    addClients: true,
    addGroups: true,
  });
  const [gridRowdata, setGridRowdata] = useState([]);
  const [futureExpiry, setFutureExpiry] = useState({});
  const [allSymbolData, setAllSymbolData] = useState({});
  const [watchlistSymbolFlag, setWatchlistSymbolFlag] = useState(false);
  var columns = [
    { headerName: "S.No.", field: "sno", width: 100, hide: true }, // Adjust column width as needed
    { headerName: "Bid QTY", field: "BidQty", width: 100 }, // Adjust column width as needed
    { headerName: "Bid Rate", field: "BidRate", width: 100 }, // Adjust column width as needed
    { headerName: "Ask QTY", field: "OfferQty", width: 100 }, // Adjust column width as needed
    { headerName: "Ask Rate", field: "OfferRate", width: 100 }, // Adjust column width as needed
  ];
  const {
    clients,
    getClientsIds,
    ExpiryDropdown, //expiry dropdown
    optionSymbolsDropdown, //indexes dropdown
    optionIndexesDropdown, //select symbol dropdown
    setPlaceOrderVisible,
    liveDataProcess,
    liveDataProcessIIFLSMC,
    currentSocketBroker,
    setLTPData,
    group_Clients,
    setSelectedGroup,
    selectedGroup,
    addClientsOptions,
    apiBody,
    groupInputList,
    setGroupInputList,
    shares,
    clientsData,
    registerSymbolForLiveData,
    liveData,
    recordsLimit,
  } = useGlobalContext();

  const { state } = router?.query;

  const exchangeType = "D";
  const { optionData, setOptionData, fetchOptions } = useFetchOptions(
    exchangeType,
    false
    // state ? false : false
  );

  useEffect(() => {
    if (state) {
      setBuyData(state === "true" ? "Buy" : state === "false" ? "Sell" : "");
      const stockName = apiBody?.current?.SelectValue?.symbolName;
      console.log("apiBody?.current", apiBody?.current);
      fetchOptions(stockName);
      // setWatchlistSymbolFlag(true);
    }
  }, [state]);

  // useEffect(() => {
  //   console.log("optionData", optionData);
  //   if (state && watchlistSymbolFlag) {
  //     const stockName = apiBody?.current?.SelectValue?.symbolName;
  //     console.log("watchlistSymbolFlag", watchlistSymbolFlag, stockName);
  //     setOptionData((prev) =>
  //       prev.length > 1 ? prev.filter((item) => item.label === stockName) : prev
  //     );
  //     setWatchlistSymbolFlag(false);
  //   }
  // }, [state, watchlistSymbolFlag]);

  useEffect(() => {
    clientTableData.forEach(({ ClientId }) => {
      if (clients.current.data[ClientId]) {
        clients.current.data[ClientId].Quantity = 1;
      }
    });
  }, [clientTableData]);

  useEffect(() => {
    if (optionData?.length) {
      const updatedOption =
        optionData?.length > 1
          ? optionData.filter(
            (item) =>
              +item.Scripcode === +apiBody?.current?.SelectValue?.scripCode
          )
          : optionData;
      if (Array.isArray(updatedOption) && updatedOption[0]) {
        setSelectedSymbol([updatedOption[0]]);
        handleSymbolSelect(updatedOption[0]);
      }
      // setSelectedSymbol([optionData[0]]);
      // handleSymbolSelect(optionData[0]);
    }
  }, [optionData]);

  const handleQTY = (event) => {
    setQty(event.target.value);
  };
  const apiBodyDervatives = useRef({
    BuySell: "BUY",
    sym: null,
    disclose_qty: null,
    price: 0,
    intraday: false,
    sl_price: 0,
    exch: null,
    LotSize: 1,
    Scripcode: null,
    exch_id: null,
    clients: [],
  });

  useEffect(() => {
    setIsSubmitButtonDisabled((prev) => ({
      ...prev,
      addClients: clientTableData.length ? false : true,
      addGroups: groupInputList.length ? false : true,
    }));
  }, [clientTableData, groupInputList]);

  const handleGroupData = (data) => {
    setGroupData(data);
  };

  const addClientsHandler = async () => {
    let addClients1 = apiBodyDervatives.current.clients;
    if (addClientRef.current || !addClients1.length) return;
    addClientRef.current = true;

    await getClientsIds();
    let tempClients = [];
    addClients1.forEach((client, index) => {
      let clientData = clients.current["data"][client];

      const ltp = +currentData?.ltp;
      const lotSize = +currentData?.lotSize;
      const isSell = currentData?.orderSide === "Sell";

      const requiredMargin =
        !currentData ||
          !Object.keys(currentData).length ||
          Ltp === undefined ||
          !ltp ||
          +clientData.Quantity <= 0 ||
          isSell
          ? "-"
          : ltp * +clientData.Quantity * lotSize;

      tempClients.push({
        ...clientData,
        requiredMargin,
      });
    });

    setClientTableData((prev) => [...prev, ...tempClients]);
    apiBodyDervatives.current.clients = [];
    setSelectedClients([]);
    addClientRef.current = false;
  };

  //variable to store the clicked column
  const findRowIndexWithValue = (rowData) => {
    const closest =
      rowData.length !== 0 &&
      rowData.reduce((a, b) => {
        return Math.abs(b.strikes - selectedSharePrice.current) <
          Math.abs(a.strikes - selectedSharePrice.current)
          ? b
          : a;
      });

    setATMPrice(closest.strikes);
    const rowIndex =
      rowData &&
      rowData.findIndex(
        (row) => row && row.call_Scripcode === closest.call_Scripcode
      );
    return rowIndex;
  };
  // Function to scroll to the row with value 6
  const scrollToRowWithValue = () => {
    setTimeout(() => {
      if (gridRef.current) {
        const rowData = [];
        gridRef?.current?.api?.forEachNode(({ data }) => rowData.push(data));
        if (rowData.length !== 0) {
          const rowIndex = findRowIndexWithValue(rowData);
          if (rowIndex !== -1 && gridRef.current) {
            gridRef.current.api.ensureIndexVisible(rowIndex - 5, "top");
          }
        }
        const rowCount = gridRef.current.api.getDisplayedRowCount();
        const middleRowIndex = Math.floor(rowCount / 2); // Find the middle row
        gridRef.current.api.ensureIndexVisible(middleRowIndex, "middle"); // Scroll to middle row
      }
    }, 500);
  };

  //To fill up the option chain grid
  const handleLiveData = (msg) => {
    if (msg.type === "LIVE_DATA") {
      const tickdata = msg.data;

      let symbolInfo = showCurrentOptions.current.find(
        (sym) => sym.Scripcode === tickdata.ScripCode
      );
      if (symbolInfo) {
        let rowNode = gridRef?.current?.api?.getRowNode(symbolInfo.StrikeRate);
        if (rowNode) {
          if (tickdata.Type === "LTP" && msg.broker === "MOSWAL") {
            if (symbolInfo.CPType === "CE") {
              rowNode.setDataValue("call_oi", tickdata.LTP_Open_Interest);
              rowNode.setDataValue("call_ltp", tickdata.LTP_Rate);
            }
            if (symbolInfo.CPType === "PE") {
              rowNode.setDataValue("put_oi", tickdata.LTP_Open_Interest);
              rowNode.setDataValue("put_ltp", tickdata.LTP_Rate);
            }
          } else if (msg.broker === "IIFL") {
            if (symbolInfo.CPType === "CE") {
              if (tickdata.Type === "OpenInterest")
                rowNode.setDataValue("call_oi", tickdata.OpenInterest);
              if (tickdata.Type === "MarketDepth")
                rowNode.setDataValue("call_ltp", tickdata.LTP);
            }
            if (symbolInfo.CPType === "PE") {
              if (tickdata.Type === "OpenInterest")
                rowNode.setDataValue("put_oi", tickdata.OpenInterest);
              if (tickdata.Type === "MarketDepth")
                rowNode.setDataValue("put_ltp", tickdata.LTP);
            }
          }
        }
      }
    }
  };

  const handleLiveLTP = useCallback(
    (msg) => {
      if (msg.type === "LTP") {
        const data = msg?.data || {};

        if (isSubscribeLTP) return;

        setIsSubscribeLTP(true);
        const symbolLabel = selectedSymbol[0]?.label;
        const price = symbolLabel ? data[symbolLabel]?.Price : null;
        if (data) setAllSymbolData(data);

        if (price) {
          setCurrentData((prev) => {
            const updatedData = {
              ...prev,
              ltp: price,
            };
            return updatedData;
          });
        } else {
          console.error("Price not found for symbol:", symbolLabel);
        }
      }
    },
    [isSubscribeLTP]
  );

  const selectedSymbolDatahandler = (currentOption) => {
    let symbolInfo = currentOption;

    gridRefLastBid?.current?.api.setRowData([]);
    if (symbolInfo) {
      setLotSize(symbolInfo?.LotSize); // lot size of selected option

      const selectedOptionData = {
        scripCode: symbolInfo?.Scripcode,
        symbol: symbolInfo?.label,
        strikeRate: symbolInfo?.StrikeRate,
        cpType: symbolInfo?.CPType,
        orderSide: "",
        ltp: 0,
        lotSize: symbolInfo?.LotSize,
      };
      setCurrentData(selectedOptionData);
      setLTPDataValue(symbolInfo?.CPType === "CE" ? "Call_LTP" : "PUT_LTP");
      registerSymbolForLiveData("register", [currentOption], true);

      apiBodyDervatives.current = {
        ...apiBodyDervatives.current,
        sym: symbolInfo?.label,
        LotSize: symbolInfo?.LotSize,
        Scripcode: symbolInfo?.Scripcode,
        exch:
          symbolInfo?.Exch === "NSE"
            ? "NSEFO"
            : symbolInfo?.Exch === "BSE"
              ? "BSEFO"
              : "MCXFO",
      };

      //to make it sumbit button true if option selected
      setIsSubmitButtonDisabled((prev) => ({
        ...prev,
        cellValueClicked: false,
      }));
    }
  };

  useEffect(() => {
    if (!Object.keys(isSelectedSymbolFlagData).length) return;

    selectedSymbolDatahandler(isSelectedSymbolFlagData);
  }, [isSelectedSymbolFlagData]);

  useEffect(() => {
    if (!Object.keys(isSelectedSymbolFlagData).length) return;

    setCurrentData((prev) => ({
      ...prev,
      orderSide: BuyData === "Buy" ? "BUY" : "SELL",
    }));
  }, [isSelectedSymbolFlagData, BuyData]);

  //To show last bid ask for selected product
  useEffect(() => {
    if (liveData[currentData?.scripCode]) {
      const bidAsk = liveData[currentData?.scripCode].BidAsk;
      gridRefLastBid?.current?.api.setRowData(bidAsk);
    }
  }, liveData[currentData?.scripCode]?.BidAsk);

  const clientsOptionsData = useMemo(() => {
    if (!clientsData.length) return [];
    const alreadyAddedclients =
      clientTableData.map((item) => item.ClientId) || [];
    return (
      alreadyAddedclients
        ? clientsData.filter(
          (item) => !alreadyAddedclients.includes(item.clientId)
        )
        : clientsData
    ).map((client) => ({
      value: client.clientId, // Save clientId as the value
      label: `${client.clientName
        ? `${client.clientId} (${client.clientName})`
        : `${client.clientId}`
        }`, // Display clientId (clientName)
    }));
  }, [clientsData, clientTableData]);

  useEffect(() => {
    getClientsIds();
    setOptDropdown([{ label: "Select Symbol", value: "Select Symbol" }]);

    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.on("message", (msg) => {
        handleLiveData(msg);
      });
    } else if (currentSocketBroker === "IIFL" || currentSocketBroker === "SMC")
      liveDataProcessIIFLSMC.on("message", (msg) => {
        handleLiveData(msg);
      });
  }, [
    currentSocketBroker,
    selectedSymbolVal.current,
    selectedOption.current,
    selectedSymbol,
  ]);

  // useEffect(() => {
  //   if (!Object.keys(isSelectedSymbolFlagData).length) return;

  //   if (currentSocketBroker === "MOSWAL") {
  //     liveDataProcess.on("message", (msg) => {
  //       console.log("symbol2 is updated");
  //       handleLiveLTP(msg);
  //     });
  //   } else if (currentSocketBroker === "IIFL" || currentSocketBroker === "SMC")
  //     liveDataProcessIIFLSMC.on("message", (msg) => {
  //       handleLiveLTP(msg);
  //     });
  // }, [isSubscribeLTP, isSelectedSymbolFlagData]);

  useEffect(() => {
    if (!Object.keys(isSelectedSymbolFlagData).length) return;

    const handleMessage = (msg) => {
      handleLiveLTP(msg);
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
    };
  }, [isSubscribeLTP, isSelectedSymbolFlagData, currentSocketBroker]);

  useEffect(() => {
    if (!Object.keys(isSelectedSymbolFlagData).length) return;

    const symbolLabel = selectedSymbol[0]?.label;
    const price =
      symbolLabel && allSymbolData ? allSymbolData?.[symbolLabel]?.Price : null;

    if (price) {
      setCurrentData((prev) => {
        const updatedData = {
          ...prev,
          ltp: prev?.ltp || price,
        };
        return updatedData;
      });
    } else {
      console.error("Price not found for symbol:", symbolLabel);
    }
  }, [allSymbolData, isSelectedSymbolFlagData]);

  //converting the apibody
  const convertApiBody = (oldApiBody) => {
    const newApiBody = {};
    const orderType = () => {
      if (oldApiBody.sl_price > 0 && oldApiBody.price > 0) {
        return "STOPLIMIT";
      } else if (oldApiBody.sl_price == 0 && oldApiBody.price > 0) {
        return "LIMIT";
      } else if (oldApiBody.sl_price > 0 && oldApiBody.price == 0) {
        return "STOPMARKET";
      } else {
        return "MARKET";
      }
    };

    (GroupData === "group" ? groupInputList : clientTableData).map((cl) => {
      newApiBody[cl.ClientId] = {
        OrderSide: BuyData === "Buy" ? "BUY" : "SELL",
        Symbol: currentData?.symbol,
        LimitPrice: oldApiBody.price,
        SLTriggerPrice: oldApiBody.sl_price,
        Exchange: oldApiBody.exch,
        LotSize: oldApiBody.LotSize,
        Scripcode: currentData?.scripCode,
        Quantity: +cl.Quantity,
        ProductType: product,
        OrderType: orderType(),
        OverNightSL: isChecked ? "ON" : "OFF",
      };
    });
    return newApiBody;
  };

  //setting input for apibody
  const setInputApi = (field, type, value) => {
    if (type == "number") {
      apiBodyDervatives.current[field] = Number(value);
    } else if (type == "string") {
      apiBodyDervatives.current[field] = String(value);
    } else if (type == "float") {
      apiBodyDervatives.current[field] = float(value);
    } else if (type == "boolean") {
      apiBodyDervatives.current[field] = value;
    }
    // setCheckValid(!checkValid);
  };

  const handleModelOpen = () => {
    setModelOption(true);
  };
  const processRef = useRef(false);
  const handleSubmit = async () => {
    if (processRef.current) return;
    processRef.current = true;
    const reqBody = convertApiBody(apiBodyDervatives.current);

    const filteredrequiredApiBody = Object.fromEntries(
      Object.entries(reqBody).filter(([key, value]) => value.Quantity !== 0)
    );

    const result = await placeOrder_api(filteredrequiredApiBody, "apiToken");
    setIsSubmitButtonDisabled({
      cellValueClicked: true,
      addClients: true,
      addGroups: true,
    });
    setTimeout(() => {
      processRef.current = false;
    }, 1000);
    if (result) toast.success(warnMessage.success_order_message);
    setModelOption(false);
    router.push("/equity");
  };

  //setting apibody on selected options
  const handleSymbolSelect = async (symbol) => {
    gridRefLastBid?.current?.api.setRowData([]);
    gridRef?.current?.api.setRowData([]);
    setLotSize(symbol.LotSize);

    if (selectedSymbol.length)
      registerSymbolForLiveData("unregister", [symbol], true);

    const selectedOptionData = {
      exchange: symbol.Exch,
      scripCode: symbol?.Scripcode,
      symbol: symbol?.label,
      strikeRate: symbol?.StrikeRate,
      cpType: symbol?.CPType,
      ltp: 0,
      lotSize: symbol?.LotSize,
    };
    setCurrentData(selectedOptionData);

    apiBodyDervatives.current = {
      ...apiBodyDervatives.current,
      sym: symbol.label,
      LotSize: symbol.LotSize,
      Scripcode: symbol.Scripcode,
      exch:
        symbol.Exch === "NSE"
          ? "NSEFO"
          : symbol.Exch === "BSE"
            ? "BSEFO"
            : "MCXFO",
    };

    setIsSelectedSymbolFlagData(symbol);
    setLtp(symbol.ltp || 0);
    setSelectedSymbol([symbol]);
    setExchange(symbol.Exch);
    setIsSubscribe((prev) => !prev);
    const symbolValue = symbol.label.split(" ")[0];
    if (symbol) atmScriptCode.current = symbol.Scripcode;
    // const symbolValue = symbol.value.split(" ")[0];
    const valueInIndex = optionIndexesDropdown?.current?.find(
      (idx) => idx.value === symbolValue
    );

    // const valueInOptions = optionSymbolsDropdown.current?.find(
    //   (idx) => idx.value === symbolValue
    // );

    const valueInOptions = {
      label: symbolValue,
      value: symbolValue,
    };

    const symbolFound = valueInIndex || valueInOptions;
    // if (valueInIndex) {
    //   selectedOption.current = valueInIndex;
    // } else {
    //   selectedSymbol = valueInOptions;
    // }

    if (valueInIndex) {
      // selectedSymbol = valueInOptions;
    } else {
      selectedOption.current = valueInIndex;
    }

    //for auto dropdown selection of symbol/index/expiry
    if (symbolFound) {
      const expiry = symbol.label.split(" ");
      // const expiry = symbol.value.split(" ");

      if (expiry.length > 4) {
        isFuture.current = false;
        const expirydataLtp =
          (await handleFilter(
            symbolFound,
            valueInIndex ? "option" : "symbol",
            symbol.Exch
          )) || "";

        let date = expiry[1];
        let month = expiry[2];
        let year = expiry[3];
        const formattedExpiry = `${date}-${month}-${year}`;

        const findExpiry = {
          label: formattedExpiry,
          value: formattedExpiry,
        };

        if (findExpiry && expirydataLtp) {
          await handleFilter(findExpiry, "expiry", symbol.Exch, expirydataLtp);
        }
      } else {
        // handleFilter(symbolFound, valueInIndex ? "option" : "symbol", symbol.Exch);
        isFuture.current = true;
      }

      // let prev = showPreviousOptions?.current;
      // registerSymbolForLiveData("unregister", prev, true);
      // registerSymbolForLiveData("register", [registerData], true);

      selectedScriptCode.current = symbol.Scripcode;
      isLastBid.current = true;
      gridRef?.current?.api.setRowData([]);
    }
  };

  useEffect(() => {
    if (selectedSymbol.length) {
      setIsSubscribeLTP(false);
      registerSymbolForLiveData("register", [selectedSymbol], true);
    }
  }, [selectedSymbol, isSubscribe]);

  const handleAtm = useCallback(
    async (scripcode, symbol, exchange) => {
      if (shares && shares?.[symbol]) {
        let ltp = shares?.[symbol]?.Price;
        setLtp(ltp || 0);
        selectedSharePrice.current = ltp;
        scrollToRowWithValue();
        return ltp;
      } else {
        let ltp = await getLTPService({
          scripcodes: [{ [exchange]: scripcode }],
        });
        if (ltp && ltp.length !== 0) {
          setLtp(ltp[0]?.ltp || 0);
          selectedSharePrice.current = ltp[0]?.ltp;
          scrollToRowWithValue();
        }
        return ltp[0]?.ltp;
      }
    },
    [atmScriptCode.current]
  );

  console.log("ExpiryDropdown", ExpiryDropdown.current)

  //changing options on strike price
  const handleFilter = async (
    { value },
    type,
    exch = "",
    expirydataLtp = ""
  ) => {
    isLastBid.current = false;
    isFuture.current = false;
    let currentStrikeRate_OptionsList = [];
    // setFilters({ ...filters, type: value });
    // filters.current = {...filters.current,[type]:value}
    gridRef?.current?.api?.setRowData([]);
    gridRefLastBid?.current?.api?.setRowData([]);
    switch (type) {
      case "option":
      case "symbol":
        filters.current = { symbol: value, strike: "", expiry: "" };
        if (type === "option") {
          selectedOption.current = { label: value, value };
          selectedSymbolVal.current = null;
        } else {
          selectedSymbolVal.current = { label: value, value };
          selectedOption.current = null;
        }
        setSelectedExpiryVal(null);
        setSelectedStrikeVal(null);
        setCurrentData({});
        setIsSubmitButtonDisabled((prev) => ({
          ...prev,
          cellValueClicked: true,
        }));
        let selectedExchange =
          exch === "MCX" ? "M" : exch === "BSE" ? "B" : "N";
        let optionExpiryList = await getOptionChainExpiry({
          exch: selectedExchange,
          exch_type: "D",
          full_name: value,
          cp_type: "CE",
        });
        if (exch) setExchange(exch);
        if (optionExpiryList) {
          let expiries = await optionExpiryList?.data.map((item) => {
            return {
              label: `${item.Expiry}(${item.Exch})`,
              value: `${item.Expiry}`,
            };
          });
          ExpiryDropdown.current = expiries;
        }
        let futureExpiryList = await getOptionChainExpiry({
          exch: selectedExchange,
          exch_type: "D",
          full_name: value,
          cp_type: "XX",
        });
        if (futureExpiryList) {
          setFutureExpiry(futureExpiryList.data[0]); //coming future expiry for the selected symbol
          return futureExpiryList.data[0];
        }
        break;
      case "expiry":
        filters.current = { ...filters.current, expiry: value, strike: "" };
        let ltpRecord = null;
        const stockExchange =
          ExchangeNameDerivatives[
          expirydataLtp ? expirydataLtp.Exch : futureExpiry?.Exch
          ] || "MCX";
        let scripCode = expirydataLtp
          ? expirydataLtp.Scripcode
          : futureExpiry?.Scripcode;

        if (!selectedOption.current) {
          let symbol =
            selectedSymbolVal.current?.value || filters.current?.symbol;
          //  let updateExchange =
          //     futureExpiry?.Exch === "NSE"
          //       ? "NSEFO"
          //       : futureExpiry?.Exch === "BSE"
          //       ? "BSEFO"
          //       : "MCX";

          setExchange(expirydataLtp ? expirydataLtp.Exch : futureExpiry?.Exch);
          ltpRecord = await handleAtm(scripCode, symbol, stockExchange);
          setLotSize(
            expirydataLtp ? expirydataLtp.LotSize : futureExpiry?.LotSize
          );
        } else {
          let symbolName =
            selectedSymbolVal.current?.value || filters.current?.symbol;
          ltpRecord = await handleAtm(
            scripCode,
            // atmScriptCode.current,
            symbolName,
            stockExchange
          );
        }

        if (ltpRecord) {
          let param = {
            name: selectedSymbolVal.current?.value || filters.current?.symbol,
            strikeRate: ltpRecord,
            expiry: Number(moment(value)?.format("YYYYMMDD")),
            exch: ExchangeShortName[stockExchange || exchange],
            exchType: "D",
            recordsLimit: recordsLimit,
            // recordsLimit: 60,
          };

          setGridRowdata([]);
          let fnOOptionChain = await getOptionChainData(param);
          let gridData = [];

          for (const item of fnOOptionChain) {
            //To insert only unique strike rate in grid
            const isStrikeRateExists = gridData.some(
              (strike) => strike.strikes === item.StrikeRate
            );

            if (!isStrikeRateExists) {
              gridData.push({
                id: item.StrikeRate,
                call_ltp: 0,
                call_oi: 0,
                strikes: item.StrikeRate,
                put_ltp: 0,
                put_oi: 0,
              });
            }
          }

          setGridRowdata(gridData);
          currentStrikeRate_OptionsList = fnOOptionChain;
          setSelectedExpiryVal({
            label: `${value} (${futureExpiry?.Exch || exchange})`,
            value: value,
          });
          setSelectedStrikeVal(null);
        }
        break;
    }
    let prev = showPreviousOptions?.current;
    showPreviousOptions.current = currentStrikeRate_OptionsList;
    if (
      currentStrikeRate_OptionsList &&
      (filters.current.symbol !== "" || filters.current.option !== "") &&
      filters.current.expiry !== ""
    ) {
      // let tempCurrentOptions = showCurrentOptions.current;

      showCurrentOptions.current = currentStrikeRate_OptionsList; //assingning new selected options
      // showPreviousOptions.current = tempCurrentOptions;
      //setExchange(currentStrikeRate_OptionsList[0]?.Exch);
      setOptDropdown(currentStrikeRate_OptionsList);

      // let prev = showPreviousOptions?.current;
      registerSymbolForLiveData("unregister", prev, true);
      registerSymbolForLiveData(
        "register",
        currentStrikeRate_OptionsList,
        true
      );
    }
  };

  const rowClassRules = useMemo(() => {
    return {
      // row style function
      "highlight-row": (params) => {
        return params.data.strikes === atmPrice;
      },
    };
  }, [atmPrice]);

  const getLtp = async (symbol, prev) => {
    if (symbol?.Scripcode) {
      let data = [
        {
          value: symbol.value,
          Scripcode: symbol.Scripcode,
          Exch: exchange,
          ExchType: "CASH",
        },
      ];
      registerSymbolForLiveData("register", data, true);
      registerSymbolForLiveData("unregister", prev, true);
    }
  };

  useEffect(() => {
    return () => {
      setPlaceOrderVisible(activeTabs);
    };
  }, []);

  const [isChecked, setChecked] = useState(false);

  const handleToggle = () => {
    setChecked(!isChecked);
  };

  const onCellValueChanged = (
    currentLtp,
    orderSide,
    boolean,
    optionSide,
    data,
    strikes
  ) => {
    let symbolInfo = showCurrentOptions.current.find(
      (sym) =>
        sym.StrikeRate === strikes &&
        sym.CPType === (optionSide === "PUT_LTP" ? "PE" : "CE")
    );
    gridRefLastBid?.current?.api.setRowData([]);
    if (symbolInfo) {
      setSelectedSymbol(symbolInfo?.label); //selected option symbol
      setLotSize(symbolInfo?.LotSize); // lot size of selected option
      setLTPData(currentLtp);
      setIsSelectedSymbolFlagData({});

      const selectedOptionData = {
        scripCode: symbolInfo?.Scripcode,
        symbol: symbolInfo?.label,
        strikeRate: symbolInfo?.StrikeRate,
        cpType: symbolInfo?.CPType,
        orderSide: orderSide,
        ltp: symbolInfo.CPType === "CE" ? data.call_ltp : data.put_ltp,
        lotSize: symbolInfo?.LotSize,
      };
      setCurrentData(selectedOptionData);
      setBuyData(orderSide);
      setLTPDataValue(optionSide);
      //setSelectFOItem(data);
      //setOptDropdown(symbolInfo);

      apiBodyDervatives.current = {
        ...apiBodyDervatives.current,
        sym: symbolInfo?.label,
        LotSize: symbolInfo?.LotSize,
        Scripcode: symbolInfo?.Scripcode,
        exch:
          symbolInfo?.Exch === "NSE"
            ? "NSEFO"
            : symbolInfo?.Exch === "BSE"
              ? "BSEFO"
              : "MCXFO",
      };

      //to make it sumbit button true if option selected
      setIsSubmitButtonDisabled((prev) => ({
        ...prev,
        cellValueClicked: false,
      }));
    }
  };

  // const modifiedData = {
  //   ...SelectFOItem,
  //   label:
  //     LTPDataValue === "Call_LTP"
  //       ? SelectFOItem.call_label
  //       : SelectFOItem.put_label,
  // };
  // delete modifiedData.call_label;

  // let SelectbasketData = [];
  // SelectbasketData.push(modifiedData);

  const toastText = useMemo(() => {
    if (isSubmitButtonDisabled.cellValueClicked) {
      return `Please select the stocks to continue.`;
    }
    const isSelectedClients =
      GroupData === "group"
        ? isSubmitButtonDisabled.addGroups
        : isSubmitButtonDisabled.addClients;

    if (isSelectedClients) {
      return `Please select the clients to continue.`;
    }
    return ``;
  }, [isSubmitButtonDisabled, GroupData]);

  const handleToaster = () => {
    if (toastText) toast.error(toastText);
  };

  const gridOptions = {
    getRowId: (params) => params.data.strikes, // Define how to get the unique row ID
  };

  useEffect(() => {
    return () => {
      setSelectedGroup(new Set(["Groups"]));
      setGroupInputList([]);
    };
  }, []);

  return (
    <>
      <SubmitModal
        submitVisible={submitVisible}
        setSubmitVisible={setSubmitVisible}
      />
      <div style={{ opacity: 0.99 }} className="w-full selltabs">
        {/* <Tabs aria-label="Options">
          <Tab key="cashandequity" title="CASH & EQUITY">
              <CashEquity />
          </Tab>

          <Tab key="fando" title="F&O">
          </Tab>
        </Tabs> */}
        <Navbar.Content activeColor="primary" hideIn="xs" variant="underline">
          {/* <Navbar.Link
            isActive={activeTabs}
            // href="#
            onClick={() => {
              setActiveTabs(!activeTabs);
              router.push("/cash&equity");
            }}
          >
            CASH & EQUITY
          </Navbar.Link> */}

          <Navbar.Link
            isActive={!activeTabs}
            // href="/options"
            onClick={() => {
              // closeHandler();
              router.push("/options");
              setActiveTabs(!activeTabs);
            }}
          >
            FUTURE & OPTION
          </Navbar.Link>
        </Navbar.Content>
      </div>
      <div style={{ top: "60px", position: "absolute", right: "0px" }}>
        <Row justify="center" align="center">
          <TopRightNavigationButton></TopRightNavigationButton>
        </Row>
      </div>
      <div style={{ background: "#Ffff", height: "calc(100vh - 80px)" }}>
        <Grid css={{ mt: "$", ml: "$13", width: "%", mr: "$13" }}>
          <div className="fo-wrap">
            <Row>
              <Col className="colspece">
                <Row css={{ padding: "20px 10px 0" }}>
                  <Col css={{ width: "350px" }}>
                    <div className="uppar-content">
                      <Text
                        h3
                        size={"$sm"}
                        css={{ fontWeight: "bold", fontFamily: "$sans" }}
                      >
                        {" "}
                        Select Symbol
                      </Text>
                    </div>
                    <div className="optionsSelect">
                      <CustomSelect
                        placeholder="Search Symbol"
                        onChange={async (selectedVal) => {
                          if (selectedVal) {
                            handleSymbolSelect(selectedVal);
                          }
                        }}
                        value={selectedSymbol}
                        exchangeType={"D"}
                        customStyles={customStyles}
                      />
                    </div>
                    {/* <Row>
                      <Text css={{ fontWeight: "bold", fontFamily: "$sans" }}>
                        {" "}
                        LTP : {(Ltp && Ltp?.toFixed(2)) || "-"}
                      </Text>
                    </Row> */}
                  </Col>

                  <Spacer x={1} />

                  <Col css={{ width: "400px" }}>
                    <div className="c-tabs">
                      <ul>
                        <li>
                          <a
                            className={`${GroupData === "client" ? `primary-button` : ``
                              } border-radius-8 active`}
                            href="#"
                            onClick={() => handleGroupData("client")}
                          // style={
                          //   GroupData === "client"
                          //     ? { background: "#4680c2", color: "white" }
                          //     : {}
                          // }
                          >
                            Clients
                          </a>
                        </li>
                        <li>
                          <a
                            className={`${GroupData === "group" ? `primary-button` : ``
                              } border-radius-8`}
                            href="#"
                            onClick={() => handleGroupData("group")}
                          // style={
                          //   GroupData === "group"
                          //     ? { background: "#4680c2", color: "white" }
                          //     : {}
                          // }
                          >
                            Groups
                          </a>
                        </li>
                      </ul>
                    </div>
                    {GroupData === "client" ? (
                      <Row style={{ width: "100%" }} className="clients-choose">
                        <Multiselect
                          className="optionsClients"
                          isObject={true}
                          // label={""}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(item) => {
                            const selectedValuesIds = item.map(
                              (item) => item.value
                            );
                            apiBodyDervatives.current = {
                              ...apiBodyDervatives.current,
                              clients: selectedValuesIds,
                            };
                            setSelectedClients(item);
                          }}
                          onSearch={function noRefCheck() { }}
                          selectedValues={selectedClients}
                          onSelect={(item) => {
                            const selectedValuesIds = item.map(
                              (item) => item.value
                            );
                            apiBodyDervatives.current = {
                              ...apiBodyDervatives.current,
                              clients: selectedValuesIds,
                            };
                            setSelectedClients(item);
                          }}
                          //replace this with list of available symbols api
                          // options={filteredOptions}
                          options={clientsOptionsData}
                          placeholder="Select Clients"
                          maxSelectedValues={3}
                          displayValue="label"
                          selectedValueDecorator={(selected, _options) => {
                            return _options?.value;
                          }}
                        ></Multiselect>

                        <Button
                          className="primary-button border-radius-8"
                          auto
                          style={{ marginLeft: "10px", padding: "0 20px" }}
                          onPress={addClientsHandler}
                          icon={
                            <IconPlus
                              type="button"
                              height={30}
                              width={30}
                              color={"#fff"}
                              strokeWidth={2}
                            />
                          }
                        ></Button>
                      </Row>
                    ) : (
                      <Row
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        <Col>
                          <Multiselect
                            className="groupDropDown-fno"
                            style={{ width: "12rem" }}
                            isObject={false}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={function noRefCheck() { }}
                            onSearch={function noRefCheck() { }}
                            selectedValues={selectedGroup}
                            singleSelect={true}
                            onSelect={(item) => {
                              setSelectedGroup(item);
                            }}
                            options={Object?.keys(group_Clients)}
                            placeholder="Select Group"
                          ></Multiselect>
                        </Col>
                        <Col
                          style={{
                            transform: "translate(25px, 0px)",
                            marginLeft: "-15px",
                          }}
                        >
                          <Input
                            placeholder="No. of Lots"
                            onChange={(event) => {
                              apiBody.current = {
                                ...apiBody.current,
                                qty: Number(event.target.value),
                              };
                              setQty(apiBody.current.qty);
                            }}
                          />
                        </Col>
                        <Col style={{ marginLeft: "-40px" }}>
                          <Button
                            className={`${qty <= 0 ? `` : `primary-button`
                              } border-radius-8`}
                            auto
                            disabled={qty <= 0}
                            onPress={() => {
                              addClientsOptions();
                            }}
                            style={{ transform: "translate(75px, 0px)" }}
                          >
                            Add
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </Col>
                </Row>
                {GroupData === "client" ? (
                  <Row>
                    <ClientTable
                      lotSize={lotSize}
                      clientTableData={clientTableData}
                      Ltp={Ltp}
                      currentData={currentData}
                      setClientTableData={setClientTableData}
                      LTPPrice={(Ltp && Number(Ltp)?.toFixed(2)) || 0}
                    />
                  </Row>
                ) : (
                  <OrderInputGroups
                    lotSize={lotSize}
                    Ltp={Ltp}
                    currentData={currentData}
                    groupInputList={groupInputList}
                    setGroupInputList={setGroupInputList}
                  />
                )}
                <span className="op-chain" style={{ float: "left" }}>
                  Option Chain
                </span>
                <span className="op-chain" style={{ float: "right" }}>
                  LTP : {(Ltp && Number(Ltp)?.toFixed(2)) || "-"}
                </span>
                <Row className="options-contracts">
                  <div className="seclect-options">
                    <Col css={{ width: "200px" }}>
                      <Text h5 size={"$sm"} css={{ fontFamily: "$sans" }}>
                        Select Index
                      </Text>
                      <div className="optionsSelect">
                        <Select
                          placeholder="Select Index"
                          maxMenuHeight={170}
                          onChange={(selectedVal) => {
                            if (selectedVal) {
                              atmScriptCode.current = selectedVal.Scripcode;
                              setExchange(selectedVal.exch);
                              setSelectedSymbol([]);
                              setIsSelectedSymbolFlagData({});
                              handleFilter(
                                selectedVal,
                                "option",
                                selectedVal.exch
                              );
                            }
                          }}
                          value={selectedOption.current}
                          options={
                            optionIndexesDropdown?.current.length
                              ? optionIndexesDropdown?.current
                              : indexes
                          }
                        />
                      </div>
                    </Col>
                    <div className="option-or">OR</div>

                    {/* <Spacer x={1} /> */}
                    <Col css={{ width: "200px" }}>
                      <Text h5 size={"$sm"} css={{ fontFamily: "$sans" }}>
                        Select Symbol
                      </Text>
                      <div className="optionsSelect">
                        <CustomSelect
                          placeholder="Search Symbol"
                          onChange={async (selectedVal) => {
                            if (selectedVal) {
                              const { label, Exch } = selectedVal;
                              const symbolObj = {
                                label: label,
                                value: label,
                              };
                              setSelectedSymbol([]);
                              setIsSelectedSymbolFlagData({});
                              handleFilter(symbolObj, "symbol", Exch);
                            }
                          }}
                          value={selectedSymbolVal.current}
                          exchangeType={"D"}
                          groupBySymbolName={true}
                          customStyles={customStyles}
                        />
                      </div>
                    </Col>
                    <Spacer x={4} />
                    <Col css={{ width: "200px" }}>
                      <Text h5 size={"$sm"} css={{ fontFamily: "$sans" }}>
                        Expiry Date
                      </Text>
                      <div className="optionsSelect">
                        <Select
                          placeholder="Expiry Date"
                          maxMenuHeight={170}
                          options={ExpiryDropdown.current}
                          value={selectedExpiryVal}
                          onChange={(selectedVal) => {
                            setSelectedSymbol([]);
                            setIsSelectedSymbolFlagData({});
                            setCurrentData((prev) => ({ ...prev, ltp: 0 }));
                            if (
                              selectedExpiryVal &&
                              selectedExpiryVal?.value === selectedVal?.value
                            )
                              return;

                            handleFilter(selectedVal, "expiry");
                          }}
                        />
                      </div>
                    </Col>
                  </div>
                </Row>
                <div className="data-table">
                  <Row>
                    <Col css={{ width: "100%" }}>
                      <div
                        className="ag-theme-balham"
                        style={{ height: "51vh" }}
                      >
                        <AgGridReact
                          ref={gridRef}
                          rowData={gridRowdata}
                          columnDefs={OptionsColumns({
                            onCellValueChanged: onCellValueChanged,
                          })}
                          enableCellChangeFlash={true}
                          onGridReady={(params) => params.api.setRowData([])}
                          overlayNoRowsTemplate="NO DATA FOUND"
                          rowClassRules={rowClassRules}
                          gridOptions={gridOptions}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Spacer x={0.5} />

              {/* secont column */}
              <Col css={{ width: "55%" }}>
                <Row css={{ width: "100%" }} className="history">
                  <Col className="history-space">
                    <Text
                      className="primary-text-color"
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                    >
                      Last 5 bid/ Ask history{" "}
                      {/* {`(${selectedSymbol[0] ? selectedSymbol[0]?.label : ""})`} */}
                      {LTPDataValue === "Call_LTP"
                        ? currentData?.call_label
                        : currentData?.put_label}
                      <Text
                        h5
                        size={"$md"}
                        style={{
                          fontFamily: "$sans",
                          display: "inline",
                          float: "right",
                          paddingRight: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatSymbolWithPrice(currentData?.symbol)} LTP:{" "}
                        {currentData?.ltp}
                      </Text>
                    </Text>

                    <div
                      className="ag-theme-balham"
                      style={{
                        height: "175px",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <AgGridReact
                        ref={gridRefLastBid}
                        onGridReady={(params) => params.api.setRowData([])}
                        columnDefs={columns}
                        suppressHorizontalScroll={true}
                        overlayNoRowsTemplate="NO DATA FOUND"
                      ></AgGridReact>
                    </div>
                  </Col>
                </Row>

                <Col
                  className="Order-Details"
                  style={{
                    backgroundColor: BuyData === "Sell" ? "#FFF6F6" : "#F1FBF6",
                  }}
                >
                  <div h3>
                    {/* Order Details{" "} */}
                    <span className="op-chain">
                      Lot Size : {currentData?.lotSize || "-"}, LTP:{" "}
                      {currentData?.ltp || "-"}
                    </span>
                  </div>

                  <Row>
                    <Col>
                      <Text
                        h4
                        size={"$md"}
                        css={{ fontFamily: "$sans", paddingLeft: "10px" }}
                        style={{ color: BuyData !== "Buy" ? "red" : "green" }}
                      >
                        {LTPDataValue === "Call_LTP"
                          ? currentData?.call_label
                          : currentData?.put_label}
                      </Text>
                    </Col>
                  </Row>
                  <Row
                    justify="space-between"
                    css={{ mt: "$5", padding: "0 0 0 5px", display: "none" }}
                  >
                    <Row css={{ width: "fit-content", display: "none" }}>
                      <Col style={{ display: "flex" }} className="lot">
                        <Text
                          h5
                          size={"$md"}
                          css={{
                            mt: "$2",
                            pl: "$5",
                            fontWeight: "bold",
                            fontFamily: "$sans",
                            width: "100px",
                          }}
                        >
                          Quantity
                        </Text>

                        <Input
                          bordered
                          borderWeight="light"
                          onChange={handleQTY}
                          type="number"
                          css={{ width: "40%" }}
                        />
                      </Col>
                    </Row>

                    <Col css={{ display: "flex", display: "none" }}>
                      <Text
                        h4
                        size={"$lg"}
                        css={{
                          pl: "$5",
                          fontFamily: "$sans",
                          width: "70px",
                          margin: "5px 0",
                        }}
                        className="radio-head"
                      >
                        Total: {qty * lotSize}
                      </Text>

                      <Radio.Group
                        css={{ pr: "$" }}
                        value={exchange}
                        orientation="horizontal"
                        color="secondary"
                        onChange={setExchange}
                      >
                        <Row
                          css={{
                            mt: "-$3",
                            width: "fit-content",
                          }}
                        >
                          <Col
                            css={{
                              mr: "$9",
                              display: "flex",
                              padding: "5px 0 0 5px",
                            }}
                          >
                            <Radio value="NSE" className="btradio">
                              <Text
                                size={"$md"}
                                css={{ mt: "$.5", fontFamily: "$sans" }}
                              >
                                NSE
                              </Text>
                            </Radio>
                            <Radio
                              value="BSE"
                              css={{ pr: "$8" }}
                              className="btradio"
                            >
                              <Text
                                size={"$md"}
                                css={{ mt: "$.5", fontFamily: "$sans" }}
                              >
                                BSE
                              </Text>
                            </Radio>
                          </Col>
                        </Row>
                      </Radio.Group>
                    </Col>
                  </Row>

                  <Text
                    h4
                    size={"$lg"}
                    css={{ pl: "$5", fontFamily: "$sans", mt: "$5" }}
                    className="radio-head"
                  >
                    Order Side
                  </Text>

                  <Radio.Group
                    css={{ mr: "$4" }}
                    value={BuyData}
                    orientation="horizontal"
                    color="secondary"
                    onChange={(val) => {
                      setBuyData(val);
                    }}
                  >
                    <Row
                      css={{
                        mt: "$2",
                        width: "fit-content",
                      }}
                    >
                      <Col
                        className="radio-col"
                        css={{
                          mr: "$9",
                          display: "flex",
                          padding: "5px 0 0 5px",
                        }}
                      >
                        <Radio size={"sm"} value="Buy" className="btradio">
                          <Text
                            h5
                            size={"$sm"}
                            css={{ fontFamily: "$sans", mt: "$5" }}
                          >
                            Buy
                          </Text>
                        </Radio>
                        <Radio size={"sm"} value="Sell" className="btradio">
                          <Text
                            h5
                            size={"$sm"}
                            css={{ fontFamily: "$sans", mt: "$5" }}
                          >
                            Sell
                          </Text>
                        </Radio>
                      </Col>
                    </Row>
                  </Radio.Group>

                  <Row
                    css={{
                      mt: "$",
                      ml: "-$5",
                      pl: "$7",
                      flexDirection: "column",
                    }}
                  >
                    <Text
                      h4
                      size={"$lg"}
                      css={{ pl: "$5", fontFamily: "$sans" }}
                      className="radio-head"
                    >
                      Type
                    </Text>
                    {/* <Spacer x={0.5} /> */}

                    <Radio.Group
                      css={{ mr: "$4" }}
                      value={deliveryType}
                      orientation="horizontal"
                      color="secondary"
                      onChange={(val) => {
                        setDeliveryType(val);
                        // setCheckValid(!checkValid);
                      }}
                    >
                      <Row
                        css={{
                          mt: "$2",
                          width: "fit-content",
                        }}
                      >
                        <Col
                          className="radio-col"
                          css={{
                            mr: "$9",
                            display: "flex",
                            padding: "5px 0 0 5px",
                          }}
                        >
                          <Radio size={"sm"} value="MKT" className="btradio">
                            <Text
                              h5
                              size={"$sm"}
                              css={{ fontFamily: "$sans", mt: "$5" }}
                            >
                              MKT
                            </Text>
                          </Radio>
                          {/* <Spacer y={-0.2} /> */}
                          <Radio size={"sm"} value="LIMIT" className="btradio">
                            <Text
                              h5
                              size={"$sm"}
                              css={{ fontFamily: "$sans", mt: "$5" }}
                            >
                              LIMIT
                            </Text>
                          </Radio>

                          <Radio size={"sm"} value="SLL" className="btradio">
                            <Text
                              h5
                              size={"$sm"}
                              css={{ fontFamily: "$sans", mt: "$5" }}
                            >
                              SLL
                            </Text>
                          </Radio>
                        </Col>
                        {/* <Col css={{ mr: "$9",display: 'flex',padding:'5px 0 0 5px' }}>
                      <Radio size={"sm"} value="SM">
                        <Text
                          h4
                          size={"$sm"}
                          css={{ fontFamily: "$sans", mt: "$4" }}
                        >
                          SLM
                        </Text>
                      </Radio>
                      <Spacer y={-0.2} />
                     
                    </Col> */}
                      </Row>
                    </Radio.Group>

                    <Text
                      h4
                      size={"$lg"}
                      css={{ pl: "$5", fontFamily: "$sans", mt: "$5" }}
                      className="radio-head"
                    >
                      Product
                    </Text>
                    {/* <Spacer x={0.5} /> */}

                    <Radio.Group
                      css={{ mr: "$4" }}
                      value={product}
                      orientation="horizontal"
                      color="secondary"
                      onChange={(val) => {
                        setProduct(val);
                        // setCheckValid(!checkValid);
                      }}
                    >
                      <Row
                        css={{
                          mt: "$2",
                          width: "fit-content",
                        }}
                      >
                        <Col
                          className="radio-col"
                          css={{
                            mr: "$9",
                            display: "flex",
                            padding: "5px 0 0 5px",
                          }}
                        >
                          <Radio size={"sm"} value="NRML" className="btradio">
                            <Text
                              h5
                              size={"$sm"}
                              css={{ fontFamily: "$sans", mt: "$5" }}
                            >
                              NORMAL
                            </Text>
                          </Radio>
                          <Radio size={"sm"} value="MIS" className="btradio">
                            <Text
                              h5
                              size={"$sm"}
                              css={{ fontFamily: "$sans", mt: "$5" }}
                            >
                              INTRADAY
                            </Text>
                          </Radio>
                        </Col>
                      </Row>
                    </Radio.Group>

                    <Spacer x={4.8} />

                    <div className="price-input">
                      <Row justify="left" css={{ pl: "$6" }}>
                        <Col>
                          <Text
                            color="#2C2C2C"
                            size={"$m"}
                            css={{
                              fontFamily: "$sans",
                              width: "80px",
                              margin: "5px 0 0 0",
                            }}
                            h4
                          >
                            Limit Price
                          </Text>
                        </Col>
                        <Input
                          css={{ pl: "$", width: "70px" }}
                          shadow={false}
                          placeholder="0.00"
                          type="number"
                          disabled={
                            deliveryType === "MKT" || deliveryType === "SM"
                          }
                          onKeyDown={blockInvalidChar}
                          onChange={({ target: { value } }) => {
                            setInputApi("price", "number", value);
                          }}
                        />
                      </Row>

                      <Spacer x={-0.1} />
                      <Row
                        justify=""
                        css={{ pl: "$10" }}
                        className="Trigger-Price"
                      >
                        <Col>
                          <Text
                            color="#2C2C2C"
                            size={"$md"}
                            css={{
                              fontFamily: "$sans",
                              width: "85px",
                              margin: "5px 0 0 0",
                            }}
                            h4
                          >
                            Trigger Price
                          </Text>
                        </Col>
                        <Input
                          css={{ pl: "$25", width: "70px" }}
                          shadow={false}
                          placeholder="0.00"
                          type="number"
                          disabled={
                            deliveryType === "MKT" ||
                            deliveryType === "Lim" ||
                            deliveryType === "LIMIT"
                          }
                          onKeyDown={blockInvalidChar}
                          onChange={({ target: { value } }) => {
                            setInputApi("sl_price", "number", value);
                          }}
                        />
                      </Row>
                    </div>
                    <Row justify="flex-start" css={{ pl: "$6" }}>
                      <Text
                        color="#2C2C2C"
                        size={"$md"}
                        css={{
                          fontFamily: "$sans",
                          margin: "5px 0 0 0",
                        }}
                        h4
                      >
                        Overnight Stop Loss
                      </Text>
                      <Spacer x={1.0} />
                      <Switch
                        checked={isChecked}
                        onChange={handleToggle}
                        style={{
                          height: "20px",
                          marginTop: "5px",
                        }}
                        disabled={true}
                      />
                    </Row>
                  </Row>

                  <Row justify="space-between" className="buttn-space"></Row>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      className="secondary-button border-radius-8"
                      auto
                      flat
                      style={{ padding: "0px 35px" }}
                      onClick={() => {
                        router.push("/equity");
                      }}
                    >
                      Cancel
                    </Button>{" "}
                    <button
                      className={
                        BuyData === "Buy"
                          ? "BuyItem"
                          : BuyData === "Sell"
                            ? "SellItem"
                            : "BuyItem"
                      }
                      onClick={() => {
                        const isSubmit =
                          isSubmitButtonDisabled.cellValueClicked ||
                          (GroupData === "group"
                            ? isSubmitButtonDisabled.addGroups
                            : isSubmitButtonDisabled.addClients);
                        if (isSubmit) {
                          handleToaster();
                        } else {
                          handleModelOpen();
                        }
                      }}
                    // disabled={
                    //   isSubmitButtonDisabled.cellValueClicked ||
                    //   (GroupData === "group"
                    //     ? isSubmitButtonDisabled.addGroups
                    //     : isSubmitButtonDisabled.addClients)
                    // }
                    >
                      Place Order
                    </button>
                  </div>
                </Col>
              </Col>

              {/* main row */}
            </Row>
          </div>
        </Grid>
        <SubmitOptionModel
          modelOption={modelOption}
          processRef={processRef}
          setModelOption={setModelOption}
          dataItem={apiBodyDervatives.current}
          bankdata={
            LTPDataValue === "Call_LTP"
              ? currentData?.call_label
              : currentData?.put_label
          }
          BuyData={BuyData}
          ProductType={product}
          handleSubmit={handleSubmit}
        />
      </div>
    </>
  );
}
