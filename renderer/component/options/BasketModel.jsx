import { Button, Modal, Row, Text, Radio } from "@nextui-org/react";
import { useEffect, useState } from "react";
import classes from "./BasketModel.module.css";
import { useGlobalContext } from "../../context/GlobalContext";
const BasketModel = ({ basketBuy, setBasketBuy }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const { basketData, setAddToCart } = useGlobalContext();
  const closeHandler = () => {
    setBasketBuy(false);
    setSelectedOption("");
  };
  const handlerAddToCart = () => {
    if (selectedOption === "Buy" || selectedOption === "Sell") {
      setAddToCart((prevCart) => [...prevCart, basketData]);
    }
  };
  useEffect(() => {
    handlerAddToCart();
  }, [basketData, selectedOption]);
  return (
    <div>
      <Modal
        aria-labelledby="modal-title"
        open={basketBuy}
        preventClose
        css={{ width: "60%" }}
      >
        <Modal.Body>
          <Row>
            {/* <img
              src="./images/VectorCart.png"
              style={{
                width: "2.5rem",
                height: "2rem",
              }}
            /> */}
            <Text
              h4
              size={"$md"}
              css={{
                fontFamily: "$sans",
                marginTop: "6px",
                marginLeft: "4px",
              }}
            >
              Basket
            </Text>{" "}
          </Row>

          <Row justify="center">
            <Radio.Group
              css={{ pr: "55px", paddingLeft: "5px" }}
              value={selectedOption}
              orientation="horizontal"
              color="secondary"
              onChange={setSelectedOption}
            >
              <Radio
                value="Buy"
                className={classes.radio}
                css={{
                  label: {
                    backgroundColor:
                      selectedOption === "Buy" ? "green" : "green",
                    color: selectedOption === "Buy" ? "white" : "green",
                  },
                }}
              >
                <Text
                  size={"$md"}
                  css={{
                    mt: "$.5",
                    fontSize: "12px",
                    fontWeight: "500",
                    lineHeight: "18px",
                  }}
                >
                  <span>Buy</span>
                </Text>
              </Radio>
              <Radio
                value="Sell"
                className={classes.radio}
                css={{
                  pr: "$8",
                  label: {
                    backgroundColor:
                      selectedOption === "Sell" ? "red" : "transparent",
                    color: selectedOption === "Sell" ? "white" : "red",
                  },
                }}
              >
                <Text
                  size={"$md"}
                  css={{
                    mt: "$.5",
                    fontSize: "12px",
                    fontWeight: "500",
                    lineHeight: "18px",
                  }}
                >
                  <span>Sell</span>
                </Text>
              </Radio>
            </Radio.Group>
          </Row>
          <Row justify="center">
            <Button auto flat color="error" onPress={closeHandler}>
              Close
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BasketModel;
