import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { formatNumber } from "../../dashboard/dashboardTables/helpers";

const previewColumnHeader = [
  // { field: "id", headerName: "ID", flex: 0.5 },
  {
    headerName: "S.no",
    field: "sno",
    maxWidth: 50,
    flex: 0.5,
  },
  {
    field: "symbol",
    headerName: "Symbol",
    flex: 1,
  },
  {
    field: "quantity",
    headerName: "Quantity",
    flex: 1,
  },
  {
    field: "buy_price",
    headerName: "Buy Price",
    cellRenderer: (param) => {
      return param.data.buy_price || "-";
    },
    flex: 1,
  },
  {
    field: "LTP",
    headerName: "LTP",
    cellRenderer: (param) => {
      return param.data.LTP || "-";
    },
    flex: 1,
  },
  {
    field: "invested_amount",
    headerName: "Invested Amount",
    valueFormatter: (params) => {
      const totalAmount = params.value || 0;
      return `${
        totalAmount !== "-" ? `\u20B9 ${formatNumber(totalAmount)}` : "-"
      }`;
    },
    
    flex: 1.5,
  },
  {
    field: "pnl",
    headerName: "P&L",
    cellStyle: (params) => {
      if (params.value < 0) {
        return { color: "red" };
      } else if (params.value > 0) {
        return { color: "green" };
      } else {
        return { color: "black" };
      }
    },
    valueFormatter: (params) => {
      const totalPNL = params.value || 0;
      return `${totalPNL !== "-" ? `\u20B9 ${formatNumber(totalPNL)}` : "-"}`;
    },
    flex: 1,
  },
  {
    field: "order_side",
    headerName: "Order Side",
    flex: 1,
  },
  {
    field: "order_type",
    headerName: "Order Type",
    flex: 1,
  },
  {
    field: "product_type",
    headerName: "Product Type",
    flex: 1,
  },
];

const rowHeight = 29;
const headerHeight = 27;

function PreviewExecuteBasket({ previewBasketData }) {

  return (
    <div
      className="ag-theme-balham basket1-preview-table"
      style={{ height: "55vh" }}
    >
      <AgGridReact
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        rowData={previewBasketData}
        columnDefs={previewColumnHeader}
      ></AgGridReact>
    </div>
  );
}

export default PreviewExecuteBasket;
