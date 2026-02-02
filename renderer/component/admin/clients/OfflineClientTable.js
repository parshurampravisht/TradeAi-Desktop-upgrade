import React, { useState, useCallback } from "react";
import { Col } from "@nextui-org/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { AgGridReact } from "ag-grid-react";
import FullPageLoader from "../../common/FullPageLoader";
import SingleHoldingModal from "./SingleHoldingModal";
import EditOfflineClient from "./EditOfflineClient";
import { SingleDeleteHoldingHandler } from "../../../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const OfflineClientTable = ({ handleOfflineData, offlineRowData }) => {
  const [loading, setLoading] = useState(false);
  const [EditHolding, setEditHolding] = useState(false);
  const [EditOfflineClientData, setEditOfflineClientData] = useState(false);
  const [editId, setEditId] = useState("");
  const [editOffline, setEditOffline] = useState("");
  const handlerHoldingClose = (boolean, data) => {
    setEditHolding(boolean);
    setEditOffline(data);
  };
  const handlerEditClose = (data) => {
    setEditOfflineClientData(true);
    setEditId(data?.id);
    setEditOffline(data);
  };

  const handleSingleDeleteHandler = async (data) => {
    const res = await SingleDeleteHoldingHandler(data?.id);
    toast.success(res?.Message);
    handleOfflineData();
  };

  const cellRenderer = useCallback((params) => {
    return (
      <>
        <img
          src="../images/holidingImg.svg"
          onClick={() => handlerHoldingClose(true, params?.data)}
          style={{ cursor: "pointer" }}
        />
        <img
          src="../images/fluent_editregular.svg"
          style={{ paddingLeft: "10px", cursor: "pointer" }}
          onClick={() => handlerEditClose(params?.data)}
        />
        <img
          src="../images/mdi_light_delete.svg"
          style={{ paddingLeft: "10px", cursor: "pointer" }}
          onClick={() => handleSingleDeleteHandler(params?.data)}
        />
      </>
    );
  }, []);
  const columnDefs = [
    {
      headerName: "Client ID",
      field: "clientCode",
      flex: 1.5,
    },
    {
      headerName: "Client Name",
      field: "clientName",
      flex: 1.5,
    },
    {
      headerName: "Broker Name",
      field: "brokerName",
      flex: 1.5,
    },
    {
      headerName: "Email Id",
      field: "email",
      flex: 1.5,
    },
    {
      headerName: "Actions",
      field: "Actions",
      editable: false,
      colId: "action",
      flex: 1,
      cellRenderer: cellRenderer,
    },
  ];
  return (
    <>
      <Col>
        <div
          className="ag-theme-balham"
          style={{ height: 350, width: "100%", marginBottom: "10px" }}
        >
          {/* <FullPageLoader show={loading} /> */}
          <AgGridReact rowData={offlineRowData} columnDefs={columnDefs} />
        </div>
        <SingleHoldingModal
          EditHolding={EditHolding}
          setEditHolding={setEditHolding}
          editOffline={editOffline}
          handleOfflineData={handleOfflineData}
        />
        <EditOfflineClient
          setEditOfflineClientData={setEditOfflineClientData}
          EditOfflineClientData={EditOfflineClientData}
          handleOfflineData={handleOfflineData}
          editId={editId}
          editOffline={editOffline}
          setLoading={setLoading}
        />
      </Col>
    </>
  );
};
export default OfflineClientTable;
