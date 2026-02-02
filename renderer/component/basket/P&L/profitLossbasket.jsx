import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, Spacer, Row, Col, Grid, Text, Button } from "@nextui-org/react";
import { AgGridReact } from "ag-grid-react";
import { columnPNL, TotalPNLAmount } from "./columnPNL";
import {
  getBasketDetails,
  getLTPService,
} from "../../../../services/transactions/transactions.service";
import { useGlobalContext } from "../../../context/GlobalContext";
import { IconEye } from "@tabler/icons-react";
import classes from "../../../component/options/BasketModel.module.css";
import EditaddStocks from "../addStocks/EditaddStocks";
import FullPageLoader from "../../common/FullPageLoader";
import PreviewExecuteBasket from "./previewExecuteBasket";
import { formatNumber } from "../../dashboard/dashboardTables/helpers";
import { ExchangeSquareOff2 } from "../../../constant/constant";

const defaultColDef = {
  cellStyle: {
    display: "flex",
    justifyContent: "center", // Horizontally center the content
    alignItems: "center", // Vertically center the content
  },
};

export default function ProfitLossBasket({
  basketId,
  basket_name,
  setCurrentState,
  symbolTableWithLTP,
  setSymbolTableWithLTP,
  symbolTableWithScripcode,
  basketDetailsRef,
  setSymbolTableWithScripcode,
  basketStatus,
  selectedSymbols,
  setSelectedSymbols,
  symbolTable,
  setSymbolTable,
  setFlag,
}) {
  const { equityBasketType, setEquityBasketType, getClientsIds } =
    useGlobalContext();
  const [RowData, setRowData] = useState([]);
  const [symbolColumns, setSymbolColumns] = useState([]);
  const [PNLData, setPNLData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataStatus, setStatusData] = useState(basketStatus || "");
  const [Weightage, setWeightage] = useState([]);
  const [previewBasket, setPreviewBasket] = useState(false);
  const [previewBasketData, setPreviewBasketData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedSymbolsLTP, setSelectedSymbolsLTP] = useState([]);
  const pendingObjRef = useRef(null);

  const handleLTPItem = async (basketOrders) => {
    const extractedScripcodes = basketOrders.map((item) => ({
      [ExchangeSquareOff2[item.exchange] || item.exchange]: item.scrip_code,
    }));

    const payloadLtp = {
      scripcodes: extractedScripcodes,
    };

    if (payloadLtp.scripcodes) {
      const resLtp = await getLTPService(payloadLtp);
      return resLtp || [];
    }
  };

  const ExecuteBasketHandler = (obj) => {
    pendingObjRef.current = obj;
    setPreviewLoading(true);
    setPreviewBasket(true);
  };

  const handleExecuteBasket = async (obj) => {
    const symbolLTPMap = selectedSymbolsLTP.reduce((acc, elem) => {
      acc[elem.scripcode] = elem.ltp || 0;
      return acc;
    }, {});

    const res = PNLData.filter((item) => item.client_id === obj.clientId).map(
      (item, index) => ({
        ...item,
        LTP: symbolLTPMap[item.scrip_code] || 0,
        sno: index + 1,
        invested_amount: !item.buy_price
          ? "-"
          : formatNumber(item.buy_price * item.quantity),
        pnl: !item.buy_price
          ? "-"
          : formatNumber(
            symbolLTPMap[item.scrip_code] * item.quantity -
            item.buy_price * item.quantity
          ),
      })
    );
    setPreviewBasketData(res);
  };

  useEffect(() => {
    if (pendingObjRef.current && PNLData.length && selectedSymbolsLTP.length) {
      handleExecuteBasket(pendingObjRef.current);
      setPreviewLoading(false);
      pendingObjRef.current = null; // Clear the ref after executing
    }
  }, [pendingObjRef.current]);

  const rowData = async () => {
    try {
      setLoading(true);
      const res = await getBasketDetails(basketId);
      basketDetailsRef.current["name"] = res.data.name;
      basketDetailsRef.current["value"] = parseInt(res.data?.weightage);
      basketDetailsRef.current["type"] = res.data?.weightage_type;
      basketDetailsRef.current["margin"] = parseInt(res.data?.used_margin);
      setWeightage(res?.data || []);
      setStatusData(res?.data?.status);
      setEquityBasketType(res?.data?.basket_type);
      setPNLData(res.data.basket_orders || []);

      if (res) {
        // Extract the relevant data from the response
        const basketOrders = res.data.basket_orders;
        const resultLTP = await handleLTPItem(basketOrders);
        setSelectedSymbolsLTP(resultLTP);

        const symbolQuantityMap = [
          ...new Set(basketOrders.map((item) => item.symbol)),
        ];
        // Create a map to store quantity for each symbol
        let symbolColumnsInfo = [];
        symbolColumnsInfo = symbolQuantityMap.map((symbol) => ({
          headerName: symbol,
          field: symbol,
          width: 100,
        }));

        setSymbolColumns([
          ...columnPNL,
          // ...symbolColumnsInfo,
          ...TotalPNLAmount,
          {
            headerName: "Action",
            field: "action",
            width: 100,
            flex: 0.5,
            cellRenderer: (param) => (
              <Row
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconEye
                  height={20}
                  onClick={() => ExecuteBasketHandler(param.data)}
                  // onClick={() => handleExecuteBasket(param.data)}
                  width={20}
                  strokeWidth={1}
                  color={"#000"}
                  style={{ cursor: "pointer", marginLeft: "15px" }}
                />
              </Row>
            ),
          },
        ]);

        const ltpMap = resultLTP.reduce((acc, item) => {
          acc[item.scripcode] = item.ltp;
          return acc;
        }, {});
        const clientDataMap = {};

        basketOrders.forEach((item) => {
          const {
            client_id,
            scrip_code,
            product_type,
            symbol,
            quantity,
            buy_price,
          } = item;
          const ltp = ltpMap[scrip_code] || 0;

          if (!clientDataMap[client_id]) {
            clientDataMap[client_id] = {
              client_id,
              pnl: 0,
              product_type,
              investedAmount: 0,
              symbols: {},
            };
          }

          if (!clientDataMap[client_id].symbols[symbol]) {
            clientDataMap[client_id].symbols[symbol] = {
              quantity: 0,
              investedAmount: 0,
            };
          }
          clientDataMap[client_id].symbols[symbol].quantity += quantity;

          if (buy_price !== null) {
            clientDataMap[client_id].symbols[symbol].investedAmount +=
              buy_price * quantity;
            clientDataMap[client_id].investedAmount += buy_price * quantity;
          }

          if (ltp !== null && buy_price !== null) {
            clientDataMap[client_id].pnl +=
              quantity * ltp - buy_price * quantity;
          }
        });

        let sno = 1;
        const rowsData = Object.values(clientDataMap).map((client) => {
          const flattenedSymbols = Object.keys(client.symbols).reduce(
            (acc, symbol) => {
              acc[symbol] = client.symbols[symbol].quantity;
              return acc;
            },
            {}
          );

          return {
            ...flattenedSymbols,
            clientId: client.client_id,
            productType: client.product_type,
            sno: sno++,
            investedAmount:
              client.investedAmount === 0 || client.investedAmount === null
                ? "-"
                : parseInt(client.investedAmount),
            pnl: client.pnl === 0 || client.pnl === null ? "-" : client.pnl,
          };
        });

        setRowData(rowsData);
      } else {
        setSymbolColumns([...columnPNL]);
      }
    } catch (error) {
      console.error("Error fetching basket details:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getClientsIds();
    rowData();
  }, [basketId]);

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };
  const rowHeight = 36;
  const headerHeight = 36;

  return (
    <div>
      {dataStatus === "draft" ? (
        <EditaddStocks
          basketDetailsRef={basketDetailsRef}
          selectedSymbols={selectedSymbols}
          setSelectedSymbols={setSelectedSymbols}
          // basketflag={basketflag}
          setFlag={setFlag}
          symbolTable={symbolTable}
          setSymbolTable={setSymbolTable}
          symbolTableWithLTP={symbolTableWithLTP}
          setSymbolTableWithLTP={setSymbolTableWithLTP}
          setSymbolTableWithScripcode={setSymbolTableWithScripcode}
          symbolTableWithScripcode={symbolTableWithScripcode}
          setCurrentState={setCurrentState}
          PNLData={PNLData}
          Weightage={Weightage}
        />
      ) : (
        <>
          <FullPageLoader show={loading} />
          <Grid.Container gap={0} justify="left" style={{ marginTop: "30px" }} className="flex-row justify-center align-center">
            <Grid sm={40} md={12} lg={10}>
              <Card className="width-100 border-radius-8" css={{ height: "70vh", margin: "0 auto" }}>
                <Card.Header css={{ background: "#fff", height: "4rem" }}>
                  <Row>
                    <Col css={{ width: "fit-content", mt: "$8", ml: "$10" }}>
                      <img src="../images/basket-fill-blue.png" width={30} />
                    </Col>
                    <Spacer y={1} />
                    <Text className="primary-text-color" h3 css={{ mt: "$5" }}>
                      {basket_name}
                    </Text>
                    <Button
                      auto
                      flat
                      bordered
                      className="primary-button"
                      css={{
                        width: "60px",
                        color: "White",
                        float: "left",
                      }}
                      style={{
                        marginLeft: "auto",
                        border: "none",
                        borderRadius: "5px",
                        marginTop: "10px",
                      }}
                      onClick={() =>
                        previewBasket
                          ? setPreviewBasket(false)
                          : setCurrentState("list")
                      }
                    >
                      Back
                    </Button>
                  </Row>
                </Card.Header>
                <Card.Body>
                  {!previewBasket ? (
                    <div
                      className="ag-theme-balham basket4-table"
                      style={{
                        height: "70vh",
                        width: "auto",
                        marginLeft: "18px",
                        border: "none",
                        overflowX: "auto",
                      }}
                    >
                      <AgGridReact
                        headerHeight={headerHeight}
                        rowHeight={rowHeight}
                        columnDefs={symbolColumns}
                        rowData={RowData}
                        onGridReady={onGridReady}
                        defaultColDef={defaultColDef}
                        // domLayout='normal'
                        // suppressHorizontalScroll={false}
                        sizeColumnsToFit={true}
                      />
                    </div>
                  ) : (
                    <>
                      <FullPageLoader show={previewLoading} />
                      <PreviewExecuteBasket
                        previewBasketData={previewBasketData}
                      />
                    </>
                  )}
                </Card.Body>
              </Card>
            </Grid>
          </Grid.Container>
        </>
      )}
    </div>
  );
}
