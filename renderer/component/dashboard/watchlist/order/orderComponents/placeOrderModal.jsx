import {
  Button,
  Card,
  Col,
  Divider,
  Grid,
  Input,
  Navbar,
  Radio,
  Row,
  Spacer,
  Text,
  Switch,
} from "@nextui-org/react";
import SymbolCard from "../../../indicator/symbolCard";
import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { useGlobalContext } from "../../../../../context/GlobalContext";
import { blockInvalidChar } from "./blockInputChars";
import { AgGridReact } from "ag-grid-react";
import classes from "./helpers/placeOrderModal.module.css";
import ClientOrder from "../clients/ClientOrder";
import GroupOrder from "../groups/GroupOrder";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useRouter } from "next/router";
import TopRightNavigationButton from "../../../../common/TopRightNavigationButton";
import { placeOrder_api } from "../../../../../../main/logic/clientAPI";
import { scripBook, client } from "../../../../../../services/serviceEndpoints";
import { axiosInstance } from "../../../../../../services/axios.config";
import { liveDataParam, warnMessage } from "../../../../../constant/constant";
import { numberFormatter } from "../../../../../helpers";
import CustomSelect from "../../../../../layout/customSelect";
import CustomConfirmationModel from "../../../../../layout/CustomConfirmation";
import { getBrokerMarginHandler } from "../../../../../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#fff",
    width: "270px",
  }),
  menu: (provided) => ({
    ...provided,
    width: "fit-content",
    minWidth: "270px",
    overflowY: "visible",
    maxHeight: "none",
  }),
  menuList: (provided) => ({
    ...provided,
    width: "fit-content",
    minWidth: "270px",
    overflowY: "auto",
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "13px",
    backgroundColor: "#fff",
    color: "black",
  }),
};

const PlaceOrder = ({
  setPlaceOrderVisible,
  buySell,
  setBuySell,
  apiBody,
  setOrderStatVisible,
  setOrderStat,
  setSuccessClients,
  setFailClients,
  setOrderReqStatusMessage,
  state,
}) => {
  const {
    selectedSymbol,
    setSelectedSymbol,
    selectedValueSymbol,
    setSingleLtp,
    switch_GpCl,
    clients,
    getClientsIds,
    setSymbolApi,
    clientInputList,
    setClientInputList,
    groupInputList,
    setGroupInputList,
    setRefreshToken,
    allSymbols,
    setRefreshTokenTable,
    cashSymbol,
    qty,
    setQty,
    setCashSymbol,
    group_Clients,
    registerSymbolForLiveData,
    liveData,
    setEquityQty,
  } = useGlobalContext();
  const [activeTabs, setActiveTabs] = useState(false); //for activating tabs between cash & fno
  const router = useRouter();
  const [groupData, setGroupData] = useState([]);
  const [deliveryType, setDeliveryType] = useState("MKT");
  const [exchange, setExchange] = useState("NSE");
  const [exchangeSegment, setExchangeSegment] = useState("CM");
  const [product, setProduct] = useState("NRML");
  //to check validity for placing order
  const [checkValid, setCheckValid] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [selectedOption, setSelectedOption] = useState(new Set(["Equity"]));
  const [confirmationToggle, setConfirmationToggle] = useState(false);
  //for uppercircuit and lower circuit data
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [leverageData, setleverageData] = useState({
    broker: "",
    margin: "4",
    finalmargin: 0
  });

  const processRef = useRef(false);

  //states for symbol check
  // const [symbolChoosen, setSymbolChoosen] = useState(false)

  const [navtabs, setNavtabs] = useState(true);
  const [selectedStockLiveData, setSelectedStockLiveData] =
    useState(liveDataParam);
  const [bidAskRowData, setBidAskRowData] = useState([]);
  //memo for selected option, equity or options
  const gridRefBidAsk = useRef();
  useEffect(() => {
    // returning to default settings ones the buy or sell option switches
    setDeliveryType("MKT");
    setExchange(
      apiBody.current.Exchange === "B" || apiBody.current.Exchange === "BSE"
        ? "BSE"
        : "NSE"
    );
    setExchangeSegment("CM");
    setProduct("NRML");
    setIsValid(false);
  }, [buySell]);

  //when some symbol is selected from drop down
  useEffect(() => {
    setCheckValid(!checkValid);
    const getLtp = async () => {
      gridRefBidAsk?.current?.api?.setRowData([]);
      setSelectedStockLiveData({});
      if (selectedValueSymbol !== "Symbol") {
        let data = [
          {
            value: apiBody.current.sym,
            Scripcode: apiBody.current.Scripcode,
            Exch: apiBody.current.Exchange,
            ExchType: "CASH",
          },
        ];
        registerSymbolForLiveData("register", data, true);
      }
    };
    getLtp();
  }, [apiBody.current.Scripcode]); /// to prevent if user select same symbol again
  // }, [selectedSymbol]);

  useEffect(() => {
    getClientsIds();
    if (liveData[apiBody.current.Scripcode]) {
      setSingleLtp(liveData[apiBody.current.Scripcode]?.LTP);
      setSelectedStockLiveData(liveData[apiBody.current.Scripcode]);
      gridRefBidAsk?.current?.api?.setRowData(
        liveData[apiBody.current.Scripcode]?.BidAsk
      );
    }
  }, [liveData[apiBody.current.Scripcode]?.LTP]);

  console.log("liveData", liveData)

  const checkOrderType = (price, slPrice) => {
    if (deliveryType == "MKT") {
      //marketorder
      // return price == 0 && slPrice == 0;
      return true;
    } else if (deliveryType == "SL") {
      //stoplimit
      return price > 0 && slPrice > 0;
    } else if (deliveryType == "SM") {
      if (buySell === true && slPrice >= selectedStockLiveData?.LTP) {
        return true;
      } else if (buySell === false && slPrice <= selectedStockLiveData?.LTP) {
        return true;
      } else {
        return false;
      }
    } else if (deliveryType == "Lim") {
      //limit order
      // return price > 0 && slPrice == 0;
      return price > 0;
    }
  };
  //to check if order is valid or not
  useEffect(() => {
    const symbol = apiBody.current["sym"];
    const price = apiBody.current["price"];
    const slPrice = apiBody.current["sl_price"];
    //To set exchange on change of stock
    if (apiBody.current.Exchange)
      setExchange(
        apiBody.current.Exchange === "B" || apiBody.current.Exchange === "BSE"
          ? "BSE"
          : "NSE"
      );

    if (
      (symbol && clientInputList && switch_GpCl == "client") ||
      (symbol && groupInputList?.length && switch_GpCl == "group")
    ) {
      let result1 = true;
      if (switch_GpCl == "client") {
        result1 = clientInputList.every((item) => {
          const price = selectedStockLiveData
            ? Number(selectedStockLiveData?.LTP)
            : 1;
          const qty = item["Quantity"];
          const margin = item["CashMargin"];
          return qty * price <= margin && qty > 0;
        });
      } else {
        result1 = apiBody.current;
      }
      const result2 = checkOrderType(price, slPrice);

      const result = result1 && result2;
      if (result) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, [checkValid]);

  useEffect(() => {
    if (!state || !apiBody.current) return;

    const exchange = apiBody.current.Exchange?.toUpperCase();
    setExchange(exchange === "B" || exchange === "BSE" ? "BSE" : "NSE");
  }, [state, apiBody.current?.Exchange]);

  // Limit the input length to 5 characters
  const handleChange = (event) => {
    const newValue = event.target.value.slice(0, 5);
    setInputValue(newValue);
  };

  //--------------------------------------------------------------------
  const closeHandler = () => {
    setSelectedSymbol(new Set(["Symbol"]));
    setSelectedOption(new Set(["Equity"]));
    setPlaceOrderVisible(false);
    setSingleLtp(null); //setting shares to null otherwise it will throw error
    apiBody.current = {
      ...apiBody.current,
      sym: null,
      disclose_qty: null,
      price: 0,
      intraday: false,
      sl_price: 0,
      exch: null,
      exch_id: null,
      LotSize: null,
      Scripcode: null,
      clients: [],
    };
    clients.current["selectedClients"].forEach((clientId) => {
      if (clients.current.data[clientId]) {
        clients.current.data[clientId].Quantity = 1; // Update Quantity for read cache to newone again
      }
    });
    setGroupInputList([]);
    setOrderStat(true);
    setExchange("NSE");
    setExchangeSegment("CM");
    setProduct("NRML");
    setDeliveryType("MKT");
    setClientInputList(null);
    clients.current["selectedClients"] = [];
    setIsValid(false);
  };

  useEffect(() => {
    return () => {
      setQty(0); //
    };
  }, []);

  //setting input for apibody
  const setInputApi = (field, type, value) => {
    if (type == "number") {
      apiBody.current[field] = Number(value);
    } else if (type == "string") {
      apiBody.current[field] = String(value);
    } else if (type == "float") {
      apiBody.current[field] = float(value);
    } else if (type == "boolean") {
      apiBody.current[field] = value;
    }
    // setCheckValid(!checkValid);
  };

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

    oldApiBody.clients.forEach((item) => {
      let clientId = Object.keys(item)[0];

      let qty = item[clientId];

      newApiBody[clientId] = {
        OrderSide: buySell ? "BUY" : "SELL",
        // OrderSide: oldApiBody["BuySell"] == "B" ? "BUY" : "SELL",
        Symbol: oldApiBody.sym,
        LimitPrice: oldApiBody.price,
        SLTriggerPrice: oldApiBody.sl_price,
        Exchange: exchange == "NSE" ? "NSECM" : "BSECM",
        LotSize: oldApiBody.LotSize || 1,
        Scripcode: oldApiBody.Scripcode,
        Quantity: qty,
        OverNightSL:
          isChecked === false ? "OFF" : isChecked === true ? "ON" : "",
        ProductType: product,
        OrderType: orderType(),
      };
    });

    return newApiBody;
  };

  //function to call ipc and api to place order
  const placeOrder = async () => {
    if (processRef.current) return;
    processRef.current = true;
    setConfirmationToggle(false);
    setOrderStatVisible(true);
    setOrderStat(true);
    setCashSymbol({});
    var clData = [];
    let clientOrders = {};

    if (switch_GpCl == "client") {
      clData = clientInputList;
      clientOrders = clData?.map((item) => {
        var temp = {};
        temp[item["ClientId"]] = Number(item["Quantity"]);
        return temp;
      });
    } else if (switch_GpCl == "group") {
      clData = groupData;
      clientOrders = clData?.map((item) => {
        var temp = {};
        temp[item["client_code"]] =
          item["shares_qty_with_invested"] === "NA" ||
            !item["shares_qty_with_invested"]
            ? 0
            : Number(item["shares_qty_with_invested"]);
        return temp;
      });
    }

    //setting clients and their respective quantity for placing orders

    apiBody.current = {
      ...apiBody.current,
      intraday: deliveryType == "INT",
      exch: exchange,
      exchSgmt: exchangeSegment,
      product: product,
      OverNightSL: isChecked === false ? "OFF" : isChecked === true ? "ON" : "",
      ...{ clients: clientOrders },
    };
    //making price and sl price to 0 on intraday
    if (deliveryType == "MKT") {
      apiBody.current = {
        ...apiBody.current,
        price: 0,
        sl_price: 0,
      };
    }

    if (deliveryType == "SM") {
      apiBody.current = {
        ...apiBody.current,
        price: 0,
      };
    }

    if (deliveryType == "Lim") {
      apiBody.current = {
        ...apiBody.current,
        sl_price: 0,
      };
    }
    var requiredApiBody = convertApiBody(apiBody.current);

    /// ---- update the ApiBody for which client have quantity zero. ----- ///

    const filteredrequiredApiBody = Object.fromEntries(
      Object.entries(requiredApiBody).filter(
        ([key, value]) => value.Quantity !== 0
      )
    );

    try {
      // const result = await ipcRenderer.invoke("ipc-placeOrder", ipcReqBody);
      const result = await placeOrder_api(filteredrequiredApiBody, "apiToken");

      if (result?.status === "success") {
        const statusCollectionArray = [];
        const failOrderClients = [];
        const successOrderClients = statusCollectionArray;
        setBuySell(true);
        setClientInputList(null);
        clients.current["selectedClients"].forEach((clientId) => {
          if (clients.current.data[clientId]) {
            clients.current.data[clientId].Quantity = 1; // Update Quantity for read cache to newone again
          }
        });
        const keys = result?.data.map((obj) => Object.keys(obj)).flat();
        // setOrderReqStatusMessage(
        //   `Order placed ${statusCollectionArray} and Order Request failed for ${
        //     failOrderClients.length === 0 ? "0" : ""
        //   } clients ${failOrderClients.length !== 0 ? failOrderClients : ""}`
        // );
        setOrderReqStatusMessage(warnMessage.success_order_message);
        setSuccessClients(successOrderClients);
        setFailClients(failOrderClients);
        setRefreshTokenTable(Math.random());
      }
    } catch (error) {
      console.log("error in place order equity", error);
      // setOrderReqStatusMessage(`Order rejected`);
    } finally {
      setTimeout(() => {
        setOrderReqStatusMessage(warnMessage.success_order_message);
      }, 1500);
    }

    setRefreshToken(Math.random());
    // setOrderStat(false);
    closeHandler();
    processRef.current = false;
  };

  var columns = [
    { headerName: "S.No.", field: "sno", width: 90, hide: true }, // Adjust column width as needed
    { headerName: "Bid QTY", field: "BidQty", flex: 1 }, // Adjust column width as needed
    { headerName: "Bid Rate", field: "BidRate", flex: 1 }, // Adjust column width as needed
    { headerName: "Ask QTY", field: "OfferQty", flex: 1 }, // Adjust column width as needed
    { headerName: "Ask Rate", field: "OfferRate", flex: 1 }, // Adjust column width as needed
  ];
  const colorGrid = "#F7F7F7";
  const colorButton = buySell ? "$success" : "$error";
  const modalheight = selectedStockLiveData ? "13rem" : "8rem";

  const [isChecked, setChecked] = useState(false);

  const handleToggle = () => {
    setChecked(!isChecked);
  };

  // const validData = clientInputList?.filter((item) => item?.Quantity >= 1);
  // const isValidDisable = validData && validData.length > 0;
  // const quantityDisable = qty > 0;

  const validData = useMemo(() => {
    return Array.isArray(clientInputList)
      ? clientInputList?.filter((item) => item?.Quantity >= 1)
      : [];
  }, [clientInputList]);

  const isValidDisable = useMemo(() => {
    return validData.length > 0;
  }, [validData]);

  const quantityDisable = useMemo(() => {
    return qty > 0;
  }, [qty]);

  const placeOrderScipBook = async () => {
    try {
      const response = await axiosInstance.post(scripBook.scripBook, symbol);
      if (!response) {
        return response?.message;
      }
      return response?.data;
    } catch (error) {
      return error;
    }
  };

  const groupListData = useCallback(async () => {
    try {
      const client_ids = group_Clients[apiBody.current?.clients[0]];

      const response = await axiosInstance.post(client.invested_margin, {
        ltp: Number(selectedStockLiveData && selectedStockLiveData?.LTP),
        Percentage: qty,
        client_ids,
      });
      if (!response) {
        return response?.message;
      }
      if (response?.data.data.length) {
        const updatedData = response?.data.data.map((item) => ({
          ...item,
          shares_qty_with_invested:
            item["available_balance"] <= 0 || isNaN(item["available_balance"])
              ? "-"
              : item["shares_qty_with_invested"],
        }));
        setGroupData(updatedData);
      } else {
        setGroupData([]);
      }
      return response?.data.data;
    } catch (error) {
      return error;
    }
  }, [selectedStockLiveData, qty, apiBody, group_Clients]);

  useEffect(() => {
    placeOrderScipBook();
  }, []);

  const handlerGetBrokerMargin = async (symbol) => {
    if (symbol.label) {
      const brokerMargin = {
        brokername: "MOSWAL",
        margin: "4",
        finalmargin: 0
      };
      const message = `No data found for symbol: ${symbol.label} and brokername: MOSWAL`
      try {
        const res =
          await getBrokerMarginHandler(symbol.label, "MOSWAL");
        if (res && Object.keys(res)?.length) {
          if (res?.message) {
            // toast.warn(message)
          }
          setleverageData({ ...brokerMargin, finalmargin: res.finalmargin });
        }
        else {
          setleverageData(brokerMargin);
        }
      } catch (error) {
        console.log("error in get broker margin");
        setleverageData(brokerMargin);
      }
    }
  }



  useEffect(() => {
    setEquityQty();
  }, [switch_GpCl]);

  return (
    <>
      <CustomConfirmationModel
        confirmationToggle={confirmationToggle}
        setConfirmationToggle={setConfirmationToggle}
        orderData={{
          ...apiBody.current,
          orderType: deliveryType,
          productType: product,
          BuySell: buySell ? "B" : "S",
        }}
        submitHandler={placeOrder}
        closeHandler={() => setConfirmationToggle(false)}
        isDisabledSubmit={processRef.current}
      />
      {/* <Confirmation
        confirmationToggle={confirmationToggle}
        setConfirmationToggle={setConfirmationToggle}
        placeOrder={placeOrder}
        closeHandler={closeHandler}
      /> */}

      <div className={classes.selltabs}>
        <Navbar.Content
          className="navbar-item-zIndex-99"
          activeColor="primary"
          hideIn="xs"
          variant="underline"
        >
          <Navbar.Link
            isActive={!activeTabs}
            href="#"
            onClick={() => {
              setActiveTabs(!activeTabs);
            }}
          >
            CASH & EQUITY
          </Navbar.Link>
          {/* <Navbar.Link
            isActive={activeTabs}
            onClick={() => {
              router.push("/options");
              setActiveTabs(!activeTabs);
            }}
          >
            F&O
          </Navbar.Link> */}
        </Navbar.Content>
      </div>
      <div style={{ top: "60px", position: "absolute", right: "0px" }}>
        <Row justify="center" align="center">
          <TopRightNavigationButton></TopRightNavigationButton>
        </Row>
      </div>
      <Grid.Container gap={0} justify="left">
        <Grid md={15} sm={8} xs={20}>
          <div className="placeModalLeftSection" style={{ width: "100%" }}>
            <Row justify="flex-start" css={{ width: "auto" }}>
              <Navbar.Content
                variant={"highlight-solid"}
                activeColor={buySell ? "success" : "error"}
              >
                <Col
                  css={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <Grid md={15}>
                    <Card.Body
                      css={{
                        pl: "$8",
                        pt: "$1",

                        "@media (min-width: 768px)": {
                          alignItems: "center",
                          pt: "$10",
                        },
                      }}
                    >
                      <Row style={{ zIndex: 10 }}>
                        <Col className={classes.spaceleft}>
                          <div className={classes.content}>
                            <Text css={{ mr: "$0", mt: "$1" }}></Text>
                          </div>

                          <Row
                            justify="flex-start"
                            align="center"
                            css={{
                              width: "16.8rem",
                              mt: "$1",
                              overscrollBehavior: "none",
                              overflowX: "hidden",
                            }}
                          >
                            <Button
                              className={classes.buy}
                              bordered
                              borderWeight={"light"}
                              auto
                              flat
                              css={{
                                background: "#F7F6F9",
                                borderColor: "$green600",
                                minWidth: "90px",
                                justifyContent: "center",
                                color: "#838383",
                                borderRadius: "0",
                                borderColor: "$accents3",
                              }}
                            >
                              <Navbar.Link
                                isActive={buySell}
                                css={{
                                  minWidth: "120px",
                                  justifyContent: "center",
                                }}
                                onClick={() => {
                                  setBuySell(true);
                                  setNavtabs(true);
                                  setPlaceOrderVisible(true);
                                  apiBody.current = {
                                    ...apiBody.current,
                                    BuySell: "B",
                                  };
                                }}
                                variant="highlight-solid"
                                itemCss={{
                                  fontWeight: "500",
                                  fontSize: "1rem",
                                }}
                              >
                                BUY
                              </Navbar.Link>
                            </Button>

                            <Button
                              className={classes.sell}
                              auto
                              flat
                              bordered
                              borderWeight={"light"}
                              css={{
                                background: "#F7F6F9",
                                minWidth: "90px",
                                justifyContent: "center",
                                color: "#838383",
                                borderRadius: "0",
                                borderColor: "$accents3",
                              }}
                            >
                              <Navbar.Link
                                isActive={!buySell}
                                css={{
                                  minWidth: "120px",
                                  justifyContent: "center",
                                }}
                                onClick={() => {
                                  setBuySell(false);
                                  setNavtabs(false);
                                  setPlaceOrderVisible(true);
                                  apiBody.current = {
                                    ...apiBody.current,
                                    BuySell: "S",
                                  };
                                }}
                                itemCss={{
                                  fontWeight: "500",
                                  fontSize: "1rem",
                                }}
                              >
                                SELL
                              </Navbar.Link>
                            </Button>
                          </Row>
                        </Col>

                        <Col className={classes.spaceleft}>
                          <div className={classes.content}>
                            <Text
                              css={{ mr: "$0", mt: "$1", ml: "20px" }}
                            ></Text>
                          </div>
                          <div
                            className="optionListContainer"
                            style={{
                              width: "270px",
                            }}
                          >
                            {/* <Select
                              value={cashSymbol}
                              placeholder="Select Symbols"
                              filterOption={createFilter({
                                ignoreAccents: false,
                              })}
                              classNamePrefix="select Symbol"
                              maxMenuHeight={120}
                              components={{
                                Option: CustomOption,
                                MenuList: CustomMenuList,
                              }}
                              menuPosition="fixed"
                              isSearchable={true}
                              onChange={(symbol) => {
                                setSymbolApi(symbol);
                                setOptionData([])
                              }}
                              isLoading={loading}
                              options={optionData}
                              styles={customStyles}
                              // options={allSymbols.current}
                              onInputChange={handleInputChange}
                            // options={
                            //   exchange == "NSE"
                            //     ? symbolNamesNSE.current
                            //     : symbolNamesBSE.current
                            // }
                            /> */}
                            <CustomSelect
                              value={cashSymbol}
                              onChange={(symbol) => {
                                setSymbolApi(symbol);
                                handlerGetBrokerMargin(symbol)
                              }}
                              placeholder="Select Symbol"
                              customStyles={customStyles}
                              exchangeType={"C"}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Spacer y={0.5} />
                      <Divider></Divider>
                      <Row
                        className="AARTIIND"
                        justify="flext-start"
                        css={{ width: "", ml: "$", mt: "$2" }}
                      >
                        {selectedStockLiveData.LTP ? (
                          <SymbolCard
                            buySell={buySell}
                            symbolName={selectedValueSymbol}
                            ltp={
                              selectedStockLiveData &&
                              selectedStockLiveData?.LTP //
                            }
                            sign={
                              selectedStockLiveData &&
                                selectedStockLiveData?.PrevDayClose &&
                                (
                                  selectedStockLiveData?.LTP -
                                  selectedStockLiveData?.PrevDayClose
                                )?.toFixed(2) > 0
                                ? "+"
                                : "-"
                            }
                            percentageChange={
                              selectedStockLiveData &&
                              selectedStockLiveData?.PrevDayClose &&
                              ((selectedStockLiveData?.LTP -
                                selectedStockLiveData?.PrevDayClose) /
                                selectedStockLiveData?.LTP) *
                              100
                            }
                            unitChange={
                              selectedStockLiveData &&
                              selectedStockLiveData?.PrevDayClose &&
                              selectedStockLiveData?.LTP -
                              selectedStockLiveData?.PrevDayClose //
                            }
                          />
                        ) : (
                          ""
                        )}
                      </Row>
                    </Card.Body>
                  </Grid>
                  {selectedStockLiveData.LTP ? (
                    <Row
                      className="LASTTRADE"
                      justify="left"
                      css={{
                        marginLeft: "$",
                        width: "100%",
                        mt: "$18",
                      }}
                    >
                      <Row
                        justify="left"
                        css={{
                          justifyContent: "left",
                          ml: "-$20",
                          mt: "$6",
                          height: "1rem",
                        }}
                      >
                        {/* <Spacer x={-4.8} /> */}
                        {/* <Col
                          css={{
                            width: "max-content",

                            ml: "-$18",
                          }}
                        >
                          <Text
                            color="black"
                            h5
                            css={{ mt: "$1", width: "inherit" }}
                          >
                            LAST TRADE
                          </Text>
                        </Col> */}

                        {/* <Spacer x={1.2} /> */}
                      </Row>
                      <Spacer x={-8} />
                      <Col css={{ mr: "$12" }}>
                        <Spacer y={2.2} />
                        <Text color="#889096" h6>
                          VOLUME
                        </Text>
                        <Text color="black">
                          {" "}
                          {selectedStockLiveData?.Volume
                            ? numberFormatter(selectedStockLiveData?.Volume)
                            : "-"}
                        </Text>
                      </Col>
                      <Col css={{ mr: "$12" }}>
                        <Spacer y={2.2} />
                        <Text color="#889096" h6>
                          LTQ
                        </Text>
                        <Text color="black">
                          {selectedStockLiveData?.LTQ || "-"}
                        </Text>
                      </Col>
                      <Col css={{ mr: "$12" }}>
                        <Spacer y={2.2} />
                        <Text color="#889096" h6>
                          TIME
                        </Text>
                        <Text color="black">
                          {selectedStockLiveData?.Time || "-"}
                        </Text>
                      </Col>
                      <Col css={{ mr: "$12" }}>
                        <Spacer y={2.2} />
                        <Text color="#889096" h6>
                          LOWERCIRCUIT
                        </Text>
                        <Text color="black">
                          {selectedStockLiveData?.LowerCktLimit
                            ? selectedStockLiveData?.LowerCktLimit
                            : "-"}
                        </Text>
                      </Col>
                      <Col css={{ mr: "$12" }}>
                        <Spacer y={2.2} />
                        <Text color="#889096" h6>
                          UPPERCIRCUIT
                        </Text>
                        <Text color="black">
                          {selectedStockLiveData?.UpperCktLimit
                            ? selectedStockLiveData?.UpperCktLimit
                            : "-"}
                        </Text>
                      </Col>
                      <Col css={{ mr: "$12" }}>
                        <Spacer y={2.2} />
                        <Text color="#889096" h6>
                          MTF
                        </Text>
                        <Text style={{ whiteSpace: "nowrap" }} className="width-fit-content primary-text-color">
                          {leverageData.margin ? `Upto ${leverageData.margin}x` : "-"}
                        </Text>
                      </Col>
                      <Spacer x={2} />
                    </Row>
                  ) : (
                    ""
                  )}
                </Col>
              </Navbar.Content>
            </Row>
          </div>

          <Spacer x={1} />
          <Card
            className="last-5"
            variant="bordered"
            css={{
              width: "55%",
              maxHeight: "calc(100vh - 20px)",
              alignContent: "center",
              height: modalheight,
              borderColor: "#DADADA",
            }}
          >
            <Card.Header css={{ padding: "10px" }}>
              <Text
                h6
                color={selectedValueSymbol !== "Symbol" ? "#0072F5" : "#808080"}
              >
                Last Bid/Ask History
              </Text>
            </Card.Header>
            <Card.Body css={{ overflow: "hidden", padding: "0" }}>
              <div className="watchlist_theme">
                <AgGridReact
                  ref={gridRefBidAsk}
                  onGridReady={(params) => params.api.setRowData([])}
                  columnDefs={columns}
                  suppressHorizontalScroll={true}
                  domLayout="autoHeight"
                  overlayNoRowsTemplate="NO DATA FOUND"
                ></AgGridReact>
              </div>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
      <Spacer y={0.1} />

      <Grid.Container justify="flex-start" css={{ flexWrap: "nowrap" }}>
        {switch_GpCl == "client" ? (
          <ClientOrder
            apiBody={apiBody}
            clients={clients}
            clientInputList={clientInputList}
            setClientInputList={setClientInputList}
            setCheckValid={setCheckValid}
            checkValid={checkValid}
            buySell={buySell}
            leverageData={leverageData}
            product={product}
          />
        ) : (
          <GroupOrder
            apiBody={apiBody}
            clients={clients}
            groupInputList={groupInputList}
            setGroupInputList={setGroupInputList}
            setCheckValid={setCheckValid}
            checkValid={checkValid}
            buySell={buySell}
            cashEquity={true}
            groupData={groupData}
            setGroupData={setGroupData}
            groupListData={groupListData}
            selectedStockLiveData={selectedStockLiveData}
          />
        )}
        <Spacer x={1} />
        <Card
          className={classes.orderDetails}
          variant="bordered"
          css={{
            flexBasis: "55%",
            background: colorGrid,
            overflow: "hidden",
            borderColor: "transparent",
            "@media (min-width: 1920px)": {
              height: selectedStockLiveData
                ? "calc(78vh - 300px)"
                : "calc(106vh - 80px)",
              width: "98%",
            },
            "@media (min-width: 1366px)": {
              overflowY: "hidden",
              overflowWrap: "break-word",
              height: selectedStockLiveData
                ? "calc(80vh - 100px)"
                : "calc(95vh - 260px)",

              width: "100%",
            },
          }}
        >
          <Card.Body>
            <Spacer y={-0.8} />
            <div className>
              <Row
                justify="left"
                css={{
                  p: "$1",
                  mb: "$8",
                }}
              >
                <Text
                  h1
                  color="#2C2C2C"
                  size={"$xl"}
                  css={{ ml: "$2", fontFamily: "$sans" }}
                >
                  {" "}
                  Order Details
                </Text>
              </Row>
            </div>
            <Spacer y={-1} />
            <Row css={{ flexDirection: "column" }}>
              <Text
                h3
                color="#2C2C2C"
                size={"$lg"}
                css={{ pl: "$5", fontFamily: "$sans" }}
              >
                {" "}
                Exchange
              </Text>
              <Radio.Group
                css={{ pr: "55px", paddingLeft: "5px" }}
                value={exchange}
                orientation="horizontal"
                color="secondary"
                onChange={setExchange}
              >
                <Radio value="NSE" className={classes.radio} isDisabled={true}>
                  <Text
                    size={"$md"}
                    css={{
                      mt: "$.5",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "18px",
                    }}
                  >
                    NSE
                  </Text>
                </Radio>
                <Radio
                  value="BSE"
                  css={{ pr: "$8" }}
                  className={classes.radio}
                  isDisabled={true}
                >
                  <Text
                    size={"$md"}
                    css={{
                      mt: "$.5",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "18px",
                    }}
                  >
                    BSE
                  </Text>
                </Radio>
              </Radio.Group>
            </Row>

            <Row css={{ flexDirection: "column" }}>
              <Text
                h3
                color="#2C2C2C"
                size={"$lg"}
                css={{ pl: "$5", fontFamily: "$sans", marginTop: "6px" }}
              >
                {" "}
                Type
              </Text>

              <Radio.Group
                css={{ mr: "$-1" }}
                value={deliveryType}
                orientation="horizontal"
                color="secondary"
                onChange={(val) => {
                  setDeliveryType(val);
                  setCheckValid(!checkValid);
                }}
              >
                <Row>
                  <Col
                    css={{
                      mr: "$8",
                      display: "inherit",
                      paddingLeft: "5px",
                    }}
                  >
                    <Radio value="MKT" className={classes.radio}>
                      {" "}
                      <Text
                        size={"$md"}
                        css={{
                          mt: "$.5",
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: "18px",
                        }}
                      >
                        MKT
                      </Text>
                    </Radio>
                  </Col>
                  <Col css={{ mr: "$14", display: "inherit" }}>
                    <Radio value="Lim" className={classes.radio}>
                      {" "}
                      <Text
                        size={"$md"}
                        css={{
                          mt: "$.5",
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: "18px",
                        }}
                      >
                        LIMIT
                      </Text>
                    </Radio>

                    <Radio value="SM" className={classes.radio}>
                      {" "}
                      <Text
                        size={"$md"}
                        css={{
                          mt: "$.5",
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: "18px",
                        }}
                      >
                        SLM
                      </Text>
                    </Radio>
                    <Radio value="SL" className={classes.radio}>
                      {" "}
                      <Text
                        size={"$md"}
                        css={{
                          mt: "$.5",
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: "18px",
                        }}
                        x
                      >
                        SLL
                      </Text>{" "}
                    </Radio>
                  </Col>
                </Row>
              </Radio.Group>
            </Row>

            <Spacer y={0.6} />

            <Row css={{ flexDirection: "column" }}>
              <Text
                h3
                color="#2C2C2C"
                size={"$lg"}
                css={{ pl: "$5", fontFamily: "$sans" }}
              >
                {" "}
                Product
              </Text>

              <Radio.Group
                value={product}
                orientation="horizontal"
                color="secondary"
                css={{ pr: "$17", pl: "5px" }}
                onChange={setProduct}
              >
                <Radio
                  value="NRML"
                  css={{ mr: "$2" }}
                  className={classes.radio}
                >
                  <Text
                    size={"$md"}
                    css={{
                      mt: "$.5",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "18px",
                    }}
                  >
                    DELIVERY
                  </Text>
                </Radio>
                <Spacer x={0.1} />
                <Radio value="MIS" className={classes.radio}>
                  {" "}
                  <Text
                    size={"$md"}
                    css={{
                      mt: "$.5",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "18px",
                    }}
                  >
                    INTRADAY
                  </Text>
                </Radio>
                <Radio value="MTF" className={classes.radio}>
                  <Text
                    size={"$md"}
                    css={{
                      mt: "$.5",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "18px",
                    }}
                  >
                    MTF{" "}
                    <span className="primary-text-color"> ( MOSWAL only )</span>
                  </Text>
                </Radio>
              </Radio.Group>
            </Row>

            <Spacer y={1} />

            <Row css={{ flexDirection: "column" }}>
              <Col
                css={{ width: "fit-content", display: "flex" }}
                className="input-text"
              >
                <Row justify="flex-start" css={{ pl: "$6" }}>
                  <Text
                    h3
                    color="#2C2C2C"
                    css={{
                      fontFamily: "$sans",
                      width: "80px",
                      margin: "5px 0px 0 5px",
                    }}
                    size={"$sm"}
                  >
                    Limit Price
                  </Text>
                  <Input
                    css={{
                      ml: "$",
                      width: "",
                      "@media (min-width: 1920px)": {
                        ml: "$10",
                      },
                    }}
                    shadow={false}
                    placeholder="0.00"
                    type="number"
                    disabled={deliveryType === "MKT" || deliveryType === "SM"}
                    onKeyDown={blockInvalidChar}
                    onChange={({ target: { value } }) => {
                      setInputApi("price", "number", value);
                    }}
                    onBlur={handleChange}
                  />
                </Row>
                <Spacer y={0.4} />
                <Row justify="left" css={{ pl: "$1" }}>
                  <Text
                    h3
                    color="#2C2C2C"
                    css={{
                      fontFamily: "$sans",
                      width: "95px",
                      margin: "5px 0px 0 0",
                    }}
                    size={"$sm"}
                  >
                    Trigger Price
                  </Text>
                  <Input
                    placeholder="0.00"
                    css={{
                      ml: "$",
                      width: "",
                      "@media (min-width: 1920px)": {
                        ml: "$10",
                      },
                    }}
                    disabled={deliveryType === "MKT" || deliveryType === "Lim"}
                    type="number"
                    onKeyDown={blockInvalidChar}
                    onChange={({ target: { value } }) => {
                      setInputApi("sl_price", "number", value);
                    }}
                    onBlur={handleChange}
                  />
                </Row>
              </Col>
              <Col>
                <Row justify="flex-start" css={{ pl: "$6" }}>
                  <Text
                    h3
                    color="#2C2C2C"
                    css={{
                      fontFamily: "$sans",
                      width: "150px",
                      margin: "5px 0px 0 5px",
                    }}
                    size={"$sm"}
                  >
                    Overnight Stop Loss
                  </Text>
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
              </Col>
              <Col>
                <Row
                  justify="center"
                  css={{
                    ml: "$",
                    mt: selectedStockLiveData ? "$15" : "$15",
                    "@media (min-width: 1920px)": {
                      mt: selectedStockLiveData ? "$32" : "$20",
                      width: "100%",
                    },
                  }}
                >
                  <Col
                    css={{ width: "50%", padding: "0 10px 0" }}
                  // className="btcancel"
                  >
                    <Button
                      className="secondary-button"
                      auto
                      css={{
                        width: "180px",
                        borderRadius: "8px",
                        "@media (min-width: 1920px)": { width: "100%" },
                      }}
                      flat
                      onPress={() => {
                        router.push("/equity");
                        closeHandler();
                        setCashSymbol({});
                      }}
                    >
                      Cancel
                    </Button>
                  </Col>
                  <Spacer x={0.6} />
                  <Col
                    css={{ width: "50%", padding: "0 0px 0 10px" }}
                    className={
                      navtabs !== true
                        ? "btPlace"
                        : navtabs === false
                          ? "#17c964"
                          : buySell && navtabs !== false
                            ? "btnclassText"
                            : "btPlace"
                    }
                    style={{
                      cursor:
                        switch_GpCl === "client"
                          ? isValidDisable
                            ? "pointer"
                            : "not-allowed"
                          : switch_GpCl === "group"
                            ? quantityDisable
                              ? "pointer"
                              : "not-allowed"
                            : "not-allowed",
                    }}
                  >
                    <Button
                      bordered
                      borderWeight={"light"}
                      css={{
                        width: "180px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        borderColor: "$accents3",
                        background: colorButton,
                        // "@media(min-width:1920px)": {
                        width: "100%",
                        // }
                        opacity:
                          switch_GpCl === "client"
                            ? isValidDisable
                              ? 1
                              : 0.6
                            : switch_GpCl === "group"
                              ? quantityDisable
                                ? 1
                                : 0.6
                              : 0.6,
                      }}
                      auto
                      disabled={
                        switch_GpCl === "client"
                          ? !isValidDisable
                          : switch_GpCl === "group"
                            ? !quantityDisable
                            : true
                      }
                      onPress={async () => {
                        setConfirmationToggle(true);
                      }}
                    >
                      Place Order
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* for clients or groups */}
      </Grid.Container>
    </>
  );
};

export default PlaceOrder;
