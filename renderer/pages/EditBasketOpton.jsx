import React, { useCallback, useState, useMemo } from "react";
import {
  Text,
  Row,
  Col,
  Grid,
  Navbar,
  Spacer,
  Radio,
  Button,
  Input,
} from "@nextui-org/react";
import electron from "electron";
import { useGlobalContext } from "../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import { BasketOptionsColumns } from "../component/options/BasketColumnDefs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useRef } from "react";
import { useEffect } from "react";
import SubmitModal from "../component/options/submitModal";
import { useRouter } from "next/router";
import {
  getLTPService,
  getOptionChainData,
  getOptionChainExpiry,
} from "../../services/transactions/transactions.service";
import { placeOrder_api } from "../../main/logic/clientAPI";
import BasketAddToCartModel from "../component/options/BasketAddtocartModel";
import classes from "../component/options/BasketModel.module.css";

import {
  BasketFOOrder,
  BasketDetail,
} from "../../services/transactions/transactions.service";

import {
  EditBasketData,
  DeleteBasketData,
} from "../../services/transactions/transactions.service";
import { blockInvalidCharFnoBasket } from "../component/dashboard/watchlist/order/orderComponents/blockInputChars";
import {
  ExchangeNameDerivatives,
  ExchangeShortName,
  warnMessage,
} from "../constant/constant";
import moment from "moment";
import CustomSelect from "../layout/customSelect";
import { numberFormatter } from "../helpers";
import { formatSymbolWithPrice } from "../component/dashboard/dashboardTables/helpers";

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: "270px",
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "16px",
  }),
};

export default function EditBasketOptions() {
  const [activeTabs, setActiveTabs] = useState(false); //active fno
  const [optDropdown, setOptDropdown] = useState([]);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [lotSize, setLotSize] = useState(0);
  const [Ltp, setLtp] = useState(0);
  const atmScriptCode = useRef();
  const [clientTableData, setClientTableData] = useState(null);
  const isLastBid = useRef(false);
  const selectedScriptCode = useRef();
  const selectedOption = useRef(null);
  const selectedSymbolVal = useRef(null);
  const [selectedStrikeVal, setSelectedStrikeVal] = useState(null);
  const [selectedExpiryVal, setSelectedExpiryVal] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState([]);
  const [futureExpiry, setFutureExpiry] = useState({});
  const [exchange, setExchange] = useState("NSE");
  const [LotSizeData, setLotSizeData] = useState("");
  const [spreadData, setSpreadData] = useState({
    netCredit: "",
  });
  const filters = useRef({
    symbol: "",
    strike: "",
    expiry: "",
  });
  const router = useRouter();
  const [liveCalls, setLiveCalls] = useState([]);
  const [livePuts, setLivePuts] = useState([]);
  const [liveStrikePrice, setLiveStrikePrice] = useState([]);
  const selectedSharePrice = useRef();
  const [atmPrice, setATMPrice] = useState();
  const [basketBuy, setBasketBuy] = useState(false);
  const [cartModel, serCartModel] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [BuyData, setBuyData] = useState("");
  const [gridRowdata, setGridRowdata] = useState([]);

  const showCurrentOptions = useRef([]);
  const showPreviousOptions = useRef([]);
  const gridRef = useRef();
  const gridRefLastBid = useRef();
  const isFuture = useRef(false);

  const containerRef = useRef();

  const { data } = router.query;

  // Parse the 'data' string back to an object
  const parsedData = data ? JSON.parse(data) : null;

  // Log the parsed data to the console

  const [basketStock, setBasketStock] = useState(
    parsedData?.basket_stock || []
  );

  const [InputData, setInputData] = useState(parsedData?.name);
  const [LTPDataValue, setLTPDataValue] = useState("");
  const [LTPItem, setLTPItem] = useState("");
  const [StrikesData, setStrikesData] = useState("");
  const [basketId, setbasketId] = useState("");
  const [InputId, setInputId] = useState("");
  const [orderType, setOrderType] = useState(
    parsedData?.is_spread_limit_set ? "LIMIT" : "MKT"
  );
  const [limitPrice, setLimitPrice] = useState(
    parsedData?.spread_limit ? parsedData?.spread_limit : 0
  );
  const [lotInput, setLotInput] = useState([]);

  const [deleteData, setDeleteData] = useState("");
  const [InstanceLtp, setInstanceLtp] = useState("");
  const {
    symbolNamesFutures,
    symbolNamesOptions,
    getClientsIds,
    StrikeRateDropDown,
    ExpiryDropdown, //expiry dropdown
    optionSymbolsDropdown, //indexes dropdown
    optionIndexesDropdown, //select symbol dropdown
    setPlaceOrderVisible,
    liveDataProcess,
    liveDataProcessIIFLSMC,
    currentSocketBroker,
    symbolNamesNSE,
    setLTPData,
    setbasketData,
    basketData,
    addToCart,
    setAddToCart,
    registerSymbolForLiveData,
    shares,
    recordsLimit,
  } = useGlobalContext();

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

  //variable to store the clicked column
  let clickedColumn = null;
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

  const handleLtpData = async () => {
    const extractedScripcodes =
      basketStock.length > 0
        ? basketStock?.map((item) => ({
          [item.item_exchange]: +item.item_scrip_code,
        }))
        : "";

    const payloadLtp = {
      scripcodes: extractedScripcodes,
    };
    try {
      const resLtp = await getLTPService(payloadLtp);
      if (resLtp?.length) {
        const ltpMap = new Map(
          resLtp.map((elem) => [elem.scripcode, elem.ltp])
        );

        setAddToCart((prev) =>
          prev.map((item) =>
            ltpMap.has(item.scripCode)
              ? { ...item, ltp: ltpMap.get(item.scripCode) }
              : item
          )
        );
      }
      setInstanceLtp(resLtp);
    } catch (error) {
      console.log("error ltp api", error);
    }
  };

  useEffect(() => {
    handleLtpData();

    if (!parsedData) return;

    setOrderType(parsedData?.is_spread_limit_set ? "LIMIT" : "MKT");
    setLimitPrice(parsedData?.spread_limit);
    setLotInput(
      parsedData?.basket_stock?.map((item) => {
        return item?.item_lot_quantity;
      })
    );
    setAddToCart(
      parsedData?.basket_stock.map(
        ({
          item_symbol,
          item_scrip_code,
          item_order_side,
          item_lot_size,
          ...rest
        }) =>
        ({
          ...rest,
          symbol: item_symbol,
          orderSide: item_order_side,
          scripCode: item_scrip_code,
          lotSize: item_lot_size,
        } || [])
      )
    );
  }, []);

  const handleEditBasket = async (id, value) => {
    const Editbasketitem = {
      item_lot_quantity: +value || 1,
    };
    try {
      const res = await EditBasketData(id, Editbasketitem);
      // toast.success(res?.message);
      // if (res.length > 0) {
      //   setInstanceData(res);
      // } else {
      //   return;
      // }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBasket = async (id) => {
    // const Editbasketitem = {
    //   item_lot_size: value,
    // };
    try {
      const res = await DeleteBasketData(id);
      if (res && res.success) {
        const updatedBasketStock = basketStock.filter((item) => item.id !== id);
        setBasketStock(updatedBasketStock);
        // setDeleteData(res.message);
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (deleteData === "Delete successfully") {
      // handleDeleteBasket();
    }
  }, [deleteData]);

  //This function is use to get Net Credit amount
  function calculateNetCredit(data) {
    // Process the array in a single reduce loop
    const { totalPaidPremium, totalReceivedPremium } = data.reduce(
      (totals, item, index) => {
        const premium = parseFloat(item.ltp) * item.lotSize * +lotInput[index];
        if (item.orderSide === "Buy") {
          totals.totalPaidPremium += premium; // Add to Buy trades
        } else if (item.orderSide === "Sell") {
          totals.totalReceivedPremium += premium; // Add to Sell trades
        }
        return totals;
      },
      { totalPaidPremium: 0, totalReceivedPremium: 0 } // Initial values
    );

    // Calculate net credit (or debit)
    const netCredit = totalReceivedPremium - totalPaidPremium;

    return {
      netCredit,
    };
  }

  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
    let result = calculateNetCredit(addToCart);
    setSpreadData(result);
  }, [addToCart, lotInput]);

  // // Function to scroll to the row with value 6
  // const scrollToRowWithValue = () => {
  //   if (gridRef.current) {
  //     const rowData = [];
  //     gridRef?.current?.api?.forEachNode(({ data }) => rowData.push(data));
  //     if (rowData.length !== 0) {
  //       const rowIndex = findRowIndexWithValue(rowData);
  //       if (rowIndex !== -1 && gridRef.current) {
  //         gridRef.current.api.ensureIndexVisible(rowIndex - 5, "top");
  //       }
  //     } else {
  //       setTimeout(() => scrollToRowWithValue(), 500);
  //     }
  //   }
  // };

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
        } else {
          setTimeout(() => scrollToRowWithValue(), 500);
        }
      }
    }, 500);
  };

  //filter,sort and set live data
  // const handleLiveData = (msg, broker) => {
  //   if (msg.type == "DERIVATIVES") {
  //     let mockOptions = msg.data;
  //     let calls = [];
  //     let puts = [];
  //     let strikeRates = [];
  //     let strikeRateArr = [];
  //     let currentOptionsArr = showCurrentOptions.current.map(
  //       (sym) => sym.label
  //     );
  //     let names = Object.keys(mockOptions);
  //     try {
  //       names.forEach((name) => {
  //         let arr = name.split(" ");
  //         let symbolName = arr[0];
  //         let strikePrice = arr[arr.length - 1];
  //         strikePrice = parseFloat(strikePrice);
  //         let callOrPut = arr[arr.length - 2];
  //         let expiry = arr.splice(1, 3).join(" ");
  //         let ltp = mockOptions[name]["Price"];
  //         let volume = mockOptions[name]["volume"];
  //         let oi = mockOptions[name]["oi"];
  //         let Scripcode = 0;
  //         let LotSize = 0;
  //         let Exch = "";
  //         let condition = currentOptionsArr.includes(name);

  //         if (condition) {
  //           let optionSymbol = showCurrentOptions.current.find(
  //             (sym) => sym.label === name
  //           );

  //           LotSize = optionSymbol.LotSize;
  //           Scripcode = optionSymbol.Scripcode;
  //           Exch = optionSymbol.Exch;
  //         }
  //         if (callOrPut == "CE" && condition) {
  //           calls.push({
  //             label: name,
  //             strikePrice: strikePrice,
  //             LTP: ltp,
  //             Scripcode: Scripcode,
  //             LotSize: LotSize,
  //             Exch: Exch,
  //             // volume: volume ?? 0,
  //             oi: oi ?? 0,
  //           });
  //         }
  //         if (callOrPut == "PE" && condition) {
  //           puts.push({
  //             label: name,
  //             strikePrice: strikePrice,
  //             LTP: ltp,
  //             Scripcode: Scripcode,
  //             LotSize: LotSize,
  //             Exch: Exch,
  //             // volume: volume ?? 0,
  //             oi: oi ?? 0,
  //           });
  //         }
  //         if (!strikeRateArr.includes(strikePrice) && condition) {
  //           strikeRateArr.push(strikePrice);
  //           strikeRates.push({ label: strikePrice });
  //         }
  //       });
  //     } catch (e) {}
  //     calls = calls.sort((a, b) => a.strikePrice - b.strikePrice);
  //     puts = puts.sort((a, b) => a.strikePrice - b.strikePrice);
  //     strikeRates = strikeRates.sort((a, b) => a.label - b.label);

  //     const gridData = [];
  //     gridRef?.current?.api?.forEachNode(({ data }) => gridData.push(data));

  //     let addData = [];
  //     let updateData = [];
  //     calls.map((call, idx) => {
  //       const findIndex = gridData.findIndex(
  //         ({ call_Scripcode }) => call.Scripcode === call_Scripcode
  //       );
  //       if (findIndex === -1) {
  //         addData.push({
  //           call_label: call.label,
  //           strikes: call.strikePrice,
  //           call_ltp: call.LTP,
  //           call_Scripcode: call.Scripcode,
  //           call_LotSize: call.LotSize,
  //           // call_volume: call.volume,
  //           call_oi: call.oi,
  //           Exch: call.Exch,
  //           put_label: puts[idx]?.["label"],
  //           put_ltp: puts[idx]?.["LTP"],
  //           put_Scripcode: puts[idx]?.["Scripcode"],
  //           put_LotSize: puts[idx]?.["LotSize"],
  //           // put_volume: puts[idx]?.["volume"],
  //           put_oi: puts[idx]?.["oi"],
  //         });
  //       } else {
  //         const data = gridData[findIndex];
  //         data["call_label"] = call.label;
  //         data["strikes"] = call.strikePrice;
  //         data["call_ltp"] = call.LTP;
  //         data["call_Scripcode"] = call.Scripcode;
  //         data["call_LotSize"] = call.LotSize;
  //         // data["call_volume"] = call.volume;
  //         data["call_oi"] = call.oi;
  //         data["Exch"] = call.Exch;
  //         data["put_label"] = puts[idx]?.["label"];
  //         data["put_ltp"] = puts[idx]?.["LTP"];
  //         data["put_Scripcode"] = puts[idx]?.["Scripcode"];
  //         data["put_LotSize"] = puts[idx]?.["LotSize"];
  //         // data["put_volume"] = puts[idx]?.["volume"];
  //         data["put_oi"] = puts[idx]?.["oi"];
  //         updateData.push(data);
  //       }
  //     });
  //     if (isFuture.current) {
  //       gridRef?.current?.api.setRowData([]);
  //     } else {
  //       if (updateData.length !== 0) {
  //         gridRef?.current?.api?.applyTransaction({
  //           update: updateData,
  //         });
  //       }
  //       if (addData.length !== 0) {
  //         gridRef?.current?.api?.applyTransaction({
  //           add: addData,
  //         });
  //       }
  //     }
  //     setLiveCalls(calls);
  //     setLivePuts(puts);
  //     setLiveStrikePrice(strikeRates);
  //   }
  //   if (msg.type === "BidAsk") {
  //     if (isLastBid.current) {
  //       let filteredData = [];
  //       if (broker === "MOSWAL") {
  //         let sno = 1;
  //         msg.data?.map((item) => {
  //           if (item.ScripCode === selectedScriptCode.current) {
  //             sno = sno + 1;
  //             filteredData.push({ ...item, sno: sno + 1 });
  //           }
  //         });
  //       } else {
  //         filteredData = msg.data;
  //       }
  //       gridRefLastBid?.current?.api.setRowData(filteredData);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   getClientsIds();
  //   setOptDropdown([{ label: "Select Symbol", value: "Select Symbol" }]);
  //   if (currentSocketBroker === "MOSWAL") {
  //     liveDataProcess.on("message", (msg) => {
  //       if (msg.type === "LTP") {
  //         if (selectedSymbolVal.current || selectedOption.current)
  //           handleLTP(msg);
  //       }
  //       handleLiveData(msg, currentSocketBroker);
  //     });
  //   } else if (currentSocketBroker === "IIFL" || currentSocketBroker === "SMC")
  //     liveDataProcessIIFLSMC.on("message", (msg) => {
  //       if (msg.type === "LTP") {
  //         if (selectedSymbolVal.current || selectedOption.current)
  //           handleLTP(msg);
  //       }
  //       handleLiveData(msg, currentSocketBroker);
  //     });
  // }, [currentSocketBroker, selectedSymbolVal.current, selectedOption.current]);

  //filter,sort and set live data
  //To fill up the option chain grid
  const handleLiveData = (msg) => {
    if (msg.type === "LIVE_DATA") {
      const tickdata = msg.data;
      let symbolInfo = showCurrentOptions.current.find(
        (sym) => sym.Scripcode === tickdata.ScripCode
      );
      if (symbolInfo) {
        if (tickdata.Type === "LTP") {
          let rowNode = gridRef?.current?.api?.getRowNode(
            symbolInfo.StrikeRate
          );
          // Update the specific field with the new value
          if (rowNode) {
            if (symbolInfo.CPType === "CE") {
              rowNode.setDataValue("call_oi", tickdata.LTP_Open_Interest);
              rowNode.setDataValue("call_ltp", tickdata.LTP_Rate);
            }
            if (symbolInfo.CPType === "PE") {
              rowNode.setDataValue("put_oi", tickdata.LTP_Open_Interest);
              rowNode.setDataValue("put_ltp", tickdata.LTP_Rate);
            }
          }
        }
      }
    }
  };

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
  }, [currentSocketBroker, selectedSymbolVal.current, selectedOption.current]);

  const handleLTP = useCallback(
    (msg) => { },
    [selectedSymbolVal.current, selectedOption.current]
  );
  //converting the apibody
  const convertApiBody = (oldApiBody, orderSide) => {
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
    clientTableData.forEach((cl) => {
      newApiBody[cl.ClientId] = {
        OrderSide: orderSide,
        Symbol: oldApiBody.sym,
        LimitPrice: oldApiBody.price,
        SLTriggerPrice: oldApiBody.sl_price,
        Exchange: oldApiBody.exch,
        LotSize: oldApiBody.LotSize,
        Scripcode: oldApiBody.Scripcode,
        Quantity: cl.Quantity, //Chane by Upen
        ProductType: "NRML",
        OrderType: orderType(),
        OverNightSL: isChecked === false ? 1 : isChecked === true ? 0 : "",
      };
    });
    return newApiBody;
  };

  const handleSubmit = async (orderSide) => {
    const reqBody = convertApiBody(apiBodyDervatives.current, orderSide);
    const ipcReqBody = {
      body: reqBody,
    };
    const result = await placeOrder_api(reqBody, "apiToken");
    if (result) toast.success(warnMessage.success_order_message);
  };

  // const handleAtm = useCallback(
  //   async (Scripcode, exchange) => {
  //     const ltp = await getLTPService({
  //       scripcodes: [{ [exchange]: Scripcode }],
  //     });
  //     if (ltp && ltp.length !== 0) {
  //       setLtp(ltp[0]?.ltp);
  //       selectedSharePrice.current = ltp[0]?.ltp;
  //       scrollToRowWithValue();
  //     }
  //   },
  //   [atmScriptCode.current]
  // );

  const handleAtm = useCallback(
    async (scripcode, symbol, exchange) => {
      if (shares[symbol]) {
        let ltp = shares[symbol]?.Price;
        setLtp(ltp);
        selectedSharePrice.current = ltp;
        scrollToRowWithValue();
        return ltp;
      } else {
        let ltp = await getLTPService({
          scripcodes: [{ [exchange]: scripcode }],
        });
        if (ltp && ltp.length !== 0) {
          setLtp(ltp[0]?.ltp);
          selectedSharePrice.current = ltp[0]?.ltp;
          scrollToRowWithValue();
        }
        return ltp[0]?.ltp;
      }
    },
    [atmScriptCode.current]
  );

  //changing options on strike price
  const handleFilter = async ({ value }, type, exch = "") => {
    isLastBid.current = false;
    isFuture.current = false;
    let currentStrikeRate_OptionsList = [];
    gridRef?.current?.api?.setRowData([]);
    switch (type) {
      case "option":
      case "symbol":
        filters.current = { symbol: value, strike: "", epiry: "" };
        if (type === "option") {
          selectedOption.current = { label: value, value };
          selectedSymbolVal.current = null;
        } else {
          selectedSymbolVal.current = { label: value, value };
          selectedOption.current = null;
        }
        setSelectedExpiryVal(null);
        setSelectedStrikeVal(null);
        // setCurrentData({});
        setExchange(exch);
        let selectedExchange = ExchangeShortName[exch];
        let optionExpiryList = await getOptionChainExpiry({
          exch: selectedExchange,
          exch_type: "D",
          full_name: value,
          cp_type: "CE",
        });

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
        }
        break;
      case "expiry":
        filters.current = { ...filters.current, expiry: value, strike: "" };
        let ltpRecord = null;

        if (!selectedOption.current) {
          let scripCode = futureExpiry?.Scripcode;
          let symbol =
            selectedSymbolVal.current?.value || filters.current?.symbol;
          let futExchange = ExchangeNameDerivatives[futureExpiry?.Exch];
          try {
            ltpRecord = await handleAtm(scripCode, symbol, futExchange);
          } catch (error) {
            console.log("error ltp fno", error);
          }
          setLotSize(futureExpiry?.LotSize);
        } else {
          let symbolName =
            selectedSymbolVal.current?.value || filters.current?.symbol;
          try {
            ltpRecord = await handleAtm(
              atmScriptCode.current,
              symbolName,
              exchange
            );
          } catch (error) {
            console.log("error ltp fno", error);
          }
        }
        if (ltpRecord) {
          let param = {
            name: selectedSymbolVal.current?.value || filters.current?.symbol,
            strikeRate: ltpRecord,
            expiry: Number(moment(value)?.format("YYYYMMDD")),
            exch: ExchangeShortName[exchange],
            exchType: "D",
            recordsLimit: recordsLimit,
            // recordsLimit: 65,
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
            label: `${value} (${exchange})`,
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

  const handleRowClick = (params) => {
    setLTPData(params.data);
    let columnClicked = null;
    let selectedSym = null;
    isLastBid.current = true;
    if (clickedColumn) {
      columnClicked = clickedColumn.getColDef().field;
      clickedColumn = null;
    }

    //[call,put]
    let selectedData = [
      {
        Scripcode: params.data.call_Scripcode,
        Exch: params.data.Exch,
        label: params.data.call_label,
        value: params.data.call_label,
        LotSize: params.data.call_LotSize,
        StrikeRate: params.data.strikes,
        symbolName: params.data.call_label.split(" ")[0],
        /* ltp: params.data.call_ltp,
        volume: params.data.call_volume, */
        ExchType: "DERIVATIVES",
      },
      {
        Scripcode: params.data.put_Scripcode,
        Exch: params.data.Exch,
        label: params.data.put_label,
        value: params.data.put_label,
        LotSize: params.data.put_LotSize,
        StrikeRate: params.data.strikes,
        symbolName: params.data.put_label.split(" ")[0],
        /* ltp: params.data.put_ltp,
        volume: params.data.put_volume, */
        ExchType: "DERIVATIVES",
      },
    ];
    selectedSym =
      columnClicked?.indexOf("put_") > -1
        ? [selectedData[1]]
        : [selectedData[0]];
    selectedScriptCode.current =
      columnClicked?.indexOf("put_") > -1
        ? params.data.put_Scripcode
        : params.data.call_Scripcode;
    setSelectedSymbol(selectedSym);
    setLotSize(selectedSym[0]?.["LotSize"]);
    setLtp(selectedSym[0]?.ltp);
    setOptDropdown(selectedData);
    setLtp(selectedSym[0]?.ltp);
    apiBodyDervatives.current = {
      ...apiBodyDervatives.current,
      sym: params.data.call_label,
      LotSize: params.data.call_LotSize,
      Scripcode: params.data.call_Scripcode,
      exch:
        params.data.Exch === "NSE"
          ? "NSEFO"
          : params.data.Exch === "BSE"
            ? "BSEFO"
            : "MCXFO",
    };

    let currentSelectedLTP =
      columnClicked?.indexOf("put_") > -1
        ? params.data.put_ltp
        : params.data.call_ltp;
    setLtp(currentSelectedLTP); //TODO

    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.send({
        action: "register",
        data: [
          columnClicked?.indexOf("put_") > -1
            ? selectedData[1]
            : selectedData[0],
        ],
        placeOrderSymbol: true,
      });
    } else if (
      currentSocketBroker === "IIFL" ||
      currentSocketBroker === "SMC"
    ) {
      liveDataProcessIIFLSMC.send({
        action: "register",
        data: [
          columnClicked?.indexOf("put_") > -1
            ? selectedData[1]
            : selectedData[0],
        ],
        placeOrderSymbol: true,
      });
    }
  };

  const rowClassRules = useMemo(() => {
    return {
      "highlight-row": (params) => {
        return params.data.strikes === atmPrice;
      },
    };
  }, [atmPrice]);

  const handleMouseDown = (event) => {
    const element = event?.event?.target;

    if (element && element.closest(".ag-cell")) {
      const cellElement = element.closest(".ag-cell");
      const colId = cellElement.getAttribute("col-id");
      clickedColumn = event.columnApi.getColumn(colId);
    }
  };
  useEffect(() => {
    return () => {
      setPlaceOrderVisible(activeTabs);
      setAddToCart([]);
      setLotInput([]);
    };
  }, []);

  const [isChecked, setChecked] = useState(false);

  // const onCellValueChanged = (
  //   params,
  //   cellName,
  //   boolean,
  //   PUT_LTP,
  //   data,
  //   strikes
  // ) => {
  //   setLTPItem(params);
  //   setBasketBuy(boolean);
  //   setbasketData(data);
  //   setBuyData(cellName);
  //   setLTPDataValue(PUT_LTP);
  //   setStrikesData(strikes);
  // };

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
    if (symbolInfo) {
      setLTPItem(currentLtp);
      setBasketBuy(boolean);
      setbasketData(data);
      setBuyData(orderSide);
      setLTPDataValue(optionSide);
      setStrikesData(strikes);
      const selectedOptionData = {
        scripCode: symbolInfo?.Scripcode,
        symbol: symbolInfo?.label,
        strikeRate: symbolInfo?.StrikeRate,
        cpType: symbolInfo?.CPType,
        orderSide: orderSide,
        ltp: symbolInfo.CPType === "CE" ? data.call_ltp : data.put_ltp,
        lotSize: symbolInfo?.LotSize,
      };

      // setCurrentData(selectedOptionData);
      setBuyData(orderSide);
      setLTPDataValue(optionSide);
      setAddToCart((prevCart) => {
        const updatedData = [...prevCart, selectedOptionData];
        setLotInput((prev) =>
          updatedData.length > prev.length ? [...prev, 1] : prev
        );
        return updatedData;
      });
    }
  };

  // const handlerAddToCart = () => {
  //   if (BuyData === "Buy" || BuyData === "Sell") {
  //     setAddToCart((prevCart) => [
  //       ...prevCart,
  //       {
  //         ...basketData,
  //         selectedType: LTPDataValue,
  //         SBData: BuyData,
  //         LTPItem: LTPItem,
  //         StrikesData: StrikesData,
  //       },
  //     ]);
  //   }
  // };
  // useEffect(() => {
  //   handlerAddToCart();
  // }, [basketData, selectedOption, BuyData]);

  const handleDeleteItem = (index) => {
    setAddToCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
    setCheckedItems((prevCheckedItems) => {
      const updatedCheckedItems = [...prevCheckedItems];
      updatedCheckedItems.splice(index, 1);
      return updatedCheckedItems;
    });
  };

  // const extractedInfoArray =
  //   addToCart.length > 0
  //     ? addToCart.map((option, index) => ({
  //         item_symbol: option?.call_label,
  //         item_exchange: option?.Exch,
  //         item_product_type: "NRML",
  //         item_order_side: option?.SBData === "Buy" ? "BUY" : "SELL",
  //         item_scrip_code:
  //           LTPDataValue === "Call_LTP"
  //             ? option?.call_Scripcode
  //             : option?.put_Scripcode,
  //         item_lot_size: lotInput[index],
  //       }))
  //     : [];

  const extractedInfoArray =
    addToCart
      .filter((item) => !item?.id)
      .map((option, index) => ({
        item_symbol: option?.symbol,
        item_exchange: ExchangeNameDerivatives[option?.Exch],
        item_product_type: "NRML",
        item_order_side:
          option?.orderSide === "Buy" || option?.orderSide === "BUY"
            ? "BUY"
            : "SELL",
        item_scrip_code: option?.scripCode,
        item_lot_quantity: Number(lotInput[index]) || 1,
        item_lot_size: +option?.lotSize || 1,
        item_ltp: +option?.ltp || 0,
      })) || [];

  const fetchData = async (tradeAll) => {
    if (InputData === "") {
      toast.warning("Please Enter Basket Name");
    }
    try {
      let payloadData = {
        basket_id: parsedData?.id,
        basket_status: parsedData?.status || "draft",
        stocks: extractedInfoArray,
        is_spread_limit_set: orderType === "LIMIT" ? true : false,
        ...(orderType === "LIMIT" && { spread_limit: +limitPrice }),
      };

      if (
        payloadData.is_spread_limit_set &&
        (+limitPrice === 0 || +limitPrice === "")
      ) {
        toast.warning("Please Enter Spread Limit Price");
        return false;
      }

      setbasketId(parsedData?.id);
      const resDetail = await BasketDetail(payloadData);
      toast.success("Updated Item Sucessfully");
      if (tradeAll === "tradeAll") {
        serCartModel(true);
      } else {
        router.push("/FOBasket");
        setAddToCart([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setBuyData(BuyData);
  }, []);

  // function calculateSum(data, key) {
  //   if (data.length > 0) {
  //     return data.reduce((total, item) => total + item[key], 0);
  //   } else {
  //     return 0;
  //   }
  // }
  // const buyData =
  //   addToCart.length > 0
  //     ? addToCart.filter((item) => item.SBData === "Buy")
  //     : "";
  // const sumBuyValue = calculateSum(buyData, "LTPItem");

  // const sellData =
  //   addToCart.length > 0
  //     ? addToCart.filter((item) => item.SBData === "Sell")
  //     : "";
  // const sumSellValue = calculateSum(sellData, "LTPItem");
  // let NetReceivedProfit;
  // if (sumBuyValue > 0 && sumSellValue > 0) {
  //   NetReceivedProfit = sumBuyValue - sumSellValue;
  // } else {
  //   NetReceivedProfit = 0;
  // }
  // const StrikesDataBuy =
  //   addToCart.length > 0
  //     ? addToCart.filter((item) => item.SBData === "Buy")
  //     : "";
  // const StrikesDataBuyValue = calculateSum(StrikesDataBuy, "StrikesData");

  // const StrikesSellData =
  //   addToCart.length > 0
  //     ? addToCart.filter((item) => item.SBData === "Sell")
  //     : "";
  // const StrikesSellDataValue = calculateSum(StrikesSellData, "StrikesData");

  // let totalStrikePrice;
  // if (StrikesDataBuyValue > 0 && StrikesSellDataValue > 0) {
  //   totalStrikePrice = StrikesSellDataValue - StrikesDataBuyValue;
  // } else {
  //   totalStrikePrice = 0;
  // }
  // const totalMaxProfit = totalStrikePrice + NetReceivedProfit;

  const gridOptions = {
    getRowId: (params) => params.data.strikes, // Define how to get the unique row ID
  };

  return (
    <>
      <SubmitModal
        submitVisible={submitVisible}
        setSubmitVisible={setSubmitVisible}
      />
      <BasketAddToCartModel
        cartModel={cartModel}
        serCartModel={serCartModel}
        basketId={basketId}
        setAddToCart={setAddToCart}
        orderType={orderType}
      />
      <div className="w-full selltabs">
        <Navbar.Content activeColor="primary" hideIn="xs" variant="underline">
          <Navbar.Link style={{ zIndex: 99 }}>Basket</Navbar.Link>
          <Input
            className="border-radius-8"
            bordered
            borderWeight="light"
            size="lg"
            placeholder="Please Enter Basket Name"
            onChange={(e) => setInputData(e.target.value)}
            value={InputData}
          />
          <Spacer x={28} />
        </Navbar.Content>
      </div>

      <div style={{ background: "#Ffff", height: "calc(100vh - 115px)" }}>
        <Grid css={{ mt: "$", ml: "$13", width: "%", mr: "$13" }}>
          <div className="fo-wrap">
            <Row>
              <Col className="colspece">
                <Row css={{ padding: "0px 10px 0" }}></Row>
                <h4 className="op-chain">Option Chain</h4>
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
                              handleFilter(
                                selectedVal,
                                "option",
                                selectedVal.exch
                              );
                            }
                          }}
                          value={selectedOption.current}
                          options={optionIndexesDropdown.current}
                        />
                      </div>
                    </Col>
                    <div className="option-or">OR</div>
                    <Col css={{ width: "200px" }}>
                      <Text h5 size={"$sm"} css={{ fontFamily: "$sans" }}>
                        Select Symbol
                      </Text>
                      <div className="optionsSelect">
                        <CustomSelect
                          placeholder="Select Symbol"
                          onChange={async (selectedVal) => {
                            if (selectedVal) {
                              const { label, Exch } = selectedVal;
                              const symbolObj = {
                                label: label,
                                value: label,
                              };
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
                        style={{ height: "61vh" }}
                      >
                        <AgGridReact
                          ref={gridRef}
                          rowData={gridRowdata}
                          columnDefs={BasketOptionsColumns({
                            onCellValueChanged: onCellValueChanged,
                          })}
                          enableCellChangeFlash={true}
                          onGridReady={(params) => params.api.setRowData([])}
                          overlayNoRowsTemplate="NO DATA FOUND"
                          // onRowClicked={handleRowClick}
                          // onCellMouseDown={handleMouseDown}
                          rowClassRules={rowClassRules}
                          gridOptions={gridOptions}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Spacer x={0.3} />
              <Col css={{ width: "64%" }}>
                <Col
                // className={classes.OrderDetails}
                >
                  <Text
                    h3
                    size={"$lg"}
                    css={{
                      pl: "$5",
                      fontFamily: "$sans",
                      margin: "12px 0 2px 0",
                    }}
                  >
                    Selected Items
                  </Text>
                  <div ref={containerRef} className={classes.scrollContainer}>
                    {/* {!!basketStock?.length &&
                      basketStock?.map((element, index) => {
                        return (
                          <div className={classes.rowContainer} key={index}>
                            <Row className="overflow-x-hidden flex-row column-gap-5">
                              <Text
                                h4
                                size={"$md"}
                                css={{
                                  fontFamily: "$sans",
                                  paddingTop: "5px",
                                  fontSize: "12px",
                                }}
                                style={{ minWidth: "250px", fontSize: "12px" }}
                              >
                                {element?.item_symbol}
                              </Text>

                              <Text
                                h4
                                size={"$md"}
                                css={{
                                  fontFamily: "$sans",
                                  paddingTop: "5px",
                                  fontSize: "12px",
                                }}
                                style={{
                                  fontSize: "12px",
                                  minWidth: "50px",
                                }}
                              >
                                {element?.LTPItem}
                              </Text>
                              <Row
                                style={{ minWidth: "70px" }}
                                className="width-fit-content"
                              >
                                <Text
                                  h4
                                  size={"$md"}
                                  css={{
                                    fontFamily: "$sans",
                                    paddingTop: "5px",
                                    fontSize: "12px",
                                  }}
                                  style={{
                                    fontSize: "12px",
                                  }}
                                >
                                  {element?.item_lot_size}
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      marginLeft: "5px",
                                    }}
                                  >
                                    X
                                  </span>
                                </Text>
                                <input
                                  type="number"
                                  style={{
                                    width: "5%",
                                    height: "20px",
                                    marginTop: "5px",
                                    marginLeft: "5px",
                                  }}
                                  value={lotInput[index]}
                                  onChange={(e) => {
                                    const updatedLotInput = [...lotInput];
                                    updatedLotInput[index] = e.target.value;
                                    setLotInput(updatedLotInput);
                                    setInputId(element?.id);
                                    handleEditBasket(
                                      element?.id,
                                      e.target.value
                                    );
                                  }}
                                  min="1"
                                />
                              </Row>

                              <div
                                style={{ minWidth: "70px" }}
                                className={classes.Itemchecked}
                              >
                                <span className={classes.sellBuy}>
                                  {" "}
                                  {element?.item_order_side === "BUY" ? (
                                    <span style={{ color: "green" }}>
                                      {element?.item_order_side}
                                    </span>
                                  ) : (
                                    <span style={{ color: "red" }}>
                                      {element?.item_order_side}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div style={{ width: "30px" }}>
                                <img
                                  src="images/iconsdelete.png"
                                  width={30}
                                  style={{
                                    cursor: "pointer",
                                    color: "red",
                                    // marginLeft: "3rem",
                                    width: "18px",
                                    marginTop: "5px",
                                  }}
                                  onClick={(e) =>
                                    handleDeleteBasket(
                                      element?.id,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </Row>
                          </div>
                        );
                      })} */}
                    {!!addToCart?.length &&
                      addToCart?.map((element, index) => {
                        return (
                          <div className={classes.rowContainer} key={index}>
                            <Row className="overflow-x-hidden flex-row column-gap-5">
                              <Text
                                h4
                                size={"$md"}
                                css={{
                                  fontFamily: "$sans",
                                  paddingTop: "5px",
                                  fontSize: "12px",
                                }}
                                style={{ minWidth: "230px", fontSize: "12px" }}
                              >
                                {formatSymbolWithPrice(element?.symbol)}
                              </Text>

                              <Text
                                h4
                                size={"$md"}
                                css={{
                                  fontFamily: "$sans",
                                  paddingTop: "5px",
                                  pl: "$2",
                                  fontSize: "12px",
                                }}
                                style={{
                                  fontSize: "12px",
                                  minWidth: "50px",
                                }}
                              >
                                {numberFormatter(element?.ltp, 2)}
                              </Text>
                              <Row
                                style={{ minWidth: "70px" }}
                                className="width-fit-content"
                              >
                                <Text
                                  h4
                                  size={"$md"}
                                  css={{
                                    fontFamily: "$sans",
                                    paddingTop: "5px",
                                    fontSize: "12px",
                                  }}
                                  style={{ fontSize: "12px" }}
                                >
                                  {element?.lotSize}
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      marginLeft: "5px",
                                    }}
                                  >
                                    X
                                  </span>
                                </Text>
                                <input
                                  type="number"
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    marginTop: "5px",
                                    marginLeft: "5px",
                                  }}
                                  value={lotInput[index]}
                                  onChange={(e) => {
                                    const updatedLotInput = [...lotInput];
                                    updatedLotInput[index] = e.target.value;
                                    setLotInput(updatedLotInput);
                                    if (element?.id) {
                                      handleEditBasket(
                                        element?.id,
                                        e.target.value
                                      );
                                    }
                                  }}
                                  min="1"
                                />
                              </Row>

                              <div
                                style={{ minWidth: "40px" }}
                                className={classes.Itemchecked}
                              >
                                <span className={classes.sellBuy}>
                                  {element?.orderSide?.toLowerCase() ===
                                    "Buy"?.toLowerCase() ? (
                                    <span style={{ color: "green" }}>BUY</span>
                                  ) : (
                                    <span style={{ color: "red" }}>SELL</span>
                                  )}
                                </span>
                              </div>
                              <div style={{ width: "40px" }}>
                                <img
                                  src="images/iconsdelete.png"
                                  width={"100%"}
                                  style={{
                                    cursor: "pointer",
                                    color: "#AC3939",
                                    // marginLeft: "3rem",
                                    width: "18px",
                                    marginTop: "5px",
                                  }}
                                  onClick={() => {
                                    handleDeleteItem(index);
                                    if (element?.id) {
                                      handleDeleteBasket(element?.id);
                                    }
                                  }}
                                />
                              </div>
                            </Row>
                          </div>
                        );
                      })}
                  </div>
                  <>
                    <hr className={classes.horizontalline} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingLeft: "10px",
                        paddingTop: "10px",
                      }}
                    >
                      <div>
                        <Text
                          h6
                          size={"$sm"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.TextCss}
                        >
                          Max Profit
                        </Text>
                        <Text
                          h6
                          size={"$sm"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.TextCss}
                        >
                          Max Loss
                        </Text>
                        <Text
                          h6
                          size={"$sm"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.TextCss}
                        >
                          Net Credit
                        </Text>
                      </div>
                      <div>
                        <Text
                          h6
                          size={"$sm"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.TextCss}
                        >
                          --
                        </Text>
                        <Text
                          h6
                          size={"$sm"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.TextCss}
                        >
                          --
                        </Text>
                        <Text
                          h6
                          size={"$sm"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.TextCss}
                        >
                          {!spreadData?.netCredit
                            ? "--"
                            : numberFormatter(spreadData?.netCredit, 2)}
                        </Text>
                      </div>
                    </div>
                    <hr className={classes.horizontalline} />
                    <Row className="flex-row align-center">
                      <Text
                        h4
                        size={"$lg"}
                        className="radio-head"
                        css={{ fontFamily: "$sans", margin: "$0" }}
                      >
                        Order Type
                      </Text>

                      <Radio.Group
                        value={orderType}
                        orientation="horizontal"
                        onChange={(val) => {
                          setOrderType(val);
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
                            <Radio
                              size={"sm"}
                              value="LIMIT"
                              className="btradio"
                              isDisabled={true}
                            >
                              <Text
                                h5
                                size={"$sm"}
                                css={{ fontFamily: "$sans", mt: "$5" }}
                              >
                                LIMIT
                              </Text>
                            </Radio>
                          </Col>
                          {/* <Row
                            className="flex-row align-center"
                            justify="left"
                            css={{ pl: "$6" }}
                          >
                            <Col>
                              <Text
                                color="#2C2C2C"
                                size={"$m"}
                                css={{
                                  fontFamily: "$sans",
                                  width: "120px",
                                  margin: "0px",
                                }}
                                h4
                              >
                                Spread Limit Price
                              </Text>
                            </Col>
                            <Input
                              className="input-secondary-bg-color"
                              css={{ pl: "$", width: "70px", height: "30px" }}
                              shadow={false}
                              placeholder="0.00"
                              value={limitPrice}
                              type="number"
                              disabled={orderType !== "LIMIT"}
                              onKeyDown={blockInvalidCharFnoBasket}
                              onChange={(e) => {
                                setLimitPrice(e.target.value);
                              }}
                            />
                          </Row> */}
                        </Row>
                      </Radio.Group>
                    </Row>
                    <Row
                      className={`${classes.buttnspace} flex-row align-center justify-space-between`}
                    >
                      <Button
                        className="secondary-button border-radius-8"
                        flat
                        auto
                        onClick={() => {
                          router.push("/FOBasket");
                        }}
                      >
                        Cancel
                      </Button>
                      <Row
                        className="flex-row justify-end column-gap-10"
                      // className={classes.buttnspace}
                      >
                        <Button
                          className="primary-button border-radius-8"
                          flat
                          auto
                          onClick={() => {
                            fetchData("Draft");
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          className="primary-button border-radius-8"
                          flat
                          auto
                          onClick={() => {
                            fetchData("tradeAll");
                          }}
                        >
                          Trade All
                        </Button>
                      </Row>
                    </Row>
                  </>
                </Col>
              </Col>
            </Row>
          </div>
        </Grid>
      </div>
    </>
  );
}
