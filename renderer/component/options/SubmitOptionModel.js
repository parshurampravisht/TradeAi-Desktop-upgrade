import { Button, Modal, Row, Spacer, Text, Col } from "@nextui-org/react";
import classes from "../../component/options/BasketModel.module.css";
const SubmitOptionModel = ({
  modelOption,
  setModelOption,
  bankdata,
  dataItem,
  BuyData,
  ProductType,
  handleSubmit,
  processRef,
}) => {
  const closeHandler = () => {
    setModelOption(false);
  };

  const orderType = () => {
    if (dataItem.sl_price > 0 && dataItem.price > 0) {
      return "STOPLIMIT";
    } else if (dataItem.sl_price == 0 && dataItem.price > 0) {
      return "LIMIT";
    } else if (dataItem.sl_price > 0 && dataItem.price == 0) {
      return "STOPMARKET";
    } else {
      return "MARKET";
    }
  };
  return (
    <div>
      <Modal aria-labelledby="modal-title" open={modelOption} preventClose>
        <Modal.Body
          style={{ backgroundColor: BuyData === "Buy" ? "#F1FBF6" : "#FFF6F6" }}
        >
          <Row justify="center">
            <Text b h5>
              Confirmation
            </Text>
          </Row>
          <Row>
            <Col>
              <Text
                h4
                size={"$md"}
                css={{ fontFamily: "$sans" }}
                className={classes.BasketModeldata}
              >
                {bankdata}
              </Text>
              <table className={classes.table3}>
                <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      Order Side:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    {" "}
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      <span
                        style={{ color: BuyData !== "Buy" ? "red" : "green" }}
                      >
                        {" "}
                        {BuyData === "Buy" ? "Buy" : "Sell"}
                      </span>
                    </Text>
                  </td>
                </tr>
                <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      Exchange:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      {dataItem?.exch}
                    </Text>
                  </td>
                </tr>
                <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      Limit Price:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      {dataItem?.price}
                    </Text>
                  </td>
                </tr>
                <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      SL TriggerPrice:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      {dataItem?.sl_price}
                    </Text>
                  </td>
                </tr>
                {/* <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      Exchange:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      {dataItem?.exch}
                    </Text>
                  </td>
                </tr> */}
                <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      Product Type:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      {ProductType == "NRML" ? "DELIVERY" : "INTRADAY"}
                    </Text>
                  </td>
                </tr>

                <tr className={classes.tr4}>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      Order Type:
                    </Text>
                  </td>
                  <td className={classes.td4}>
                    <Text
                      h4
                      size={"$md"}
                      css={{ fontFamily: "$sans" }}
                      className={classes.BasketModeldata}
                    >
                      {orderType()}
                    </Text>
                  </td>
                </tr>
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
                processRef.current ? "disable-button" : "primary-button"
              } border-radius-8"`}
              disabled={processRef.current}
              flat
              color="error"
              css={{
                background: "$blue600",
                color: "#FFF",
                width: "7rem",
              }}
              onPress={() => {
                handleSubmit();
              }}
            >
              Place Order
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SubmitOptionModel;
