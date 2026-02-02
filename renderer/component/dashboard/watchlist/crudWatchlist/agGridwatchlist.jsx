import HelperButtons from "./components/HelperButtons";
import { useEffect, useState, memo, useCallback, useMemo } from "react";
import electron from "electron";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useGlobalContext } from "../../../../../renderer/context/GlobalContext";
import classes from "../../../../component/options/BasketModel.module.css";

function AgGridwatchlist(props) {
  const {
    loadSymbols,
    liveDataProcess,
    liveDataProcessIIFLSMC,
    currentSocketBroker,
    selectedCurrentWatchlist,
    selectedWatchlistSymbolData,
    setSelectedWatchlistSymbolData,
    selectedCurrentWatchlistSymbolHandler,
  } = useGlobalContext();

  const [tableData, setTableData] = useState([]);
  const [isTableDataCheck, setIsTableDataCheck] = useState(false);

  // useEffect(() => {
  //   if (props.shares.length && props.shares.length !== 0) {
  //     setTableData((prev) => {
  //       return isTableDataCheck && prev.length < props.shares.length
  //         ? prev
  //         : props.shares;
  //     });
  //     if (isTableDataCheck) setIsTableDataCheck(false);
  //   } else {
  //     setTableData([]);
  //   }
  // }, [props.shares, loadSymbols]);

  // const DeleteHandler = async (id, deleteSymbol) => {
  //   //removing symbols from deleted watchlist in table component
  //   setTableData((prev) => prev.filter((item) => item.id !== id));
  //   //current watchlist name
  //   setIsTableDataCheck(true);
  //   const currentWatchlist = props.selectedWatchlist.values().next().value;
  //   //watchlist name to be updated after deleteing all symbols from watchlist
  //   var updateWatchList = props.selectedWatchlist.values().next().value;
  //   //remaining symbol after clicking symbol delete button
  //   const updatedSymbols =
  //     props.watchlistSymbols.current[currentWatchlist]?.filter(
  //       (item) => item?.Scripcode !== id
  //     ) || [];

  //   setTableData(updatedSymbols);
  //   //current watchlist index
  //   const watchListIndex = props.watchlists.findIndex(
  //     (ele) => ele === currentWatchlist
  //   );
  //   //local variable for watchList array
  //   const tempWatchlists = props.watchlists;
  //   //local variable for symbols and watchlist object
  //   var tempWatchlistSymbols = [];

  //   //removing symbol from the current watchlist
  //   props.watchlistSymbols.current[currentWatchlist] = updatedSymbols;

  //   //if total symbols in a watchlist after deletion is 0, then we have to delete the current watchlist
  //   //and update the latest watchlist in the drop down
  //   if (updatedSymbols.length === 0) {
  //     if (tempWatchlists.length > 1) {
  //       //condition what to display on the screen w.r.t watchlist
  //       updateWatchList =
  //         watchListIndex === 0 ? tempWatchlists[1] : tempWatchlists[0];
  //     } else {
  //       //if not then this is the default case
  //       updateWatchList = "empty";
  //     }

  //     //eliminating the watchlist from local variable of watchlist
  //     tempWatchlists.splice(watchListIndex, 1);
  //     // and setting the new value for the remaining watchlist
  //     props.setWatchlists(tempWatchlists);
  //     //updating the updated watchlist to dropdown
  //     props.setSelectedWatchlist(new Set([updateWatchList]));
  //     //assigning the local variable of symbols the value of current symbol in the watchlist
  //     tempWatchlistSymbols = props.watchlistSymbols.current;
  //     //deleting the watchlist name as key in watchlistSymbol object
  //     delete tempWatchlistSymbols[currentWatchlist];
  //   }

  //   tempWatchlistSymbols = props.watchlistSymbols.current;
  //   var TSymbols = []; //temperory symbols to add all available symbols from all watchlists
  //   const Nkeys = Object.keys(tempWatchlistSymbols); //new keys
  //   Nkeys.forEach((item) => {
  //     TSymbols = TSymbols.concat(tempWatchlistSymbols[item]);
  //   });
  //   //choosing unique symbols from all symbols
  //   var uniqueSymbols = TSymbols.filter(
  //     (item, index) => TSymbols.indexOf(item) == index
  //   );
  //   //adding default symbol
  //   uniqueSymbols.push("NIFTY 50");
  //   uniqueSymbols.push("BANKNIFTY");
  //   uniqueSymbols.push("SENSEX");

  //   //updating the loading symbol which refreshes every 10 seconds
  //   props.setLoadSymbols(uniqueSymbols);
  //   //calling IPC to update the watchlist in the memory
  //   const ipcReqBody = {
  //     field: "watchlist",
  //     subField: "All",
  //     data: {
  //       currentWatchlist: updateWatchList,
  //       symbols: uniqueSymbols,
  //       watchlistAndSymbols: tempWatchlistSymbols,
  //     },
  //   };
  //   const result = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
  // };

  // const setLTP = useCallback((scripCode, ltp) => {
  //   setTableData((prevTableData) =>
  //     prevTableData.map((item) =>
  //       item.id === scripCode ? { ...item, LTP: ltp?.toFixed(2) } : item
  //     )
  //   );
  // }, []);

  // useEffect(() => {
  //   const getLtp = async () => {
  //     if (props.shares.length && props.shares.length !== 0) {
  //       const data = props.shares.map((val) => ({
  //         value: val?.symbolName,
  //         Scripcode: val?.id,
  //         Exch:
  //           val?.exch === "N"
  //             ? "NSE"
  //             : val.Exch === "B"
  //             ? "BSE"
  //             : !val.Exch
  //             ? "NSE"
  //             : "MCX",
  //         ExchType: val?.exchType,
  //       }));

  //       if (currentSocketBroker === "MOSWAL") {
  //         liveDataProcess.send({
  //           action: "register",
  //           data: data,
  //           placeOrderSymbol: true,
  //         });
  //       } else if (
  //         currentSocketBroker === "IIFL" ||
  //         currentSocketBroker === "SMC"
  //       ) {
  //         liveDataProcessIIFLSMC.send({
  //           action: "register",
  //           data: data,
  //           placeOrderSymbol: true,
  //         });
  //       }
  //     }
  //   };
  //   getLtp();
  // }, [props.shares]);

  // useEffect(() => {
  //   const handleLtpUpdate = (msg) => {
  //     if (msg && msg.type == "LTP") {
  //       try {
  //         props?.shares?.forEach((val) => {
  //           const specificSymbolLTP = msg.data[val.symbolName];
  //           if (specificSymbolLTP) {
  //             setLTP(specificSymbolLTP.Scripcode, specificSymbolLTP.Price);
  //           }
  //         });
  //       } catch (error) {
  //         console.log("error", error);
  //       }
  //     }
  //   };

  //   if (currentSocketBroker === "MOSWAL") {
  //     liveDataProcess.on("message", handleLtpUpdate);
  //   } else if (
  //     currentSocketBroker === "IIFL" ||
  //     currentSocketBroker === "SMC"
  //   ) {
  //     liveDataProcessIIFLSMC.on("message", handleLtpUpdate);
  //   }

  //   return () => {
  //     if (currentSocketBroker === "MOSWAL") {
  //       liveDataProcess.off("message", handleLtpUpdate);
  //     } else if (
  //       currentSocketBroker === "IIFL" ||
  //       currentSocketBroker === "SMC"
  //     ) {
  //       liveDataProcessIIFLSMC.off("message", handleLtpUpdate);
  //     }
  //   };
  // }, [props.shares, setLTP]);

  const setLTP = useCallback((scripCode, ltpValue) => {
    setSelectedWatchlistSymbolData((prevTableData) =>
      prevTableData.map((item) =>
        +item.scripCode === scripCode
          ? {
              ...item,
              LTP:
                ltpValue !== undefined && ltpValue !== 0
                  ? ltpValue.toFixed(2)
                  : 0,
            }
          : item
      )
    );
  }, []);

  useEffect(() => {
    const handleLtpUpdate = (msg) => {
      if (msg && msg.type == "LTP") {
        try {
          selectedWatchlistSymbolData.forEach((val) => {
            const specificSymbolLTP = msg.data[val.symbolName];
            if (specificSymbolLTP) {
              setLTP(specificSymbolLTP.Scripcode, specificSymbolLTP.Price);
            }
          });
        } catch (error) {
          console.log("error", error);
        }
      }
    };

    if (currentSocketBroker === "MOSWAL") {
      liveDataProcess.on("message", handleLtpUpdate);
    } else if (
      currentSocketBroker === "IIFL" ||
      currentSocketBroker === "SMC"
    ) {
      liveDataProcessIIFLSMC.on("message", handleLtpUpdate);
    }

    return () => {
      if (currentSocketBroker === "MOSWAL") {
        liveDataProcess.off("message", handleLtpUpdate);
      } else if (
        currentSocketBroker === "IIFL" ||
        currentSocketBroker === "SMC"
      ) {
        liveDataProcessIIFLSMC.off("message", handleLtpUpdate);
      }
    };
  }, [selectedWatchlistSymbolData, setLTP]);

  useEffect(() => {
    selectedCurrentWatchlistSymbolHandler();
  }, [selectedCurrentWatchlist]);

  return (
    <div className="watchlist_theme">
      <div
        className="ag-theme-balham"
        style={{ height: "32vw", width: "100%", overflowY: "auto" }}
      >
        <table
          aria-label="Watchlist Table"
          className={classes.table1}
          style={{ paddingLeft: "12px" }}
        >
          <thead>
            <tr>
              <th className={classes.th1}>Symbol</th>
              <th className={classes.th1}>LTP</th>
              {/* <th className={classes.th1}></th> */}
              <th
                className={classes.th1}
                style={{
                  width: "8rem",
                  paddingLeft: "10px",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className={classes.tbody1}>
            {selectedWatchlistSymbolData.map((row) => (
              <tr key={row.id} className={classes.tr1}>
                <td
                  className={classes.td1}
                  style={{ minWidth: "15rem", maxWidth: "15rem" }}
                >
                  {row?.symbolName}
                </td>
                <td
                  className={classes.td1}
                  style={{ minWidth: "75px", maxWidth: "100px" }}
                >
                  {row?.LTP === 0 || row?.LTP == "0.00" ? "-" : row?.LTP}
                </td>
                {/* <td className={classes.td1}></td> */}
                <td
                  className={classes.td1}
                  style={{
                    // width: "8rem",
                    width: "auto",
                    paddingLeft: "10px",
                  }}
                >
                  <HelperButtons
                    cell={row}
                    setStepOrderVisible={props.setStepOrderVisible}
                    setBuySell={props.setBuySell}
                    apiBody={props.apiBody}
                    setSelectedSymbol={props.setSelectedSymbol}
                    setSingleLtp={props.setSingleLtp}
                    // onDelete={DeleteHandler}
                    setSymbolApi={props.setSymbolApi}
                    setPlaceOrderVisible={props.setPlaceOrderVisible}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(AgGridwatchlist);
