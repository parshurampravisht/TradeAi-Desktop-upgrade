import React, { useCallback } from "react";
import { currencyFormatter, numberFormatter } from "../../helpers";
import classes from "./ColumnDefs.module.css";
export const CallColumns = [
  { headerName: "CALL", field: "label" },
  {
    headerName: "LTP",
    field: "LTP",
  },
];
export const StrikesColumns = [
  {
    headerName: "STRIKE",
    field: "label",
  },
];
export const PutColumns = [
  {
    headerName: "PUT",
    field: "label",
  },
  {
    headerName: "LTP",
    field: "LTP",
  },
];

export const OptionsColumns = ({ onCellValueChanged }) => [
  {
    headerName: "OI",
    field: "call_oi",
    width: "120",
    cellStyle: { "backgroundColor": "#f1fbf6", "textAlign": "center" },
    valueGetter: (params) => {
      return params.data.call_oi === 0
        ? "-"
        : numberFormatter(params.data.call_oi);
    },
  },
  {
    headerName: "Call LTP",
    field: "call_ltp",
    width: "180",
    cellStyle: { "backgroundColor": "#f1fbf6", "textAlign": "center" },
    valueGetter: (params) => {
      return params.data.call_ltp === 0
        ? "-"
        : currencyFormatter(params.data.call_ltp);
    },
    cellRenderer: useCallback(
      (params) => (
        <div className={classes.cellcontent}>
          {params.data.call_ltp === 0
            ? "-"
            : currencyFormatter(params.data.call_ltp)}
          <span>
            <button
              className={classes.hoverbutton}
              onClick={() =>
                onCellValueChanged(
                  params.node.data.call_ltp,
                  "Buy",
                  "true",
                  "Call_LTP",
                  params?.data,
                  params.data.strikes
                )
              }
            >
              Buy
            </button>
            <button
              className={classes.hoverbutton1}
              onClick={() =>
                onCellValueChanged(
                  params.node.data.call_ltp,
                  "Sell",
                  "true",
                  "Call_LTP",
                  params?.data,
                  params.data.strikes
                )
              }
            >
              Sell
            </button>
          </span>
        </div>
      ),
      []
    ),
  },
  {
    headerName: "Strikes",
    field: "strikes",
    width: "130",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
    cellStyle: { "backgroundColor": "#f0f0f0", "textAlign": "center" },
    valueGetter: (params) => {
      return params.data.strikes === 0 ? "-" : params.data.strikes;
    },
  },
  {
    headerName: "Put LTP",
    field: "put_ltp",
    width: "170",
    cellStyle: { "backgroundColor": "#fff6f6", "textAlign": "center" },
    valueGetter: (params) => {
      return params.data.put_ltp === 0
        ? "--"
        : currencyFormatter(params.data.put_ltp);
    },

    cellRenderer: useCallback(
      (params) => (
        <div className={classes.cellcontent}>
          {params.data.put_ltp === 0
            ? "-"
            : currencyFormatter(params.data.put_ltp)}
          <span>
            <button
              className={classes.hoverbutton}
              onClick={() =>
                onCellValueChanged(
                  params.node.data.put_ltp,
                  "Buy",
                  "true",
                  "PUT_LTP",
                  params?.data,
                  params.data.strikes
                )
              }
            >
              Buy
            </button>
            <button
              className={classes.hoverbutton1}
              onClick={() =>
                onCellValueChanged(
                  params.node.data.put_ltp,
                  "Sell",
                  "true",
                  "PUT_LTP",
                  params?.data,
                  params.data.strikes
                )
              }
            >
              Sell
            </button>
          </span>
        </div>
      ),
      []
    ),
  },
  {
    headerName: "OI",
    field: "put_oi",
    width: "130",
    cellStyle: { "backgroundColor": "#fff6f6", "textAslign": "center" },
    valueGetter: (params) => {
      return params.data.put_oi === 0
        ? "-"
        : numberFormatter(params.data.put_oi);
    },
  },
];
