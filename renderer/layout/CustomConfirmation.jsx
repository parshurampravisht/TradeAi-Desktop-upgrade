import { Button, Modal, Row, Text, Col } from "@nextui-org/react";
import classes from "../component/options/BasketModel.module.css";
import {
  fullConversionOrderType,
  shortProductType,
} from "../constant/constant";

const labelData = [
  {
    labelHeader: `Order Side`,
    value: `BuySell`,
  },
  {
    labelHeader: `Symbol`,
    value: `sym`,
  },
  {
    labelHeader: `Exchange`,
    value: `Exchange`,
  },
  {
    labelHeader: `Limit Price`,
    value: `price`,
  },
  {
    labelHeader: `SL TriggerPrice`,
    value: `sl_price`,
  },
  {
    labelHeader: `Order Type`,
    value: `orderType`,
  },
  {
    labelHeader: `Product Type`,
    value: `productType`,
  },
];

function CustomConfirmationModel({
  submitHandler,
  closeHandler,
  confirmationToggle,
  orderData,
  isDisabledSubmit,
}) {
  return (
    <div>
      <Modal
        aria-labelledby="modal-title"
        open={confirmationToggle}
        preventClose
      >
        <Modal.Body
          style={{
            backgroundColor: orderData?.BuySell === "B" ? "#F1FBF6" : "#FFF6F6",
          }}
        >
          <Row justify="center">
            <Text b h5>
              Confirmation
            </Text>
          </Row>
          <Row>
            <Col>
              <table className={classes.table3}>
                {labelData.map((item, ind) => {
                  const labelValue = orderData[item.value];
                  return (
                    <tr key={ind.toString()} className={classes.tr4}>
                      <td className={classes.td4}>
                        <Text
                          h4
                          size={"$md"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.BasketModeldata}
                        >
                          {item.labelHeader}:
                        </Text>
                      </td>
                      <td className={classes.td4}>
                        <Text
                          h4
                          size={"$md"}
                          css={{ fontFamily: "$sans" }}
                          className={classes.BasketModeldata}
                        >
                          {["B", "S"].includes(labelValue) ? (
                            <span
                              style={{
                                color: labelValue === "B" ? "green" : "red",
                              }}
                            >
                              {labelValue === "B" ? "Buy" : "Sell"}
                            </span>
                          ) : item.value === `productType` ? (
                            shortProductType[labelValue]
                          ) : item.value === `orderType` ? (
                            fullConversionOrderType[labelValue]
                          ) : (
                            labelValue
                          )}
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </table>
            </Col>
          </Row>
          <div className={classes.SqaureCss}>
            <Button
              auto
              flat
              onPress={closeHandler}
              style={{ padding: "0px 35px" }}
              color="default"
              className="secondary-button border-radius-8"
            >
              Cancel
            </Button>
            <Button
              auto
              className={`${
                isDisabledSubmit ? `disable-button` : `primary-button`
              }  border-radius-8`}
              flat
              style={{ cursor: isDisabledSubmit ? "not-allowed" : "pointer" }}
              css={{
                width: "7rem",
              }}
              onPress={submitHandler}
            >
              Place Order
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default CustomConfirmationModel;
