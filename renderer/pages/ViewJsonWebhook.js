import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Row,
  Col,
  Text,
  Radio,
  Switch,
  Navbar,
} from "@nextui-org/react";
import classes from "./CreateWebhook.module.css";
import WebhookClient from "./WebhookClient";
import {
  CreateWebHookDetail,
  WebHookDetailMaster,
} from "../../services/transactions/transactions.service";
import { useGlobalContext } from "../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { IoClose } from "react-icons/io5";
import { environment } from "../../environments/environment";

const ViewJsonWebhook = ({
  openModel,
  setOpenModel,
  handleWebhookData,
  webhookId,
}) => {
  const { initialArray, InputWebhook } = useGlobalContext();
  const [isChecked, setChecked] = useState(false);
  const [tabBasket, setTabBasket] = useState(false);
  const [selectTab, setselectTabs] = useState(false);
  const [inputTextData, setinputTextData] = useState("35.154.137.97:8000");
  const [copyMessage, setCopyMessage] = useState("");

  const crypto = require("crypto");
  const [numberToEncrypt, setNumberToEncrypt] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [WebHookName, setWebHookName] = useState("");
  const [orderside, setOrderside] = useState("");
  const [ordertype, setOrderType] = useState("");
  const [ProductType, setProductType] = useState("");
  const [Price, setPrice] = useState("");

  const closeHandler = () => {
    setOpenModel(false);
  };

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
  };

  useEffect(() => {
    EncrpytHandler();
  }, []);

  const createWebhookHandler = async () => {
    const newArrayWithoutLabel =
      initialArray?.length > 0
        ? initialArray?.map((obj, index) => {
            const { label, value, status, ...rest } = obj;
            return {
              quantity: Number(InputWebhook[index]),

              ...rest,
            };
          })
        : "";
    const payload = {
      webhook_title: WebHookName,
      order_side: orderside,
      order_type: ordertype,
      product_type: ProductType,
      limit_price: ordertype === "LIMIT" ? Price : 0,
      order_validity: 7,
      webhook_unique_code: numberToEncrypt,
      clients: newArrayWithoutLabel,
    };

    try {
      const res = await CreateWebHookDetail(payload);
      toast.success(res?.message);
      setOpenModel(false);
      handleWebhookData();
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
    } catch (error) {}
  };

  const beautifyJson = (jsonString) => {
    try {
      const jsonObject = JSON.parse(jsonString);
      return JSON.stringify(jsonObject, null, 2);
    } catch (error) {
      return "Invalid JSON";
    }
  };

  return (
    <>
      <style>{`
          .nextui-c-grJsex-ikUaMfZ-css {
            max-width: 50rem !important;
          }
        `}</style>
      <Modal
        aria-labelledby="modal-title"
        open={openModel}
        className={classes.modalContainer}
        closeButton
      >
        <Modal.Body>
          <Row>
            <Col>
              <Text h5 css={{ fontWeight: "$bold" }}>
                WebHook View Json
              </Text>
              {webhookId?.history?.length > 0 ? (
                <>
                  <pre>{beautifyJson(JSON.stringify(webhookId?.history))}</pre>
                </>
              ) : (
                <pre>
                  <p style={{ textAlign: "center" }}>Record Not Found</p>
                </pre>
              )}
            </Col>
          </Row>

          {/* <Row justify="end">
            <Button
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
              auto
              flat
              style={{ marginLeft: "15px" }}
              color="primary"
              css={{
                backgroundColor: "#4680c2",
                color: "white",
              }}
              onClick={() => {
                createWebhookHandler();
              }}
            >
              Save
            </Button>
          </Row> */}
        </Modal.Body>
      </Modal>
    </>
  );
};
export default ViewJsonWebhook;
