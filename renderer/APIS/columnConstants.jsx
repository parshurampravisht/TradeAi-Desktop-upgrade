import { Checkbox, Tooltip } from "@nextui-org/react";
import { currencyFormatter } from "../helpers";
import { brokerLogoFormatHandler } from "../constant/constant";

// ORDERBOOK (exact fields/headerNames from your original)
export const staticOrderBookColumns = [
  {
    headerName: "Brkr",
    field: "Broker",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
    minWidth: 63,
    resizable: true,
    cellRenderer: (params) => {
      const brokerLowerCase = params?.data?.Broker?.toLowerCase();

      return (
        <>
          <div
            style={{
              background: `url(${brokerLogoFormatHandler(brokerLowerCase)})`,
              backgroundPosition: "center",
              backgroundSize: "20px",
              backgroundRepeat: "no-repeat",
              width: "20px",
              height: "20px",
            }}
          ></div>
        </>
      );
    },
  },
  {
    headerName: "Client ID",
    field: "ClientID",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 100,
    resizable: true,
  },
  {
    headerName: "Name",
    field: "ClientName",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Symbol",
    field: "Symbol",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 200,
    resizable: true,
  },
  {
    headerName: "Lot Size",
    field: "LotSize",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 90,
    resizable: true,
  },
  {
    headerName: "Equity (QTY.) / F&O (No. Of Lots)",
    field: "Lots_Qty",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    editable: true,
    minWidth: 140,
    resizable: true,
    cellStyle: { fontSize: "12px" },
  },
  {
    headerName: "Ord Type",
    field: "OrderType",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 90,
    resizable: true,
  },
  {
    headerName: "Ord Side",
    field: "OrderSide",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 90,
    resizable: true,
  },
  {
    headerName: "Status",
    field: "Status",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Limit Price",
    field: "Limit Price",
    minWidth: 85,
    resizable: true,
    sortable: true,
  },
  {
    headerName: "Trig Price",
    field: "Trig Price",
    minWidth: 80,
    resizable: true,
    sortable: true,
  },
  {
    headerName: "Time",
    field: "Time",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
    comparator: (valueA, valueB) => {
      // Convert time format from "dd-mm-yyyy hh:mm:ss" to "mm/dd/yyyy hh:mm:ss"
      const dateA = new Date(
        valueA.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
      );
      const dateB = new Date(
        valueB.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
      );

      if (isDescending) {
        // Sort in descending order
        return dateB - dateA;
      } else {
        // Sort in ascending order
        return dateA - dateB;
      }
    },
    onSortChanged: (event) => {
      const sortedColumn = event.columnApi
        .getAllColumns()
        .find((col) => col.getColId() === "LastUpdateDateTime");

      if (sortedColumn) {
        // Toggle the sort direction
        isDescending = !isDescending;
        event.api.refreshCells({ force: true });
      }
    },
  },
  { headerName: "ID", field: "ID", minWidth: 140, resizable: true },
  {
    headerName: "Dealer",
    field: "OrderUniqueIdentifier",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Reason",
    field: "CancelRejectReason",
    minWidth: 250,
    resizable: true,
  },
];

// MARGIN (exact from original)
export const staticMarginColumns = [
  {
    headerName: "Brkr",
    field: "Broker",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 90,
    resizable: true,
    cellRenderer: (params) => {
      const brokerLowerCase = params?.data?.Broker?.toLowerCase();

      return (
        <>
          <div
            style={{
              background: `url(${brokerLogoFormatHandler(brokerLowerCase)})`,
              backgroundPosition: "center",
              backgroundSize: "20px",
              backgroundRepeat: "no-repeat",
              width: "20px",
              height: "20px",
            }}
          ></div>
        </>
      );
    },
  },
  {
    headerName: "Client ID",
    field: "ClientID",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Name",
    field: "ClientName",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Cash Available",
    field: "Cash Available",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Collateral",
    field: "Collateral",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Margin Utilized",
    field: "Margin Utilized",
    minWidth: 130,
    resizable: true,
  },
  {
    headerName: "Net Margin",
    field: "Net Margin",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
];

// TRADEBOOK (exact from original)
export const staticTradeBookColumns = [
  {
    headerName: "Brkr",
    field: "Broker",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 63,
    resizable: true,
    cellRenderer: (params) => {
      const brokerLowerCase = params?.data?.Broker?.toLowerCase();

      return (
        <>
          <div
            style={{
              background: `url(${brokerLogoFormatHandler(brokerLowerCase)})`,
              backgroundPosition: "center",
              backgroundSize: "20px",
              backgroundRepeat: "no-repeat",
              width: "20px",
              height: "20px",
            }}
          ></div>
        </>
      );
    },
  },
  {
    headerName: "Client ID",
    field: "ClientID",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 100,
    resizable: true,
  },
  {
    headerName: "Name",
    field: "ClientName",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Symbol",
    field: "Symbol",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 200,
    resizable: true,
  },
  {
    headerName: "Qty",
    field: "Qty",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 130,
    resizable: true,
  },
  {
    headerName: "Trade Time",
    field: "Time",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 110,
    resizable: true,
  },
  {
    headerName: "Traded Price",
    field: "TradedPrice",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "ID",
    field: "ID",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Trade Side",
    field: "OrderSide",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 100,
    resizable: true,
  },
];

// HOLDINGS (exact fields from original)
export const staticHoldingsColumns = [
  {
    headerName: "Brkr",
    field: "Broker",
    minWidth: 80,
    resizable: true,
    floatingFilter: true,
    filter: "agTextColumnFilter",
    type: "centerAligned",
    sortable: false,
    cellRenderer: (params) => {
      const brokerLowerCase = params?.data?.Broker?.toLowerCase();

      const isOnline = params?.data?.is_online;
      return (
        <>
          <span
            class="dot"
            style={{
              height: "8px",
              width: "8px",
              backgroundColor:
                params?.data?.is_online === false ? "gray" : "green",
              borderRadius: "50%",
              float: "left",
              marginTop: "5px",
            }}
          ></span>
          <div
            style={{
              background: `url(${brokerLogoFormatHandler(brokerLowerCase)})`,
              backgroundPosition: "center",
              backgroundSize: "20px",
              backgroundRepeat: "no-repeat",
              width: isOnline === "true" ? "20px" : "18px",
              height: isOnline === "true" ? "20px" : "18px",
              float: "left",
              marginLeft: "15px",
              borderRadius: isOnline === "true" ? "" : "50%",
            }}
          ></div>
        </>
      );
    },
  },
  {
    headerName: "Client ID",
    field: "ClientID",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    type: "leftAligned",
    minWidth: 100,
    resizable: true,
  },
  {
    headerName: "Name",
    field: "ClientName",
    type: "leftAligned",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Symbol",
    field: "ScripName",
    type: "leftAligned",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 200,
    resizable: true,
  },
  {
    headerName: "Qty.",
    field: "Quantity",
    type: "rightAligned",
    minWidth: 80,
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
  },
  {
    headerName: "Buy Price",
    field: "BuyPrice",
    type: "rightAligned",
    minWidth: 80,
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
  },
  // Invested will be added dynamically (computed)
];

// NETPOSITIONS (exact fields from original)
export const staticNetPositionsColumns = [
  {
    headerName: "Brkr",
    field: "Broker",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 63,
    resizable: true,
    cellRenderer: (params) => {
      const brokerLowerCase = params?.data?.Broker?.toLowerCase();

      return (
        <>
          <div
            style={{
              background: `url(${brokerLogoFormatHandler(brokerLowerCase)})`,
              backgroundPosition: "center",
              backgroundSize: "20px",
              backgroundRepeat: "no-repeat",
              width: "20px",
              height: "20px",
            }}
          ></div>
        </>
      );
    },
  },
  {
    headerName: "Client ID",
    field: "ClientID",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 100,
    resizable: true,
  },
  {
    headerName: "Name",
    field: "ClientName",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Symbol",
    field: "Symbol",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 200,
    resizable: true,
  },
  {
    headerName: "Qty",
    field: "Qty",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 120,
    resizable: true,
  },
  {
    headerName: "Product Type",
    field: "ProductType",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 140,
    resizable: true,
  },
  {
    headerName: "Exchange Type",
    field: "stock_exchange",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    minWidth: 150,
    resizable: true,
  },
  {
    headerName: "Exchange Segment",
    field: "ExchangeSegment",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    hide: true,
    minWidth: 130,
    resizable: true,
  },
  {
    headerName: "Exchange Instrument Id",
    field: "ExchangeInstrumentId",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    hide: true,
    minWidth: 130,
    resizable: true,
  },
];

/* ============================
   getTableColumn implementation
   Accepts deps: filteredbody, ltpList, NetltpData, modifyOrderData, handlers...
   Returns final columns (static + dynamic injected where needed)
   ============================ */

export const getScripCode = (nse, bse, mcx) => {
  if (nse !== 0) {
    return nse;
  } else if (bse !== 0) {
    return bse;
  }
  return mcx;
};
//
export const getTableColumn = (tableName, deps = {}) => {
  const {
    filteredbody = [],
    holdingsFilteredbody = [],
    ltpList = {},
    NetltpData = {},
    modifyOrderData = [],
    modifiySelectAllHandler = () => { },
    pendingOrders = [],
    holdingsSelectAll = false,
    selectAllHandler = () => { },
    netPositionsSelectAll = false,
    MemoizedOrderCellRenderer,
    MemoizedHoldingsCellRenderer,
    MemoizedNetPositionsCellRenderer,
  } = deps;

  // helper: safe currency formatting - assumes currencyFormatter exists in scope
  const fmt = (v) => {
    try {
      return v === "-" ? "-" : currencyFormatter(v, 2);
    } catch {
      return v;
    }
  };

  switch (tableName) {
    /* ---------------- ORDERBOOK ---------------- */
    case "orderbook": {
      const actionCol = {
        headerName: "Action",
        field: "Actions",
        cellRenderer: MemoizedOrderCellRenderer,
        editable: false,
        colId: "action",
        minWidth: 100,
        resizable: true,
        valueGetter: () => "-",
        headerComponent: () => (
          <div className="flex-row">
            <span>Action</span>
            {!!pendingOrders.length && (
              <div style={{ marginLeft: "5px" }}>
                <Tooltip content="Select All">
                  <Checkbox
                    isSelected={pendingOrders.length === modifyOrderData.length}
                    onChange={modifiySelectAllHandler}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        ),
      };

      // Build Limit Price renderer and Trig Price editable logic (fixed)
      const finalStatic = staticOrderBookColumns.map((col) => {
        if (col.field === "Status") {
          return {
            ...col,
            cellRenderer: (params) => (
              <span
                title={
                  params?.data?.Status === "Rejected"
                    ? params?.data?.CancelRejectReason
                    : ""
                }
              >
                {params?.data?.Status}
              </span>
            ),
          };
        }

        if (col.field === "Limit Price") {
          return {
            ...col,
            editable: (params) =>
              params?.node?.data?.OrderType !== "StopMarket" &&
              params?.node?.data?.OrderType !== "Market",
            cellRenderer: (params) => <>{fmt(params.data["Limit Price"])}</>,
          };
        }

        if (col.field === "Trig Price") {
          return {
            ...col,
            // fixed condition: editable if OrderType !== "Limit" && !== "Market"
            editable: (params) =>
              params?.node?.data?.OrderType !== "Limit" &&
              params?.node?.data?.OrderType !== "Market",
            cellRenderer: (params) => <>{fmt(params.data["Trig Price"])}</>,
          };
        }

        if (col.field === "Time") {
          return {
            ...col,
            comparator: (valueA, valueB) => {
              // valueA/B format assumed "dd-mm-yyyy hh:mm:ss"
              const parseDMY = (v) =>
                new Date(
                  v.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
                ).getTime();
              const a = parseDMY(valueA || "");
              const b = parseDMY(valueB || "");
              return a - b;
            },
          };
        }

        if (col.field === "Dealer") {
          // col defined originally as OrderUniqueIdentifier
          return col;
        }

        if (col.field === "Reason") {
          return {
            ...col,
            cellRenderer: (params) => (
              <span
                style={{ color: "red" }}
                title={
                  params?.data?.Status === "Rejected"
                    ? params?.data?.CancelRejectReason
                    : ""
                }
              >
                {params?.data?.CancelRejectReason}
              </span>
            ),
          };
        }

        return col;
      });

      return [actionCol, ...finalStatic];
    }

    /* ---------------- MARGIN ---------------- */
    case "margin": {
      // keep static margin columns, injecting the same renderers as original where needed
      const cols = staticMarginColumns.map((col) => {
        if (col.field === "ClientID") {
          return { ...col, cellRenderer: (p) => p.data.ClientID || "--" };
        }
        if (col.field === "ClientName")
          return { ...col, cellRenderer: (p) => p.data.ClientName || "--" };
        if (col.field === "Cash Available") {
          return {
            ...col,
            cellRenderer: (p) =>
              p.data["Cash Available"] ? fmt(p.data["Cash Available"]) : "--",
          };
        }
        if (col.field === "Collateral")
          return {
            ...col,
            cellRenderer: (p) => fmt(p.data.Collateral) || "--",
          };
        if (col.field === "Margin Utilized") {
          return {
            ...col,
            cellRenderer: (p) =>
              p.data["Margin Utilized"] ? fmt(p.data["Margin Utilized"]) : "--",
          };
        }
        if (col.field === "Net Margin") {
          return {
            ...col,
            cellRenderer: (p) =>
              p.data["Cash Available"] ? fmt(p.data["Net Margin"]) : "--",
          };
        }
        return col;
      });

      return cols;
    }

    /* ---------------- TRADEBOOK ---------------- */
    case "tradebook": {
      // keep static tradebook columns; keep TradedPrice formatting
      return staticTradeBookColumns.map((col) => {
        if (col.field === "ClientName")
          return { ...col, cellRenderer: (p) => p.data.ClientName || "--" };
        if (col.field === "TradedPrice")
          return {
            ...col,
            cellRenderer: (p) => <>{fmt(p.data["TradedPrice"])}</>,
          };
        return col;
      });
    }

    /* ---------------- HOLDINGS ---------------- */
    case "holdings": {
      // Start with a copy so we don't mutate static template
      const cols = [...staticHoldingsColumns];

      // Insert Action column at beginning (as your old code)
      const actionCol = {
        headerName: "Action",
        field: "Actions",
        cellRenderer: MemoizedHoldingsCellRenderer, // caller must pass this
        editable: false,
        colId: "action",
        minWidth: 85,
        resizable: true,
        valueGetter: () => "Square Off",
        headerComponent: () => (
          <div className="flex-row">
            <span>Action</span>
            {!!holdingsFilteredbody.length && (
              <div style={{ marginLeft: "5px" }}>
                <Tooltip content="Select All">
                  <Checkbox
                    isSelected={holdingsSelectAll}
                    onChange={selectAllHandler}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        ),
      };

      // add Invested, Mkt. Price, Mkt. Value, P&L, P&L (%) after BuyPrice (like original)
      const buyIndex = cols.findIndex((c) => c.field === "BuyPrice");
      const insertAt = buyIndex >= 0 ? buyIndex + 1 : cols.length;

      const extra = [
        {
          headerName: "Invested",
          field: "Invested",
          type: "rightAligned",
          minWidth: 150,
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          resizable: true,
          valueGetter: (params) => {
            const { BuyPrice, Quantity } = params.data;
            if (BuyPrice === "-") return "-";
            return (Number(BuyPrice) || 0) * (Number(Quantity) || 0);
          },
          valueFormatter: (params) =>
            params.value === "-" ? "-" : currencyFormatter(params.value, 2),
        },
        {
          headerName: "Mkt. Price",
          field: "marketPrice",
          minWidth: 150,
          resizable: true,
          type: "rightAligned",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          valueGetter: (params) => {
            const {
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId,
            } = params.data;
            const code = getScripCode(+ExchangeNSEInstrumentId, +ExchangeBSEInstrumentId, ExchangeMSEInstrumentId === "NA" ? 0 : ExchangeMSEInstrumentId);
            const price = ltpList?.[code];
            return price ?? 0;
          },
          valueFormatter: (params) => {
            const formatted = currencyFormatter(params.value, 2);
            return formatted === "₹0.00" ? "-" : formatted;
          },
        },
        {
          headerName: "Mkt. Value",
          field: "marketValue",
          minWidth: 150,
          resizable: true,
          type: "rightAligned",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          valueGetter: (params) => {
            const {
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId,
              Quantity,
            } = params.data;
            const code = getScripCode(
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId
            );
            const market =
              (Number(Quantity) || 0) * Number(ltpList?.[code] ?? 0);
            return market ?? 0;
          },
          valueFormatter: (params) => {
            const formatted = currencyFormatter(params.value, 2);
            return formatted === "₹0.00" ? "-" : formatted;
          },
        },
        {
          headerName: "P&L",
          field: "profit_and_loss",
          minWidth: 150,
          resizable: true,
          type: "rightAligned",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          valueGetter: (params) => {
            const {
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId,
              Quantity,
              BuyPrice,
            } = params.data;
            const code = getScripCode(
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId
            );
            const ltp = Number(ltpList?.[code] ?? 0);
            if (!ltp || !Quantity || !BuyPrice) return 0;
            const marketValue = ltp * Quantity;
            const investedValue = BuyPrice * Quantity;
            return marketValue - investedValue;
          },
          valueFormatter: (params) => {
            const formatted = currencyFormatter(params.value, 2);
            return formatted === "₹0.00" ? "-" : formatted;
          },
          cellRenderer: (params) => {
            const pnl = Number(params.value || 0);
            const formatted = currencyFormatter(pnl, 2);
            const display = formatted === "₹0.00" ? "-" : formatted;
            return (
              <span style={{ color: pnl >= 0 ? "green" : "red" }}>
                {display}
              </span>
            );
          },
        },
        {
          headerName: "P&L (%)",
          field: "profit_and_loss_percentage",
          ellClass: "ag-right-aligned-cell",
          minWidth: 150,
          resizable: true,
          type: "rightAligned",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          valueGetter: (params) => {
            const {
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId,
              Quantity,
              BuyPrice,
            } = params.data;
            const code = getScripCode(
              ExchangeNSEInstrumentId,
              ExchangeBSEInstrumentId,
              ExchangeMSEInstrumentId
            );
            const ltp = Number(ltpList?.[code] ?? 0);
            if (!ltp || !Quantity || !BuyPrice) return 0;
            const invested = BuyPrice * Quantity;
            const current = ltp * Quantity;
            const pnlPerc = ((current - invested) * 100) / invested;
            return isFinite(pnlPerc) ? pnlPerc : 0;
          },
          valueFormatter: (params) => {
            const value = params.value;
            if (value === 0 || isNaN(value)) return "-";
            return `${value.toFixed(2)}%`;
          },
          cellRenderer: (params) => {
            const value = params.value;
            const formatted = isNaN(value) ? "-" : `${value.toFixed(2)}%`;
            return (
              <span style={{ color: value >= 0 ? "green" : "red" }}>
                {formatted}
              </span>
            );
          },
        },
      ];

      // splice extras in
      const before = cols.slice(0, insertAt);
      const after = cols.slice(insertAt);
      const final = [actionCol, ...before, ...extra, ...after];
      return final;
    }

    /* ---------------- NETPOSITIONS ---------------- */
    case "netpositions": {
      const cols = [...staticNetPositionsColumns];

      // Action column at start
      const actionCol = {
        headerName: "Action",
        field: "Actions",
        cellRenderer: MemoizedNetPositionsCellRenderer, // provided by caller
        editable: true,
        colId: "action",
        minWidth: 85,
        resizable: true,
        valueGetter: (params) => {
          const isDisable =
            params.data?.TradeSide === "-" && +params.data?.Qty === 0;
          return isDisable ? "Squared Off" : "Square Off";
        },
        headerComponent: () => (
          <div className="flex-row">
            <span>Action</span>
            {!!filteredbody.length && (
              <div style={{ marginLeft: "5px" }}>
                <Tooltip content="Select All">
                  <Checkbox
                    isSelected={netPositionsSelectAll}
                    onChange={selectAllHandler}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        ),
      };

      // extras to insert after existing static columns (as in original)
      const extra = [
        {
          headerName: "Unrealized MTM",
          field: "UnrealizedMTM",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          minWidth: 130,
          resizable: true,
          cellRenderer: (params) => {
            const isDisable =
              params.data?.TradeSide === "-" && +params.data?.Qty === 0;
            const { ExchangeInstrumentId } = params.data;
            const code = getScripCode(ExchangeInstrumentId);
            const netquantity = Number(params?.data?.Qty || 0);
            const avgTrade = Number(params?.data?.AvgTradedPrice || 0);
            const netAvgPrice = Number(params?.data?.NetAveragePrice || 0);
            const totalMTM =
              netquantity * Number(NetltpData?.[code] ?? 0) -
              netquantity * avgTrade;

            const UnrealizedMTMCalc =
              ["IIFLONT", "KOTAK"].includes(params.data?.Broker)
                ? (Number(NetltpData?.[code] ?? 0) - netAvgPrice) * netquantity
                : params.data?.UnrealizedMTM;

            return (
              <span
                style={{
                  color: isDisable
                    ? "#7e868c"
                    : UnrealizedMTMCalc >= 0
                      ? "green"
                      : "red",
                }}
              >
                {fmt(UnrealizedMTMCalc)}
                {/* {fmt(params.data?.UnrealizedMTM)} */}
              </span>
            );
          },
        },
        {
          headerName: "Realized MTM",
          field: "RealizedMTM",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          minWidth: 130,
          resizable: true,
          cellRenderer: (params) => {
            const { RealizedMTM } = params.data;
            const isDisable =
              params.data?.TradeSide === "-" && +params.data?.Qty === 0;
            return (
              <span style={{ color: isDisable ? "#7e868c" : "#000" }}>
                {fmt(RealizedMTM)}
              </span>
            );
          },
        },
        {
          headerName: "Avg Traded Price",
          field: "AvgTradedPrice",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          minWidth: 160,
          resizable: true,
          cellRenderer: (params) => {
            const isDisable =
              params.data?.TradeSide === "-" && +params.data?.Qty === 0;
            return (
              <span
                style={{
                  marginRight: "5px",
                  color: isDisable ? "#7e868c" : "#000",
                }}
              >
                {fmt(params.data["AvgTradedPrice"])}
              </span>
            );
          },
        },
        {
          headerName: "LTP",
          field: "LTP",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          minWidth: 100,
          resizable: true,
          valueGetter: (params) => {
            const { ExchangeInstrumentId } = params.data;
            const code = getScripCode(ExchangeInstrumentId);
            const ltp = NetltpData[code];
            return ltp ?? 0;
          },
          cellRenderer: (params) => {
            const isDisable =
              params.data?.TradeSide === "-" && +params.data?.Qty === 0;
            const { ExchangeInstrumentId } = params.data;
            const code = getScripCode(ExchangeInstrumentId);
            return (
              <span style={{ color: isDisable ? "#7e868c" : "#000" }}>
                {fmt(NetltpData[code] ?? 0)}
              </span>
            );
          },
        },
        {
          headerName: "Market Value",
          field: "MTM",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          minWidth: 130,
          resizable: true,
          cellRenderer: (params) => {
            const isDisable =
              params.data?.TradeSide === "-" && +params.data?.Qty === 0;
            const { ExchangeInstrumentId } = params.data;
            const code = getScripCode(ExchangeInstrumentId);
            const netquantity = Number(params?.data?.Qty || 0);
            const totalMTM = netquantity * Number(NetltpData?.[code] ?? 0);
            return (
              <span style={{ color: isDisable ? "#7e868c" : "#000" }}>
                {fmt(totalMTM)}
              </span>
            );
          },
        },
        {
          headerName: "Trade Side",
          field: "TradeSide",
          floatingFilter: true,
          filter: "agTextColumnFilter",
          sortable: true,
          minWidth: 120,
          resizable: true,
          cellRenderer: (params) => {
            const isDisable =
              params.data?.TradeSide === "-" && +params.data?.Qty === 0;
            return (
              <span style={{ color: isDisable ? "#7e868c" : "#000" }}>
                {params.data?.TradeSide}
              </span>
            );
          },
        },
      ];

      // final: action column first, then static cols + extras
      return [actionCol, ...cols, ...extra];
    }

    /* ---------------- DEFAULT ---------------- */
    default:
      return [];
  }
};

export const dashboardTabHeader = [
  {
    id: 1,
    label: "Orders",
    value: "orderbook",
  },
  {
    id: 2,
    label: "Trades",
    value: "tradebook",
  },
  {
    id: 3,
    label: `${"Net" + " " + "Positions"}`,
    value: "netpositions",
  },
  {
    id: 4,
    label: "Margins",
    value: "margin",
  },
  {
    id: 5,
    label: "Holdings",
    value: "holdings",
  },
];

// --- trade excel ----///
export const tradeExcelColumnDefs = [
  {
    headerName: "Client ID",
    field: "clientId",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Order Side",
    field: "orderside",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Order Type",
    field: "ordertype",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Product Type",
    field: "Product Type",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Exchange",
    field: "exchange",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Symbol",
    field: "symbol",
    flex: 1.5,
    minWidth: 100,
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Quantity",
    field: "Quantity",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Price/Limit Price",
    field: "price",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    headerName: "Trigger Price",
    field: "sltriggerprice",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
];
