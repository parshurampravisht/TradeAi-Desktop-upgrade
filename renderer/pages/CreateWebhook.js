import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  Row,
  Col,
  Text,
  Radio,
  Switch,
} from "@nextui-org/react";
import classes from "./CreateWebhook.module.css";
import WebhookClient from "./WebhookClient";
import { CreateWebHookDetail } from "../../services/transactions/transactions.service";
import { useGlobalContext } from "../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { environment } from "../../environments/environment";

const initialDisableState = {
  webhookTitle: true,
  orderSide: true,
  // orderType: true,
  productType: true,
  // price: true,
  webHookUrl: true,
  clientDetails: true,
};
const CreateWebhook = ({ openModel, setOpenModel, handleWebhookData }) => {
  const {
    initialArray,
    InputWebhook,
    setInputWebhook,
    setInitialArray,
    setGroupClientsData,
    groupInputWebhook,
    setGroupInputWebhook,
    selectedGroup,
    setSelectedGroup,
    groupClientsData,
    webhookGroupDefaultQuantity,
    setWebhookGroupDefaultQuantity,
  } = useGlobalContext();
  const [isChecked, setChecked] = useState(false);
  const [tabBasket, setTabBasket] = useState(false);
  const [selectTab, setSelectTab] = useState(false);
  const [inputTextData, setinputTextData] = useState(
    `${environment.webhookBaseUrl}/websocket/tradeView-data`
  );
  const [copyMessage, setCopyMessage] = useState("");
  const [isJsonCopied, setIsJsonCopied] = useState(false);
  const [reGenerateMessage, setReGenerateMessage] = useState("");
  const inputRef = useRef(null);
  const processRef = useRef(false);

  const crypto = require("crypto");
  const [numberToEncrypt, setNumberToEncrypt] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [WebHookName, setWebHookName] = useState("");
  const [orderside, setOrderside] = useState("");
  const [ordertype, setOrderType] = useState("");
  const [ProductType, setProductType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [Price, setPrice] = useState("");
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] =
    useState(initialDisableState);

  useEffect(() => {
    setIsSaveButtonDisabled({
      webhookTitle: WebHookName?.trim() ? false : true,
      orderSide: orderside ? false : true,
      // orderType: ordertype ? false : true,
      productType: ProductType ? false : true,
      // price:
      //   ordertype === "MARKET"
      //     ? false
      //     : ordertype === "LIMIT" && +Price && Price >= 0
      //     ? false
      //     : true,
      webHookUrl: inputTextData?.trim() ? false : true,
      clientDetails: (selectTab === false ? initialArray : groupClientsData)
        .length
        ? false
        : true,
    });
  }, [
    WebHookName,
    orderside,
    // ordertype,
    ProductType,
    // Price,
    initialArray,
    inputTextData,
    groupClientsData,
    selectTab,
  ]);

  const isDisabled =
    isSaveButtonDisabled.orderSide ||
    // isSaveButtonDisabled.orderType ||
    // isSaveButtonDisabled.price ||
    isSaveButtonDisabled.productType ||
    isSaveButtonDisabled.webHookUrl ||
    isSaveButtonDisabled.webhookTitle ||
    isSaveButtonDisabled.clientDetails;

  const [webhookJson, setwebHookJson] = useState({
    // strategy_name: "{{ticker}}",
    exchange: "{{exchange}}",
    symbol: "{{ticker}}",
    order_side: orderside || "BUY",
    // order_side: orderside === "SELL" ? "SE" : "LE",
    // type: ordertype === "MARKET" ? "market" : "limit",
    product_type: ProductType === "MIS" ? "intraday" : "delivery",
    quantity: 0,
    // validity: "2 Week",
  });

  const closeHandler = () => {
    setOpenModel(false);
    setProductType("");
    setOrderType("");
    setOrderside("");
    setPrice("");
    setWebHookName("");
    setInputWebhook([]);
    setWebhookGroupDefaultQuantity(1);
    setIsSaveButtonDisabled(initialDisableState);
    setSelectedGroup([]);
    setInitialArray([]);
    setSelectTab(false);
    setGroupClientsData([]);
    setGroupInputWebhook([]);
  };

  const updateWebhookJson = () => {
    setwebHookJson((prevJson) => ({
      ...prevJson,
      order_side: orderside || "BUY",
      // type: ordertype === "MARKET" ? "market" : "limit",
      product_type: ProductType === "MIS" ? "intraday" : "delivery",
    }));
  };

  useEffect(() => {
    updateWebhookJson();
  }, [ordertype, ProductType, orderside]);

  const handleInputChange = (e) => {
    setinputTextData(e.target.value);
  };
  const handleCopyURL = () => {
    const inputField = document.getElementById("inputTextData");
    inputField.select();
    document.execCommand("copy");
    setCopyMessage("Copied!");
    setTimeout(() => setCopyMessage(""), 2000);
  };

  // const handleCopyURL = () => {
  //   const inputField = inputRef.current;
  //   navigator.clipboard
  //     .writeText(inputField.value)
  //     .then(() => {
  //       setCopyMessage("Copied!");
  //       setTimeout(() => setCopyMessage(""), 2000);
  //     })
  //     .catch((err) => {
  //       console.error("Could not copy text: ", err);
  //     });
  // };

  useEffect(() => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const userId = localStorage.getItem("user_id");
    let concatenatedString = timestamp + userId;
    setNumberToEncrypt(concatenatedString);
    setSecretKey(userId);
  }, []);

  function hashData(data) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  const EncrpytHandler = () => {
    const userId = localStorage.getItem("user_id");
    const dataToHash = {
      id: userId,
      date: new Date().toISOString(),
    };
    const hashedValue = hashData(dataToHash);
    setNumberToEncrypt(hashedValue.slice(0, 12));
    setReGenerateMessage("Regenerated!");
    setTimeout(() => setReGenerateMessage(""), 2000);
  };

  useEffect(() => {
    EncrpytHandler();
  }, []);

  const createWebhookHandler = async () => {
    if (processRef.current) return;
    processRef.current = true;
    const newArrayWithoutLabel = (
      selectTab === false ? initialArray : groupClientsData
    )?.map((obj, index) => {
      const { label, value, status, ...rest } = obj;
      return {
        ...rest,
        quantity:
          Number(
            selectTab === false ? InputWebhook[index] : groupInputWebhook[index]
          ) || 1,
      };
    });
    const payload = {
      webhook_title: WebHookName,
      order_side: orderside,
      order_type: "MARKET",
      product_type: ProductType,
      // limit_price: ordertype === "LIMIT" ? Price : 0,
      order_validity: 7,
      webhook_unique_code: numberToEncrypt,
      clients: newArrayWithoutLabel,
      group_name: selectTab === false ? "" : selectedGroup[0] || "",
      is_active: isActive,
    };

    try {
      const res = await CreateWebHookDetail(payload);
      processRef.current = false;
      toast.success(res?.message);
      setOpenModel(false);
      setInputWebhook([]);
      setGroupClientsData([]);
      setGroupInputWebhook([]);
      setWebhookGroupDefaultQuantity(1);
      setSelectedGroup([]);
      setPrice("");
      setWebHookName("");
      setInitialArray([]);
      setProductType("");
      setOrderType("");
      setOrderside("");
      setSelectTab(false);
      setIsSaveButtonDisabled(initialDisableState);
      handleWebhookData();
      EncrpytHandler();

      if (
        res?.message ===
        "Webhook details and associated clients saved successfully."
      ) {
        const userId = localStorage.getItem("user_id");
        const payloaddata = {
          user_id: userId,
          unique_code: numberToEncrypt,
        };
        const response = await axios.post(
          `${environment.webhookBaseUrl}/websocket/webhookMaster-data/`,
          payloaddata
        );
        return response;
      }
    } catch (error) {
      console.log("webhook saving error", error);
    } finally {
      process.current = false;
    }
  };
  const formatJson = (json) => {
    return JSON.stringify(json, null, 2);
  };

  const handleCopy = () => {
    const formattedJson = formatJson(webhookJson);
    navigator.clipboard
      .writeText(formattedJson)
      .then(() => {
        setIsJsonCopied(true);
        // toast.success("JSON copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const handlerStatus = (e) => {
    setIsActive(e.target.checked);
  };

  useEffect(() => {
    let timeout;
    if (isJsonCopied) {
      timeout = setTimeout(() => setIsJsonCopied(false), 2000);
    }
    return () => clearTimeout(timeout); // Cleanup timeout
  }, [isJsonCopied]);

  return (
    <div className="modal-parent-container">
      <style>{`
          .nextui-c-grJsex-ikUaMfZ-css {
            max-width: 55rem !important;
          }
        `}</style>
      <Modal
        aria-labelledby="modal-title"
        open={openModel}
        preventClose
        className={`position-relative`}
        css={{ zIndex: "999" }}
      >
        <Modal.Body>
          <Row>
            <Col>
              <Text
                className="primary-text-color"
                h5
                css={{ fontWeight: "$bold" }}
              >
                Create WebHook
              </Text>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ marginTop: "10px" }}>
                  <Text h5 className={classes.TextCss}>
                    WebHook Name
                    <input
                      style={{ padding: "4px 10px" }}
                      type="text"
                      className={classes.inputText1}
                      placeholder="Enter name"
                      onChange={(e) => setWebHookName(e.target.value)}
                    />
                  </Text>
                  <div className={classes.ExpriryData}>
                    <div style={{ marginTop: "10px" }}>
                      <Text h5 className={classes.TextCss}>
                        Order Side
                      </Text>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <Radio.Group
                        css={{
                          pr: "55px",
                          paddingLeft: "5px",
                          marginLeft: "2.2rem",
                        }}
                        orientation="horizontal"
                        color="secondary"
                        value={orderside}
                        onChange={(val) => {
                          setOrderside(val);
                        }}
                      >
                        <Radio value="BUY" className={classes.radio}>
                          <Text
                            size={"$md"}
                            css={{
                              mt: "$.5",
                              fontSize: "12px",
                              fontWeight: "500",
                              lineHeight: "18px",
                              width: "40px",
                            }}
                          >
                            Buy
                          </Text>
                        </Radio>
                        <Radio
                          value="SELL"
                          css={{ pr: "$8" }}
                          className={classes.radio}
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
                            Sell
                          </Text>
                        </Radio>
                      </Radio.Group>
                    </div>
                  </div>

                  {/* 
                  <div className={classes.ExpriryData}>
                    <div style={{ marginTop: "10px" }}>
                      <Text h5 className={classes.TextCss}>
                        Order Type
                      </Text>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <Radio.Group
                        css={{
                          pr: "55px",
                          paddingLeft: "5px",
                          marginLeft: "2.2rem",
                        }}
                        orientation="horizontal"
                        color="secondary"
                        value={ordertype}
                        onChange={(val) => {
                          setOrderType(val);
                        }}
                      >
                        <Radio value="MARKET" className={classes.radio}>
                          <Text
                            size={"$md"}
                            css={{
                              mt: "$.5",
                              fontSize: "12px",
                              fontWeight: "500",
                              lineHeight: "18px",
                            }}
                          >
                            Market
                          </Text>
                        </Radio>
                        <Radio
                          value="LIMIT"
                          css={{ pr: "$8" }}
                          className={classes.radio}
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
                            Limit
                          </Text>
                        </Radio>
                      </Radio.Group>
                    </div> 
                  </div>
                    */}

                  <div className={classes.ExpriryData}>
                    <div style={{ marginTop: "8px" }}>
                      <Text h5 className={classes.TextCss}>
                        Product Type
                      </Text>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <Radio.Group
                        css={{
                          pr: "55px",
                          paddingLeft: "5px",
                          marginLeft: "1.4rem",
                        }}
                        orientation="horizontal"
                        color="secondary"
                        value={ProductType}
                        onChange={(val) => {
                          setProductType(val);
                        }}
                      >
                        <Radio value="NRML" className={classes.radio}>
                          <Text
                            size={"$md"}
                            css={{
                              mt: "$.5",
                              fontSize: "12px",
                              fontWeight: "500",
                              lineHeight: "18px",
                            }}
                          >
                            Delivery
                          </Text>
                        </Radio>
                        <Radio
                          value="MIS"
                          css={{ pr: "$8" }}
                          className={classes.radio}
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
                            Intraday
                          </Text>
                        </Radio>
                      </Radio.Group>
                    </div>
                  </div>

                  {/* <Text
                    h5
                    className={classes.TextCss}
                    style={{ marginTop: "10px" }}
                  >
                    Price
                    <input
                      type="number"
                      className={classes.inputText}
                      style={{
                        marginLeft: "5.2rem",
                        width: "14%",
                        marginTop: "10px",
                      }}
                      disabled={ordertype === "LIMIT" ? false : true}
                      onChange={(e) => setPrice(+e.target.value)}
                    />
                  </Text> */}
                  <div
                    className={classes.ExpriryData}
                    style={{ marginTop: "10px" }}
                  >
                    <div style={{ marginTop: "10px" }}>
                      <Text h5 className={classes.TextCss}>
                        WebHook URL
                      </Text>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <input
                        type="text"
                        className={classes.inputText}
                        value={`${inputTextData}/${numberToEncrypt}/`}
                        onChange={handleInputChange}
                        id="inputTextData"
                        // disabled
                      />
                    </div>
                    {/* <img src="./images/copy_url.svg" /> */}
                    <div style={{ position: "relative" }}>
                      {copyMessage && (
                        <span style={{ position: "absolute", top: "-20px" }}>
                          {copyMessage}
                        </span>
                      )}
                      <img
                        src="./images/copy_url.svg"
                        className={classes.CopyButton}
                        onClick={handleCopyURL}
                        style={{ marginTop: "10px" }}
                      />
                    </div>
                    {/* <button
                      className={classes.CopyButton}
                      onClick={handleCopyURL}
                      style={{ marginTop: "10px" }}
                    >
                      Copy URL
                    </button> */}
                    {/* <button
                      style={{ marginTop: "10px" }}
                      className={classes.GeerateButton}
                      onClick={() => EncrpytHandler()}
                    >
                      Generate New
                    </button> */}
                    <div style={{ position: "relative" }}>
                      {reGenerateMessage && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-20px",
                            right: "0px",
                          }}
                        >
                          {reGenerateMessage}
                        </span>
                      )}
                      <img
                        src="./images/refresh.svg"
                        style={{ marginTop: "10px" }}
                        className={classes.GeerateButton}
                        onClick={() => EncrpytHandler()}
                      />
                    </div>
                  </div>
                  <Row className="flex-row align-center justify-start column-gap-4-5rem">
                    <Text
                      h5
                      style={{ marginBottom: "0px" }}
                      className={classes.TextCss}
                    >
                      Status
                    </Text>
                    <Switch
                      checked={isActive}
                      onChange={handlerStatus}
                      defaultChecked
                    />
                  </Row>
                </div>

                <div className={`position-relative`}>
                  <div className={classes.jsoncontainer}>
                    <pre>{formatJson(webhookJson)}</pre>
                  </div>
                  <div
                    style={{ bottom: "0px", right: "5%", width: "100%" }}
                    className="position-absolute"
                  >
                    <img
                      src={
                        isJsonCopied
                          ? "./images/copied_icon.svg"
                          : "./images/copy.svg"
                      }
                      className={classes.CopyButtonJson}
                      onClick={handleCopy}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <WebhookClient selectTab={selectTab} setSelectTab={setSelectTab} />

          <Row justify="end">
            <Button
              className="secondary-button border-radius-8"
              auto
              flat
              color="error"
              onPress={closeHandler}
              css={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                color: "Black",
              }}
            >
              Cancel
            </Button>
            <Button
              className={`${
                isDisabled ? "" : "primary-button"
              } border-radius-8`}
              auto
              flat
              disabled={isDisabled}
              style={{ marginLeft: "15px" }}
              onClick={() => {
                createWebhookHandler();
              }}
            >
              Save
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default CreateWebhook;
