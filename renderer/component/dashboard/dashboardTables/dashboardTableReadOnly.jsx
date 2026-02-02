import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";

const DashBoardTableReadOnly = (props) => {
  
  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };
  return (
    <>
      <div
        className="ag-theme-balham"
        style={{ height: "68vh", width: "100%" }}
      >
        <AgGridReact
          rowData={props.filteredbody}
          columnDefs={props.tableColumns}
          onGridReady={onGridReady}
          floatingFilter={true}
          defaultColDef={{ width: 100 }}
        />
      </div>
    </>
  );
};

export default DashBoardTableReadOnly;
