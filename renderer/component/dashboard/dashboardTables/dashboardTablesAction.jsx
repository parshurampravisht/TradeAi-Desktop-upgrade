import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  currencyFormatter,
  getSquareOffExchange,
} from "../../../helpers";
import {
  getLTPService,
  squareOffOrder,
} from "../../../../services/transactions/transactions.service";
import { useRef, useState, useMemo, useCallback, memo } from "react";
import { useEffect } from "react";
import {
  Row,
  Modal,
  Spacer,
  Checkbox,
} from "@nextui-org/react";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import {
  cancelOrder,
  modifyOrder,
} from "../../../../services/transactions/transactions.service";
import { getScripCode, getTableColumn } from "../../../APIS/columnConstants";
import { useGlobalContext } from "../../../context/GlobalContext";
import { toast } from "react-toastify";
import { getSymbolsListNetPositions, getSymbolsListHoldings } from "./helpers";
import FullPageLoader from "../../common/FullPageLoader";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineDownload } from "react-icons/ai";
import {
  ExchangeSquareOff,
  ExchangeSquareOff2,
  OrderType,
  orderTypeFormat,
  ProductType,
  variety_type,
  warnMessage,
} from "../../../constant/constant";
import SubDashboardTablesEditor from "./SubDashboardTablesEditor";

function DashboardActionTable(props) {
  const {
    selectedCheckboxSquareOffHoldings,
    setSelectedCheckboxSquareOffHoldings,
    holdingsTableSquareOffHandler,
    selectAllholdingsTableSquareOffHandler,
    selectedCheckboxSquareOffNetPositions,
    setSelectedCheckboxSquareOffNetPositions,
    netPositionsTableSquareOffHandler,
    selectAllNetPositionsTableSquareOffHandler,
    holdingsSelectAll,
    setHoldingsSelectAll,
    netPositionsSelectAll,
    setNetPositionsSelectAll,
    onClientExport,
    cloneFilteredbody,
    setFilteredbody,
    globalExchangeType,
  } = props;

  const [ltpList, setLtpList] = useState({});
  const [NetltpData, setNetltpData] = useState({});
  const sizes = ["full"];
  // let gridOptions;
  const {
    setRefreshTokenTable,
    shares,
    loadSymbols,
    setLoadSymbols,
    flowLtpShares,
    gridRef,
    fullGridRef,
    gridSize,
    openModelFull,
    setopenModelFull,
    symbolDropdown,
    modifyOrderData,
    setModifyOrderData,
    setCancelOrderData,
    resetClientCheckboxHandler,
    holdingsFilteredbody,
    setHoldingsFilteredbody,
    cloneHoldingsFilteredbody,
    setCloneHoldingsFilteredbody,
  } = useGlobalContext();

  useEffect(() => {
    if (props.showtable !== "holdings") return;

    const updated = cloneFilteredbody.map((row) => {
      const code = getScripCode(
        row.ExchangeNSEInstrumentId,
        row.ExchangeBSEInstrumentId,
        row.ExchangeMSEInstrumentId
      );
      const ltp = ltpList?.[code] ?? 0;
      const Quantity = Number(row.Quantity) || 0;
      const BuyPrice = Number(row.BuyPrice) || 0;

      const marketPrice = ltp;
      const marketValue =
        Number.isFinite(ltp) && Number.isFinite(Quantity)
          ? parseFloat((ltp * Quantity).toFixed(2))
          : 0;

      const Invested =
        Number.isFinite(BuyPrice) && Number.isFinite(Quantity)
          ? parseFloat((BuyPrice * Quantity).toFixed(2))
          : 0;

      const profit_and_loss_raw = marketValue - BuyPrice * Quantity;
      const profit_and_loss = Number.isFinite(profit_and_loss_raw)
        ? parseFloat(profit_and_loss_raw.toFixed(2))
        : 0;
      const profit_and_loss_percentage_raw =
        BuyPrice && BuyPrice !== 0
          ? (profit_and_loss_raw * 100) / (BuyPrice * Quantity || BuyPrice)
          : 0;
      const profit_and_loss_percentage = Number.isFinite(
        profit_and_loss_percentage_raw
      )
        ? parseFloat(profit_and_loss_percentage_raw.toFixed(2))
        : 0;

      return {
        ...row,
        Invested,
        marketPrice,
        marketValue,
        profit_and_loss,
        profit_and_loss_percentage,
      };
    });

    setHoldingsFilteredbody(updated);
    setCloneHoldingsFilteredbody(updated);
  }, [ltpList, cloneFilteredbody, props.showtable]);

  const filterDataBySearchInputs = (data, filters) => {
    return data.filter((item) => {
      return filters.every(({ field, searchText }) => {
        const rawValue = item[field];
        const value = rawValue == null ? "" : String(rawValue).toLowerCase();
        const search =
          searchText == null ? "" : String(searchText).toLowerCase();
        return value.includes(search);
      });
    });
  };

  const getAllSearchInputs = useCallback(
    (params) => {
      const filterModel = params.api.getFilterModel() || {};

      const searchInputs = Object.entries(filterModel).map(([field, model]) => ({
        field,
        searchText: model?.filter ?? "",
      }));

      const isHoldings = props.showtable === "holdings";

      if (isHoldings) {
        if (searchInputs.length) {
          const filteredResults = filterDataBySearchInputs(
            cloneHoldingsFilteredbody,
            searchInputs
          );
          setHoldingsFilteredbody([...filteredResults]);
        } else {
          setHoldingsFilteredbody([...cloneHoldingsFilteredbody]);
        }
      } else {
        if (searchInputs.length) {
          const filteredResults = filterDataBySearchInputs(
            cloneFilteredbody,
            searchInputs
          );
          setFilteredbody(filteredResults);
        } else {
          setFilteredbody(cloneFilteredbody);
        }
      }
    },
    [
      props.showtable,
      cloneHoldingsFilteredbody,
      cloneFilteredbody,
      filterDataBySearchInputs,
      setFilteredbody,
    ]
  );

  useEffect(() => {
    if (
      props.showtable === "holdings" &&
      !props.isDataLoading &&
      props.filteredbody &&
      props.filteredbody !== 0
      // ltpList.length === 0
    ) {
      handleLTP();
    }
  }, [props.showtable, props.isDataLoading, props.filteredbody]);

  useEffect(() => {
    if (props.showtable === "netpositions" && props.isDataLoading === false) {
      handleLTPNetPositon();
    }
  }, [props.showtable, props.isDataLoading]);

  useEffect(() => {
    resetClientCheckboxHandler();
  }, [props.showtable, props.filteredbody]);

  let scripcodes = [];

  const handleLTPNetPositon = async () => {
    props.filteredbody?.map((item) => {
      scripcodes.push({ [ExchangeSquareOff2[item.ExchangeSegment] || item.ExchangeSegment]: +item.ExchangeInstrumentId });
      // else if (item.ExchangeBSEInstrumentId !== 0) {
      //   scripcodes1.push({ BSE: item.ExchangeBSEInstrumentId });
      // } else {
      //   scripcodes1.push({ MCX: item.ExchangeMSEInstrumentId });
      // }
    });
    const ltp =
      scripcodes.length !== 0 && (await getLTPService({ scripcodes }));
    // setNetltpData(ltp);
    if (ltp && ltp.length > 0) {
      let list = {};
      ltp?.map(({ scripcode, ltp }) => {
        list = { ...list, [scripcode]: ltp };
      });
      setNetltpData({ ...list });
    }
  };

  const handleLTP = async () => {
    props.filteredbody?.map((item) => {
      if (item?.Exchange === "NSE") {
        scripcodes.push({ NSE: +item.ExchangeNSEInstrumentId });
      } else if (item?.Exchange === "BSE") {
        scripcodes.push({ BSE: +item.ExchangeBSEInstrumentId });
      } else {
        scripcodes.push({ MCX: +item.ExchangeMSEInstrumentId });
      }
      // if (item.ExchangeNSEInstrumentId !== 0) {
      //   scripcodes.push({ NSE: +item.ExchangeNSEInstrumentId });
      // } else if (item.ExchangeBSEInstrumentId !== 0) {
      //   scripcodes.push({ BSE: +item.ExchangeBSEInstrumentId });
      // } else {
      //   scripcodes.push({ MCX: +item.ExchangeMSEInstrumentId });
      // }
    });
    const ltp =
      scripcodes.length !== 0 && (await getLTPService({ scripcodes }));
    if (Array.isArray(ltp)) {
      let list = {};
      ltp?.map(({ scripcode, ltp }) => {
        list = { ...list, [scripcode]: ltp };
      });
      setLtpList({ ...list });
    }
  };

  const holdingsTableCellClicked = async (params) => {
    let payload = {};
    let lotSize = 1;

    if (
      params.column.colId === "action" &&
      params.event.target.dataset.action
    ) {
      let action = params.event.target.dataset.action;
      if (action === "send") {
        let payload = {};
        payload[params.data.ClientID] = {
          OrderSide: params?.data?.OrderSide == "SELL" ? "BUY" : "SELL",
          Symbol: params.data.ScripName, //required
          Quantity: +params.data.Quantity, //done
          LimitPrice: 0,
          SLTriggerPrice: 0,
          Exchange:
            getSquareOffExchange(params.data.ExchangeSegment) ||
              !globalExchangeType
              ? ExchangeSquareOff.NSE
              : ExchangeSquareOff.BSE,
          LotSize: 1,
          // Scripcode: params.data.scrip,
          Scripcode: !globalExchangeType
            ? params.data.ExchangeNSEInstrumentId
            : params.data.ExchangeBSEInstrumentId,
          ProductType: ProductType.NORMAL,
          OrderType: OrderType.MARKET,
          OverNightSL: 0,
        };

        try {
          const res = await squareOffOrder(payload);
          // const res = await placeOrder(payload);
          if (res?.status === "success") {
            params.api.applyTransaction({
              remove: [params.node.data],
            });
            toast.success(warnMessage.success_squareoff_message);
          }
        } catch (error) {
          toast.error("Order not placed, Something went wrong!");
        }
      }
    }
  };

  const netPositionsTableCellClicked = async (params) => {
    if (
      params.column.colId === "action" &&
      params.event.target.dataset.action
    ) {
      let action = params.event.target.dataset.action;
      if (action === "send") {
        let payload = {};
        let symboldata = symbolDropdown || {};
        let lotsize =
          symboldata?.symbolDictionary?.[params.data?.ExchangeInstrumentId]?.[
          "LotSize"
          ] || null;
        payload[params.data.ClientID] = {
          OrderSide: params.data.TradeSide == "BUY" ? "SELL" : "BUY",
          Symbol: params.data.Symbol,
          Quantity: +params.data.Qty < 0 ? -+params.data.Qty : params.data.Qty,
          // Quantity: params.data.Qty,
          LimitPrice: 0,
          SLTriggerPrice: 0,
          Exchange: getSquareOffExchange(params.data.ExchangeSegment) || "",
          LotSize: lotsize || 1,
          Scripcode: +params.data.ExchangeInstrumentId,
          ProductType:
            params?.data?.ProductType == "DELIVERY"
              ? ProductType.NORMAL
              : ProductType.INTRA,
          OrderType: OrderType.MARKET,
          OverNightSL: "OFF",
        };
        try {
          const res = await squareOffOrder(payload);
          // const res = await placeOrder(payload);
          if (res?.status === "success") {
            // params.api.applyTransaction({
            //   remove: [params.node.data],
            // });
            toast.success(warnMessage.success_squareoff_message);
          }
        } catch (error) {
          toast.error("Order not placed, Something went wrong!");
        }
        setTimeout(() => {
          setRefreshTokenTable(Math.random());
        }, 1500);
      }
    }
  };

  const selectAllHandler = useCallback(() => {
    if (props.showtable === "netpositions") {
      setNetPositionsSelectAll((prev) => {
        const newState = !prev;

        // Compute once, before updating other states
        const filtered = props.filteredbody.filter(
          (item) => item.TradeSide !== "-"
        );
        const checkBoxArr = newState
          ? filtered.map((_, index) => `row-${index}`)
          : [];

        // Trigger dependent updates AFTER computing all data
        selectAllNetPositionsTableSquareOffHandler(newState);
        setSelectedCheckboxSquareOffNetPositions(checkBoxArr);

        return newState;
      });
    } else {
      setHoldingsSelectAll((prev) => {
        const newState = !prev;

        // ✅ Use latest holdingsFilteredbody reference
        setSelectedCheckboxSquareOffHoldings(
          newState ? holdingsFilteredbody.map((_, index) => `row-${index}`) : []
        );

        selectAllholdingsTableSquareOffHandler(newState);

        return newState;
      });
    }
  }, [props.showtable, props.filteredbody, holdingsFilteredbody]);

  const modifiySelectAllHandler = (isChecked) => {
    const allSelectedClientsData = isChecked
      ? props.filteredbody
        .map((item, index) => ({
          ...item,
          rowIndex: index,
        }))
        .filter(
          (item) => item?.Status === "Pending" || item?.Status === "Modified" || item?.Status === "Open"
        )
      : [];
    setModifyOrderData(allSelectedClientsData);
    setCancelOrderData(allSelectedClientsData);
  };

  const [holdingSellApproveFlag, setHoldingSellApproveFlag] = useState("");

  const holdingsCellRenderer = (params) => {
    const rowId = `row-${params.rowIndex}`;

    const checkboxHandler = (rowId) => {
      setSelectedCheckboxSquareOffHoldings((prev) => {
        const isSelected = prev.includes(rowId);
        return isSelected
          ? prev.filter((id) => id !== rowId)
          : [...prev, rowId];
      });
    };

    return (
      <>
        {rowId !== holdingSellApproveFlag ? (
          <div className="flex-row align-center">
            <Checkbox
              style={{ marginRight: "5px", cursor: "pointer" }}
              isSelected={selectedCheckboxSquareOffHoldings.includes(rowId)}
              onChange={() => {
                checkboxHandler(rowId);
                setHoldingsSelectAll(false);
                holdingsTableSquareOffHandler(params);
              }}
            />
            <button
              style={{
                textAlign: "justify",
                lineHeight: "15px",
                padding: "0px 5px -2px 5px",
                height: "20px",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
              }}
              onClick={() => {
                flowLtpShares.current = true;
                setHoldingSellApproveFlag(rowId);
              }}
            >
              SQ
            </button>
          </div>
        ) : (
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconCheck
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              data-action="send"
              onClick={() => {
                flowLtpShares.current = true;
                setHoldingSellApproveFlag(rowId);
              }}
            />
            <IconX
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              onClick={() => {
                flowLtpShares.current = true;
                setHoldingSellApproveFlag("");
              }}
              data-action="cancel"
            />
          </div>
        )}
      </>
    );
  };

  const netPositionsCellRenderer = (params) => {
    const sellApproveFlagRef = useRef(false);
    const rowId = `row-${params.rowIndex}`;

    const handleClick = () => {
      const newValue = !sellApproveFlagRef.current;
      sellApproveFlagRef.current = newValue;
    };

    const netPositionsCheckboxHandler = (rowId) => {
      setSelectedCheckboxSquareOffNetPositions((prev) => {
        const isSelected = prev.includes(rowId);
        return isSelected
          ? prev.filter((id) => id !== rowId)
          : [...prev, rowId];
      });
    };

    return (
      <>
        {!sellApproveFlagRef.current ? (
          <div className="flex-row align-center">
            {+params.data?.Qty !== 0 && (
              <>
                <Checkbox
                  style={{ marginRight: "5px", cursor: "pointer" }}
                  isSelected={selectedCheckboxSquareOffNetPositions.includes(
                    rowId
                  )}
                  // type="checkbox"
                  onChange={() => {
                    netPositionsCheckboxHandler(rowId);
                    setNetPositionsSelectAll(false);
                    netPositionsTableSquareOffHandler(params);
                  }}
                />
                <button
                  style={{
                    textAlign: "justify",
                    lineHeight: "15px",
                    padding: "0px 5px -2px 5px",
                    height: "20px",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                  }}
                  onClick={handleClick}
                >
                  SQ
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconCheck
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              data-action="send"
              onClick={handleClick}
              style={{ cursor: "pointer" }}
            />
            <IconX
              type="button"
              height={20}
              width={20}
              color={"#000"}
              stroke-width={1}
              onClick={handleClick}
              data-action="cancel"
              style={{ cursor: "pointer" }}
            />
          </div>
        )}
      </>
    );
  };

  const MemoizedHoldingsCellRenderer = useMemo(
    () => holdingsCellRenderer,
    [selectedCheckboxSquareOffHoldings]
  );
  const MemoizedNetPositionsCellRenderer = useMemo(
    () => netPositionsCellRenderer,
    [selectedCheckboxSquareOffNetPositions]
  );

  const MemoizedOrderCellRenderer = useMemo(
    () => actionCellRenderer,
    [modifyOrderData]
  );

  // memoized symbol lists to avoid updating state during render
  const symbolListForHoldings = useMemo(() => {
    return getSymbolsListHoldings(loadSymbols, props.filteredbody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSymbols, props.filteredbody]);

  const symbolListForNetPositions = useMemo(() => {
    return getSymbolsListNetPositions(loadSymbols, props.filteredbody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSymbols, props.filteredbody]);

  // effects to update context state after render
  useEffect(() => {
    if (props.showtable === "holdings") {
      setLoadSymbols(symbolListForHoldings);
    }
  }, [props.showtable, symbolListForHoldings, setLoadSymbols]);

  useEffect(() => {
    if (props.showtable === "netpositions") {
      setLoadSymbols(symbolListForNetPositions);
    }
  }, [props.showtable, symbolListForNetPositions, setLoadSymbols]);

  const pendingOrders = useMemo(() =>
    props.filteredbody.filter(
      item => ["pending", "modified", "partial", "open"].includes(item?.Status?.toLowerCase())
    )
    , [props.filteredbody]);

  // console.log("pendingOrders", pendingOrders, "props.filteredbody", props.filteredbody)

  const defaultColDef = {
    resizable: true, // Set resizable to true for all columns by default
    wrapHeaderText: true, //to wrap text in second line
    autoHeaderHeight: true,
  };

  const columns = useMemo(
    () =>
      getTableColumn(props.showtable, {
        filteredbody: props.filteredbody,
        holdingsFilteredbody,
        pendingOrders,
        ltpList,
        NetltpData,
        modifyOrderData,
        modifiySelectAllHandler,
        holdingsSelectAll,
        selectAllHandler,
        netPositionsSelectAll,
        MemoizedOrderCellRenderer,
        MemoizedHoldingsCellRenderer,
        MemoizedNetPositionsCellRenderer,
      }),
    [
      props.showtable,
      props.filteredbody?.length,
      holdingsFilteredbody?.length,
      modifyOrderData?.length,
      pendingOrders?.length,
      holdingsSelectAll,
      netPositionsSelectAll,
      ltpList,
      NetltpData,
      MemoizedHoldingsCellRenderer,
      MemoizedNetPositionsCellRenderer,
      MemoizedOrderCellRenderer,
    ]
  );

  const modifyOrderCall = async (data) => {
    const apiBody = {};
    const updatedOrderType =
      data["Limit Price"] === 0 && data["Trig Price"] === 0
        ? "MARKET"
        : data["Limit Price"] > 0 && data["Trig Price"] === 0
          ? "LIMIT"
          : data["Limit Price"] === 0 && data["Trig Price"] > 0
            ? "STOPMARKET"
            : orderTypeFormat[data.OrderType?.toUpperCase()] ||
            data.OrderType?.toUpperCase();
    apiBody[data.ClientID] = {
      BrokerOrderId: data.ID,
      UniqueIdentifier: data.OrderUniqueIdentifier,
      ProductType: data.ProductType,
      // data["Broker"] === "IIFL" && data["ProductType"] === "DELIVERY"
      //   ? "CNC" // iifl condition CNC is temporary that should be changes backend in future.
      //   : productType[data.ProductType],
      OrderType: updatedOrderType,
      OrderQuantity: data["Lots_Qty"],
      // OrderQuantity: +data.Qty,
      DisclosedQuantity: +data.OrderDisclosedQuantity,
      LimitPrice: data["Limit Price"],
      LastUpdateDateTime: data["LastUpdateDateTime"],
      TradedQuantity: data["Broker"] === "MOSWAL" ? 0 : +data["Qty"],
      SLTriggerPrice: data["Trig Price"],
      TimeInForce: data["TimeInForce"]?.toUpperCase(),
      Exchange: data["ExchangeSegment"],
      LotSize: data["LotSize"] || 1,
      TradedSymbol: data["Symbol"] || "",
      ExchangeInstrumentID: +data["ExchangeInstrumentID"] || "",
      Variety:
        data["Variety"] &&
          ["STOPLIMIT", "STOPMARKET"].includes(updatedOrderType)
          ? "STOPLOSS"
          : variety_type[data["Variety"]] ?? data["Variety"] ?? "NORMAL",
      // Scripcode: data["ExchangeInstrumentID"],
    };

    var res = await modifyOrder(apiBody);

    setTimeout(() => {
      setRefreshTokenTable(Math.random());
    }, 1000);
  };

  const cancelOrderCall = async (data) => {
    let apiBody = {};
    const clientId = data.ClientID;
    const body = {
      BrokerOrderId: data.ID,
      Exchange: data.ExchangeSegment,
      ScripCode: 14894,
      UniqueIdentifier: data.OrderUniqueIdentifier,
    };

    apiBody[clientId] = body;

    const res = await cancelOrder({
      [data.ClientID]: {
        BrokerOrderId: data.ID,
        Exchange: data.ExchangeSegment,
        ScripCode: 14894,
        UniqueIdentifier: data.OrderUniqueIdentifier,
        Variety: variety_type[data["Variety"]] || "NORMAL",
      },
    });
    toast.success(`Order cancelled Successfully`)
    setRefreshTokenTable(Math.random());
  };

  function actionCellRenderer(params) {
    let actionbuttons = null;

    let editingCells = params.api.getEditingCells();
    // checks if the rowIndex matches in at least one of the editing cells
    let isCurrentRowEditing = editingCells.some((cell) => {
      return cell.rowIndex === params.node.rowIndex;
    });

    const multipleModifyOrderHandler = (selectedParams) => {
      setModifyOrderData((prevData) => {
        let exists = prevData.some(
          (item) => item["rowIndex"] === selectedParams.rowIndex
        );

        const updatedData = exists
          ? prevData.filter(
            (item) => item["rowIndex"] !== selectedParams?.rowIndex
          )
          : [
            ...prevData,
            { ...selectedParams?.data, rowIndex: selectedParams?.rowIndex },
          ];
        setCancelOrderData(updatedData);
        return updatedData;
      });
    };

    if (params.data.Status !== "Pending" && params.data.Status !== "Modified")
      return <></>;

    if (isCurrentRowEditing) {
      actionbuttons = (
        <>
          <Row justify="center">
            <IconCheck
              type="button"
              height={25}
              width={18}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="update"
            />
            <Spacer x={1} />
            <IconX
              type="button"
              height={25}
              width={18}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="cancel"
            />
          </Row>
        </>
      );
    } else {
      actionbuttons = (
        <>
          <Row justify="center">
            <Checkbox
              style={{ marginRight: "10px", cursor: "pointer" }}
              isSelected={modifyOrderData
                .map((item) => item?.rowIndex)
                .includes(params?.rowIndex)}
              onChange={() => multipleModifyOrderHandler(params)}
            />
            <IconPencil
              type="button"
              height={25}
              width={25}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="edit"
            />
            <Spacer x={1} />
            <IconTrash
              height={25}
              // width={18}
              width={25}
              cursor="pointer"
              color={"#000"}
              strokeWidth={2}
              data-action="delete"
            />
          </Row>
        </>
      );
    }
    return actionbuttons;
  }

  async function onCellClicked(params) {
    // Handle click event for action cells
    if (
      params.column.colId === "action" &&
      params.event.target.dataset.action
    ) {
      let action = params.event.target.dataset.action;

      if (action === "edit") {
        flowLtpShares.current = true;

        params.api.startEditingCell({
          rowIndex: params.node.rowIndex,
          // gets the first columnKey
          colKey: params.columnApi.getDisplayedCenterColumns()[0].colId,
        });
      }

      if (action === "delete") {
        cancelOrderCall(params.data);
      }

      if (action === "update") {
        flowLtpShares.current = true;

        params.api.stopEditing(false);
        modifyOrderCall(params.data);
      }

      if (action === "cancel") {
        flowLtpShares.current = true;

        params.api.stopEditing(true);
      }
    }
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

  const gridOptionsData = {
    getRowStyle: (params) => {
      if (
        params.data?.Status === "Executed" ||
        params.data?.TradeSide === "BUY"
      ) {
        return { backgroundColor: "#E8FDEB" };
      } else if (
        params.data?.Status === "Cancelled" ||
        (params.data?.TradeSide === "SELL" && +params.data?.Qty < 0)
      ) {
        return { backgroundColor: "#FEECEB" };
      } else if (params.data?.Status === "Rejected") {
        return { backgroundColor: "#FEECEB" };
      } else if (
        params.data?.Status === "Pending" ||
        params.data?.Status === "Modified" ||
        params.data?.Status === "Open"
      ) {
        return { backgroundColor: "#FDEE98" };
      } else if (params.data?.TradeSide === "-" && +params.data?.Qty === 0) {
        return { backgroundColor: "#fcfdfe" };
      } else if (params.data?.OrderSide === "BUY") {
        return { backgroundColor: "#E8FDEB" };
      } else if (params.data?.OrderSide === "SELL") {
        return { backgroundColor: "#FEECEB" };
      } else {
        return null;
      }
    },
  };

  const closeModal = () => {
    setopenModelFull(false);
  };

  const calculateTotals = useCallback(
    (data) => {
      let totalAmount = 0;
      let MktValue = 0;
      let marketAmount = 0;
      let TotalLTP = 0;
      let totalMTMValue = 0;
      let totalUnReliziedMTM = 0;
      let totalRealizedMTM = 0;
      let totalUnRealizedMTM = 0;

      data?.forEach((row) => {
        const buyPrice = +row.BuyPrice;
        const quantity = +row.Quantity;

        if (!isNaN(buyPrice) && !isNaN(quantity) && row.BuyPrice !== "-") {
          totalAmount += buyPrice * quantity;
        }

        totalUnRealizedMTM += +row.UnrealizedMTM || 0;
        totalRealizedMTM += +row.RealizedMTM || 0;

        const code = getScripCode(row.ExchangeInstrumentId);
        const ltData = NetltpData[code] ?? 1;

        const netQty = row.Qty;
        const totalMTM = netQty * ltData;
        totalMTMValue += totalMTM;

        const avgTrade = +row.AvgTradedPrice;
        const unMTM = netQty * ltData - netQty * avgTrade;
        totalUnReliziedMTM += unMTM;

        const code2 = getScripCode(
          row.ExchangeNSEInstrumentId,
          row.ExchangeBSEInstrumentId,
          row.ExchangeMSEInstrumentId
        );

        const ltp = ltpList[code2] ?? 0;

        MktValue += ltp;
        marketAmount += quantity * ltp;

        const buyValue = buyPrice * quantity;
        const pnl = quantity * ltp - buyValue;

        if (!isNaN(pnl)) TotalLTP += pnl;
      });

      return {
        value: totalAmount,
        MktValue,
        marketAmount,
        TotalLTP,
        totalMTMValue,
        totalUnReliziedMTM,
        totalRealizedMTM,
        totalUnRealizedMTM,
      };
    },
    [NetltpData, ltpList, getScripCode] // <-- 🔥 FIXED
  );

  const totalRow = useMemo(
    () => calculateTotals(props.filteredbody),
    [
      props.filteredbody,
      NetltpData,
      ltpList,
      getScripCode
    ]
  );


  const PercentageLTP = (totalRow.TotalLTP * 100) / totalRow.value;
  const displayPercentageLTP = isNaN(PercentageLTP)
    ? "-"
    : PercentageLTP.toFixed();

  const displayTotalUnRealizedMTM = useMemo(() => {
    const value = totalRow?.totalUnRealizedMTM;
    return Number.isFinite(value) ? value : "-";
  }, [totalRow?.totalUnRealizedMTM]);

  const totalRealizedMTM = isNaN(totalRow.totalRealizedMTM)
    ? "-"
    : +totalRow.totalRealizedMTM;

  return (
    <>
      <Modal.Body>
        <>
          <div>
            <Modal
              aria-labelledby="modal-title"
              open={openModelFull}
              fullScreen
            >
              <Modal.Body>
                <>
                  {!!props.filteredbody?.length && (
                    <div
                      className="position-relative"
                      style={{
                        left: "95.1%",
                        top: "4%",
                        width: "fit-content",
                        margin: "0px",
                      }}
                    >
                      <AiOutlineDownload
                        className="cursor-pointer"
                        style={{ fontSize: "22px" }}
                        title="Download clients"
                        onClick={onClientExport}
                      />
                    </div>
                  )}
                  <img
                    src="../images/windowminimize.png"
                    width={20}
                    id="svgImage"
                    onClick={closeModal}
                    style={{
                      position: "relative",
                      left: "98.1%",
                      cursor: "pointer",
                    }}
                    title="miximize"
                  />

                  <div
                    className="ag-theme-balham"
                    style={{
                      height: gridSize.height,
                      width: gridSize.width,
                      // marginTop: "25px",
                    }}
                  >
                    <FullPageLoader show={props.isDataLoading} />
                    <AgGridReact
                      className="ag-grid-custom-height"
                      onRowEditingStopped={onRowEditingStopped}
                      onRowEditingStarted={onRowEditingStarted}
                      onCellClicked={
                        props.showtable === "holdings"
                          ? holdingsTableCellClicked
                          : props.showtable === "netpositions"
                            ? netPositionsTableCellClicked
                            : onCellClicked
                      }
                      editType="fullRow"
                      suppressClickEdit={true}
                      columnDefs={columns}
                      ref={fullGridRef}
                      overlayNoRowsTemplate="No Data Found"
                      overlayLoadingTemplate="Loading Data..."
                      floatingFilter={true}
                      rowData={
                        props.showtable === "holdings"
                          ? holdingsFilteredbody
                          : props.filteredbody
                      }
                      sizeColumnsToFit={true}
                      enableColResize={true}
                      defaultColDef={defaultColDef}
                      gridOptions={gridOptionsData}
                      onFilterChanged={(params) => {
                        getAllSearchInputs(params);
                      }}
                      onGridReady={(params) => {
                        // gridRef.current = params.api;
                        params.api.sizeColumnsToFit(); // Adjusts columns to fit grid width initially
                      }}
                    // getRowStyle={getRowStyle}
                    // pinnedBottomRowData={props.showtable == "holdings" ? pinnedTopRowData : null}
                    />
                    {props.showtable === "holdings" ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignContent: "center",
                          border: "1px solid #ECEEF0",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Total
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "3rem",
                            marginRight: "20px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "500",
                              fontSize: "14px",
                            }}
                          >
                            Invested: {currencyFormatter(totalRow.value, 2)}
                          </span>

                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: "14px",
                            }}
                          >
                            Market Value:{" "}
                            <span
                              style={{
                                color:
                                  totalRow.marketAmount - totalRow.value > 0
                                    ? "green"
                                    : "red",
                              }}
                            >
                              {totalRow.marketAmount
                                ? currencyFormatter(totalRow.marketAmount, 2)
                                : "-"}
                            </span>
                          </div>
                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: "14px",
                            }}
                          >
                            P&L:{" "}
                            <span
                              style={{
                                color:
                                  totalRow.marketAmount - totalRow.value > 0
                                    ? "green"
                                    : "red",
                              }}
                            >
                              {totalRow.TotalLTP
                                ? currencyFormatter(totalRow.TotalLTP, 2)
                                : "-"}{" "}
                              ({displayPercentageLTP || "-"}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : props.showtable === "netpositions" ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignContent: "center",
                          border: "1px solid #ECEEF0",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Total
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "3rem",
                            marginRight: "20px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "500",
                              fontSize: "14px",
                            }}
                          >
                            Realized MTM:{" "}
                            {currencyFormatter(totalRealizedMTM, 2)}
                          </span>
                          <span
                            style={{
                              fontWeight: "500",
                              fontSize: "14px",
                            }}
                          >
                            Unrealized MTM:{" "}
                            {currencyFormatter(displayTotalUnRealizedMTM, 2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div></div>
                      </div>
                    )}
                  </div>
                </>
              </Modal.Body>
            </Modal>
          </div>
        </>
      </Modal.Body>
      <SubDashboardTablesEditor
        {...props}
        displayTotalUnRealizedMTM={displayTotalUnRealizedMTM}
        totalRealizedMTM={totalRealizedMTM}
        displayPercentageLTP={displayPercentageLTP}
        totalRow={totalRow}
        gridOptionsData={gridOptionsData}
        holdingsTableCellClicked={holdingsTableCellClicked}
        netPositionsTableCellClicked={netPositionsTableCellClicked}
        onCellClicked={onCellClicked}
        onRowEditingStopped={onRowEditingStopped}
        onRowEditingStarted={onRowEditingStarted}
        getAllSearchInputs={getAllSearchInputs}
        ltpList={ltpList}
        NetltpData={NetltpData}
        columns={columns}
        filteredbody={props.filteredbody}
        holdingsFilteredbody={holdingsFilteredbody}
        defaultColDef={defaultColDef}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "center",
          fontSize: "10px",
          color: "red",
        }}
      >
        Disclaimer: In some cases, there may be discrepancies in the data, so
        please verify it with the client's respective demat account.
      </div>
    </>
  );
}

export default memo(DashboardActionTable);
