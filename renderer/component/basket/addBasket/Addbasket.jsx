import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Col,
  Row,
  Text,
  Input,
  Radio,
  Spacer,
  Button,
} from "@nextui-org/react";
import { addBasket } from "../../../../services/transactions/transactions.service";
import { useGlobalContext } from "../../../context/GlobalContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Store = require("electron-store");

export default function AddBasket(props) {
  const {
    clients,
    loginData,
    setLoginData,
    user,
    equityBasketType,
    setEquityBasketType,
  } = useGlobalContext();

  const [Weightage, setWeightage] = useState("Equal");
  const [errorMessage, setErrorMessage] = useState("");
  const [weightageActive, setWeightageActive] = useState(false);
  const [value, setValue] = useState(null);
  const [inputToggle, setInputToggle] = useState(false); // by default false for Equal weightage
  const [active, setActive] = useState(false); // Set to false initially
  const [isTouched, setIsTouched] = useState(false);

  const [isBasketNameError, setBasketNameError] = useState(false);
  const [isMarginError, setMarginError] = useState(false);
  const [isWeightageError, setWeightageError] = useState(false);

  const store = new Store();
  const basketNameRef = useRef("");
  const marginRef = useRef("");

  const handleClose = async (action) => {
    // props.setToggle(false);
    setActive(true); // Reset active state when closing the modal
    // setIsTouched(false);
    props.setSelectedSymbols([]);
    setBasketNameError(false);
    setMarginError(false);
    setWeightageError(false);
    setWeightage("Equal");
    props.setSymbolTable([]);

    if (action === "create") {
      if (!handleValidation()) {
        props.basketDetailsRef.current["name"] = basketNameRef.current.value;
        props.basketDetailsRef.current["type"] = Weightage;
        props.basketDetailsRef.current["value"] = parseInt(value);
        props.basketDetailsRef.current["margin"] = parseInt(
          marginRef.current.value
        );

        let payload = {
          // status:"draft",
          name: props.basketDetailsRef.current["name"],
          weightage: props.basketDetailsRef.current["value"],
          weightage_type: props.basketDetailsRef.current["type"],
          used_margin: props.basketDetailsRef.current["margin"],
          created_by:
            store.get("logedInUserData").firstname +
            " " +
            store.get("logedInUserData").lastname,
          modified_by:
            store.get("logedInUserData").firstname +
            " " +
            store.get("logedInUserData").lastname,
          type: "cashAndEquity",
          status: "draft",
          basket_type: equityBasketType,
        };
        try {
          const res = await addBasket(payload);

          props.basketDetailsRef.current["basket_id"] = res?.data?.id;
          setEquityBasketType(res?.data?.basket_type);

          toast.success("Basket Added");
          props.setCurrentState("addStocks");
          props.setToggle(false);
        } catch (error) {
          console.log("basket save error", error);
        }
      }
    }
    if (action === "close") {
      props.setToggle(false);
    }
    setActive(false);
    // setErrorMessage("");
    // setValue("");
  };

  const handleTouch = () => {
    setIsTouched(true);
  };
  useEffect(() => {
    if (Weightage === "Custom") {
      setInputToggle(true);
    } else {
      setInputToggle(false);
    }
  }, [Weightage]);

  const handleValue = (e) => {
    if (Weightage === "Equal") {
      const inputValue = e.target.value;
      setValue(inputValue);

      /*  const regexPattern = /^(100(\.0{1,2})?|(\d(\.\d{1,2})?|[1-9]\d?))$/;
      const Valid = regexPattern.test(inputValue);
      

      if (!Valid) {
        setWeightageActive(true);

        setErrorMessage("please enter the value in range(1-100)");
      } else if (inputValue.length === 0) {
        setWeightageActive(false);
      } else {
        setValue(inputValue);
        setWeightageActive(false);
      } */
    }
  };

  const handleValidation = () => {
    let haveError = false;
    const basketInputLength = basketNameRef.current.value.trim().length; // Trim leading/trailing whitespace
    const marginInput = marginRef.current.value;

    const regexPattern = /^(100(\.0{1,2})?|(\d(\.\d{1,2})?|[1-9]\d?))$/;

    const isValidMargin =
      equityBasketType === "SELL" ? true : regexPattern.test(marginInput);
    if (basketInputLength === 0) {
      haveError = true;
      setBasketNameError(true);
    }
    if (!isValidMargin) {
      haveError = true;
      setMarginError(true);
    }
    if (Weightage === "Equal") {
      const isValidWeightage =
        equityBasketType === "SELL" ? true : regexPattern.test(value);
      if (!isValidWeightage) {
        haveError = true;
        setWeightageError(true);
      }
    }
    if (Weightage === "Custom") {
      if (value) {
        const isValidWeightage = regexPattern.test(value);
        if (!isValidWeightage) {
          haveError = true;
          setWeightageError(true);
        }
      }
    }
    return haveError;
  };

  return (
    <Modal
      open={props.toggle}
      onClose={() => handleClose("close")}
      css={{ width: "max-content" }}
    >
      <Modal.Header>
        <Row justify="left">
          <Text h3 css={{ mt: "$5" }}>
            Create Basket
          </Text>
        </Row>
      </Modal.Header>
      <Spacer y={-1} />
      <Modal.Body>
        <Row>
          <Col>
            <Text h5>Basket Name</Text>
            <Input
              ref={basketNameRef}
              onChange={() => setBasketNameError(false)}
              // onFocus={handleTouch}
              bordered
              borderWeight="light"
              color="default"
              fullWidth
              css={{ background: "$gray600", borderColor: "$blue700" }}
            />
            {isBasketNameError && (
              <p style={{ color: "red" }}>
                Please enter the name for the basket
              </p>
            )}
          </Col>
        </Row>
        <Spacer y={-1} />
        <Text style={{ marginBottom: "4px" }} h5>
          Basket Type
        </Text>
        <Radio.Group
          defaultValue={equityBasketType}
          onChange={setEquityBasketType}
        >
          <Row>
            <Radio
              value="BUY"
              color="secondary"
              size="sm"
              css={{ color: "#2C2C2C" }}
            >
              Buy
            </Radio>
            <Spacer x={1} />
            <Col>
              <Radio
                value="SELL"
                color="secondary"
                size="sm"
                css={{ color: "#2C2C2C" }}
              >
                Sell
              </Radio>
            </Col>
          </Row>
        </Radio.Group>

        <Col>
          <Text
            className={equityBasketType === "SELL" ? `disable-text-color` : ``}
            h5
          >
            Margin to be used (% of Cash + Holdings)
          </Text>
          <Spacer y={0.4} />
          <Input
            disabled={equityBasketType === "SELL"}
            bordered
            borderWeight="light"
            fullWidth
            ref={marginRef}
            onChange={() => setMarginError(false)}
            onBlur={handleTouch}
            labelRight="%"
            type="number"
          />
          {isMarginError && (
            <p style={{ color: "red" }}>Please enter a valid margin</p>
          )}
          <Spacer y={0.4} />
          <Text
            className={equityBasketType === "SELL" ? `disable-text-color` : ``}
            style={{ marginBottom: "4px" }}
            h5
          >
            Weightage
          </Text>
          <Radio.Group defaultValue={Weightage} onChange={setWeightage}>
            <Row>
              <Radio
                value="Custom"
                color="secondary"
                size="sm"
                className={
                  equityBasketType === "SELL" ? `disable-text-color` : `black-text-color`
                }
              >
                Custom
              </Radio>
              <Spacer x={2} />
              <Col>
                <Radio
                  value="Equal"
                  color="secondary"
                  size="sm"
                  className={
                    equityBasketType === "SELL" ? `disable-text-color` : `black-text-color`
                  }
                >
                  Equal
                </Radio>
              </Col>

              <Col css={{ mb: "$1" }}>
                <Input
                  disabled={inputToggle || equityBasketType === "SELL"}
                  bordered
                  borderWeight="light"
                  // onFocus={handleTouch}
                  defaultValue={value}
                  onChange={handleValue}
                  labelRight="%"
                  type="number"
                />
              </Col>
            </Row>
            {isWeightageError ? (
              <p style={{ color: "red" }}>
                {"Please enter the value in range(1-100)"}
              </p>
            ) : (
              ""
            )}
          </Radio.Group>
        </Col>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="secondary-button border-radius-8"
          auto
          bordered
          flat
          css={{
            width: "120px",
          }}
          onClick={() => {
            handleClose("close");
            setEquityBasketType("BUY");
          }}
        >
          Cancel
        </Button>
        <Button
          className="primary-button border-radius-8"
          auto
          bordered
          disabled={active}
          flat
          css={{ width: "120px" }}
          onClick={() => handleClose("create")}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
