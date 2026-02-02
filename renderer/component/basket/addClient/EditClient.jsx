import {
  Card,
  Grid,
  Row,
  Col,
  Text,
  Image,
  Spacer,
  Button,
  Navbar,
} from "@nextui-org/react";
import { IconPlus } from "@tabler/icons-react";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useGlobalContext } from "../../../context/GlobalContext";
import Multiselect from "multiselect-react-dropdown";
import { AgGridReact } from "ag-grid-react";
import ExecuteModal from "../executeModel";
import ExitModal from "../exitModal/exitModal";
import PrevBasket from "../prevBasket/prevBasket";
import { columns } from "./clientColumns";
import { useFinalData } from "../../../context/finalBasketContext";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import {
  CEBasketDraftHandler,
  OrderBasket,
} from "../../../../services/transactions/transactions.service";
import { ExchangeSquareOff } from "../../../constant/constant";
import { currencyFormatter } from "../../../helpers";
import { getTabledata } from "../../../APIS/TTapis";

const EditClient = (props) => {
  const {
    switch_GpCl,
    setswitch_GpCl,
    clients,
    getClientsIds,
    selectedGroup,
    setSelectedGroup,
    selectedValueGroup,
    group_Clients,
    apiBody,
    singleLtp,
    setCurrentState,
    currentState,
    symbolDropdown,
    clientsData,
    getClientsInvestedMargin,
    equityBasketType,
    setEquityBasketType,
    clientIds,
    holdingsData,
    setHoldingsData,
  } = useGlobalContext();
  const [isExecute, setisExecute] = useState(false);
  const [investedMarginClientsData, setInvestedMarginClientsData] = useState(
    []
  );

  let clientData;
  props?.PNLData.forEach((order) => {
    clientData = order.client_id;
  });

  const { symbolTableWithLTP } = props;
  const clientData1 = props?.PNLData.map((order) => order.client_id);

  const draftSelectedClients = useMemo(() => {
    return clientsData
      .filter((item) => clientData1.includes(item.clientId))
      .map((client) => ({
        value: client.clientId, // Save clientId as the value
        label: `${client.clientName
          ? `${client.clientId} (${client.clientName})`
          : `${client.clientId}`
          }`, // Display clientId (clientName)
      }));
  }, [clientsData, selectedClientsWithIds]);

  const { updateFinalData, finalData, deleteBasketData } = useFinalData();
  const [selectedClients, setSelectedClients] = useState(
    draftSelectedClients || []
  ); //state for selected clients from multiselect dropdown
  //to check validity for placing order
  const [selectedClientsWithIds, setSelectedClientsWithIds] = useState(
    clientData1 || []
  );

  const [rowData, setRowData] = useState([]);
  //   const clientDetails = {broker:selectedClients}
  const [columnData, setColumnData] = useState([]);
  const [exit, setExit] = useState(false);
  const [isfinalData, setFinalData] = useState({});
  const symbolPrice = useRef({});
  const [basketType, setBasketType] = useState("");
  let clickedColumn = null;

  //initializing clientIds
  useEffect(() => {
    getClientsIds();
    //setting price value , it will be fetched from socket later
    // props.selectedSymbols.forEach((sym)=>{
    //   symbolPrice[sym] = 100;
    // })
    (async () => {
      const result = await getClientsInvestedMargin();
      setInvestedMarginClientsData(result);
    })();
  }, []);

  const clientsOptionsData = useMemo(() => {
    return (
      selectedClientsWithIds && selectedClientsWithIds.length
        ? clientsData.filter(
          (item) => !selectedClientsWithIds.includes(item.clientId)
        )
        : clientsData
    ).map((client) => ({
      value: client.clientId, // Save clientId as the value
      label: `${client.clientName
        ? `${client.clientId} (${client.clientName})`
        : `${client.clientId}`
        }`, // Display clientId (clientName)
    }));
  }, [clientsData, selectedClientsWithIds]);

  //setting dynamic columns with symbols
  useEffect(() => {
    let type = props.basketDetailsRef.current.type === "Custom" ? true : false;
    const tempCol = [];
    props.selectedSymbols.forEach((item, index) => {
      symbolPrice.current[item.label] = 100;

      tempCol.push({
        headerName: `${item.label} (Qty.)`,
        field: item.label,
        editable: true,
        width: 130,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      });
    });
    setColumnData([...columns, ...tempCol]);
  }, [props.selectedSymbols]);

  //on hanlding and mapping client details
  const prepareRowData = (clientsList = []) => {
    // const mergedClient = clientsList
    //   ? [...new Set([...selectedClients, ...clientsList])]
    //   : [...selectedClients];

    const mergedClient = clientsList
      ? [...new Set([...selectedClientsWithIds, ...clientsList])]
      : [...selectedClientsWithIds];

    let data = [];

    mergedClient?.forEach((cl) => {
      let tempRowBody = {};
      const matchclientsData = investedMarginClientsData.find(
        (item) => item.client_code === cl
      );
      tempRowBody["cashAvailable"] = clients.current.data[cl]?.["CashMargin"]
        ? currencyFormatter(clients.current.data[cl]?.["CashMargin"])
        : "-";
      tempRowBody["investedMargin"] =
        matchclientsData?.invested_price_sum &&
          matchclientsData?.invested_price_sum !== "NA"
          ? currencyFormatter(matchclientsData?.invested_price_sum)
          : "-";
      tempRowBody["broker"] = clients?.current?.data[cl]?.["Broker"];
      tempRowBody["client"] = cl;
      tempRowBody["margin"] =
        clients.current.data[cl]?.["CashMargin"] *
        (props?.Weightage?.used_margin / 100);

      const adjustmentFactor = props.basketDetailsRef.current["value"] / 100;

      let marginBalanceValue = Math.floor(tempRowBody["margin"]);

      props.selectedSymbols.map((symbol) => {
        let filterHoldingsData = [];
        if (equityBasketType === "SELL") {
          filterHoldingsData = holdingsData.find(
            (item) =>
              item?.ClientID === cl && +item?.scrip === +symbol?.Scripcode
          );
        }
        const matchObj = symbolTableWithLTP.find(
          (obj) => obj.label === symbol.label
        );
        tempRowBody[symbol.label] =
          equityBasketType === "SELL"
            ? filterHoldingsData?.Quantity
              ? +filterHoldingsData?.Quantity
              : "-"
            : Math.floor(
              (tempRowBody["margin"] * adjustmentFactor) / matchObj?.ltp || 0
            );

        const usageMargin = Math.floor(marginBalanceValue * adjustmentFactor);
        const restMargin = marginBalanceValue - usageMargin;

        tempRowBody[`${symbol.label}_color`] =
          (restMargin < 0 || tempRowBody[symbol.label] === 0) &&
            equityBasketType === "SELL"
            ? "red"
            : "black";

        marginBalanceValue = restMargin;
      });
      if (switch_GpCl === "client") {
        const clientvalues = Object?.values(group_Clients);
        clientvalues.forEach((item) => {
          tempRowBody["group"] = group_Clients[item];
        });
      } else if (switch_GpCl === "group") {
        tempRowBody["group"] = selectedGroup;
      } else {
        tempRowBody["group"] = "default";
      }
      data.push(tempRowBody);
    });

    return data;
  };

  const handleClientDetails = (selectedValuesIds) => {
    let data = [];

    if (switch_GpCl === "client") {
      // data = prepareRowData(clients.current.selectedClients);
      data = prepareRowData(selectedValuesIds);
    } else if (switch_GpCl === "group") {
      data = prepareRowData(group_Clients[selectedValueGroup]);
    }

    setRowData(data);
    // setSelectedClients([]);
    clients.current["selectedClients"] = [];
  };

  useEffect(() => {
    handleClientDetails(selectedClientsWithIds);
  }, [investedMarginClientsData]);

  const removeFromTable = (selectedValuesIds) => {
    let data = [];

    if (switch_GpCl === "client") {
      // data = prepareRowData(combinedClientData);
      // const selectedValuesIds = items.map(item => (typeof item === 'string' ? item : item.value));
      // setSelectedClients(selectedClientsWithIds)
      data = prepareRowData(selectedValuesIds);
    } else if (switch_GpCl === "group") {
      data = prepareRowData(group_Clients[selectedValueGroup]);
    }
    setRowData(data);
  };

  const gridApiRef = useRef(null);

  const isDisabledNextButton = useMemo(() => {
    //  switch_GpCl === "client" ? 
    return rowData.length === 0
    // : selectedGroup.length === 0;
  }, [rowData, switch_GpCl]);


  const prepareDataForJson = async (flag, updatedData) => {
    // props?.EditclientValue(true);
    // setCurrentState("empty");
    setBasketType(flag);
    const selectedRows = gridApiRef?.current?.getSelectedRows(); // Get selected rows
    const basketData = {
      basket_status: flag,
      orders: {},
    };

    let symbolData = symbolDropdown.NSE;

    rowData.forEach((row) => {
      const basketId = `${props.basketDetailsRef.current.name}_${Date.now()}`; // Unique identifier

      const clientKey = row.client;
      if (!basketData.orders[clientKey]) {
        basketData.orders[clientKey] = [];
      }

      const weightage = {};
      let scriptcode = null;
      props.selectedSymbols.forEach((symbol) => {
        weightage[symbol.label] = {
          quantity: row[symbol.label],
          Scripcode: symbol.Scripcode,
          exch: symbol.Exch,
        };

        // for (let i = 0; i < symbolData.length; i++) {
        //   if (symbolData[i].label === symbol.label) {
        //     weightage[symbol].scriptcode = symbolData[i].Scripcode;
        //     scriptcode = symbolData[i].Scripcode; // Set scriptcode for later use
        //   }
        // }
      });

      const symbolOrders = Object.entries(weightage).map(([symbol, data]) => {
        const exeData = updatedData?.filter(
          ({ Symbol }) => Symbol === symbol
        )[0];

        const symbolWithLtp = symbolTableWithLTP.find(
          (item) => item.scripcode === data.Scripcode
        );

        const exch = data.exch || exeData?.Exchange || "NSE";
        const exchangeFormat = ExchangeSquareOff[exch] || exch;

        return {
          OrderSide: equityBasketType,
          Symbol: symbol,
          Quantity: data.quantity,
          LimitPrice: exeData?.LimitPrice || 0, // Replace with the actual limit price logic
          SLTriggerPrice: exeData?.SLTriggerPrice || 0,
          Exchange: exchangeFormat,
          LotSize: 1, // Replace with the actual lot size logic
          Scripcode: data.Scripcode || exeData?.Scripcode, // Use scriptcode from weightage
          ProductType: exeData?.ProductType || "NRML",
          LTP: symbolWithLtp ? symbolWithLtp.ltp : 0,
          BuyPrice: symbolWithLtp ? symbolWithLtp.ltp : 0,
          OrderType: exeData?.OrderType || "MARKET",
          OverNightSL: "OFF",
        };
      });

      if (symbolOrders.length > 0) {
        basketData.orders[clientKey].push(...symbolOrders);
      }
    });

    // Rest of the function remains the same
    setFinalData(basketData);
    updateFinalData(basketData);
    try {
      let res = await CEBasketDraftHandler(props?.Weightage?.id, basketData);
      if (res.err) {
        alert(res.err);
      } else {
        setExit(true);
      }
    } catch (error) { }
    setEquityBasketType("BUY");
    props.setFlag(true);
  };

  const executeData = (data) => {
    prepareDataForJson("executed", data);
  };
  const rowHeight = 36;
  const headerHeight = 36;

  const handleRowClick = (params) => {
    // setLTPData(params.data);
    let columnClicked = null;
    let selectedSym = null;
    // isLastBid.current = true;
    if (clickedColumn) {
      columnClicked = clickedColumn.getColDef().field;
      clickedColumn = null;
    }
  };
  const handleMouseDown = (event) => {
    const element = event?.event?.target;

    if (element && element.closest(".ag-cell")) {
      const cellElement = element.closest(".ag-cell");
      const colId = cellElement.getAttribute("col-id");
      clickedColumn = event.columnApi.getColumn(colId);
    }
  };

  // Event handler for cell value changes
  const handleCellValueChange = (event) => {
    const { data, colDef, newValue } = event;

    // Example: Update the local row data state (optional)
    setRowData((prev) =>
      prev.map((row, ind) =>
        ind === event.rowIndex ? { ...row, [colDef?.field]: newValue } : row
      )
    );
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseDown]);

  const handlerCloseDraft = () => {
    props?.EditclientValue(true);
  };

  const OptionsColumns = () => {
    // Dynamic columns based on selected symbols
    const dynamicColumns = props.selectedSymbols.map((symbol) => ({
      headerName: `${symbol.label} (Qty.)`,
      field: symbol.label,
      editable: true,
      width: 130,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        const color = params.data?.[`${symbol.label}_color`] || "black";
        return <span style={{ color: color }}>{params.value}</span>;
      },
    }));
    return [...columns, ...dynamicColumns];
  };

  useEffect(() => {
    if (equityBasketType !== "SELL" || !props.selectedSymbols?.length) return;

    (async () => {
      const [cols, tableBody] = await getTabledata("holdings", clientIds);

      setHoldingsData(tableBody || []);
    })();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <Grid.Container gap={0} justify="center">
        <Grid sm={24} md={20} lg={10} className="basket3-wrap">
          <Card
            className="basket3-main"
            // css={{
            //   height: "65vh",
            //   "@media(min-width: 1367px)": {
            //     width: "100%",
            //     height: "70vh",
            //   },
            // }}
            css={{
              height: "",
              width: "85%",
              margin: "0 auto",
              "@media(min-width:1367px)": {
                width: "100%",
                height: "70vh",
              },
            }}
          >
            <Card.Header
              css={{
                background: "#fff",
                // background: "#E5F2FF",
                height: "4rem",
              }}
            >
              <Row>
                <Col css={{ width: "fit-content", ml: "$10" }}>
                  <div style={{ display: "flex" }}>
                    <div>
                      <Image
                        src="../../../images/basket-fill-blue.png"
                        width={30}
                      />
                    </div>
                    {/* <div
                      style={{
                        width: "9rem",
                        marginLeft: "10px",
                        marginTop: "5px",
                      }}
                    >
                      {props?.Weightage?.name}
                    </div> */}
                  </div>
                </Col>

                <Spacer y={1} />
                <Col css={{ mt: "$3" }} className="basket3-content">
                  <Text h3 css={{ color: "$blue500", mt: "$0" }}>
                    {props.basketDetailsRef.current.name}
                  </Text>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body
              style={{
                overflowX: "hidden",
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
            >
              <Row justify="space-between">
                <Navbar.Content variant={"highlight"}>
                  <Row justify="center" align="center" css={{ pb: "$3" }}>
                    <div className="basket3-button">
                      <Navbar.Link
                        isActive={switch_GpCl == "client"}
                        onPress={() => setswitch_GpCl("client")}
                      >
                        Clients
                      </Navbar.Link>
                      <div className="groupbt">
                        <Navbar.Link
                          isActive={switch_GpCl == "group"}
                          onPress={() => setswitch_GpCl("group")}
                        >
                          Groups
                        </Navbar.Link>
                      </div>
                    </div>
                  </Row>
                </Navbar.Content>
              </Row>

              {switch_GpCl === "client" ? (
                <div
                  className="order_select_clients"
                  style={{ marginTop: "4px" }}
                >
                  <Row css={{ display: "flex" }}>
                    <Col
                      colspan={2}
                      className="order_select_clients2 basket3-input basket3-input-equity-basket"
                    >
                      <Multiselect
                        className="input"
                        isObject={true}
                        onKeyPressFn={function noRefCheck() { }}
                        onRemove={(item) => {
                          //item contains all the selected values till now
                          //using spread operator to add array into the object
                          const selectedValuesIds = item.map(
                            (item) => item.value
                          );
                          clients.current["selectedClients"] =
                            selectedValuesIds;
                          setSelectedClientsWithIds(selectedValuesIds);
                          setSelectedClients(item);
                          removeFromTable(selectedValuesIds);
                        }}
                        onSearch={function noRefCheck() { }}
                        selectedValues={selectedClients}
                        onSelect={(item) => {
                          //item contains all the selected values till now
                          //using spread operator to add array into the object
                          const selectedValuesIds = item.map(
                            (item) => item.value
                          );
                          clients.current["selectedClients"] =
                            selectedValuesIds;

                          setSelectedClientsWithIds(selectedValuesIds);
                          setSelectedClients(item);
                          handleClientDetails(selectedValuesIds);
                        }}
                        //replace this with list of available symbols api
                        options={clientsOptionsData}
                        // options={clients.current["clients"]}
                        placeholder="Select clients"
                        displayValue="label"
                        selectedValueDecorator={(selected, _options) => {
                          return _options?.value;
                        }}
                      ></Multiselect>
                    </Col>
                    <Spacer x={1} />
                    <Col
                      css={{ pr: "$10", display: "noe" }}
                      className="basket3-btadd"
                    >
                      {/* <Button
                          auto
                          flat
                          css={{ background: "$blue700", width: "10rem" }}
                          
                          onPress={() => {                          
                            handleClientDetails();
                            setSelectedClients([]);
                            clients.current["selectedClients"] = [];
                          }}
                          icon={
                            <IconPlus
                              type="button"
                              height={32}
                              width={32}
                              color={"#fff"}
                              strokeWidth={2}
                            />
                          }
                        ></Button> */}
                    </Col>
                  </Row>
                </div>
              ) : (
                <div
                  className="groupDropDown"
                  style={{ marginLeft: "20px", marginTop: "4px" }}
                >
                  <Row style={{ width: "95%" }}>
                    <Multiselect
                      isObject={false}
                      onKeyPressFn={function noRefCheck() { }}
                      onRemove={function noRefCheck() { }}
                      onSearch={function noRefCheck() { }}
                      selectedValues={selectedGroup}
                      singleSelect={true}
                      onSelect={(item) => {
                        //item contains all the selected values till now

                        setSelectedGroup(item);
                      }}
                      //replace this with list of available symbols api
                      options={Object.keys(group_Clients)}
                      placeholder="Select Group"
                    ></Multiselect>
                    <Col css={{ ml: "$5" }}>
                      <Button
                        auto
                        color="primary"
                        onPress={() => {
                          handleClientDetails();
                        }}
                        icon={
                          <IconPlus
                            type="button"
                            height={25}
                            width={25}
                            color={"#fff"}
                            strokeWidth={2}
                          />
                        }
                      ></Button>
                    </Col>
                  </Row>
                </div>
              )}

              <Spacer y={1} />
              <div
                className="ag-theme-balham basket3-table client-table-rows"
                style={{ height: "32vh", width: "100%" }}
              // onClick={handleMouseDown}
              >
                <AgGridReact
                  headerHeight={headerHeight}
                  rowHeight={rowHeight}
                  // columnDefs={columnData}
                  rowData={rowData}
                  columnDefs={OptionsColumns()}
                  rowSelection="multiple"
                  onGridReady={(params) => {
                    gridApiRef.current = params.api;
                  }}
                  onRowClicked={handleRowClick}
                  onCellMouseDown={handleMouseDown}
                  onCellValueChanged={handleCellValueChange}
                />
                {/* <Row css={{ paddingLeft: "$10", paddingRight: "$10" }}>
                  <ClientTable
                    selectedSymbols={props.selectedSymbols}
                    basketDetailsRef={props.basketDetailsRef}
                    symbolTable={props.symbolTable}
                  />
                </Row> */}
              </div>
            </Card.Body>
          </Card>
          <Card.Footer
            className="basket2-f-button"
            css={{
              width: "85%",
              "@media(min-width:1920px)": {
                width: "100%",
              },
            }}
          >
            <Row
            // css={{
            //   width: "86%",
            //   margin: "0 auto",
            //   "@media(min-width: 1367px)": {
            //     width: "100%",
            //     // height: "70vh",
            //   },
            // }}
            // className="basket3-footer-bt"
            >
              <Col
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  className={`secondary-button border-radius-8`}
                  flat
                  auto
                  bordered
                  css={{ width: "120px" }}
                  onClick={() => {
                    // props.setCurrentState("addStocks");
                    // props.setSelectedSymbols([]);
                    // props.setSymbolTable([]);
                    // deleteBasketData(); //setting the symbol table to be empty while closing
                    // props.setFlag(true);
                    handlerCloseDraft();
                  }}
                >
                  Back
                </Button>
              </Col>
              <Col>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Row style={{ width: "fit-content", marginRight: "10px" }}>
                    <Button
                      className={`secondary-button border-radius-8`}
                      auto
                      flat
                      bordered
                      css={{
                        width: "140px",
                        cursor: isDisabledNextButton ? "not-allowed" : "pointer",
                        opacity: isDisabledNextButton ? 0.6 : 1,
                      }}
                      onClick={() => {
                        if (isDisabledNextButton) {
                          toast.warn("Please add clients to proceed");
                          return;
                        }
                        prepareDataForJson("draft");
                      }}
                    >
                      Update
                    </Button>
                  </Row>
                  <Button
                    className={`${isDisabledNextButton ? "disable-button" : "primary-button"} border-radius-8 basket3-footer-blue`}
                    auto
                    flat
                    bordered
                    css={{
                      width: "140px",
                      cursor: isDisabledNextButton ? "not-allowed" : "pointer",
                      opacity: isDisabledNextButton ? 0.6 : 1,
                    }}
                    onClick={() => {
                      if (isDisabledNextButton) {
                        toast.warn("Please add clients to proceed");
                        return;
                      }
                      setisExecute(true);
                    }}
                  >
                    Edit Execute order
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Footer>
          <ExitModal
            basketType={basketType}
            toggle={exit}
            setCurrentState={(param) => {
              setCurrentState(param);
            }}
            setToggle={setExit}
          />
          <ExecuteModal
            basketType={basketType}
            toggle={isExecute}
            selectedSymbols={props.selectedSymbols || []}
            symbolTableWithScripcode={props.symbolTableWithScripcode}
            setToggle={setisExecute}
            executeData={executeData}
          />
        </Grid>
      </Grid.Container>
    </div>
  );
};
export default EditClient;
