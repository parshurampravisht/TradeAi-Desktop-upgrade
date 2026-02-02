import { useState, useEffect, useRef } from "react";
import { Modal, Image, Tooltip, Button, Row } from "@nextui-org/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classes from "../../../component/options/BasketModel.module.css";
import { useGlobalContext } from "../../../context/GlobalContext";
import {
  brokerLogoFormatHandler,
  orderTypeFormat,
  productType,
  variety_type,
} from "../../../constant/constant";
import { modifyOrder } from "../../../../services/transactions/transactions.service";
import CustomToolTip from "../../../layout/CustomToolTip";
import CommonConfirmationModal from "../../common/CommonConfirmationModal";

const initialState = {
  Lots_Qty: "",
  ["Limit Price"]: "",
  ["Trig Price"]: "",
};

export default function MultipleModifyOrderModal(props) {
  const { toggle, setToggle } = props;

  const {
    modifyOrderData,
    setCancelOrderData,
    setModifyOrderData,
    setRefreshTokenTable,
  } = useGlobalContext();

  const [isDisabledInput, setIsDisableInput] = useState(true);
  const [modifyInputField, setModifyInputField] = useState(initialState);
  const [isOpen, setIsOpen] = useState(false);
  const processRef = useRef(false);

  useEffect(() => {
    const firstSymbol = modifyOrderData[0]?.Symbol?.toUpperCase()?.replace(
      /-/g,
      ""
    ); // Take the first symbol
    const isDisabled = modifyOrderData.every(
      (item) => item.Symbol.toUpperCase()?.replace(/-/g, "") === firstSymbol
    );
    setIsDisableInput(!isDisabled);
  }, [modifyOrderData]);

  const modifyOrderCall = async (data) => {
    const apiBody = {};
    const updatedOrderType =
      data["Limit Price"] === 0 && data["Trig Price"] === 0
        ? "MARKET"
        : data["Limit Price"] > 0 && data["Trig Price"] === 0
          ? "LIMIT"
          : data["Limit Price"] === 0 && data["Trig Price"] > 0
            ? "STOPMARKET"
            : orderTypeFormat[data.OrderType?.toUpperCase()] ||
            data.OrderType?.toUpperCase();
    apiBody[data.ClientID] = {
      BrokerOrderId: data.ID,
      UniqueIdentifier: data.OrderUniqueIdentifier,
      ProductType:
        data["Broker"] === "IIFL" ? data.ProductType : data.ProductType,
      // : productType[data.ProductType],
      // data["Broker"] === "IIFL" && data["ProductType"] === "DELIVERY"
      //   ? "CNC" // iifl condition CNC is temporary that should be changes backend in future.
      //   : productType[data.ProductType],
      OrderType: updatedOrderType,
      OrderQuantity: +data["Lots_Qty"],
      // OrderQuantity: +data.Qty,
      DisclosedQuantity: +data.OrderDisclosedQuantity,
      LimitPrice: +data["Limit Price"],
      LastUpdateDateTime: data["LastUpdateDateTime"],
      TradedQuantity: data["Broker"] === "MOSWAL" ? 0 : +data["Qty"],
      SLTriggerPrice: +data["Trig Price"],
      TimeInForce: data["TimeInForce"]?.toUpperCase(),
      Exchange: data["ExchangeSegment"],
      LotSize: data["LotSize"] || 1,
      TradedSymbol: data["Symbol"] || "",
      ExchangeInstrumentID: +data["ExchangeInstrumentID"] || "",
      Variety:
        data["Variety"] &&
          ["STOPLIMIT", "STOPMARKET"].includes(updatedOrderType)
          ? "STOPLOSS"
          : variety_type[data["Variety"]] ?? data["Variety"] ?? "NORMAL",
      // Scripcode: data["ExchangeInstrumentID"],
    };

    try {
      let res = await modifyOrder(apiBody);
    } catch (error) {
      console.log("multiple modify order error", error);
    }
  };

  const submitHandler = async () => {
    if (processRef.current) return;

    processRef.current = true;
    ///----- it's need to change in api payload array of object from backend, instead  api calling in loop --- //
    for (const items of modifyOrderData) {
      await modifyOrderCall(items);
    }
    setModifyOrderData([]);
    setCancelOrderData([]);
    setModifyInputField(initialState);
    setRefreshTokenTable(Math.random());
    setToggle(false);
    setIsOpen(false)
    processRef.current = false;
    toast.success(`Order is Modified`);
  };

  const closeHandler = () => {
    setToggle(false);
    setModifyInputField(initialState);
    setModifyOrderData([]);
  };

  const onChangeHandler = (e, rowId) => {
    const { name, value } = e.target;
    setModifyOrderData((prev) =>
      prev.map((item) =>
        item?.rowIndex === rowId ? { ...item, [name]: value } : item
      )
    );
  };

  const onInputFieldHandler = (e) => {
    const { name, value } = e.target;
    setModifyInputField((prev) => ({ ...prev, [name]: value }));
    setModifyOrderData((prev) =>
      prev.map((item) => ({ ...item, [name]: value }))
    );
  };

  return (
    <>
      <Modal
        style={{
          padding: "20px",
          zIndex: 99,
        }}
        className="modify-multiple-order-modal"
        preventClose
        open={toggle}
        width="1000px"
        blur
      >
        <CommonConfirmationModal
          isOpen={isOpen}
          handleClose={() => setIsOpen(false)}
          handleConfirm={submitHandler}
        />
        <Modal.Header
          className="justify-start"
          style={{
            textAlign: "left",
            fontSize: "24px",
            padding: "0 0 10px 0",
            fontWeight: 500,
          }}
        >
          Multiple Modify Order
        </Modal.Header>
        <Modal.Body>
          <Row className="" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table
              className={classes.table1}
              style={{ color: "#838383", fontSize: "12px" }}
            >
              <thead
                className={"position-sticky top-0"}
                style={{ height: "40px", zIndex: 999 }}
              >
                <tr>
                  <th className={classes.th1}>Broker</th>
                  <th className={classes.th1}>Client ID</th>
                  <th className={classes.th1} style={{ width: "12rem" }}>
                    Client Name
                  </th>
                  <th className={classes.th1}>Symbol Name</th>
                  <th className={classes.th1}>Quantity</th>
                  <th className={classes.th1}>Limit Price</th>
                  <th className={classes.th1}>Trigger Price</th>
                </tr>
              </thead>
              <tbody className={`table-body`}>
                <tr
                  style={{
                    backgroundColor: "#4680C233",
                    padding: "5px 0px",
                    height: "40px",
                  }}
                >
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
                      value={modifyInputField.Lots_Qty}
                      name="Lots_Qty"
                      onChange={onInputFieldHandler}
                      disabled={isDisabledInput}
                      placeholder="Qty"
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "60px",
                      }}
                      className="position-absolute cursor-pointer"
                    >
                      <CustomToolTip
                        toolTipText={`Enter the quantity to update all rows with the same symbol.`}
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
                      }}
                      value={modifyInputField["Limit Price"]}
                      name="Limit Price"
                      onChange={onInputFieldHandler}
                      disabled={isDisabledInput}
                      placeholder="Limit price"
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "60px",
                      }}
                      className="position-absolute cursor-pointer"
                    >
                      <CustomToolTip
                        toolTipText={`Enter the limit price to update all rows with the same symbol.`}
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
                      }}
                      value={modifyInputField["Trig Price"]}
                      name="Trig Price"
                      onChange={onInputFieldHandler}
                      disabled={isDisabledInput}
                      placeholder="Trigger price"
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "60px",
                      }}
                      className="position-absolute cursor-pointer"
                    >
                      <CustomToolTip
                        toolTipText={`Enter the Trig price to update all rows`}
                        position={"left"}
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
                </tr>
                {modifyOrderData.map((item) => {
                  const brokerLowerCase = item?.Broker?.toLowerCase();
                  return (
                    <tr key={item?.rowIndex}>
                      <td className={`broker-image-wrapper`}>
                        <Image
                          style={{ margin: "0px" }}
                          src={brokerLogoFormatHandler(brokerLowerCase)}
                          width={20}
                          height={20}
                          alt={item.label}
                        />
                      </td>
                      <td>{item?.ClientID}</td>
                      <td>{item?.ClientName}</td>
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
                          value={item?.Lots_Qty}
                          name="Lots_Qty"
                          onChange={(e) => onChangeHandler(e, item?.rowIndex)}
                          placeholder="Qty"
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
                          value={item["Limit Price"]}
                          name="Limit Price"
                          onChange={(e) => onChangeHandler(e, item?.rowIndex)}
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
                          value={item["Trig Price"]}
                          name="Trig Price"
                          onChange={(e) => onChangeHandler(e, item?.rowIndex)}
                          placeholder="Trigger price"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Row>
        </Modal.Body>
        <Modal.Footer
          css={{
            justifyContent: "right",
            width: "100%",
            paddingTop: "$0",
            paddingBottom: "$3",
            marginBottom: "$5",
          }}
        >
          <Button
            className={`secondary-button border-radius-8`}
            auto
            flat
            onClick={() => {
              closeHandler();
            }}
          >
            Cancel
          </Button>
          <Button
            className={`${processRef.current ? `` : `primary-button`
              } border-radius-8`}
            disabled={processRef.current}
            type="submit"
            auto
            flat
            // onClick={submitHandler}
            onPress={() => setIsOpen(true)}
          >
            Modify Place Order
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
