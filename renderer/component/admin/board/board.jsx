import React from "react";
import { Button } from "@nextui-org/react";
import electron from "electron";
import { useGlobalContext } from "../../../context/GlobalContext";
import { toast } from "react-toastify";
import { deleteAllClients } from "../../../../services/transactions/transactions.service";
const ipcRenderer = electron.ipcRenderer || false;

const Board = () => {
  const { setClientCreds } = useGlobalContext();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <div>
        <Button
          className="primary-button border-radius-8"
          style={{ color: "BLUE" }}
          onPress={async () => {
            try {
              const deleteRes = await deleteAllClients();
              if (deleteRes) {
                toast.success(deleteRes.message);
              }
            } catch (error) {
              console.log("delete store error", error);
            }
            const result = await ipcRenderer.invoke("deleteStore-ipc");
            setClientCreds([]);
          }}
        >
          Delete Store
        </Button>
      </div>
      <div>
        <Button
          className="primary-button border-radius-8"
          onPress={async () => {
            const result = await ipcRenderer.invoke("ipc-saveSheetToCliDir", {
              rows: [{}],
            });
          }}
        >
          Save Excel
        </Button>
      </div>
    </div>
  );
};

export default Board;
