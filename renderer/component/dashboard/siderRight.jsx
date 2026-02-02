import {
  Container,
  Row,
  Text,
  Col,
  Spacer,
  Button,
  Navbar,
  Image,
  Grid,
  Card,
  Dropdown,
  Link,
} from "@nextui-org/react";
import NormalWatchlist from "./watchlist/normalWatchlist";
import { useRouter } from "next/router";
import { useState, useEffect, memo } from "react";

import WatchListHeader from "./watchlist/crudWatchlist/createDeleteWatchlist";
import PlaceOrder from "./watchlist/order/orderComponents/placeOrderModal";
import { useGlobalContext } from "../../context/GlobalContext";
import PlaceOrderModal from "./watchlist/order/orderComponents/orderStatusModal";
import StepOrderPlaceModal from "./watchlist/order/orderComponents/stepOrderPlaceModal";
import AgGridwatchlist from "./watchlist/crudWatchlist/agGridwatchlist";
import { findIndex } from "lodash/fp";
import electron from "electron";

const ipcRenderer = electron.ipcRenderer || false;
import Sidebar from "react-sidebar";

function SiderRight(props) {
  const {
    watchlistSelectedValue,
    watchlists,
    setWatchlists,
    watchlistSymbols,
    selectedWatchlist,
    setSelectedWatchlist,
    loadSymbols,
    setLoadSymbols,
    reqShares,
    setReqShares,
    apiBody,
    setSelectedSymbol,
    setStepOrderVisible,
    setSingleLtp,
    setSymbolApi,
    placeOrderVisible,
    setPlaceOrderVisible,
    shares,
  } = useGlobalContext();

  const [successClient, setSuccessClients] = useState([]); //array of clients whose order was requested successfully from place Order screen
  const [failClient, setFailClients] = useState([]); //array of clients whose order request was unsuccessful
  const [orderReqStatusMessage, setOrderReqStatusMessage] = useState("");
  const [orderStat, setOrderStat] = useState(false); //shows order status of place order api
  const [orderStatVisible, setOrderStatVisible] = useState(false); //modal for showing order status after placing the order
  const router = useRouter();
  const [buySell, setBuySell] = useState(true);

  useEffect(() => {
    ipcRenderer.on("shortcut_keys", (event, data) => {
      if (data === "F2") {
        setBuySell(false);
        apiBody.current = {
          ...apiBody.current,
          BuySell: "S",
        };
        setPlaceOrderVisible(true);
      } else if (data === "F1") {
        setBuySell(true);
        apiBody.current = { ...apiBody.current, BuySell: "B" };
        setPlaceOrderVisible(true);
        router.push("/cash&equity");
      }
    });
  }, []);

  return (
    <>
      <Sidebar
        sidebar={
          <>
            <div style={{ height: "calc(100vh - 650px)" }}>
              <Row css={{ minHeight: "36rem" }}>
                <Card
                  variant="bordered"
                  css={{
                    maxHeight: "100%",
                    borderColor: "transparent",
                    "@media (max-width: 1920px)": {
                      maxHeight: "95%",
                    },
                    "@media (min-width: 1360px)": {
                      height: "95%",
                    },
                    "@media (min-width: 768px)": {
                      height: "95%",
                    },
                  }}
                >
                  <Card.Header>
                    {" "}
                    <Row
                      justify="space-evenly"
                      css={{ pt: "$5", pl: "$0", pr: "$0", m: "$0" }}
                    >
                      <Link
                        auto
                        flat
                        onClick={() => props?.setCollapsed(!props?.collapsed)}
                      >
                        <img src="../images/arrow.svg" width={35} />
                      </Link>
                      <WatchListHeader
                        watchlistSymbols={watchlistSymbols}
                        setSelectedWatchlist={setSelectedWatchlist}
                      ></WatchListHeader>
                    </Row>
                  </Card.Header>
                  <Card.Body css={{ p: "$1", overflow: "hidden" }}>
                    <Row justify="center" align="center"></Row>
                    {/* row for sider content */}
                    <Spacer y={0.1} />
                    <Row justify="center" align="center">
                      <Col
                        css={{
                          width: "100%",
                          paddingLeft: " 10px",
                          paddingRight: "10px",
                        }}
                      >
                        <AgGridwatchlist
                          shares={reqShares}
                          setStepOrderVisible={setStepOrderVisible}
                          setBuySell={setBuySell}
                          apiBody={apiBody}
                          setSelectedSymbol={setSelectedSymbol}
                          setSingleLtp={setSingleLtp}
                          watchlists={watchlists}
                          setWatchlists={setWatchlists}
                          selectedWatchlist={selectedWatchlist}
                          setSelectedWatchlist={setSelectedWatchlist}
                          loadSymbols={loadSymbols}
                          setLoadSymbols={setLoadSymbols}
                          watchlistSelectedValue={watchlistSelectedValue}
                          watchlistSymbols={watchlistSymbols}
                          setSymbolApi={setSymbolApi}
                          setPlaceOrderVisible={setPlaceOrderVisible}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                  {/* <Card.Footer></Card.Footer> */}
                </Card>
              </Row>
            </div>
          </>
        }
        open={props.collapsed}
        // onSetOpen={onSetSidebarOpen}
        sidebarClassName="custom-right-sidebar-class" // Custom class for sidebar styles (optional)
        overlayClassName="custom-overlay-class" // Custom class for overlay styles (optional)
        styles={{
          sidebar: {
            background: "white",
            width: "450px",
            zIndex: 1000,
            boxShadow: "rgba(0, 0, 0, 0.15) -2px 2px 4px;",
            height: "71.8%",
            overflowY: "hidden",
            borderRadius: "15px 0px 0px 15px",
            position: "fixed",
            top: "20%",
            right: "0px",
          },
          overlay: {
            display: "none", // Hide the overlay when sidebar is open
          },
        }}
      ></Sidebar>

      {/* <PlaceOrder
        placeOrderVisible={placeOrderVisible}
        setPlaceOrderVisible={setPlaceOrderVisible}
        buySell={buySell}
        setBuySell={setBuySell}
        // shares={shares}
        apiBody={apiBody}
        setOrderStatVisible={setOrderStatVisible}
        setOrderStat={setOrderStat}
        setSuccessClients={setSuccessClients}
        setFailClients={setFailClients}
        setOrderReqStatusMessage={setOrderReqStatusMessage}
        loadSymbols={loadSymbols}
      /> */}
      <PlaceOrderModal
        orderStat={orderStat}
        orderStatVisible={orderStatVisible}
        setOrderStatVisible={setOrderStatVisible}
        successClient={successClient}
        failClient={failClient}
        orderReqStatusMessage={orderReqStatusMessage}
      />
      <StepOrderPlaceModal
        setPlaceOrderVisible={setPlaceOrderVisible}
        apiBody={apiBody}
      />
    </>
  );
}

export default memo(SiderRight);
