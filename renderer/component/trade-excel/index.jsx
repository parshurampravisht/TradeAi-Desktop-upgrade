import { Button, Loading, Text } from "@nextui-org/react";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useRef, useState } from "react";
import { tradeExcelColumnDefs } from "../../APIS/columnConstants";
import { excelFilePlaceOrderHandler } from "../../../services/transactions/transactions.service";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/router";
import { useGlobalContext } from "../../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { orderTypeFormatTradeWithExcel } from "../../constant/constant";
import UploadExcelSheetModal from "./UploadExcelSheetModal";


const defaultColDef = {
  resizable: true, // Set resizable to true for all columns by default
  wrapHeaderText: true, //to wrap text in second line
  autoHeaderHeight: true,
  flex: 1,
  headerClass: "ag-left-align-header",
};
//

function TradeExcelDashboard() {
  const router = useRouter();
  const { excelOrderItems, eventId, setEventId, setExcelOrderItems,
    //  setIsUploadTradeExcel
  } = useGlobalContext()

  const processRef = useRef(false);
  const [loader, setLoader] = useState(false);
  const [isUploadTradeExcel, setIsUploadTradeExcel] = useState(true);

  const transformArrayToClientMap = (ordersArray) => {
    return ordersArray.reduce((acc, order) => {
      const {
        clientId,
        orderside,
        ordertype,
        exchange,
        symbol,
        Quantity,
        price,
        sltriggerprice,
        scripcode,
        lotsize,
        ["Product Type"]: productType,
      } = order;

      console.log("ordertype", ordertype, order)

      const transformedOrder = {
        OrderSide: orderside,
        OrderType: orderTypeFormatTradeWithExcel[ordertype] || ordertype,
        Exchange: exchange,
        Symbol: symbol,
        Quantity,
        LimitPrice: price,
        SLTriggerPrice: sltriggerprice,
        Scripcode: scripcode,
        LotSize: lotsize,
        ProductType: productType,
        OverNightSL: "OFF"
      };

      if (!acc[clientId]) {
        acc[clientId] = [];
      }

      acc[clientId?.trim()].push(transformedOrder);
      return acc;
    }, {});
  };



  const PlaceOrderHandler = async () => {

    if (processRef.current) return;

    processRef.current = true;

    setLoader(true)
    const data = transformArrayToClientMap(excelOrderItems)
    const payload = {
      ...data,
      event_id: eventId,
    };

    try {
      const res = await excelFilePlaceOrderHandler(payload);
      console.log("res", res);
      toast.success(res.message)
      router.push("/equity")
      setExcelOrderItems([])
      processRef.current = false;
      setEventId('')
      setLoader(false)
    } catch (error) {
      console.log("error in place order", error);
    } finally {
      setTimeout(() => {
        processRef.current = false;
        setLoader(true)
      }, 6000)
    }
  };


  useEffect(() => {
    if (router.query.orderItems) {
      try {
        setExcelOrderItems((prev) => prev.length ? prev : JSON.parse(router.query.orderItems) || [])
        // setEventId(router.query.eventId)

      } catch (err) {
        console.error('Invalid JSON')
      }
    }
  }, [router.query.orderItems])

  return (
    <div>
      <UploadExcelSheetModal
        setToggle={setIsUploadTradeExcel}
        toggle={isUploadTradeExcel}
      />
      <div className="flex-row align-center justify-between width-100">
        <div className="flex-col">
          <Text
            h5
            color="#2C2C2C"
            className="font-weight-600"
            css={{ pl: "$0", mt: "$8", mb: "0" }}
          >
            Trade with excel
          </Text>
          <Text
            h6
            className="font-weight-400 disable-text-color"
            css={{ pl: "$0", color: "838383", letterSpacing: 0.3 }}
          >
            Excel file uploaded successfully. Review and confirm your trade data
            from below.
          </Text>
        </div>
        <button
          style={{
            minWidth: "60px",
            padding: "5px 15px",
            fontSize: "15px",
            paddingLeft: "0px"
          }}
          className={`flex-row align-center border-radius-8 primary-outline-button cursor-pointer font-weight-500`}
          onClick={() => {
            setIsUploadTradeExcel(true);
          }}
        >
          <img src="images/excel-sheet-icon.png" style={{ color: "green", width: 40, height: 30 }} />
          Upload Excel
        </button>
      </div>
      <div
        className="ag-theme-balham grid-wrapper"
        style={{ background: "white", height: "calc( 100vh - 260px)" }}
      >
        <AgGridReact
          // className="ag-grid-custom-height"
          editType="fullRow"
          suppressClickEdit={true}
          suppressHeaderVirtualisation={true}
          columnDefs={tradeExcelColumnDefs}
          overlayNoRowsTemplate="No Data Found"
          overlayLoadingTemplate="Loading Data..."
          // floatingFilter={true}
          rowData={excelOrderItems}
          // sizeColumnsToFit={true}
          // enableColResize={true}
          defaultColDef={defaultColDef}
        // onGridReady={(params) => {
        //   params.api.sizeColumnsToFit(); // Adjusts columns to fit grid width initially
        // }}
        />
      </div>
      <div
        style={{ marginTop: "10px" }}
        className="flex-row justify-end width-100 column-gap-10"
      >
        <Button
          className={`border-radius-8 secondary-button`}
          auto
          flat
          onClick={() => {
            router.push("/equity");
          }}
        >
          Cancel
        </Button>

        <Button
          className={`flex-row align-center justify-center border-radius-8 primary-button`}
          auto
          flat
          style={{ width: "110px" }}
          onPress={PlaceOrderHandler}
        >
          {loader ? <Loading type="spinner" size="md" /> : `Place order`}
        </Button>
      </div>
    </div>
  );
}

export default TradeExcelDashboard;
