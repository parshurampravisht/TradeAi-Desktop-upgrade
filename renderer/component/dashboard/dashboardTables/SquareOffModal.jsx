import { Modal, Button, Image, Row, Text, Radio, Col } from "@nextui-org/react";
import { useEffect, useState } from "react";
import classes from "../../../component/options/BasketModel.module.css";
import CustomToolTip from "../../../layout/CustomToolTip";
import { useGlobalContext } from "../../../context/GlobalContext";
import { orderTypeFormatTradeWithExcel } from "../../../constant/constant";

export default function SquareOffModal(props) {
  const { toggle, setToggle, isDisabled, showtable, deliveryType, setDeliveryType, setIsOpen } = props;

  const [errorQtyMsg, setErrorQtyMsg] = useState("");
  const [disableState, setDisableState] = useState({
    isDisabledLimitPrice: true,
    isDisabledTriggerPrice: true,
  });

  const {
    netPositionsBulkSquareOff,
    setNetPositionsBulkSquareOff,
    cloneNetPositionsBulkSquareOff,
    holdingsBulkSquareOff,
    setHoldingsBulkSquareOff,
    cloneHoldingsBulkSquareOff,
  } = useGlobalContext();

  const resetBulkSquareOff = () => {
    if (showtable === "netpositions") {
      setNetPositionsBulkSquareOff(cloneNetPositionsBulkSquareOff);
    } else {
      setDeliveryType("MKT");
      setHoldingsBulkSquareOff(cloneHoldingsBulkSquareOff);
    }
    setErrorQtyMsg(""); // common reset
  };

  function updateOrderType(list) {
    return list.map((obj) => {
      // find the dynamic key (the one that's not 'rowIndex')
      const dynamicKey = Object.keys(obj).find((k) => k !== "rowIndex");
      if (!dynamicKey) return obj; // nothing to change

      // clone object and inner object to avoid mutating original
      return {
        ...obj,
        [dynamicKey]: {
          ...obj[dynamicKey],
          OrderType: orderTypeFormatTradeWithExcel[deliveryType],
        },
      };
    });
  }

  useEffect(() => {

    if (showtable !== "holdings") return

    if (deliveryType === "MKT") {
      setDisableState({
        isDisabledLimitPrice: true,
        isDisabledTriggerPrice: true,
      });
    } else if (deliveryType === "LIMIT") {
      setDisableState((prev) => ({ ...prev, isDisabledLimitPrice: false, isDisabledTriggerPrice: true }));
    } else if (deliveryType === "SLM") {
      setDisableState((prev) => ({ ...prev, isDisabledLimitPrice: true, isDisabledTriggerPrice: false }));
    } else if (deliveryType === "SLL") {
      setDisableState((prev) => ({ ...prev, isDisabledLimitPrice: false, isDisabledTriggerPrice: false }))
    }
    // setHoldingsBulkSquareOff((prev) => ([ ...prev, orderType: orderTypeFormatTradeWithExcel[deliveryType] ]))
    setHoldingsBulkSquareOff(updateOrderType(holdingsBulkSquareOff));
  }
    , [deliveryType, showtable]);

  const closeHandler = () => {
    resetBulkSquareOff();
    setToggle(false);
  };

  useEffect(() => {
    return () => {
      resetBulkSquareOff();
    };
  }, []);

  useEffect(() => {
    (() => {
      const isNetPositions = showtable === "netpositions";

      const originalList = isNetPositions
        ? cloneNetPositionsBulkSquareOff
        : cloneHoldingsBulkSquareOff;

      const updatedList = isNetPositions
        ? netPositionsBulkSquareOff
        : holdingsBulkSquareOff; // assuming you have a corresponding updated holdings array

      if (!(originalList.length && updatedList.length)) return;

      for (let i = 0; i < originalList.length; i++) {
        const cloneItem = originalList[i];
        const updatedItem = updatedList[i];

        const cloneKey = Object.keys(cloneItem).find((k) => k !== "rowIndex");
        const key = Object.keys(updatedItem).find((k) => k !== "rowIndex");

        const existingQuantity = cloneItem[cloneKey].Quantity;
        const updatedExistingQuantity = updatedItem[key].Quantity
          ? +updatedItem[key].Quantity
          : updatedItem[key].Quantity;

        const isEmpty = !updatedExistingQuantity;
        const isGreaterThanQuantity = updatedExistingQuantity > existingQuantity;

        if ((isEmpty || isGreaterThanQuantity) && name === "LotsQty") {
          setErrorQtyMsg(
            isEmpty
              ? "Quantity cannot be empty."
              : "Quantity cannot be greater than existing Quantity."
          );
          return;
        } else {
          // setErrorQtyMsg(""); // Clear error if valid
        }
      }
    })();
  }, [netPositionsBulkSquareOff, holdingsBulkSquareOff, showtable]);

  // const onInputFieldHandler = (e, updateAll = false, index = null) => {
  //   const { name, value } = e.target;

  //   (showtable === "netpositions" ? cloneNetPositionsBulkSquareOff : cloneHoldingsBulkSquareOff).map((item, ind) => {
  //     const key = Object.keys(item).find((k) => k !== "rowIndex");

  //     const existingQuantity = item[key].Quantity;
  //     const inputValue = value ? +value : 0;

  //     const inputqtyValue = value === "" || value === null || isNaN(inputValue);
  //     const isEmpty = index === null || index === ind ? inputqtyValue : false;
  //     const isGreaterThanQuantity =
  //       index === ind || index === null ? inputValue > existingQuantity : false;

  //     // Set error message if input is invalid
  //     if (isEmpty || isGreaterThanQuantity) {
  //       setErrorQtyMsg(
  //         isEmpty
  //           ? "Quantity cannot be empty."
  //           : "Quantity cannot be greater than existing Quantity."
  //       );
  //       return;
  //     } else {
  //       setErrorQtyMsg(""); // Clear error if valid
  //     }
  //   });

  //   setNetPositionsBulkSquareOff((prev) =>
  //     prev.map((item, i) => {
  //       const key = Object.keys(item).find((k) => k !== "rowIndex");

  //       if (key && item[key]) {
  //         // Condition to update all or a specific index
  //         if (updateAll || i === index) {
  //           return {
  //             ...item,
  //             [key]: {
  //               ...item[key],
  //               [name]: value ? +value : value,
  //               ["Quantity"]: ["BSECM", "NSECM"].includes(item[key]["Exchange"])
  //                 ? value
  //                   ? +value
  //                   : value
  //                 : item[key]["LotSize"] * (value ? +value : value),
  //             },
  //           };
  //         }
  //       }
  //       return item;
  //     })
  //   );
  // };

  const onInputFieldHandler = (e, updateAll = false, index = null) => {
    const { name, value } = e.target;
    const inputValue = Number(value);

    const isNetPositions = showtable === "netpositions";

    const cloneList = isNetPositions
      ? cloneNetPositionsBulkSquareOff
      : cloneHoldingsBulkSquareOff;

    // 🔍 Validation
    for (const item of cloneList) {
      const key = Object.keys(item).find(k => k !== "rowIndex");
      const existingQty = item[key]?.Quantity ?? 0;

      if (name === "LotsQty") {
        if (!value || isNaN(inputValue) || inputValue <= 0) {
          setErrorQtyMsg("Quantity must be greater than 0.");
        } else if (inputValue > existingQty) {
          setErrorQtyMsg("Quantity cannot be greater than existing quantity.");
        } else {
          setErrorQtyMsg("");
        }
      }
    }

    // cloneList.forEach((item, ind) => {
    //   const key = Object.keys(item).find((k) => k !== "rowIndex");

    //   const existingQuantity = item[key].Quantity;
    //   const inputValue = value ? +value : 0;

    //   const inputqtyValue = value === "" || value === null || isNaN(inputValue);
    //   const isEmpty = index === null || index === ind ? inputqtyValue : false;
    //   const isGreaterThanQuantity =
    //     index === ind || index === null ? inputValue > existingQuantity : false;

    //   if ((isEmpty || isGreaterThanQuantity) && name === "LotsQty") {
    //     setErrorQtyMsg(
    //       isEmpty
    //         ? "Quantity cannot be empty."
    //         : "Quantity cannot be greater than existing Quantity."
    //     );
    //     return;
    //   } else {
    //     setErrorQtyMsg(""); // Clear error if valid
    //   }
    // });

    const setBulkSquareOff = isNetPositions
      ? setNetPositionsBulkSquareOff
      : setHoldingsBulkSquareOff;

    setBulkSquareOff((prev) =>
      prev.map((item, i) => {
        const key = Object.keys(item).find((k) => k !== "rowIndex");

        if (key && item[key]) {
          if (updateAll || i === index) {
            // compute numeric value for the changed field
            const newVal = value ? +value : value;

            // Only recalculate Quantity when LotsQty is changed.
            const newQuantity =
              name === "LotsQty"
                ? ["BSECM", "NSECM"].includes(item[key]["Exchange"])
                  ? newVal
                  : item[key]["LotSize"] * newVal
                : item[key]["Quantity"];

            return {
              ...item,
              [key]: {
                ...item[key],
                [name]: newVal,
                Quantity: newQuantity,
              },
            };
          }
        }
        return item;
      })
    );
  };

  return (
    <Modal
      style={{
        width: "100%",
        padding: "20px",
      }}
      preventClose
      open={toggle}
      width={`${showtable === "netpositions" ? "750px" : "850px"}`}
      blur
    >
      <Modal.Header style={{ fontSize: "22px", padding: "0 0 10px 0" }}>
        Square Off Confirmation
      </Modal.Header>
      <Modal.Body>
        <Text style={{ letterSpacing: "0.3px" }}>
          Please confirm the square off by clicking submit button.
        </Text>
        {(showtable === "netpositions" || showtable === "holdings") && (
          <Row
            className="width-100"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              overflowX: "hidden",
              marginBottom: "0px",
              // border: "1px solid #4680C2",
            }}
          >
            <table
              className={classes.table1}
              style={{
                color: "#838383",
                fontSize: "12px",
                marginBottom: "0px",
              }}
            >
              <thead
                className={"position-sticky top-0"}
                style={{ height: "40px", zIndex: 999 }}
              >
                <tr>
                  <th className={classes.th1}>S.No</th>
                  <th className={classes.th1}>Client ID</th>
                  <th className={classes.th1}>Order Side</th>
                  {showtable === "netpositions" && <th className={classes.th1}>Lot Size</th>}
                  <th className={classes.th1}>Symbol Name</th>
                  <th className={classes.th1}>Quantity</th>
                  {showtable === "holdings" &&
                    <>
                      <th className={classes.th1}>Limit Price</th>
                      <th className={classes.th1}>Trigger Price</th>
                    </>
                  }
                </tr>
              </thead>
              <tbody className={`table-body position-relative`}>
                {showtable === "holdings" && <Radio.Group
                  css={{ mr: "$-1", left: "$0", height: "40px" }}
                  value={deliveryType}
                  orientation="horizontal"
                  color="secondary"
                  className="position-absolute flex-row align-center"
                  onChange={(val) => {
                    setDeliveryType(val);
                  }}
                >
                  <Row>
                    <Col
                      css={{
                        mr: "$8",
                        display: "inherit",
                        paddingLeft: "5px",
                      }}
                    >
                      <Radio value="MKT" className={classes.radio}>
                        {" "}
                        <Text
                          size={"$md"}
                          css={{
                            mt: "$.5",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "18px",
                          }}
                        >
                          MKT
                        </Text>
                      </Radio>
                    </Col>
                    <Col css={{ mr: "$14", display: "inherit" }}>
                      <Radio value="LIMIT" className={classes.radio}>
                        {" "}
                        <Text
                          size={"$md"}
                          css={{
                            mt: "$.5",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "18px",
                          }}
                        >
                          LIMIT
                        </Text>
                      </Radio>

                      <Radio value="SLM" className={classes.radio}>
                        {" "}
                        <Text
                          size={"$md"}
                          css={{
                            mt: "$.5",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "18px",
                          }}
                        >
                          SLM
                        </Text>
                      </Radio>
                      <Radio value="SLL" className={classes.radio}>
                        {" "}
                        <Text
                          size={"$md"}
                          css={{
                            mt: "$.5",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "18px",
                          }}
                          x
                        >
                          SLL
                        </Text>{" "}
                      </Radio>
                    </Col>
                  </Row>
                </Radio.Group>}
                <tr
                  style={{
                    backgroundColor: "#4680C233",
                    padding: "5px 0px",
                    height: "40px",
                  }}
                >
                  {showtable === "netpositions" && <td></td>}
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="position-relative tooltip-wrapper">
                    <input
                      type="number"
                      style={{
                        border: `0.5px solid #4680C2`,
                        borderRadius: "3px",
                        padding: "5px 25px 5px 5px",
                        width: "100px",
                      }}
                      name="LotsQty"
                      onChange={(e) => onInputFieldHandler(e, true, null)}
                      placeholder="Qty"
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        // right: "55px",  //
                        left: "80px",
                      }}
                      className="position-absolute cursor-pointer"
                    >
                      <CustomToolTip
                        toolTipText={`The Partial Square-Off with quantity.`}
                        position="left"
                      >
                        <img
                          style={{
                            width: "16px",
                            zIndex: 99,
                          }}
                          src="./images/tooltip_icon.svg"
                          alt="tooltip"
                        />
                      </CustomToolTip>
                    </div>
                  </td>
                  {showtable === "holdings" && (
                    <>
                      <td className="position-relative tooltip-wrapper">
                        <input
                          type="number"
                          style={{
                            border: `0.5px solid #4680C2`,
                            borderRadius: "3px",
                            padding: "5px 25px 5px 5px",
                            width: "100px",
                            cursor: disableState.isDisabledLimitPrice ? "not-allowed" : "auto",
                          }}
                          disabled={disableState.isDisabledLimitPrice}
                          name="LimitPrice"
                          onChange={(e) => onInputFieldHandler(e, true, null)}
                          placeholder="Limit price"
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            // right: "55px",  
                            left: "80px",
                          }}
                          className="position-absolute cursor-pointer"
                        >
                          <CustomToolTip
                            toolTipText={`The Partial Square-Off with Limit Price.`}
                            position="left_0"

                          >
                            <img
                              style={{
                                width: "16px",
                                zIndex: 99,
                              }}
                              src="./images/tooltip_icon.svg"
                              alt="tooltip"
                            />
                          </CustomToolTip>
                        </div>
                      </td>
                      <td className="position-relative tooltip-wrapper">
                        <input
                          type="number"
                          style={{
                            border: `0.5px solid #4680C2`,
                            borderRadius: "3px",
                            padding: "5px 25px 5px 5px",
                            width: "100px",
                            cursor: disableState.isDisabledTriggerPrice ? "not-allowed" : "auto",
                          }}
                          disabled={disableState.isDisabledTriggerPrice}
                          name="SLTriggerPrice"
                          onChange={(e) => onInputFieldHandler(e, true, null)}
                          placeholder="Trigger price"
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            // right: "55px",  
                            left: "80px",
                          }}
                          className="position-absolute cursor-pointer"
                        >
                          <CustomToolTip
                            toolTipText={`The Partial Square-Off with Limit Price.`}
                            position="left_0"

                          >
                            <img
                              style={{
                                width: "16px",
                                zIndex: 99,
                              }}
                              src="./images/tooltip_icon.svg"
                              alt="tooltip"
                            />
                          </CustomToolTip>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
                {(showtable === "netpositions" ? netPositionsBulkSquareOff : holdingsBulkSquareOff).map((Obj, index) => {
                  const clientId = Object.keys(Obj)[0];
                  const item = Object.values(Obj)[0];
                  const quantity = showtable === "netpositions" ? item?.LotsQty : item.Quantity;

                  return (
                    <tr key={index.toString()}>
                      <td style={{ paddingLeft: "20px" }}>{index + 1}</td>
                      <td>{clientId}</td>
                      <td
                        style={{
                          color: item?.OrderSide === "SELL" ? "red" : "green",
                        }}
                      >
                        {item?.OrderSide}
                      </td>
                      {showtable === "netpositions" && <td>{item?.LotSize}</td>}
                      <td>{item?.Symbol}</td>
                      <td>
                        <input
                          type="number"
                          style={{
                            border: `0.5px solid #4680C2`,
                            borderRadius: "3px",
                            padding: "5px 25px 5px 5px",
                            width: "100px",
                          }}
                          value={quantity}
                          name="LotsQty"
                          onChange={(e) => onInputFieldHandler(e, false, index)}
                          placeholder="Qty"
                        />
                      </td>
                      {showtable === "holdings" &&
                        <>
                          <td>
                            <input
                              type="number"
                              style={{
                                border: `0.5px solid #4680C2`,
                                borderRadius: "3px",
                                padding: "5px 25px 5px 5px",
                                width: "100px",
                              }}
                              value={item["LimitPrice"]}
                              name="LimitPrice"
                              onChange={(e) => onInputFieldHandler(e, false, index)}
                              placeholder="limit price"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              style={{
                                border: `0.5px solid #4680C2`,
                                borderRadius: "3px",
                                padding: "5px 25px 5px 5px",
                                width: "100px",
                              }}
                              value={item["SLTriggerPrice"]}
                              name="SLTriggerPrice"
                              onChange={(e) => onInputFieldHandler(e, false, index)}
                              placeholder="Trigger price"
                            />
                          </td>
                        </>
                      }
                      {/* <td>
                      <input
                        type="number"
                        style={{
                          border: `0.5px solid #4680C2`,
                          borderRadius: "3px",
                          padding: "5px 25px 5px 5px",
                          width: "100px",
                        }}
                        value={item["Trig Price"]}
                        name="Trig Price"
                        onChange={(e) => onChangeHandler(e, item?.rowIndex)}
                        placeholder="Trigger price"
                      />
                    </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Row>
        )}
        {errorQtyMsg && (
          <small
            style={{
              color: "red",
              textAlign: "right",
              marginTop: "10px",
              letterSpacing: "0.3px",
            }}
          >
            {errorQtyMsg}
          </small>
        )}
      </Modal.Body>
      <Modal.Footer
        css={{
          justifyContent: "right",
          width: "97.5%",
          paddingTop: "$0",
          paddingBottom: "$3",
          marginBottom: "$5",
        }}
      >
        <Button
          className={`secondary-button border-radius-8`}
          auto
          flat
          onPress={closeHandler}
        >
          Cancel
        </Button>
        <Button
          className={`${isDisabled || errorQtyMsg !== "" ? `` : `primary-button`} border-radius-8`}
          disabled={isDisabled || errorQtyMsg !== ""}
          type="submit"
          auto
          flat
          style={{ cursor: isDisabled || errorQtyMsg !== "" ? "not-allowed" : "pointer" }}
          onPress={() => setIsOpen(true)}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal >
  );
}
