import React from "react";
import { useGlobalContext } from "../../../context/GlobalContext";
import { statusHandler } from "../../dashboard/dashboardTables/helpers";
import {
  delBasket,
  getFOBasketID,
} from "../../../../services/transactions/transactions.service";
import { AgGridReact } from "ag-grid-react";
import { Row, Col } from "@nextui-org/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IconEye, IconTrash } from "@tabler/icons-react";
const rowHeight = 29;
const headerHeight = 27;

function FoBasketBase() {
  const { fnoBasketRowData, setFnoBasketRowData } = useGlobalContext();
  const router = useRouter();

  const handleBasket = async (param) => {
    try {
      const res = await getFOBasketID(param?.id);
      router.push({
        pathname: "/EditBasketOpton",
        query: { data: JSON.stringify(res) },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelBasket = async (param) => {
    try {
      const res = await delBasket(param.name);
      setFnoBasketRowData((prev) =>
        prev.filter((item) => item.id !== param?.id)
      );
      toast.success("deleted !!");
    } catch (error) {
      console.log("error delete F&O basket", error);
    }
  };

  const renderActionCell = (param) => (
    <Row>
      <Col>
        <IconEye
          height={20}
          width={20}
          strokeWidth={1}
          color={"#000"}
          onClick={() => {
            if (param.data.status === "draft") {
              handleBasket(param.data);
            }
          }}
          style={{
            cursor: "pointer",
            visibility: param.data.status === "running" ? "hidden" : "visible",
          }}
        />
        <IconTrash
          height={20}
          width={20}
          strokeWidth={1}
          color={"#000"}
          onClick={() => handleDelBasket(param.data)}
          style={{ cursor: "pointer", marginLeft: "10px" }}
        />
      </Col>
    </Row>
  );

  return (
    <div className="ag-theme-balham basket1-table" style={{ height: "55vh" }}>
      <AgGridReact
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        rowData={fnoBasketRowData}
        columnDefs={[
          { field: "id", headerName: "Id" },
          { field: "name", headerName: "Name" },

          {
            field: "type",
            headerName: "Basket Type",
            cellRenderer: statusHandler,
            flex: 1,
          },

          // {
          //   field: "status",
          //   headerName: "Status",
          //   cellRenderer: statusHandler,
          //   flex: 1,
          // },

          {
            field: "action",
            flex: 1,
            cellRenderer: renderActionCell,
          },
        ]}
      ></AgGridReact>
    </div>
  );
}

export default FoBasketBase;
