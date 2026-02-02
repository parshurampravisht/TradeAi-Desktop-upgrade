import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
// import { columns } from "./columnConstants";

const ClientTable = (props) => {
  let type = props.basketDetailsRef.current.type === "Custom" ? true : false;

  const rowHeight = 36;
  const headerHeight = 36;

  const columns = [
    {
      headerName: "Sr. No",
      field: "sno",
      valueGetter: (param) => param.data.sno + 1,
      width: "225",
    },
    {
      headerName: "Order Type",
      field: "orderType",
      // editable: true,
      // cellEditor: "agSelectCellEditor",
      // cellEditorParams: {
      //   values: ["Buy", "Sell"],
      //   valueListGap: 0,
      // },
      cellRenderer: (param) => {
        return (
          <span
            style={{ color: param.data?.orderType === "BUY" ? "green" : "red" }}
          >
            {param.data?.orderType}
          </span>
        );
      },
      width: "250",
    },
    {
      headerName: "Symbol",
      field: "symbol",
      cellRenderer: (param) => {
        if (typeof param.data?.symbol === "string") return param.data?.symbol;
        return param.data?.symbol?.label;
      },
      width: "250",
    },
    {
      headerName: "Weightage (%)",
      field: "weightage",
      editable: true,
      width: "250",
      cellRenderer: (params) => {
        return <>{params.data?.weightage ? params.data?.weightage : "-"}</>;
      },
    },
    /* {
      headerName: "Action",
      field: "weightage",
      editable: true,
      width: '100'
    }, */
  ];

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };
  return (
    <>
      <div
        className="ag-theme-balham basket2-grid"
        style={{ height: "32vh", width: "100%" }}
      >
        <AgGridReact
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          columnDefs={columns}
          onGridReady={onGridReady}
          rowData={props.symbolTable}
          sizeColumnsToFit={true}
        />
      </div>
    </>
  );
};

export default ClientTable;
