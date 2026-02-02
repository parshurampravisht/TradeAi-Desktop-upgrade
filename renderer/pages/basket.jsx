import React from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { useState, useEffect } from "react";
import Indicator from "../component/dashboard/indicators";
import AddBasket from "../component/basket/addBasket/Addbasket";
import EmptyStatus from "../component/basket/emptyBasket/emptyStatus";
import {
  delBasket,
  getBaskets,
} from "../../services/transactions/transactions.service";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import classes from "../component/options/BasketModel.module.css";
import { Card, Row, Button, Navbar } from "@nextui-org/react";
import AddStocks from "../component/basket/addStocks/addStocks";
import AddClient from "../component/basket/addClient/addClient";
import { useRef } from "react";
import { IconEye, IconArrowBack, IconTrash } from "@tabler/icons-react";
import ProfitLossBasket from "../component/basket/P&L/profitLossbasket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import InstanceBasket from "./InstanceBasket";
import FullPageLoader from "../component/common/FullPageLoader";
import { statusHandler } from "../component/dashboard/dashboardTables/helpers";
import IndicesIndicator from "./_IndicesIndicator";

export default function Basket() {
  const { shares, currentState, setCurrentState } = useGlobalContext();
  const [toggle, setToggle] = useState(false);
  // const [currentState, setCurrentState] = useState("empty");
  const [basket, setBasket] = useState({});
  const router = useRouter();
  const basketDetailsRef = useRef({});
  const addToggle = () => setToggle(true);
  const [selectedSymbols, setSelectedSymbols] = useState([]);

  const [symbolTable, setSymbolTable] = useState([]);
  const [symbolTableWithScripcode, setSymbolTableWithScripcode] = useState([]); // symbols is with NSE code as well as BSE
  const [symbolTableWithLTP, setSymbolTableWithLTP] = useState([]);
  const [basketflag, setbasketFlag] = useState(false);
  const [tabBasket, setTabBasket] = useState(false);
  const [selectTab, setselectTabs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rowData, setrowData] = useState([]);

  const setFlag = (value) => {
    setbasketFlag(value);
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await getBaskets("cashAndEquity");
        if (list.length > 0) {
          setCurrentState("list");
          setrowData(list);
        } else {
          setCurrentState("empty");
        }
      } catch (error) {
        console.log("baskets error", error);
      }
      if (isLoading) setIsLoading(false);
    })();
  }, [basketflag]);

  useEffect(() => {
    if (currentState === "list") {
      (async () => {
        const list = await getBaskets("cashAndEquity");
        if (list.length > 0) {
          setrowData(list);
        }
      })();
    }
  }, [currentState]);

  const handleBasket = (param) => {
    setCurrentState("profitandloss");
    setBasket(param);
  };

  const handleDelBasket = async (param) => {
    try {
      await delBasket(param.name);
      setrowData((prev) => prev.filter((item) => item.id !== param?.id));
      toast.success("deleted !!");
    } catch (error) {
      console.log("error delete basket", error);
    }
  };

  const rowHeight = 29;
  const headerHeight = 27;

  const getstateComp = (currentState) => {
    switch (currentState) {
      case "empty":
        return <EmptyStatus addToggle={addToggle} />;
      case "profitandloss":
        return (
          <>
            <ProfitLossBasket
              basketId={basket.id}
              basket_name={basket.name}
              basketStatus={basket.status}
              setCurrentState={setCurrentState}
              symbolTableWithLTP={symbolTableWithLTP}
              setSymbolTableWithLTP={setSymbolTableWithLTP}
              basketDetailsRef={basketDetailsRef}
              symbolTableWithScripcode={symbolTableWithScripcode}
              setSymbolTableWithScripcode={setSymbolTableWithScripcode}
              symbolTable={symbolTable}
              setSymbolTable={setSymbolTable}
              selectedSymbols={selectedSymbols}
              setSelectedSymbols={setSelectedSymbols}
              setFlag={setFlag}
            />
          </>
        );
      case "list":
        return (
          <>
            <div className="basket1-wrap">
              <div style={{ width: "100%", display: "flex" }}>
                <Card.Body>
                  <Navbar.Content variant={"highlight-solid"}>
                    <Row
                      css={{
                        width: "16.8rem",
                        marginLeft: "3rem",
                        marginBottom: "-17px",
                      }}
                    >
                      <Button
                        bordered
                        borderWeight={"light"}
                        auto
                        flat
                        css={{
                          minWidth: "90px",
                          justifyContent: "center",
                        }}
                        className={`${tabBasket === false ? classes.buy : ""
                          } primary-button`}
                      >
                        <Navbar.Link
                          css={{
                            minWidth: "120px",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            setTabBasket(false);
                            setselectTabs(false);
                          }}
                          variant="highlight-solid"
                          itemCss={{
                            fontWeight: "500",
                            fontSize: "1rem",
                          }}
                        >
                          Basket
                        </Navbar.Link>
                      </Button>
                    </Row>
                  </Navbar.Content>
                </Card.Body>
                <div className={classes.BOButtom}>
                  <Button
                    className="primary-button border-radius-8"
                    auto
                    flat
                    onPress={() => setToggle(true)}
                    css={{
                      width: "7rem",
                    }}
                  >
                    Equity Basket +
                  </Button>
                </div>
              </div>
              {selectTab === false ? (
                <div
                  className="ag-theme-balham basket1-table"
                  style={{ height: "55vh" }}
                >
                  <AgGridReact
                    headerHeight={headerHeight}
                    rowHeight={rowHeight}
                    rowData={rowData}
                    columnDefs={[
                      { field: "id", headerName: "Id", flex: 0.5 },
                      { field: "name", flex: 1.5 },
                      {
                        field: "used_margin",
                        headerName: "Invested (%)",
                        cellRenderer: (params) => {
                          return (
                            <>
                              {params.data?.used_margin
                                ? params.data?.used_margin
                                : "-"}
                            </>
                          );
                        },
                        flex: 1,
                      },

                      {
                        field: "basket_type",
                        headerName: "Basket Type",
                        cellRenderer: (param) => {
                          return (
                            <span
                              style={{
                                color:
                                  param.data?.basket_type === "BUY"
                                    ? "green"
                                    : "red",
                              }}
                            >
                              {param.data?.basket_type}
                            </span>
                          );
                        },
                        flex: 1,
                      },
                      {
                        field: "weightage_type",
                        headerName: "Weightage Type",
                        flex: 1,
                      },

                      // {
                      //   field: "modified_by",
                      //   headerName: "Modified By",
                      //   flex: 1,
                      // },
                      // {
                      //   field: "created_by",
                      //   headerName: "Created By",
                      //   flex: 1,
                      // },
                      {
                        field: "status",
                        headerName: "Status",
                        cellRenderer: statusHandler,
                        flex: 1,
                      },
                      {
                        field: "action",
                        flex: 1,
                        cellRenderer: (param) => (
                          <Row
                            style={{
                              display: "flex",
                              justifyContent: "flex-start",
                            }}
                          >
                            {
                              <IconEye
                                height={20}
                                width={20}
                                strokeWidth={1}
                                color={"#000"}
                                onClick={() => handleBasket(param.data)}
                                style={{ cursor: "pointer" }}
                              />
                            }
                            <IconTrash
                              height={20}
                              width={20}
                              strokeWidth={1}
                              color={"#000"}
                              onClick={() => handleDelBasket(param.data)}
                              style={{ cursor: "pointer" }}
                            />
                          </Row>
                        ),
                      },
                    ]}
                  ></AgGridReact>
                </div>
              ) : (
                <InstanceBasket
                  rowData={rowData}
                  headerHeight={headerHeight}
                  rowHeight={rowHeight}
                  selectTab={selectTab}
                />
              )}
            </div>
          </>
        );
      case "addStocks":
        return (
          <AddStocks
            basketDetailsRef={basketDetailsRef}
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            basketflag={basketflag}
            setFlag={setFlag}
            symbolTable={symbolTable}
            setSymbolTable={setSymbolTable}
            symbolTableWithScripcode={symbolTableWithScripcode}
            setSymbolTableWithScripcode={setSymbolTableWithScripcode}
            symbolTableWithLTP={symbolTableWithLTP}
            setSymbolTableWithLTP={setSymbolTableWithLTP}
            setCurrentState={setCurrentState}
            rowData={rowData}
          />
        );
      case "addClient":
        return (
          <AddClient
            basketDetailsRef={basketDetailsRef}
            setFlag={setFlag}
            basketflag={basketflag}
            selectedSymbols={selectedSymbols}
            setCurrentState={setCurrentState}
            setSelectedSymbols={setSelectedSymbols}
            setSymbolTable={setSymbolTable}
            symbolTableWithScripcode={symbolTableWithScripcode}
            setSymbolTableWithScripcode={setSymbolTableWithScripcode}
            symbolTableWithLTP={symbolTableWithLTP}
            setSymbolTableWithLTP={setSymbolTableWithLTP}
          />
        );
      default:
        return <FullPageLoader show={isLoading} />;
    }
  };

  return (

    <IndicesIndicator>
      <div
        style={{
          maxHeight: "100vh",
          height: "calc(100vh - 70px)",
          background: "#F99F9",
        }}
      >
        <AddBasket
          toggle={toggle}
          setToggle={setToggle}
          basketDetailsRef={basketDetailsRef}
          setCurrentState={setCurrentState}
          setSymbolTable={setSymbolTable}
          setSelectedSymbols={setSelectedSymbols}
        />
        <div style={{ margin: "0px 10px" }}>{getstateComp(currentState)}</div>
      </div>
    </IndicesIndicator>
  );
}
