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
    width: "140",
    cellStyle: { "background-color": "#f1fbf6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.call_oi === 0
        ? "-"
        : numberFormatter(params.data.call_oi);
    },
  },
  {
    headerName: "Call LTP",
    field: "call_ltp",
    width: "170",
    cellStyle: { "background-color": "#f1fbf6", "text-align": "center" },
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
    width: "168",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
    cellStyle: { "background-color": "#f0f0f0", "text-align": "center" },
    // valueGetter: (params) => {
    //   return params.data.strikes === 0 ? "-" : params.data.strikes;
    // },
  },
  {
    headerName: "Put LTP",
    field: "put_ltp",
    width: "170",
    cellStyle: { "background-color": "#fff6f6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.put_ltp === 0
        ? "-"
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
    width: "140",
    cellStyle: { "background-color": "#fff6f6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.put_oi === 0
        ? "-"
        : numberFormatter(params.data.put_oi);
    },
  },
];

export const BasketOptionsColumns = ({ onCellValueChanged }) => [
  {
    headerName: "OI",
    field: "call_oi",
    width: "140",
    cellStyle: { "background-color": "#f1fbf6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.call_oi === 0
        ? "-"
        : numberFormatter(params.data.call_oi);
    },
  },
  {
    headerName: "Call LTP",
    field: "call_ltp",
    width: "170",
    cellStyle: { "background-color": "#f1fbf6", "text-align": "center" },
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
    width: "137",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
    cellStyle: { "background-color": "#f0f0f0", "text-align": "center" },
    // valueGetter: (params) => {
    //   return params.data.strikes === 0 ? "-" : params.data.strikes;
    // },
  },
  {
    headerName: "Put LTP",
    field: "put_ltp",
    width: "170",
    cellStyle: { "background-color": "#fff6f6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.put_ltp === 0
        ? "-"
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
    width: "140",
    cellStyle: { "background-color": "#fff6f6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.put_oi === 0
        ? "-"
        : numberFormatter(params.data.put_oi);
    },
  },
];

export const EditHoverColumns = ({ onCellValueChanged }) => [
  {
    headerName: "Call LTP",
    field: "call_ltp",
    width: "146",
    cellStyle: { "background-color": "#f1fbf6", "text-align": "center" },
    // valueGetter: (params) => {
    //   return params.data.call_ltp === 0
    //     ? "-"
    //     : currencyFormatter(params.data.call_ltp);
    // },
    cellRenderer: (params) => (
      <div className={classes.cellcontent}>
        {params.data.call_ltp === 0
          ? "-"
          : currencyFormatter(params.data.call_ltp)}
        <span>
          <button
            className={classes.hoverbutton}
            // onClick={() =>
            //   onCellValueChanged(
            //     params.node.data.call_ltp,
            //     "Buy",
            //     "true",
            //     "Call_LTP",
            //     params?.data,
            //     params.data.strikes
            //   )
            // }
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
  },
  {
    headerName: "Strikes",
    field: "strikes",
    width: "156",
    floatingFilter: true,
    filter: "agTextColumnFilter",
    sortable: true,
    resizable: true,
    cellStyle: { "background-color": "#f0f0f0", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.strikes === 0
        ? "-"
        : currencyFormatter(params.data.strikes);
    },
  },
  {
    headerName: "Put LTP",
    field: "put_ltp",
    width: "200",
    cellStyle: { "background-color": "#fff6f6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.put_ltp === 0
        ? "-"
        : currencyFormatter(params.data.put_ltp);
    },

    cellRenderer: (params) => {
      console.log("params", params);
      return (
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
      );
    },
  },
  {
    headerName: "OI",
    field: "put_oi",
    width: "156",
    cellStyle: { "background-color": "#fff6f6", "text-align": "center" },
    valueGetter: (params) => {
      return params.data.put_oi === 0
        ? "-"
        : currencyFormatter(params.data.put_oi);
    },
  },
];
