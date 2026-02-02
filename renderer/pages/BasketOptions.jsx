import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
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
import moment from "moment";
import { BasketOptionsColumns } from "../component/options/BasketColumnDefs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import SubmitModal from "../component/options/submitModal";
import { useRouter } from "next/router";
import {
  getLTPService,
  getOptionChainData,
  getOptionChainExpiry,
} from "../../services/transactions/transactions.service";
import {
  ExchangeShortName,
  ExchangeNameDerivatives,
} from "../constant/constant";
import classes from "../component/options/BasketModel.module.css";

import {
  BasketFOOrder,
  BasketDetail,
} from "../../services/transactions/transactions.service";
import { currencyFormatter, numberFormatter } from "../helpers";
import BasketAddToCartModel from "../component/options/BasketAddtocartModel";
import CustomSelect from "../layout/customSelect";
import { blockInvalidCharFnoBasket } from "../component/dashboard/watchlist/order/orderComponents/blockInputChars";
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

export default function BasketOptions() {
  const [activeTabs, setActiveTabs] = useState(false); //active fno2
  const [optDropdown, setOptDropdown] = useState([]);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [lotSize, setLotSize] = useState(0);
  const [Ltp, setLtp] = useState(0);
  const atmScriptCode = useRef();
  const isLastBid = useRef(false);
  const selectedOption = useRef(null);
  const selectedSymbolVal = useRef(null);
  const [selectedStrikeVal, setSelectedStrikeVal] = useState(null);
  const [selectedExpiryVal, setSelectedExpiryVal] = useState(null);
  const [exchange, setExchange] = useState("NSE");
  const [orderType, setOrderType] = useState("MKT");
  const [limitPrice, setLimitPrice] = useState(0);
  const filters = useRef({
    symbol: "",
    strike: "",
    expiry: "",
  });
  const router = useRouter();
  const selectedSharePrice = useRef();
  const [atmPrice, setATMPrice] = useState();
  const [currentData, setCurrentData] = useState();
  const [basketBuy, setBasketBuy] = useState(false);
  const [cartModel, serCartModel] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [BuyData, setBuyData] = useState("");

  const showCurrentOptions = useRef([]);
  const showPreviousOptions = useRef([]);
  const gridRef = useRef();
  const isFuture = useRef(false);

  const containerRef = useRef();
  const tradeAllProcessRef = useRef(false);
  const [InputData, setInputData] = useState("");
  const [LTPDataValue, setLTPDataValue] = useState("");
  const [LTPItem, setLTPItem] = useState("");
  const [StrikesData, setStrikesData] = useState("");
  const [basketId, setbasketId] = useState("");
  const [lotInput, setLotInput] = useState([1]);
  const [gridRowdata, setGridRowdata] = useState([]);
  const [futureExpiry, setFutureExpiry] = useState({});
  const [spreadData, setSpreadData] = useState({
    netCredit: "",
  });
  const {
    getClientsIds,
    ExpiryDropdown, //expiry dropdown
    optionIndexesDropdown, //select symbol dropdown
    setPlaceOrderVisible,
    liveDataProcess,
    liveDataProcessIIFLSMC,
    currentSocketBroker,
    setbasketData,
    basketData,
    addToCart,
    setAddToCart,
    shares,
    registerSymbolForLiveData,
    liveData,
    recordsLimit,
  } = useGlobalContext();
  // const apiBodyDervatives = useRef({
  //   BuySell: "BUY",
  //   sym: null,
  //   disclose_qty: null,
  //   price: 0,
  //   intraday: false,
  //   sl_price: 0,
  //   exch: null,
  //   LotSize: 1,
  //   Scripcode: null,
  //   exch_id: null,
  //   clients: [],
  // });

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

  const handleLTP = useCallback(() => {}, [
    selectedSymbolVal.current,
    selectedOption.current,
  ]);

  const handleAtm = useCallback(
    async (scripcode, symbol, exchange) => {
      if (shares && shares?.[symbol]) {
        let ltp = shares?.[symbol]?.Price;
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
        setCurrentData({});
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
          ltpRecord = await handleAtm(scripCode, symbol, futExchange);
          setLotSize(futureExpiry?.LotSize);
        } else {
          let symbolName =
            selectedSymbolVal.current?.value || filters.current?.symbol;
          ltpRecord = await handleAtm(
            atmScriptCode.current,
            symbolName,
            exchange
          );
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

  const rowClassRules = useMemo(() => {
    return {
      "highlight-row": (params) => {
        return params.data.strikes === atmPrice;
      },
    };
  }, [atmPrice]);

  useEffect(() => {
    return () => {
      setPlaceOrderVisible(activeTabs);
      setAddToCart([]);
      setLotInput([]);
    };
  }, []);

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

      setCurrentData(selectedOptionData);
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

  const extractedInfoArray =
    addToCart.length > 0
      ? addToCart.map((option, index) => ({
          item_symbol: option?.symbol,
          item_exchange: ExchangeNameDerivatives[option?.Exch],
          item_product_type: "NRML",
          item_order_side: option?.orderSide === "Buy" ? "BUY" : "SELL",
          item_scrip_code: option?.scripCode,
          item_lot_quantity: Number(lotInput[index]) || 1,
          item_lot_size: option?.lotSize || 1,
          item_ltp: +option?.ltp || 0,
        }))
      : [];

  const fetchData = async (tradeAll) => {
    if (InputData === "") {
      toast.warning("Please Enter Basket Name");
      return;
    }

    if (tradeAllProcessRef.current) return;
    tradeAllProcessRef.current = true;

    const createby = localStorage.getItem("createdBy");
    const modifyBy = localStorage.getItem("modifyBy");
    try {
      let basketPayload = {
        name: InputData,
        created_by: `${createby}${modifyBy}`,
        modified_by: `${createby}${modifyBy}`,
        status: "draft",
        type: "futureAndOptions",
        basket_type: "futureAndOptions",
        is_spread_limit_set: orderType === "LIMIT" ? true : false,
        ...(orderType === "LIMIT" && { spread_limit: limitPrice }),
      };

      if (
        basketPayload.is_spread_limit_set &&
        (limitPrice === 0 || limitPrice === "")
      ) {
        tradeAllProcessRef.current = false;
        toast.warning("Please Enter Spread Limit Price");
        return false;
      }

      let res;
      try {
        res = await BasketFOOrder(basketPayload);
        if (res === undefined) {
          toast.error("Name already Exists");
        }
      } catch (error) {
        console.error("Fno basket save error", error);
      }

      setbasketId(res?.data?.id);
      // toast.success(res?.message);
      if (res?.data?.id) {
        if (tradeAll === "tradeAll") serCartModel(true);

        let payloadData = {
          basket_id: res?.data?.id,
          basket_status: "draft",
          stocks: extractedInfoArray,
        };
        const resDetail = await BasketDetail(payloadData);
        try {
          if (tradeAll === "Draft") {
            router.push("/FOBasket");
          }
          // toast.success(resDetail?.message);
        } catch (error) {
          console.log("err", error);
        }
      }
    } catch (error) {
      console.error("F&O save error", error);
    }
    tradeAllProcessRef.current = false;
  };

  useEffect(() => {
    setBuyData(BuyData);
  }, []);

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
          />
          <Spacer x={28} />
        </Navbar.Content>
      </div>

      <div style={{ background: "#Ffff", height: "calc(100vh - 115px)" }}>
        <Grid css={{ mt: "$", ml: "$13", width: "%", mr: "$13" }}>
          <div className="fo-wrap">
            <Row>
              <Col>
                <Row css={{ padding: "0px 10px 0" }}></Row>
                <h4 className="op-chain">
                  Option Chain (LTP : {numberFormatter(Ltp, 2)})
                </h4>
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
              <Col css={{ width: "66%" }}>
                <h4 className="op-chain">Selected Items</h4>
                <Col>
                  <div ref={containerRef} className={classes.scrollContainer}>
                    {addToCart?.length > 0 ? (
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
                                  }}
                                  min="1"
                                />
                              </Row>

                              <div
                                style={{ minWidth: "40px" }}
                                className={classes.Itemchecked}
                              >
                                <span className={classes.sellBuy}>
                                  {element?.orderSide === "Buy" ? (
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
                                  onClick={() => handleDeleteItem(index)}
                                />
                              </div>
                            </Row>
                          </div>
                        );
                      })
                    ) : (
                      <Text h2 size={"$lg"} className={classes.ItemSelected}>
                        No Item Has Been Selected
                      </Text>
                    )}
                  </div>
                  {!!addToCart?.length && (
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
                          css={{ pl: "$5", fontFamily: "$sans", margin: "$0" }}
                        >
                          Order Type
                        </Text>

                        <Radio.Group
                          css={{ mr: "$4" }}
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
                              <Radio
                                size={"sm"}
                                value="MKT"
                                className="btradio"
                              >
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
                            {/* 
                            <Row
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
                                type="number"
                                disabled={orderType !== "LIMIT"}
                                onKeyDown={blockInvalidCharFnoBasket}
                                onChange={(e) => {
                                  setLimitPrice(e.target.value);
                                }}
                              /> 
                            </Row>
                              */}
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
                            Save
                          </Button>
                          <Button
                            flat
                            auto
                            className="primary-button border-radius-8"
                            onClick={() => {
                              fetchData("tradeAll");
                            }}
                          >
                            Trade All
                          </Button>
                        </Row>
                      </Row>
                    </>
                  )}
                </Col>
              </Col>
            </Row>
          </div>
        </Grid>
      </div>
    </>
  );
}
