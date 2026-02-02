import { formatNumber } from "../component/dashboard/dashboardTables/helpers";
import { ExchangeSquareOff } from "../constant/constant";

const transformOrderBook = (tablebody) => {
  const transformedData = [];
  const customedCols = [
    "ClientID",
    "OrderSide",
    "OrderType",
    "TradingSymbol",
    "OrderQuantity",
    "OrderStopPrice",
    "OrderPrice",
    "ExchangeTransactTime",
    "OrderStatus",
    "AppOrderID",
  ];

  tablebody.forEach((order, indx) => {
    const data = {
      ClientID: order["ClientID"],
      OrderSide: order["OrderSide"] === "BUY" ? "B" : "S",
      OrderType:
        (order["OrderType"] || "").toLowerCase() === "limit"
          ? "L"
          : ((!order["OrderPrice"] || order["OrderPrice"] == 0) &&
            order["OrderType"] === "Stop Loss") ||
            order["OrderType"] === "StopMarket"
            ? "SLM"
            : (order["OrderType"] === "StopLimit" ||
              order["OrderType"] === "Stop Loss") &&
              order["OrderPrice"] > 0
              ? "SLL"
              : "M",

      Symbol: order["TradingSymbol"],
      Qty:
        order["Broker"] === "IIFLONT" &&
          ["Open", "Pending"].includes(order["OrderStatus"]) &&
          order["LeavesQuantity"] > 0
          ? String(order["LeavesQuantity"])
          : String(order["OrderQuantity"]),
      Lots_Qty:
        (order["Broker"] === "IIFL" && order["ExchangeSegment"] === "MCXFO") ||
          (order["Broker"] === "IIFLONT" &&
            order["ExchangeSegment"] === "MCXCOMM")
          ? +order["OrderQuantity"]
          : order["ExchangeSegment"] === "MCX"
            ? order["Broker"] === "ANGELONE"
              ? formatNumber(+order["OrderQuantity"] / (order["LotSize"] || 1), 2)
              : formatNumber(+order["OrderQuantity"], 2)
            : formatNumber(+order["OrderQuantity"] / (order["LotSize"] || 1), 2),
      "Limit Price": order["OrderPrice"],
      "Trig Price": order["OrderStopPrice"],
      Time: order["ExchangeTransactTime"],
      // Time: order["ExchangeTransactTime"].split(" ")[1],
      Status:
        (order["OrderStatus"] || "")?.toLowerCase() === "open"
          ? "Pending"
          : order["OrderStatus"],
      ID: order["AppOrderID"],
      OrderUniqueIdentifier: order["OrderUniqueIdentifier"],
      Variety: order["Variety"] ?? "NORMAL",
    };
    //passing rest of the data as it is
    Object.keys(order).forEach((key) => {
      if (!customedCols.includes(key)) data[key] = order[key];
    });
    transformedData.push(data);
  });
  return transformedData;
};

const transformTradeBook = (tablebody) => {
  const transformedData = [];
  tablebody.forEach((order, indx) => {
    const data = {
      ClientID: order["ClientID"],
      OrderSide: order["OrderSide"],
      OrderType: order["OrderType"],
      Symbol: order["TradingSymbol"],
      Qty: +order["OrderQuantity"],
      Time:
        (order["ExchangeTransactTime"] || order["TradeDateTime"] || "").split(
          " "
        )[1] ||
        order["ExchangeTransactTime"] ||
        order["TradeDateTime"],
      Status: order["OrderStatus"],
      ID: String(order["AppOrderID"]),
      TradedPrice: order["LastTradedPrice"],
      // TradedPrice: order["OrderAverageTradedPrice"],
      Broker: order["Broker"],
      ClientName: order["ClientName"], //
    };
    transformedData.push(data);
  });

  console.log("transformedData", transformedData, "tablebody", tablebody);

  return transformedData;
};

//transform margin
const transformMargin = async (tableBody) => {
  var transformedData = [];

  tableBody.forEach((item) => {
    if (item) {
      const ClientID = Object.keys(item)[0];
      var ClientData = {};
      ClientData["Cash Available"] = item[ClientID]["cashAvailable"];
      ClientData["Collateral"] = item[ClientID]["collateral"];
      ClientData["Margin Utilized"] = item[ClientID]["marginUtilized"];
      ClientData["Net Margin"] = item[ClientID]["netMarginAvailable"];
      ClientData["MTM"] = item[ClientID]["MTM"];
      ClientData["Unrealized MTM"] = item[ClientID]["UnrealizedMTM"];
      ClientData["Realized MTM"] = item[ClientID]["RealizedMTM"];
      ClientData["ClientID"] = ClientID;
      ClientData["Broker"] = item[ClientID]["Broker"];
      ClientData["ClientName"] = item[ClientID]["ClientName"];

      //checking if there's empty client
      if (ClientData["ClientID"] == 0) return;
      transformedData.push(ClientData);
    }
  });

  return transformedData;
};

const transformHoldings = (tableBody) => {
  let symboldata = null;
  // ipcRenderer.invoke("readMemory-ipc", "symbolDropdown").then((result) => {
  //
  //   symboldata = result["symbolDictionary"];
  //   resolve(symboldata)
  // }).then((resultData)=>{
  //
  // });

  let transformedData = [];
  tableBody.forEach((item, index) => {
    const {
      ClientId,
      ExchangeNSEInstrumentId,
      ExchangeBSEInstrumentId,
      ExchangeMSEInstrumentId,
      HoldingQuantity,
      BuyAvgPrice,
      ScripName,
      Broker,
      ClientName,
      ...rest
    } = item;

    transformedData.push({
      ...rest,
      ExchangeNSEInstrumentId: +ExchangeNSEInstrumentId,
      ExchangeBSEInstrumentId: +ExchangeBSEInstrumentId,
      ExchangeMSEInstrumentId: ExchangeMSEInstrumentId === "NA" ? 0 : +ExchangeMSEInstrumentId,
      Broker: Broker,
      ClientID: ClientId,
      ClientName: ClientName,
      ScripName: ScripName,
      Quantity: String(HoldingQuantity),
      BuyPrice: BuyAvgPrice <= 0 ? String("-") : String(BuyAvgPrice),
      scrip: ExchangeNSEInstrumentId,
      LotSize: 1,
    });
  });
  return transformedData;
};

const transformNetPositions = (tableBody) => {
  let transformedData = [];
  tableBody.forEach((item) => {
    const {
      Broker,
      AccountID,
      TradingSymbol,
      Quantity,
      OpenBuyQuantity,
      OpenSellQuantity,
      BuyAmount,
      SellAmount,
      BuyAveragePrice,
      SellAveragePrice,
      NetAveragePrice = 0,
      MTM,
      RealizedMTM,
      UnrealizedMTM,
      ExchangeSegment,
      ExchangeInstrumentId,
      ProductType,
      ClientName,
      LotSize,
      ClientID = "NA",
    } = item;

    // if (OpenBuyQuantity - OpenSellQuantity) {
    // transformedData.push({
    //   Broker: Broker,
    //   ClientID: AccountID,
    //   Symbol: TradingSymbol,
    //   // AppOrderID: AppOrderID,
    //   TradeSide: OpenBuyQuantity > OpenSellQuantity ? "BUY" : "SELL",
    //   Qty: Math.abs(OpenBuyQuantity - OpenSellQuantity),
    //   AvgTradedPrice:
    //     OpenBuyQuantity > OpenSellQuantity
    //       ? BuyAveragePrice
    //       : SellAveragePrice,
    //   LTP: "",
    //   MTM: MTM,
    //   RealizedMTM: RealizedMTM,
    //   UnrealizedMTM: UnrealizedMTM,
    //   ExchangeSegment: ExchangeSegment,
    //   ExchangeInstrumentId: ExchangeInstrumentId,
    //   ProductType: ProductType,
    //   ClientName: ClientName,
    // });
    // }
    //
    transformedData.push({
      Broker: Broker,
      ClientID: AccountID === "NA" ? ClientID : AccountID,
      Symbol: TradingSymbol,
      // AppOrderID: AppOrderID,
      TradeSide: +Quantity > 0 ? "BUY" : +Quantity < 0 ? "SELL" : "-",
      // TradeSide: OpenBuyQuantity > OpenSellQuantity ? "BUY" : "SELL",
      Qty: ["MCX"].includes(ExchangeSegment)
        ? Broker === "ANGELONE"
          ? +Quantity
          : +Quantity * LotSize
        : +Quantity, /// this is multiple is temporary condition for mcx
      /// Qty: Math.abs(OpenBuyQuantity - OpenSellQuantity),
      AvgTradedPrice:
        OpenBuyQuantity > OpenSellQuantity ? BuyAveragePrice : SellAveragePrice,
      LTP: "",
      MTM: MTM,
      RealizedMTM: RealizedMTM,
      UnrealizedMTM: UnrealizedMTM, //
      OpenBuyQuantity: OpenBuyQuantity,
      OpenSellQuantity: OpenSellQuantity,
      BuyAmount: BuyAmount,
      SellAmount: SellAmount,
      NetAveragePrice: NetAveragePrice,
      ExchangeSegment: ["NFO"].includes(ExchangeSegment)
        ? "NSEFO"
        : ExchangeSegment,
      stock_exchange: ExchangeSquareOff[ExchangeSegment] || ExchangeSegment,
      ExchangeInstrumentId: ExchangeInstrumentId,
      ProductType: ProductType,
      ClientName: ClientName,
      LotSize: ["NSECM", "BSCEM"].includes(ExchangeSegment)
        ? isNaN(LotSize)
          ? 1
          : LotSize
        : LotSize,
    });
  });

  return transformedData.sort((a, b) => {
    if (a.Qty === 0 && b.Qty !== 0) return 1; // Move `a` (Qty = 0) to the end
    if (b.Qty === 0 && a.Qty !== 0) return -1; // Move `b` (Qty = 0) to the end
    return a.Qty - b.Qty; // Normal ascending sort for non-zero Qty
  });
};

//common function to divert to orderbook and tradebook for rearrangement
const transformTableBook = (tableBody, tableName) => {
  if (tableName == "orderbook") {
    tableBody = transformOrderBook(tableBody);
  }
  if (tableName == "tradebook") {
    tableBody = transformTradeBook(tableBody);
  }
  if (tableName == "margin") {
    tableBody = transformMargin(tableBody);
  }
  if (tableName == "holdings") {
    tableBody = transformHoldings(tableBody);
  }
  if (tableName == "netpositions") {
    tableBody = transformNetPositions(tableBody);
  }
  return tableBody;
};

export { transformTableBook };
