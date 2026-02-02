import React, { useCallback, useState, useMemo } from "react";
import { Text, Row, Col, Grid, Navbar, Spacer } from "@nextui-org/react";
import { useGlobalContext } from "../context/GlobalContext";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import { OptionsColumns } from "../component/options/BasketColumnDefs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useRef } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getLTPService } from "../../services/transactions/transactions.service";
import { throttle } from "lodash";
export default function BasketOptions() {
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
  const [exchange, setExchange] = useState("NSE");
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
  const [symbolModel, setsymbolModel] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [BuyData, setBuyData] = useState("");
  const showCurrentOptions = useRef([]);
  const showPreviousOptions = useRef([]);
  const gridRef = useRef();
  const gridRefLastBid = useRef();
  const isFuture = useRef(false);

  const containerRef = useRef();
  const [InputData, setInputData] = useState("");
  const [LTPDataValue, setLTPDataValue] = useState("");
  const [LTPItem, setLTPItem] = useState("");
  const [StrikesData, setStrikesData] = useState("");
  const [basketId, setbasketId] = useState("");
  const [LotInput, setLotInput] = useState([1]);
  const [LotSizeData, setLotSizeData] = useState("");
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
    setLTPData,
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

  // Function to scroll to the row with value 6
  const scrollToRowWithValue = () => {
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
  };
  //filter,sort and set live data
  const handleLiveData = throttle((msg, broker) => {
    if (msg.type == "DERIVATIVES") {
      let mockOptions = msg.data;
      let calls = [];
      let puts = [];
      let strikeRates = [];
      let strikeRateArr = [];
      let currentOptionsArr = showCurrentOptions.current.map(
        (sym) => sym.label
      );
      let names = Object.keys(mockOptions);
      try {
        names.forEach((name) => {
          let arr = name.split(" ");
          let strikePrice = arr[arr.length - 1];
          strikePrice = parseFloat(strikePrice);
          let callOrPut = arr[arr.length - 2];
          let ltp = mockOptions[name]["Price"];
          let oi = mockOptions[name]["oi"];
          let Scripcode = 0;
          let LotSize = 0;
          let Exch = "";
          let condition = currentOptionsArr.includes(name);

          if (condition) {
            let optionSymbol = showCurrentOptions.current.find(
              (sym) => sym.label === name
            );

            LotSize = optionSymbol.LotSize;
            Scripcode = optionSymbol.Scripcode;
            Exch = optionSymbol.Exch;
          }
          if (callOrPut == "CE" && condition) {
            calls.push({
              label: name,
              strikePrice: strikePrice,
              LTP: ltp,
              Scripcode: Scripcode,
              LotSize: LotSize,
              Exch: Exch,
              // volume: volume ?? 0,
              oi: oi ?? 0,
            });
          }
          if (callOrPut == "PE" && condition) {
            puts.push({
              label: name,
              strikePrice: strikePrice,
              LTP: ltp,
              Scripcode: Scripcode,
              LotSize: LotSize,
              Exch: Exch,
              // volume: volume ?? 0,
              oi: oi ?? 0,
            });
          }
          if (!strikeRateArr.includes(strikePrice) && condition) {
            strikeRateArr.push(strikePrice);
            strikeRates.push({ label: strikePrice });
          }
        });
      } catch (e) {}
      calls = calls.sort((a, b) => a.strikePrice - b.strikePrice);
      puts = puts.sort((a, b) => a.strikePrice - b.strikePrice);
      strikeRates = strikeRates.sort((a, b) => a.label - b.label);

      const gridData = [];
      gridRef?.current?.api?.forEachNode(({ data }) => gridData.push(data));

      let addData = [];
      let updateData = [];
      calls.map((call, idx) => {
        const findIndex = gridData.findIndex(
          ({ call_Scripcode }) => call.Scripcode === call_Scripcode
        );
        if (findIndex === -1) {
          addData.push({
            call_label: call.label,
            strikes: call.strikePrice,
            call_ltp: call.LTP,
            call_Scripcode: call.Scripcode,
            call_LotSize: call.LotSize,
            // call_volume: call.volume,
            call_oi: call.oi,
            Exch: call.Exch,
            put_label: puts[idx]?.["label"],
            put_ltp: puts[idx]?.["LTP"],
            put_Scripcode: puts[idx]?.["Scripcode"],
            put_LotSize: puts[idx]?.["LotSize"],
            // put_volume: puts[idx]?.["volume"],
            put_oi: puts[idx]?.["oi"],
          });
        } else {
          const data = gridData[findIndex];
          data["call_label"] = call.label;
          data["strikes"] = call.strikePrice;
          data["call_ltp"] = call.LTP;
          data["call_Scripcode"] = call.Scripcode;
          data["call_LotSize"] = call.LotSize;
          // data["call_volume"] = call.volume;
          data["call_oi"] = call.oi;
          data["Exch"] = call.Exch;
          data["put_label"] = puts[idx]?.["label"];
          data["put_ltp"] = puts[idx]?.["LTP"];
          data["put_Scripcode"] = puts[idx]?.["Scripcode"];
          data["put_LotSize"] = puts[idx]?.["LotSize"];
          // data["put_volume"] = puts[idx]?.["volume"];
          data["put_oi"] = puts[idx]?.["oi"];
          updateData.push(data);
        }
      });
      if (isFuture.current) {
        gridRef?.current?.api.setRowData([]);
      } else {
        if (updateData.length !== 0) {
          gridRef?.current?.api?.applyTransaction({
            update: updateData,
          });
        }
        if (addData.length !== 0) {
          gridRef?.current?.api?.applyTransaction({
            add: addData,
          });
        }
      }
      setLiveCalls(calls);
      setLivePuts(puts);
      setLiveStrikePrice(strikeRates);
    }
    if (msg.type === "BidAsk") {
      if (isLastBid.current) {
        let filteredData = [];
        if (broker === "MOSWAL") {
          let sno = 1;
          msg.data?.map((item) => {
            if (item.ScripCode === selectedScriptCode.current) {
              sno = sno + 1;
              filteredData.push({ ...item, sno: sno + 1 });
            }
          });
        } else {
          filteredData = msg.data;
        }
        gridRefLastBid?.current?.api.setRowData(filteredData);
      }
    }
  }, 500);

  useEffect(() => {
    getClientsIds();
    setOptDropdown([{ label: "Select Symbol", value: "Select Symbol" }]);
    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.on("message", (msg) => {
        if (msg.type === "LTP") {
          if (selectedSymbolVal.current || selectedOption.current)
            handleLTP(msg);
        }
        handleLiveData(msg, currentSocketBroker);
      });
    } else if (currentSocketBroker === "IIFL" || currentSocketBroker === "SMC")
      liveDataProcessIIFLSMC.on("message", (msg) => {
        if (msg.type === "LTP") {
          if (selectedSymbolVal.current || selectedOption.current)
            handleLTP(msg);
        }
        handleLiveData(msg, currentSocketBroker);
      });
  }, [currentSocketBroker, selectedSymbolVal.current, selectedOption.current]);
  const handleLTP = useCallback(() => {}, [
    selectedSymbolVal.current,
    selectedOption.current,
  ]);

  const handleAtm = useCallback(
    async (Scripcode, exchange) => {
      const ltp = await getLTPService({
        scripcodes: [{ [exchange]: Scripcode }],
      });
      if (ltp && ltp.length !== 0) {
        console.log("LTP========", ltp[0]?.ltp);
        setLtp(ltp[0]?.ltp);
        selectedSharePrice.current = ltp[0]?.ltp;
        scrollToRowWithValue();
      }
    },
    [atmScriptCode.current]
  );
  //changing options on strike price
  const handleFilter = ({ value }, type) => {
    isLastBid.current = false;
    isFuture.current = false;
    let currentStrikeRate_OptionsList = [];
    gridRef?.current?.api?.setRowData([]);
    gridRefLastBid?.current?.api?.setRowData([]);
    switch (type) {
      case "option":
      case "symbol":
        filters.current = { symbol: value, strike: "", epiry: "" };
        let [currentStrikes, currentExpiry] = [[], []]; //array to check if item includes
        let [expiries, strikes] = [[], []]; //carry data for dropdown
        currentStrikeRate_OptionsList = symbolNamesOptions.current.filter(
          ({ Scripcode, StrikeRate, Expiry, label, Exch }) => {
            let condition = label.split(" ")[0] === value;
            condition = condition && (Exch === exchange || Exch === "MCX");
            if (condition) {
              if (!currentStrikes.includes(StrikeRate)) {
                strikes.push({ label: StrikeRate, value: StrikeRate });
                currentStrikes.push(StrikeRate);
              }
              if (!currentExpiry.includes(Expiry)) {
                currentExpiry.push(Expiry);
                expiries.push({ label: Expiry, value: Expiry, Scripcode });
              }
            }
            return condition;
          }
        );
        expiries = expiries.sort(function (a, b) {
          return new Date(a.value) - new Date(b.value);
        });
        ExpiryDropdown.current = expiries;
        StrikeRateDropDown.current = strikes;
        if (type === "option") {
          selectedOption.current = { label: value, value };
          selectedSymbolVal.current = null;
        } else {
          selectedSymbolVal.current = { label: value, value };

          selectedOption.current = null;
        }
        setSelectedExpiryVal(null);
        setSelectedStrikeVal(null);
        break;
      case "expiry":
        filters.current = { ...filters.current, expiry: value, strike: "" };
        if (!selectedOption.current) {
          const selectedMoth = new Date(value).getMonth();
          const selectedYear = new Date(value).getFullYear();
          let futureList = symbolNamesFutures.current.filter(
            ({ label, Expiry }) => {
              if (label.split(" ")[0] === filters.current.symbol) {
                const moth = new Date(Expiry).getMonth();
                const year = new Date(Expiry).getFullYear();
                return selectedMoth === moth && selectedYear === year;
              }
              return false;
            }
          );

          if (futureList.length > 1) {
            futureList = futureList.filter(({ Expiry }) => Expiry === value);
          }
          const futureLenght = futureList.length - 1;
          atmScriptCode.current = futureList[futureLenght].Scripcode;
          const exchange =
            futureList[futureLenght].Exch === "NSE"
              ? "NSEFO"
              : futureList[futureLenght].Exch === "BSE"
              ? "BSEFO"
              : "MCX";
          handleAtm(futureList[futureLenght].Scripcode, exchange);
          setLotSize(futureList[futureLenght]["LotSize"]);
        } else {
          const scripList = {
            NIFTY: 26000,
            FINNIFTY: 26037,
            BANKNIFTY: 26009,
            MIDCPNIFTY: 26074,
          };
          atmScriptCode.current = scripList[filters.current.symbol];
          handleAtm(
            scripList[filters.current.symbol],
            // filters.current.symbol === "FINNIFTY" ? "NSEFO" : "NSE"
            filters.current.symbol === "FINNIFTY" ? "NSE" : "NSE"
          );
        }

        currentStrikeRate_OptionsList = symbolNamesOptions.current.filter(
          ({ Expiry, label, Exch }) => {
            let condition = Expiry === value;
            condition = condition && (Exch === exchange || Exch === "MCX");

            if (filters.current.symbol !== "") {
              condition =
                condition && label.split(" ")[0] === filters.current.symbol;
            } else {
              condition = false;
            }
            return condition;
          }
        );
        setSelectedExpiryVal({ label: value, value: value });
        setSelectedStrikeVal(null);

        break;
    }
    if (
      (filters.current.symbol !== "" || filters.current.option !== "") &&
      filters.current.expiry !== ""
    ) {
      let tempCurrentOptions = showCurrentOptions.current;
      showCurrentOptions.current = currentStrikeRate_OptionsList; //assingning new selected options
      showPreviousOptions.current = tempCurrentOptions;
      setExchange(currentStrikeRate_OptionsList[0]?.Exch);
      setOptDropdown(currentStrikeRate_OptionsList);
      if (currentSocketBroker === "MOSWAL") {
        let prev = showPreviousOptions?.current;
        liveDataProcess.send({
          action: "unregister",
          data: prev,
        });
        liveDataProcess.send({
          action: "register",
          data: currentStrikeRate_OptionsList.slice(0, 50),
        });
      } else if (
        currentSocketBroker === "IIFL" ||
        currentSocketBroker === "SMC"
      ) {
        let prev = showPreviousOptions?.current;
        liveDataProcessIIFLSMC.send({
          action: "unregister",
          data: prev,
        });

        liveDataProcessIIFLSMC.send({
          action: "register",
          data: currentStrikeRate_OptionsList,
        });
      }
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
    };
  }, []);

  const onCellValueChanged = (params, cellName, boolean, PUT_LTP, strikes) => {
    setLTPItem(params);
    setBasketBuy(boolean);
    setBuyData(cellName);
    setLTPDataValue(PUT_LTP);
    setStrikesData(strikes);
  };

  useEffect(() => {
    setBuyData(BuyData);
  }, []);

  return (
    <>
      <div className="w-full selltabs">
        <Navbar.Content activeColor="primary" hideIn="xs" variant="underline">
          <Navbar.Link>Option Chain</Navbar.Link>
          <Spacer x={28} />
        </Navbar.Content>
      </div>

      <div style={{ background: "#Ffff", height: "calc(100vh - 80px)" }}>
        <Grid css={{ mt: "$", ml: "$13", width: "%", mr: "$13" }}>
          <div className="fo-wrap">
            <Row>
              <Col className="colspece">
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
                              handleFilter(selectedVal, "option");
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
                        <Select
                          placeholder="Select Symbol"
                          maxMenuHeight={170}
                          onChange={async (selectedVal) => {
                            if (selectedVal) {
                              handleFilter(selectedVal, "symbol");
                            }
                          }}
                          value={selectedSymbolVal.current}
                          options={optionSymbolsDropdown.current}
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
                        style={{ height: "50vh" }}
                      >
                        <AgGridReact
                          columnDefs={OptionsColumns({
                            onCellValueChanged: onCellValueChanged,
                          })}
                          enableCellChangeFlash={true}
                          ref={gridRef}
                          onGridReady={(params) => params.api.setRowData([])}
                          overlayNoRowsTemplate="NO DATA FOUND"
                          onRowClicked={handleRowClick}
                          onCellMouseDown={handleMouseDown}
                          rowClassRules={rowClassRules}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
        </Grid>
      </div>
    </>
  );
}
