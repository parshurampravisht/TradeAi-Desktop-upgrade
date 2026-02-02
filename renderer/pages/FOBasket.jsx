import React from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { useState, useEffect } from "react";
import Indicator from "../component/dashboard/indicators";
import EmptyStatus from "../component/basket/emptyBasket/emptyStatus";
import {
  getBaskets,
  getInstanceBasket,
} from "../../services/transactions/transactions.service";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import classes from "../component/options/BasketModel.module.css";
import { Card, Row, Button, Navbar } from "@nextui-org/react";
import AddStocks from "../component/basket/addStocks/addStocks";
import AddClient from "../component/basket/addClient/addClient";
import { useRef } from "react";
import { IconArrowBack } from "@tabler/icons-react";
import ProfitLossBasket from "../component/basket/P&L/profitLossbasket";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import InstanceBasket from "./InstanceBasket";
import FullPageLoader from "../component/common/FullPageLoader";
import { IconRefresh } from "@tabler/icons-react";
import CustomToolTip from "../layout/CustomToolTip";
import FoBasketBase from "../component/basket/P&L/FoBasketBase";
import AddBasket from "../component/basket/addBasket/Addbasket";
import IndicesIndicator from "./_IndicesIndicator";
const rowHeight = 29;
const headerHeight = 27;

export default function FOBasket() {
  const {
    shares,
    fnoBasketRowData,
    setFnoBasketRowData,
    InstanceData,
    setInstanceData,
  } = useGlobalContext();
  const [toggle, setToggle] = useState(false);
  const [currentState, setCurrentState] = useState("");
  const router = useRouter();
  const basketDetailsRef = useRef({});
  const addToggle = () => setToggle(true);
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [symbolTableWithScripcode, setSymbolTableWithScripcode] = useState([]);
  const [symbolTableWithLTP, setSymbolTableWithLTP] = useState([]);
  const [symbolTable, setSymbolTable] = useState([]);
  const [basketflag, setbasketFlag] = useState(false);
  const [tabBasket, setTabBasket] = useState(false);
  const [selectTab, setselectTabs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [instanceDataLoading, setInstanceDataLoading] = useState(false);

  const isInstanceProcessRef = useRef(false);

  const setFlag = (value) => {
    setbasketFlag(value);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const list = await getBaskets("futureAndOptions");
      if (list.length > 0) {
        setCurrentState("list");
        setFnoBasketRowData(list);
      } else {
        setCurrentState("empty");
      }
      setIsLoading(false);
    })();
  }, [basketflag]);

  const instanceBasketHandler = async () => {
    if (isInstanceProcessRef.current) return;
    isInstanceProcessRef.current = true;
    try {
      const res = await getInstanceBasket();
      setInstanceDataLoading(true);
      if (Array.isArray(res)) {
        setInstanceData(res || []);
      }
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {
      setInstanceDataLoading(false);
      isInstanceProcessRef.current = false;
    }, 1000);
  };


  const handleCashEquility = () => {
    router.push("/BasketOptions");
  };

  const getstateComp = (currentState) => {
    switch (currentState) {
      case "empty":
        return <EmptyStatus addToggle={addToggle} />;
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
                          background: "#F7F6F9",
                          borderColor: "$green600",
                          minWidth: "90px",
                          justifyContent: "center",
                          color: "#838383",
                          borderRadius: "0",
                          borderColor: "$accents3",
                        }}
                        className={tabBasket === false ? classes.buy : ""}
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

                      <Button
                        className={tabBasket === true ? classes.sell : ""}
                        auto
                        flat
                        bordered
                        borderWeight={"light"}
                        css={{
                          minWidth: "90px",
                          justifyContent: "center",
                          color: "#838383",
                          borderRadius: "0",
                          borderColor: "$accents3",
                        }}
                      >
                        <Navbar.Link
                          css={{
                            minWidth: "120px",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            setTabBasket(true);
                            setselectTabs(true);
                          }}
                          itemCss={{
                            fontWeight: "500",
                            fontSize: "1rem",
                          }}
                        >
                          Instances
                        </Navbar.Link>
                      </Button>
                    </Row>
                  </Navbar.Content>
                </Card.Body>
                <div className={`${classes.BOButtom} align-center`}>
                  {selectTab && !!InstanceData.length && (
                    <CustomToolTip
                      position={"top_center"}
                      toolTipText={`Reload Data`}
                    >
                      <div
                        style={{ marginRight: "10px" }}
                        className="flex-row align-center justify-center"
                      >
                        <IconRefresh
                          type="button"
                          height={20}
                          width={20}
                          color={"#000"}
                          strokeWidth={1}
                          cursor={"pointer"}
                          title="refresh"
                          onClick={() => {
                            instanceBasketHandler();
                          }}
                        />
                      </div>
                    </CustomToolTip>
                  )}
                  <Button
                    className="primary-button border-radius-8"
                    auto
                    flat
                    onClick={handleCashEquility}
                    css={{
                      width: "7rem",
                    }}
                  >
                    F&O Basket +
                  </Button>
                </div>
              </div>
              {selectTab === false ? (
                <FoBasketBase />
              ) : (
                <>
                  <FullPageLoader show={instanceDataLoading} />
                  <InstanceBasket
                    rowData={fnoBasketRowData}
                    headerHeight={headerHeight}
                    rowHeight={rowHeight}
                    selectTab={selectTab}
                    setTabBasket={setTabBasket}
                    setselectTabs={setselectTabs}
                  />
                </>
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
            setSymbolTableWithScripcode={setSymbolTableWithScripcode}
            symbolTableWithScripcode={symbolTableWithScripcode}
            basketflag={basketflag}
            setFlag={setFlag}
            symbolTable={symbolTable}
            setSymbolTable={setSymbolTable}
            setCurrentState={setCurrentState}
            symbolTableWithLTP={symbolTableWithLTP}
            setSymbolTableWithLTP={setSymbolTableWithLTP}
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
