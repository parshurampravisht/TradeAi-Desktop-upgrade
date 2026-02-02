import { Modal, Row, Text, Button, Checkbox } from "@nextui-org/react";
import { AgGridReact } from "ag-grid-react";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import classes from "../component/options/BasketModel.module.css";
import {
  getInstanceBasket,
  getInstanceBasketID,
  getSquareOffInstane,
  getSquareOffAllInstane,
  getLTPService,
} from "../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { statusHandler } from "../component/dashboard/dashboardTables/helpers";
import {
  ExchangeSquareOff2,
  mcxfo_converter_mcx,
  warnMessage,
} from "../constant/constant";
import { useGlobalContext } from "../context/GlobalContext";
import CommonConfirmationModal from "../component/common/CommonConfirmationModal";

function InstanceBasket({
  rowHeight,
  headerHeight,
  setselectTabs,
  setTabBasket,
}) {
  const [SquareOffmodal, setSquareOffModel] = useState(false);
  // const [InstanceData, setInstanceData] = useState([]);
  const [InstanceId, setInstanceId] = useState("");
  const [BasketOpen, setBasketOpen] = useState([]);
  const [checkboxState, setCheckboxState] = useState([]);
  const [instanceLtp, setInstanceLtp] = useState([]);
  const [SqureBoolean, setSqureBoolean] = useState("");
  const [MarginAvailable, setMarginAvailable] = useState("");
  const [InstanceLtpItem, setInstanceLtpItem] = useState([]);
  const [totalPnL, setTotalPnL] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const gridRef = useRef(null);
  const squareOffAllRef = useRef(null);
  const processRef = useRef(null);

  const { InstanceData, setInstanceData } = useGlobalContext();

  const closeHandler = () => {
    setSquareOffModel(false);
    localStorage.removeItem("setltpData");
  };

  const handlerInstance = async () => {
    try {
      const res = await getInstanceBasket();
      setInstanceData(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const isDisabledSelectedSquareoffAll = useMemo(() => {
    return !checkboxState.length;
  }, [checkboxState]);

  const handleBasket = async (param, is_squareof) => {
    setSquareOffModel(true);
    setInstanceId(param);
    setSqureBoolean(is_squareof);
    try {
      const res = await getInstanceBasketID(param?.id);
      setBasketOpen(Array.isArray(res?.basket_instance_details) ? res?.basket_instance_details : []);
      if (Array.isArray(res?.basket_instance_details) && res?.basket_instance_details?.length) {
        const extractedScripcodes =
          res?.basket_instance_details.length > 0
            ? res?.basket_instance_details?.map((item) => ({
              [mcxfo_converter_mcx[item.item_exchange] || item.item_exchange]:
                item.item_scrip_code,
            }))
            : "";
        const payloadLtp = {
          scripcodes: extractedScripcodes,
        };
        const resLtp = await getLTPService(payloadLtp);
        setInstanceLtp(resLtp || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlerSquareOff = async (params) => {
    if (processRef.current) return;
    processRef.current = true;
    try {
      const res = await getSquareOffInstane(params?.id);
      toast.success(warnMessage.success_squareoff_message);
      setTabBasket(false);
      setselectTabs(false);
      processRef.current = false;
      // if (res.length > 0) {
      //   setInstanceData(res || []);
      // } else {
      //   return;
      // }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        processRef.current = false;
      }, 5000);
    }
  };

  useEffect(() => {
    // handlerSquareOff();
    handlerInstance();
  }, []);

  const handleSquareOffAllData = async () => {
    if (squareOffAllRef.current) return;

    squareOffAllRef.current = true;
    const instance_ids = {
      instance_ids: checkboxState,
    };
    try {
      const res = await getSquareOffAllInstane(instance_ids);

      if (res.success) {
        toast.success(warnMessage.success_squareoff_message);
        setTabBasket(false);
        setselectTabs(false);
        setCheckboxState([]);
        setIsOpen(false);
      }
      // if (res.length > 0) {
      //   setInstanceData(res || []);
      // } else {
      //   return;
      // }
    } catch (error) {
      console.error(error);
    }
    finally {
      setTabBasket(false);
      setselectTabs(false);
      setCheckboxState([]);
      setIsOpen(false);
    }
    squareOffAllRef.current = false;
  };

  useEffect(() => {
    handlerInstance();
  }, []);

  let LtPDataSet = 0;

  const handlenetMarginAvailable = (
    AvgBuy,
    quantity,
    item_lot_quantity,
    is_squareof,
    squareof_price,
    item_scrip_code,
    buyprice,
    order_status //
  ) => {
    if (!(buyprice > 0 && order_status)) {
      return <span style={{ color: "" }}>-</span>;
    }

    let netMarginAvailable = 0;
    instanceLtp?.map((element) => {
      if (item_scrip_code === element?.scripcode) {
        if (is_squareof === false) {
          const SellPrice = element?.ltp * quantity * item_lot_quantity;
          netMarginAvailable = SellPrice - AvgBuy;
          LtPDataSet += netMarginAvailable;
        } else if (is_squareof === true) {
          const SellPrice = quantity * item_lot_quantity * squareof_price;
          netMarginAvailable =
            squareof_price === null || squareof_price === 0
              ? 0
              : SellPrice - AvgBuy;
          LtPDataSet += netMarginAvailable;
        }
        localStorage.setItem("setltpData", LtPDataSet);
      }
    });

    if (netMarginAvailable?.toFixed(2) < 0) {
      return (
        <span style={{ color: "red" }}>
          {" "}
          {netMarginAvailable
            ? `\u20B9 ${netMarginAvailable?.toFixed(2)}`
            : "-"}
        </span>
      );
    } else {
      return (
        <span style={{ color: "green" }}>
          {netMarginAvailable
            ? `\u20B9 ${netMarginAvailable?.toFixed(2)}`
            : "-"}
        </span>
      );
    }
  };

  const handleLTPItem = async () => {
    if (!InstanceData.length) return;

    const extractedScripcodes =
      InstanceData &&
      InstanceData.map((element) => {
        return element?.details?.map((item) => ({
          [ExchangeSquareOff2[item.item_exchange] || item.item_exchange]:
            item.item_scrip_code,
        }));
      }).flat();

    const payloadLtp = {
      scripcodes: extractedScripcodes,
    };
    try {
      const resLtp = await getLTPService(payloadLtp);
      if (Array.isArray(resLtp)) {
        setInstanceLtpItem(resLtp || []);
      }
    } catch (error) { }
  };

  useEffect(() => {
    handleLTPItem();
    localStorage.getItem("setltpData");
  }, [InstanceData, SquareOffmodal]);

  useEffect(() => {
    let PnL = localStorage.getItem("setltpData");
    setTotalPnL(PnL);
  }, []);

  const MemoizedSelectCheckBoxCellRenderer = useCallback(
    (param) => {
      const handleCheckboxChange = (param, checked) => {
        const isSelected = checked;
        // const isSelected = checkboxState.includes(param?.id);
        if (!isSelected) {
          setCheckboxState((prevCart) =>
            prevCart.filter((id) => id !== param?.id)
          );
        } else {
          setCheckboxState((prevCart) => [...prevCart, param?.id]);
        }
      };

      return (
        <>
          <Checkbox
            type="checkbox"
            isSelected={checkboxState.includes(param?.data.id)}
            onChange={(isChecked) => {
              if (param?.data.is_squareof === true) return;
              handleCheckboxChange(param?.data, isChecked);
            }}
            disabled={param?.data.is_squareof === true}
            style={{
              cursor:
                param?.data.is_squareof === true ? "not-allowed" : "pointer",
            }}
          />
        </>
      );
    },
    [checkboxState]
  );

  const pnlCellRenderer = useCallback(
    (param) => {
      let netMarginAvailable = 0;

      if (param?.data?.details) {
        param.data.details.forEach((item) => {
          const buyPrice = item?.buy_price || 0;
          const isSquareOff = item?.is_squareof;
          const squareOffPrice = item?.squareof_price || 0;
          const stockOrderStatus = item?.order_status;
          const order_status = [
            "Filled",
            "complete",
            "executed",
            "Executed",
            "Traded",
            "Initiated",
            "initiated",
          ].includes(stockOrderStatus);
          const quantity = item?.item_lot_size || 0;
          const itemLotQuantity = item?.item_lot_quantity || 0;

          const avgBuy =
            buyPrice > 0 && order_status
              ? buyPrice * quantity * itemLotQuantity
              : 0;

          InstanceLtpItem.forEach((element) => {
            if (element?.scripcode === item?.item_scrip_code) {
              const sellPrice = isSquareOff
                ? quantity * itemLotQuantity * squareOffPrice
                : buyPrice > 0 && order_status
                  ? element?.ltp * quantity * itemLotQuantity
                  : 0;

              const temp = !order_status
                ? 0
                : param.data?.is_squareof && isSquareOff && squareOffPrice === 0
                  ? sellPrice - avgBuy
                  : sellPrice - avgBuy;
              netMarginAvailable += temp;
            }
          });
        });
      }

      return (
        <span
          style={{
            color:
              netMarginAvailable < 0
                ? "red"
                : netMarginAvailable > 0
                  ? "green"
                  : "",
          }}
        >
          {netMarginAvailable === 0 || netMarginAvailable == null
            ? "-"
            : `\u20B9 ${netMarginAvailable?.toFixed(2)}`}
        </span>
      );
    },
    [InstanceLtpItem]
  );

  // 🔹 Refresh the grid when `InstanceLtpItem` updates
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current?.api?.refreshCells({ force: true, columns: ["P&L"] });
    }
  }, [InstanceLtpItem]); // 🔹 Trigger re-render on price updates

  const gridColumns = [
    {
      field: "Select",
      headerName: "Select",
      flex: 0.5,
      cellRenderer: MemoizedSelectCheckBoxCellRenderer,
    },
    { field: "id", headerName: "Instance Id", flex: 1 },

    { field: "client_id", headerName: "Client", flex: 1.5 },

    {
      field: "status",
      headerName: "Status",
      cellRenderer: statusHandler,
      flex: 1,
    },
    {
      field: "P&L",
      headerName: "P&L",
      flex: 0.8,
      cellRenderer: pnlCellRenderer,
    },

    // {
    //   field: "P&L",
    //   headerName: "P&L",
    //   flex: 0.8,
    //   cellRenderer: (param) => {
    //     let netMarginAvailable = 0;

    //     // {
    //     //   param?.data?.details?.map((item, index) => {
    //     //     const buyprice = item?.buy_price;
    //     //     const quantity = item?.item_lot_size;
    //     //     const item_lot_quantity = item?.item_lot_quantity;
    //     //     const is_squareof = item?.is_squareof;
    //     //     const squareof_price = item?.squareof_price;
    //     //     const AvgBuy = buyprice * quantity * item_lot_quantity;
    //     //     InstanceLtpItem.length > 0
    //     //       ? InstanceLtpItem?.map((element) => {
    //     //           if (element?.scripcode === item?.item_scrip_code) {
    //     //             if (is_squareof === false) {
    //     //               const SellPrice =
    //     //                 element?.ltp * quantity * item_lot_quantity;
    //     //               let temp = SellPrice - AvgBuy;
    //     //               netMarginAvailable += temp;
    //     //             } else if (is_squareof === true) {
    //     //               const SellPrice =
    //     //                 quantity * item_lot_quantity * squareof_price;
    //     //               let temp = SellPrice - AvgBuy;
    //     //               netMarginAvailable += temp;
    //     //             }
    //     //           }
    //     //         })
    //     //       : "";
    //     //     setMarginAvailable(netMarginAvailable);
    //     //   });
    //     // }

    //     if (param?.data?.details) {
    //       param.data.details.forEach((item) => {
    //         const buyPrice = item?.buy_price || 0;
    //         const quantity = item?.item_lot_size || 0;
    //         const itemLotQuantity = item?.item_lot_quantity || 0;
    //         const isSquareOff = item?.is_squareof;
    //         const squareOffPrice = item?.squareof_price || 0;

    //         // If buy_price is zero, skip calculation for this item
    //         if (buyPrice === 0) {
    //           netMarginAvailable = 0;
    //           return;
    //         }

    //         const avgBuy = buyPrice * quantity * itemLotQuantity;

    //         InstanceLtpItem.forEach((element) => {
    //           if (element?.scripcode === item?.item_scrip_code) {
    //             const sellPrice = isSquareOff
    //               ? quantity * itemLotQuantity * squareOffPrice
    //               : element?.ltp * quantity * itemLotQuantity;

    //             const temp = sellPrice - avgBuy;
    //             netMarginAvailable += temp;
    //           }
    //         });
    //       });
    //     }

    //     // Update margin value
    //     setMarginAvailable(netMarginAvailable);

    //     return (
    //       <Row style={{ marginLeft: "-35px" }}>
    //         <span
    //           style={{
    //             color:
    //               netMarginAvailable < 0
    //                 ? "red"
    //                 : netMarginAvailable > 0
    //                 ? "green"
    //                 : "",
    //           }}
    //         >
    //           {netMarginAvailable === 0 ||
    //           netMarginAvailable === null ||
    //           netMarginAvailable === undefined
    //             ? "-"
    //             : `\u20B9   ${netMarginAvailable?.toFixed(2)}`}
    //         </span>
    //       </Row>
    //     );
    //   },
    // },
    {
      field: "created Date",
      headerName: "created Date",
      flex: 1,
      cellRenderer: (param) => {
        const date = new Date(param?.data?.created_at);

        const formattedDate = `${date.getDate()}/${date.getMonth() + 1
          }/${date.getFullYear()}`;
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""
          }${minutes}`;

        return (
          <Row style={{ marginLeft: "-16px" }}>
            {formattedDate} {formattedTime}
          </Row>
        );
      },
    },
    {
      field: "action",
      flex: 1,
      cellRenderer: (param) => {
        const matchById = checkboxState.find((item) => item === param.data?.id);
        return (
          <>
            <Row>
              <IconEye
                height={20}
                width={20}
                strokeWidth={1}
                color={"#000"}
                onClick={() =>
                  handleBasket(param.data, param.data?.is_squareof)
                }
                style={{ cursor: "pointer", width: "3rem" }}
              />
              <Button
                className={`${param.data?.is_squareof === true || matchById
                  ? ``
                  : `primary-button`
                  } border-radius-8`}
                style={{ minWidth: "1rem", height: "18px" }}
                disabled={
                  param.data?.is_squareof === true || matchById ? true : false
                }
                onPress={() => handlerSquareOff(param.data)}
              >
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 15px 2px 15px",
                  }}
                >
                  Square Off
                </span>
              </Button>
            </Row>
          </>
        );
      },
    },
  ];

  return (
    <>
      <CommonConfirmationModal
        isOpen={isOpen}
        title={`Square Off Confirmation`}
        handleClose={() => setIsOpen(false)}
        handleConfirm={handleSquareOffAllData}
      />

      <OverAllPnlModal
        SquareOffmodal={SquareOffmodal}
        setSquareOffModel={setSquareOffModel}
        BasketOpen={BasketOpen}
        handlenetMarginAvailable={handlenetMarginAvailable}
        totalPnL={totalPnL}
        classes={classes}
        InstanceId={InstanceId}
        SqureBoolean={SqureBoolean}
        handlerSquareOff={handlerSquareOff}
        closeHandler={closeHandler}
      />

      <div className="width-100">
        <div
          className="ag-theme-balham basket1-table"
          style={{ height: "50vh" }}
        >
          <AgGridReact
            ref={gridRef}
            headerHeight={headerHeight}
            rowHeight={rowHeight}
            rowData={InstanceData}
            columnDefs={gridColumns}
          ></AgGridReact>

          <div className={classes.SqaureCss}>
            {/* <Button
            auto
            flat
            onPress={closeHandler}
            style={{ padding: "0px 35px", marginTop: "15px" }}
            color="default"
          >
            Back
          </Button> */}
            <Button
              className={`${isDisabledSelectedSquareoffAll
                ? "disable-button"
                : "primary-button"
                } border-radius-8`}
              auto
              flat
              onPress={() => {
                if (isDisabledSelectedSquareoffAll) return;
                // handleSquareOffAllData();
                setIsOpen(true);
              }}
              css={{
                width: "7rem",
              }}
              style={{
                marginTop: "15px",
                cursor: `${squareOffAllRef.current || isDisabledSelectedSquareoffAll
                  ? "not-allowed"
                  : "pointer"
                  }`,
              }}
            >
              Square Off All
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InstanceBasket;

function OverAllPnlModal({
  SquareOffmodal,
  setSquareOffModel,
  BasketOpen,
  handlenetMarginAvailable,
  totalPnL,
  classes,
  InstanceId,
  SqureBoolean,
  handlerSquareOff,
  closeHandler
}) {
  return (
    <Modal aria-labelledby="modal-title" open={SquareOffmodal} preventClose width="60rem">
      <Modal.Body>
        <Row>
          <Text b h5>
            Over all P&L
            <span
              className={classes.Sqdigit}
              style={{
                backgroundColor: "transparent",
                color: "black",
                // totalPnL < 0 ? "red" : totalPnL > 0 ? "green" : "",
              }}
            >
              <span>{"-" || `\u20B9   ${totalPnL}`}</span>{" "}
            </span>
          </Text>
        </Row>
        <Row>
          <table
            aria-label="Example static collection table"
            className={classes.table1}
          >
            <thead>
              <tr>
                <th className={classes.th1}>ID</th>
                <th className={classes.th1}>Name</th>
                <th className={classes.th1} style={{ width: "8rem" }}>
                  Order Type
                </th>
                <th className={classes.th1}>Lots</th>
                <th className={classes.th1}>Avg Price</th>
                <th className={classes.th1}>P&L</th>
              </tr>
            </thead>
            <tbody className={classes.tbody1}>
              {BasketOpen.map((row, index) => {
                const buyprice = row?.buy_price;
                const quantity = row?.item_lot_size;
                const item_lot_quantity = row?.item_lot_quantity;
                const is_squareof = row?.is_squareof;
                const squareof_price = row?.squareof_price;
                const AvgBuy = buyprice * quantity * item_lot_quantity;
                const stockOrderStatus = row?.order_status;
                const order_status = [
                  "Filled",
                  "complete",
                  "executed",
                  "Executed",
                  "Traded",
                  "Initiated",
                  "initiated",
                ].includes(stockOrderStatus);
                return (
                  <tr key={row.id} className={classes.tr1}>
                    <td className={classes.td1}>{row?.id}</td>
                    <td className={classes.td1}>{row?.item_symbol}</td>
                    <td
                      className={classes.td1}
                      style={{ width: "8rem", paddingLeft: "2rem" }}
                    >
                      <span
                        className={
                          row?.item_order_side === "SELL"
                            ? classes.RedColor
                            : classes.greeencolor
                        }
                      >
                        {row?.item_order_side}
                      </span>
                    </td>
                    <td
                      className={classes.td1}
                    >{`${row?.item_lot_quantity} (${row?.item_lot_size})`}</td>
                    <td className={classes.td1}>
                      {" "}
                      {`\u20B9   ${row?.buy_price}`}
                    </td>
                    <td className={classes.td1}>
                      {handlenetMarginAvailable(
                        AvgBuy,
                        quantity,
                        item_lot_quantity,
                        is_squareof,
                        squareof_price,
                        row?.item_scrip_code,
                        buyprice,
                        order_status
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Row>

        <div className={classes.SqaureCss}>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            onPress={closeHandler}
            style={{ padding: "0px 35px" }}
          >
            Back
          </Button>
          <Button
            className={`${SqureBoolean === true ? `` : `primary-button`
              } border-radius-8`}
            auto
            flat
            color="error"
            css={{
              background: "$blue600",
              color: "#FFF",
              width: "7rem",
            }}
            onPress={() => {
              handlerSquareOff(InstanceId);
              setSquareOffModel(false);
            }}
            disabled={SqureBoolean === true ? true : false}
          >
            Square Off
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
