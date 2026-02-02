import {
  Card,
  Navbar,
  Row,
  Spacer,
  Button,
  Text,
  Switch,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import DashboardActionTable from "../dashboard/dashboardTables/dashboardTablesAction";
import { IconRefresh } from "@tabler/icons-react";
import { useGlobalContext } from "../../context/GlobalContext";
import CmdCli from "./cmdCli";
import BasketOrderBase from "../dashboard/watchlist/order/basketOrder/basketOrderBase";
import { useState, useEffect, useRef } from "react";
import { dashboardTabHeader } from "../../APIS/columnConstants";
import SquareOffModal from "../dashboard/dashboardTables/SquareOffModal";
import { getSquareOffExchange } from "../../helpers";
import { AiOutlineDownload } from "react-icons/ai";
import {
  ExchangeSquareOff,
  OrderType,
  ProductType,
  variety_type,
  warnMessage,
} from "../../constant/constant";
import {
  cancelOrder,
  squareOffOrder,
} from "../../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import { userValidateSession } from "../../../services/auth/auth.service";
import MultipleModifyOrderModal from "../dashboard/dashboardTables/MultipleModifyOrderModal";
import CustomOrderConfirmation from "../../layout/CustomOrderConfirmation";
import ConversionOrderModal from "../dashboard/dashboardTables/ConversionOrder";
import CommonConfirmationModal from "../common/CommonConfirmationModal";

const TradeView = ({
  showtable,
  setshowtable,
  tableColumns,
  filteredbody,
  cloneFilteredbody,
  setCloneFilteredbody,
  setFilteredbody,
  isDataLoading,
}) => {
  const {
    setRefreshTokenTable,
    setopenModelFull,
    openModelFull,
    tableDataItem,
    symbolDropdown,
    selectedCheckboxSquareOffHoldings,
    setSelectedCheckboxSquareOffHoldings,
    selectedCheckboxSquareOffNetPositions,
    setSelectedCheckboxSquareOffNetPositions,
    holdingsBulkSquareOff,
    setHoldingsBulkSquareOff,
    setCloneHoldingsBulkSquareOff,
    netPositionsBulkSquareOff,
    setNetPositionsBulkSquareOff,
    setCloneNetPositionsBulkSquareOff,
    holdingsSelectAll,
    setHoldingsSelectAll,
    netPositionsSelectAll,
    setNetPositionsSelectAll,
    modifyOrderData,
    connectToLastClients,
    gridRef,
    fullGridRef,
    cancelOrderData,
    setCancelOrderData,
    setModifyOrderData,
    holdingsFilteredbody,
  } = useGlobalContext();
  const router = useRouter();
  const [showBasket, setShowBasket] = useState(false);
  const [isMount, setIsMount] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [modifyOrdertoggle, setModifyOrderToggle] = useState(false);
  const [cancelOrderToggle, setCancelOrderToggle] = useState(false);
  const [globalExchangeType, setGlobalExchangeType] = useState(false);
  const [conversionOrderToggle, setConversionOrderToggle] = useState(false);
  const [deliveryType, setDeliveryType] = useState("MKT");
  const [isOpen, setIsOpen] = useState(false);

  const navLinkRef = useRef();
  const processRef = useRef(false);

  useEffect(() => {
    if (!isMount) setIsMount(true);
  }, []);

  const globalExchangeHandler = () => {
    setGlobalExchangeType((prev) => !prev);
  };

  ///---- holdings bulk square off handler----///
  const holdingsTableSquareOffHandler = (params) => {
    let payload = {};
    payload[params.data.ClientID] = {
      OrderSide: params?.data?.OrderSide == "SELL" ? "BUY" : "SELL",
      Symbol: params.data.ScripName, //required
      Quantity: +params.data.Quantity, //done
      LimitPrice: 0,
      SLTriggerPrice: 0,
      Exchange:
        getSquareOffExchange(params.data.ExchangeSegment) || !globalExchangeType
          ? ExchangeSquareOff.NSE
          : ExchangeSquareOff.BSE,
      LotSize: 1,
      Scripcode: !globalExchangeType
        ? params.data.ExchangeNSEInstrumentId
        : params.data.ExchangeBSEInstrumentId,
      exchangeNSEInstrumentId: params.data.ExchangeNSEInstrumentId,
      exchangeBSEInstrumentId: params.data.ExchangeBSEInstrumentId,
      // Scripcode: params.data.scrip,
      ProductType: ProductType.NORMAL,
      OrderType: OrderType.MARKET,
      OverNightSL: 0,
    };

    setHoldingsBulkSquareOff((prev) => {
      const isSelected = prev.find((item) => item.rowIndex === params.rowIndex);
      const isUpdatedData = isSelected
        ? prev.filter((item) => item.rowIndex !== params.rowIndex)
        : [...prev, { ...payload, rowIndex: params.rowIndex }];
      setCloneHoldingsBulkSquareOff(isUpdatedData);
      return isUpdatedData;
    });
  };

  ///---- holdings bulk square off handler with Select All----///
  const selectAllholdingsTableSquareOffHandler = (isSelectAllFlag) => {
    const holdingsSelectedAll = isSelectAllFlag
      ? holdingsFilteredbody.map((data, index) => ({
        [data.ClientID]: {
          OrderSide: data?.OrderSide == "SELL" ? "BUY" : "SELL",
          Symbol: data.ScripName, //required
          Quantity: +data.Quantity, //done
          LimitPrice: 0,
          SLTriggerPrice: 0,
          Exchange:
            getSquareOffExchange(data.ExchangeSegment) || !globalExchangeType
              ? ExchangeSquareOff.NSE
              : ExchangeSquareOff.BSE,
          LotSize: 1,
          Scripcode: !globalExchangeType
            ? data.ExchangeNSEInstrumentId
            : data.ExchangeBSEInstrumentId,
          exchangeNSEInstrumentId: data.ExchangeNSEInstrumentId,
          exchangeBSEInstrumentId: data.ExchangeBSEInstrumentId,
          // Scripcode: data.scrip,
          ProductType: ProductType.NORMAL,
          OrderType: OrderType.MARKET,
          OverNightSL: 0,
        },
        rowIndex: index,
      }))
      : [];

    setHoldingsBulkSquareOff(holdingsSelectedAll);
    setCloneHoldingsBulkSquareOff(holdingsSelectedAll);
  };

  ///-- net position bulk square off handler -----///
  const netPositionsTableSquareOffHandler = (params) => {
    let payload = {};
    let symboldata = symbolDropdown || {};
    // let lotsize =
    //   symboldata?.symbolDictionary?.[params?.data?.ExchangeInstrumentId]?.[
    //     "LotSize"
    //   ] || null; //
    let qty = +params.data.Qty < 0 ? -+params.data.Qty : params.data.Qty;
    let lotsize = params.data.LotSize || null;
    let calcQty =
      ["MCXFO"].includes(params.data.ExchangeSegment) &&
        ["IIFLONT"].includes(params.data.Broker)
        ? +params.data.Qty
        : +params.data.Qty / (params.data["LotSize"] || 1);
    let lotsQty = ["NSE", "BSE", "NSECM", "BSECM"].includes(
      params.data.ExchangeSegment
    )
      ? Math.abs(qty)
      : Math.abs(calcQty);

    payload[params.data.ClientID] = {
      OrderSide: params.data.TradeSide == "BUY" ? "SELL" : "BUY",
      Symbol: params.data.Symbol,
      Quantity: qty,
      LimitPrice: 0,
      Broker: params.data.Broker,
      OpenBuyQuantity: params.data?.OpenBuyQuantity,
      OpenSellQuantity: params.data?.OpenSellQuantity,
      BuyAmount: params.data?.BuyAmount,
      SellAmount: params.data?.SellAmount,
      Exchange: getSquareOffExchange(params.data.ExchangeSegment) || "",
      LotSize: lotsize || 1,
      LotsQty: lotsQty,
      Scripcode: +params.data.ExchangeInstrumentId,
      ProductType:
        params?.data?.ProductType == "DELIVERY"
          ? ProductType.NORMAL
          : params?.data?.ProductType == "INTRADAY"
            ? ProductType.INTRA
            : params?.data?.ProductType,
      OrderType: OrderType.MARKET,
      OverNightSL: "OFF",
    };

    setNetPositionsBulkSquareOff((prev) => {
      const isSelected = prev.find((item) => item.rowIndex === params.rowIndex);
      const isUpdatedData = isSelected
        ? prev.filter((item) => item.rowIndex !== params.rowIndex)
        : [...prev, { ...payload, rowIndex: params.rowIndex }];
      setCloneNetPositionsBulkSquareOff(isUpdatedData);
      return isUpdatedData;
    });
  };

  ///-- select All net position bulk square off handler -----///
  const selectAllNetPositionsTableSquareOffHandler = (isSelectAllFlag) => {
    let symboldata = symbolDropdown || {};
    const netPositionsSelectedAll = isSelectAllFlag
      ? filteredbody
        .filter((item) => item.TradeSide !== "-")
        .map((data, index) => ({
          [data.ClientID]: {
            OrderSide: data.TradeSide == "BUY" ? "SELL" : "BUY",
            Symbol: data.Symbol,
            Quantity: +data.Qty < 0 ? -+data.Qty : data.Qty,
            // Quantity: data.Qty,
            LimitPrice: 0,
            SLTriggerPrice: 0,
            Exchange: getSquareOffExchange(data.ExchangeSegment) || "",
            LotSize: data.LotSize,
            Broker: data.Broker,
            OpenBuyQuantity: data?.OpenBuyQuantity,
            OpenSellQuantity: data?.OpenSellQuantity,
            BuyAmount: data?.BuyAmount,
            SellAmount: data?.SellAmount,
            LotsQty: ["NSE", "BSE"].includes(data.ExchangeSegment)
              ? +data.Qty < 0
                ? -+data.Qty
                : data.Qty
              : (["MCXFO"].includes(data.ExchangeSegment) &&
                ["IIFLONT"].includes(data.Broker))
                ? +data.Qty :
                Math.abs(+data.Qty / (data["LotSize"] || 1)),
            // LotSize:
            //   symboldata["symbolDictionary"][data?.ExchangeInstrumentId]?.[
            //     "LotSize"
            //   ] || 1,

            Scripcode: data.ExchangeInstrumentId,
            ProductType:
              data?.ProductType == "DELIVERY"
                ? ProductType.NORMAL
                : ProductType.INTRA,
            OrderType: OrderType.MARKET,
            OverNightSL: "OFF",
          },
          rowIndex: index,
        }))
      : [];

    setNetPositionsBulkSquareOff(netPositionsSelectedAll);
    setCloneNetPositionsBulkSquareOff(netPositionsSelectedAll);
  };

  const dashBoardTabHandler = (tabName) => {
    if (showtable === tabName) return;
    setFilteredbody([]);
    setCloneFilteredbody([]);
    setshowtable(tabName);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === "F3") {
        if (navLinkRef.current) {
          navLinkRef.current.click();
          setFilteredbody([]);
          setCloneFilteredbody([]);
          setshowtable("orderbook");
        }
      } else if (event.ctrlKey && event.key === "F6") {
        if (navLinkRef.current) {
          navLinkRef.current.click();
          setFilteredbody([]);
          setCloneFilteredbody([]);
          setshowtable("tradebook");
        }
      } else if (event.key === "F8") {
        if (navLinkRef.current) {
          navLinkRef.current.click();
          setFilteredbody([]);
          setCloneFilteredbody([]);
          setshowtable("netpositions");
        }
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [showtable]);

  const bulkCancelHandler = async () => {
    if (processRef.current) return;

    processRef.current = true;

    for (const data of cancelOrderData) {
      let apiBody = {};
      const clientId = data.ClientID;
      const body = {
        BrokerOrderId: data.ID,
        Exchange: data.ExchangeSegment,
        ScripCode: 14894,
        UniqueIdentifier: data.OrderUniqueIdentifier,
      };

      apiBody[clientId] = body;

      try {
        const res = await cancelOrder({
          [data.ClientID]: {
            BrokerOrderId: data.ID,
            Exchange: data.ExchangeSegment,
            ScripCode: 14894,
            UniqueIdentifier: data.OrderUniqueIdentifier,
            Variety: variety_type[data["Variety"]] || "NORMAL",
          },
        });
      } catch (error) {
        console.log("error in cancel order", error);
      }
    }

    setRefreshTokenTable(Math.random());
    processRef.current = false;
    setCancelOrderData([]);
    setModifyOrderData([]);
    setCancelOrderToggle(false);
    toast.success(`All Selected Orders are Cancel Successfully.`);
  };

  const handleSubmit = async () => {
    if (processRef.current) return;
    processRef.current = true;

    const bulkSquareOffData =
      showtable === "holdings"
        ? holdingsBulkSquareOff
        : netPositionsBulkSquareOff;

    const rowIndexesToRemove = [];
    for (let items of bulkSquareOffData) {
      const { rowIndex, ...rest } = items;

      rowIndexesToRemove.push(+rowIndex);
      const clientIdKey = Object.keys(rest)[0];

      if (clientIdKey) {
        const clientData = { ...rest[clientIdKey] };

        if (showtable === "netpositions") {
          // clientData.Quantity = clientData.LotsQty;
          clientData.Quantity = ["MCXFO", "MCX"].includes(clientData.Exchange) &&
            ["IIFLONT", "ZERODHA"].includes(clientData.Broker)
            ? clientData.LotsQty : clientData.LotsQty * clientData.LotSize;
          clientData.LotSize = 1;
          delete clientData.LotsQty;
        } else if (showtable === "holdings") {
          // clientData.Quantity = clientData.LotsQty * clientData.LotSize;
          clientData.Quantity = clientData.Quantity;
          clientData.LotSize = 1;
          delete clientData.LotsQty;
          clientData.OverNightSL = "OFF";
          clientData.OrderType = clientData?.OrderType;
          clientData.Exchange = !globalExchangeType
            ? ExchangeSquareOff.NSE
            : ExchangeSquareOff.BSE;
          clientData.Scripcode = !globalExchangeType
            ? +clientData?.exchangeNSEInstrumentId
            : +clientData?.exchangeBSEInstrumentId;
        }

        try {
          const res = await squareOffOrder({
            [clientIdKey]: { ...clientData },
          });
          if (res?.status === "success") {
            if (showtable === "holdings") {
              setSelectedCheckboxSquareOffHoldings([]);
              setHoldingsBulkSquareOff([]);
              setCloneHoldingsBulkSquareOff([]);
              setDeliveryType("MKT");
              if (holdingsSelectAll) setHoldingsSelectAll(false);
            } else if (showtable === "netpositions") {
              setNetPositionsBulkSquareOff([]);
              setCloneNetPositionsBulkSquareOff([]);
              setSelectedCheckboxSquareOffNetPositions([]);
              if (netPositionsSelectAll) setNetPositionsSelectAll(false);
            }
            toast.success(warnMessage.success_squareoff_message);

          }
        } catch (error) {
          toast.error("Order not placed, Something went wrong!");
        }
      }
    }
    // setFilteredbody((prev) => {
    //   const updatedData = prev.filter(
    //     (_, index) => !rowIndexesToRemove.includes(index)
    //   );
    //   return updatedData;
    // });
    setToggle(false);
    setIsOpen(false);
    processRef.current = false;

    setTimeout(() => {
      setRefreshTokenTable(Math.random());
    }, 2000);
  };

  useEffect(() => {
    let timeoutId;
    (async () => {
      try {
        const [_, sessionResult] = await Promise.all([
          connectToLastClients(),
          userValidateSession(),
        ]);
        // const sessionResult = await userValidateSession();

        if (sessionResult && sessionResult?.status === "error") {
          toast.success(`Your session is expired.`);
          timeoutId = setTimeout(() => {
            router.push("/home");
          }, 800);
        }
      } catch (error) {
        console.log("session error", error);
      }
    })();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const onClientExport = () => {
    const gridApi = openModelFull
      ? fullGridRef.current?.api
      : gridRef.current?.api;

    if (gridApi) {
      gridApi.exportDataAsCsv({ fileName: `${showtable}.csv` });
    } else {
      console.warn("Grid is not ready");
    }
  };

  return (
    <>
      <BasketOrderBase showBasket={showBasket} setShowBasket={setShowBasket} />
      <SquareOffModal
        toggle={toggle}
        setToggle={setToggle}
        isDisabled={processRef.current}
        showtable={showtable}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        setIsOpen={setIsOpen}
      />
      <CommonConfirmationModal
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
        handleConfirm={handleSubmit}
      />
      <CustomOrderConfirmation
        toggle={cancelOrderToggle}
        setToggle={() => setCancelOrderToggle(false)}
        closeHandler={() => setCancelOrderToggle(false)}
        submitHandler={bulkCancelHandler}
        headerText={`Order Confirmation`}
        subHeaderText={`Please confirm the order by clicking submit button`}
        submitBtnText={`Cancel Orders`}
        cancelBtnText={`Back`}
        isDisabledConfirm={processRef.current}
      />
      <MultipleModifyOrderModal
        toggle={modifyOrdertoggle}
        setToggle={setModifyOrderToggle}
      />
      <ConversionOrderModal
        toggle={conversionOrderToggle}
        setToggle={setConversionOrderToggle}
      />
      <Card
        variant="bordered"
        className="border-radius-8"
        css={{
          borderColor: "transparent",
          height: "88%",
          ...(isMount &&
            window.innerWidth >= 1620 && {
            height: "100%",
            marginBottom: "-40px",
          }),
        }}
      >
        <Card.Header css={{ width: "100%", padding: "5px 10px" }}>
          <Row css={{ width: "100%" }} justify="space-between">
            <Navbar.Content variant={"highlight"} activeColor={"warning"}>
              <Row justify="flex-start" align="center">
                {dashboardTabHeader.map(({ id, label, value }) => {
                  return (
                    <Navbar.Link
                      key={id.toString()}
                      isActive={showtable === value}
                      ref={navLinkRef}
                      onPress={() => {
                        dashBoardTabHandler(value);
                      }}
                    >
                      <Text
                        h6
                        color="#2C2C2C"
                        css={{ pl: "$5", fontFamily: "$sans", mt: "$12" }}
                      >
                        {label}
                      </Text>
                    </Navbar.Link>
                  );
                })}
              </Row>
              {((showtable === "holdings" &&
                !!selectedCheckboxSquareOffHoldings.length) ||
                (showtable === "netpositions" &&
                  !!selectedCheckboxSquareOffNetPositions.length)) && (
                  <Button
                    className="primary-button border-radius-8"
                    auto
                    flat
                    color="error"
                    onClick={() => setToggle(true)}
                    css={{
                      width: "7rem",
                    }}
                    style={{ marginLeft: "70px" }}
                  >
                    Square Off
                  </Button>
                )}
              {showtable === "netpositions" &&
                !!selectedCheckboxSquareOffNetPositions.length && (
                  <Button
                    className="primary-button border-radius-8"
                    auto
                    flat
                    color="error"
                    onClick={() => setConversionOrderToggle(true)}
                    css={{
                      width: "7rem",
                    }}
                    style={{ marginLeft: "20px" }}
                  >
                    Change position
                  </Button>
                )}
              {showtable === "holdings" && (
                <Row
                  style={{ width: "130px", margin: "0px 20px" }}
                  className="flex-row align-center justify-around column-gap-10"
                >
                  {/* NSE Label */}
                  <Text
                    h6
                    css={{
                      fontWeight: "$bold",
                      marginBottom: "0px",
                      color: !globalExchangeType ? "#3c57a2" : "#A0A0A0", // selected vs unselected
                      transition: "color 0.3s",
                    }}
                  >
                    NSE
                  </Text>

                  {/* Switch */}
                  <Switch
                    className="exch_switch"
                    checked={globalExchangeType}
                    onChange={globalExchangeHandler}
                    color="success"
                  />

                  {/* BSE Label */}
                  <Text
                    h6
                    css={{
                      fontWeight: "$bold",
                      marginBottom: "0px",
                      color: globalExchangeType ? "#3c57a2" : "#A0A0A0", // selected vs unselected
                      transition: "color 0.3s",
                    }}
                  >
                    BSE
                  </Text>
                </Row>
              )}
              {showtable === "orderbook" &&
                !!cancelOrderData.length &&
                !!modifyOrderData.length && (
                  <>
                    <Button
                      className="primary-button border-radius-8"
                      auto
                      flat
                      color="error"
                      onClick={() => setModifyOrderToggle(true)}
                      css={{
                        width: "7rem",
                      }}
                      style={{ marginLeft: "70px" }}
                    >
                      Modify Order
                    </Button>
                    <Button
                      className="primary-button border-radius-8"
                      auto
                      flat
                      color="error"
                      onClick={() => setCancelOrderToggle(true)}
                      css={{
                        width: "7rem",
                      }}
                      style={{ marginLeft: "10px" }}
                    >
                      Cancel Order
                    </Button>
                  </>
                )}
            </Navbar.Content>
          </Row>
          <div
            // style={{ display: "flex", gap: "2rem" }}
            className="flex-row align-center column-gap-1rem justify-end"
          >
            {!!filteredbody?.length && (
              <AiOutlineDownload
                className="cursor-pointer"
                style={{ fontSize: "22px", marginTop: "-4px", color: "gray" }}
                title="Download clients"
                onClick={() => onClientExport(showtable)}
              />
            )}
            <div style={{ width: "1.5rem" }} className="">
              <img
                src="./images/maximize.svg"
                width={20}
                style={{
                  // marginLeft: "15rem",
                  cursor: "pointer",
                }}
                title="expend"
                onClick={() => {
                  setopenModelFull(!openModelFull);
                }}
              />
            </div>
            <div>
              <IconRefresh
                type="button"
                height={20}
                width={20}
                color={"gray"}
                style={{ stroke: "gray" }}
                strokeWidth={1}
                cursor={"pointer"}
                onClick={() => {
                  setRefreshTokenTable(Math.random());
                }}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body css={{ p: "$3" }}>
          <Spacer y={0.5}></Spacer>
          {showtable !== "cli" && showtable !== "basket" ? (
            <DashboardActionTable
              tableColumns={tableColumns}
              filteredbody={filteredbody || []}
              cloneFilteredbody={cloneFilteredbody || []}
              setFilteredbody={setFilteredbody}
              showtable={showtable}
              isDataLoading={isDataLoading}
              onClientExport={onClientExport}
              selectedCheckboxSquareOffHoldings={
                selectedCheckboxSquareOffHoldings
              }
              setSelectedCheckboxSquareOffHoldings={
                setSelectedCheckboxSquareOffHoldings
              }
              selectedCheckboxSquareOffNetPositions={
                selectedCheckboxSquareOffNetPositions
              }
              setSelectedCheckboxSquareOffNetPositions={
                setSelectedCheckboxSquareOffNetPositions
              }
              holdingsTableSquareOffHandler={holdingsTableSquareOffHandler}
              selectAllholdingsTableSquareOffHandler={
                selectAllholdingsTableSquareOffHandler
              }
              netPositionsTableSquareOffHandler={
                netPositionsTableSquareOffHandler
              }
              selectAllNetPositionsTableSquareOffHandler={
                selectAllNetPositionsTableSquareOffHandler
              }
              holdingsSelectAll={holdingsSelectAll}
              setHoldingsSelectAll={setHoldingsSelectAll}
              netPositionsSelectAll={netPositionsSelectAll}
              setNetPositionsSelectAll={setNetPositionsSelectAll}
              globalExchangeType={globalExchangeType}
            />
          ) : (
            <CmdCli />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default TradeView;
