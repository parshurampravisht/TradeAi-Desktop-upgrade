import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { Container, Row, Grid } from "@nextui-org/react";
import Indicator from "../component/dashboard/indicators";
import SiderLeft from "../component/dashboard/siderLeft";
import SiderRight from "../component/dashboard/siderRight";
import { getTabledata } from "../APIS/TTapis";
import MainView from "../component/mainView/mainView";
import RiskModal from "../component/auth/login/Modal";
import { useGlobalContext } from "../context/GlobalContext";
import TopRightNavigationButton from "../component/common/TopRightNavigationButton";
import IndicesIndicator from "./_IndicesIndicator";
function Dashboard(props) {
  const [showModal, setShowModal] = useState(false); // showing risk modal
  const [showtable, setshowtable] = useState("orderbook"); //to show type of orderbook
  const [tableColumns, setTableColumns] = useState(props.defaultColumns); // setting columns for the table
  const [collapsed, setCollapsed] = useState(false);
  const [collapsed1, setCollapsed1] = useState(false);
  const {
    cl,
    refreshTokenTable,
    liveDataProcess,
    liveDataProcessIIFLSMC,
    currentSocketBroker,
    setshares,
    flowLtpShares,
    clientIds,
    subscribeExchangeFlag,
    getAllClientItem,
  } = useGlobalContext();

  ///--- for already login client status green circle -----///
  useEffect(() => {
    getAllClientItem();
  }, []);

  const tableBody = useCallback(
    () => useRef(props.defaultRows),
    [props.defaultRows]
  ); // to store data in table body

  //cl contains selected client
  //fixClient is a reduce function which sets the client name

  //ltp data of all the symbols

  // to filter the table on client click
  const [filteredbody, setFilteredbody] = useState([]); //
  const [cloneFilteredbody, setCloneFilteredbody] = useState([]); //
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");
    // if (!hasVisited) {
    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.on("message", (msg) => {
        if (msg.type == "LTP" && flowLtpShares.current) {
          setshares(msg.data);
        }
      });
    } else if (
      currentSocketBroker === "IIFL" ||
      currentSocketBroker === "SMC"
    ) {
      liveDataProcessIIFLSMC.on("message", (msg) => {
        if (msg.type == "LTP" && flowLtpShares.current) {
          setshares(msg.data);
        }
      });
    }
    if (!hasVisited) {
      setShowModal(true);
      // subscribeExchangeFlag(false);
    } else {
    }
  }, [currentSocketBroker, subscribeExchangeFlag]);

  // filteredbody ************************************************************>
  const filterAccounts = (clt) => {
    if (clt.length == 0) {
      //return all the records of table if no client is selected
      return tableBody.current;
    } else if (clt.length > 0) {
      //return records corresponding to the client
      const temp = tableBody.current?.filter((row) => {
        const result = clt.some((client) => {
          if (!client) {
            return false;
          }
          return row.ClientID.toLowerCase().includes(client.toLowerCase());
        });
        return result;
      });

      /// commented the sort logic based on cliend id
      return temp;
      //sorting the clients in ascending order
      // return temp?.sort((a, b) => {
      //   const fa = a.ClientID.toLowerCase();
      //   const fb = b.ClientID.toLowerCase();
      //   if (fa < fb) {
      //     return -1;
      //   }
      //   if (fa > fb) {
      //     return 1;
      //   }
      //   return 0;
      // });
    } else {
      return "There doesn't seem to be an account associated with this profile. Please add an account to continue.";
    }
  };

  //effect when some client is seleted to filter the table w.r.t client
  useEffect(() => {
    const selectedItems = filterAccounts(cl);
    setFilteredbody(selectedItems);
    setCloneFilteredbody(selectedItems);
  }, [cl]);

  //effect when some other table is selected
  //it will show filtered data even , table is changed
  useEffect(() => {
    const change = async () => {
      setIsDataLoading(true);
      if (
        [
          "orderbook",
          "tradebook",
          "netpositions",
          "margin",
          "holdings",
        ].includes(showtable)
      ) {
        const [cols, tblBody] = await getTabledata(showtable, clientIds);
        setTableColumns(cols);
        tableBody.current = tblBody;
        const filtTbl = filterAccounts(cl);
        setFilteredbody(filtTbl);
        setCloneFilteredbody(filtTbl);
        setIsDataLoading(false);
      }
    };
    change();
  }, [showtable, refreshTokenTable]);

  return (
    <IndicesIndicator>
      <Row css={{ overflow: "hidden", height: "100%", marginTop: "-5px" }}>
        <Grid.Container
          gap={1}
          fluid
          wrap="nowrap"
          justify="space-between"
          css={{ overflow: "hidden" }}
        >
          <Grid css={{ overflow: "hidden" }}>
            {collapsed ? (
              <SiderLeft collapsed={collapsed} setCollapsed={setCollapsed} />
            ) : (
              <div
                style={{
                  borderLeft: "16px solid green",
                  height: "490px",
                  position: "fixed",
                  top: "24%",
                  marginLeft: "-30px",
                  display: "flex",
                  justifyContent: "center", // Centers horizontally
                  alignItems: "center", // Centers vertically
                  borderRadius: "0px 8px 8px 0px",
                  cursor: "pointer",
                }}
                onClick={() => setCollapsed(!collapsed)}
              >
                <img
                  src="../images/arrow.svg"
                  width={20}
                  style={{
                    marginLeft: "10px",
                    position: "fixed",
                    marginLeft: "-10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setCollapsed(!collapsed)}
                />
                <p
                  style={{
                    marginLeft: "10px",
                    position: "fixed",
                    marginLeft: "-20px",
                    cursor: "pointer",
                    transform: "rotate(90deg)",
                    color: "white",
                    letterSpacing: "2px",
                    fontSize: "13px",
                    fontWeight: "500px",
                    marginTop: "80px",
                  }}
                >
                  Clients
                </p>
              </div>
            )}
          </Grid>
          <Grid
            css={{
              flexGrow: "1",
              overflow: "hidden",
            }}
            justify="flex-start"
            style={{ marginLeft: "-14px" }}
          >
            <MainView
              showtable={showtable}
              setshowtable={setshowtable}
              tableColumns={tableColumns}
              filteredbody={filteredbody}
              setFilteredbody={setFilteredbody}
              cloneFilteredbody={cloneFilteredbody}
              setCloneFilteredbody={setCloneFilteredbody}
              isDataLoading={isDataLoading}
            ></MainView>
          </Grid>
          {/* <Grid
            css={{
              overflow: "hidden",
              height: "calc(100vh - 158px)",
              "@media (min-width: 1920px)": {
                height: "calc(100vh - 290px)",
              },
            }}
          >
            <SiderRight />
          </Grid> */}

          <Grid css={{ overflow: "" }}>
            {collapsed1 ? (
              <SiderRight collapsed={collapsed1} setCollapsed={setCollapsed1} />
            ) : (
              <div
                style={{
                  borderLeft: "16px solid green",
                  height: "490px",
                  position: "fixed",
                  top: "24%",
                  marginLeft: "14px",
                  display: "flex",
                  justifyContent: "center", // Centers horizontally
                  alignItems: "center", // Centers vertically
                  borderRadius: "8px 0px 0px 8px",
                  cursor: "pointer",
                }}
                onClick={() => setCollapsed1(!collapsed1)}
              >
                <img
                  src="../images/arrow.svg"
                  width={20}
                  style={{
                    marginLeft: "10px",
                    position: "fixed",
                    marginLeft: "-7px",
                    cursor: "pointer",
                  }}
                  id="svgImage"
                  onClick={() => setCollapsed1(!collapsed1)}
                />
                <p
                  style={{
                    position: "fixed",
                    marginLeft: "-18px",
                    cursor: "pointer",
                    transform: "rotate(90deg)",
                    color: "white",
                    letterSpacing: "2px",
                    fontSize: "13px",
                    fontWeight: "500px",
                    marginTop: "98px",
                  }}
                >
                  Watchlist
                </p>
              </div>
            )}
          </Grid>
        </Grid.Container>
      </Row>
      {showModal && <RiskModal toggle={showModal} setToggle={setShowModal} />}

      <Row
        justify="center"
        css={{ position: "absolute", bottom: "0", width: "100%" }}
      ></Row>
    </IndicesIndicator>
  );
}

// Exporting a function called getStaticProps will pre-render a page at build time using the props returned from the function:
/* export const getStaticProps = async () => {
  const [columns, tableBody] = await getTabledata("orderbook");

  return {
    props: {
      defaultColumns: columns,
      defaultRows: tableBody,
    },
  };
}; */

export default memo(Dashboard);
