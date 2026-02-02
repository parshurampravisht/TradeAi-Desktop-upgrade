import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Modal,
  Row,
  Col,
  Text,
  Radio,
  Image,
  Navbar,
  Grid,
  Input,
  Switch,
} from "@nextui-org/react";
import classes from "./CreateWebhook.module.css";
import { useRouter } from "next/router";
import WebhookClient from "./WebhookClient";
import Select from "react-select";
import {
  updateBasketDataHandler,
  WebHookDetailMaster,
  MarginDetail,
  DeleteWebHookClientsDetail,
} from "../../services/transactions/transactions.service";
import { useGlobalContext } from "../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forOwn } from "lodash";
import Multiselect from "multiselect-react-dropdown";
import { currencyFormatter } from "../helpers";
import { environment } from "../../environments/environment";
import { formatNumber } from "../component/dashboard/dashboardTables/helpers";

const customStyles = {
  menu: (provided) => ({
    ...provided,
    zIndex: "9999",
    overflowY: "visible",
    maxHeight: "none",
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999, // Ensure it's rendered on top of the modal
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "160px",
    overflowY: "auto",
  }),
};

const initialDisableState = {
  webhookTitle: true,
  orderSide: true,
  // orderType: true,
  productType: true,
  // price: true,
  webHookUrl: true,
  clientDetails: true,
};

const EditWebHook = ({
  openModel,
  setOpenModel,
  handleWebhookData,
  webhookId,
  dataId,
}) => {
  const {
    getClientsIds,
    clients,
    group_Clients,
    selectedGroup,
    setSelectedGroup,
    addClients,
    groupInputList,
    InputWebhook,
    setInputWebhook,
    groupInputWebhook,
    setGroupInputWebhook,
    groupClientsData,
    setGroupClientsData,
    clientsData,
    addWebHooksGroupsClients,
    setWebhookGroupDefaultQuantity,
    webhookGroupDefaultQuantity,
    getClientsInvestedMargin,
  } = useGlobalContext();
  const [inputTextData, setinputTextData] = useState(
    `${environment.webhookBaseUrl}/websocket/tradeView-data`
  );
  const [copyMessage, setCopyMessage] = useState("");
  const [isJsonCopied, setIsJsonCopied] = useState(false);
  const [reGenerateMessage, setReGenerateMessage] = useState("");
  const crypto = require("crypto");

  const [numberToEncrypt, setNumberToEncrypt] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [selectTab, setSelectTab] = useState(
    Boolean(webhookId?.group_name) ? true : false
  );
  const [clientidData, setClientIdData] = useState([]);
  const [marginData, setMarginData] = useState([]);
  const [formData, setFormData] = useState({
    webhook_title: webhookId?.webhook_title && webhookId?.webhook_title,
    order_side: webhookId?.order_side && webhookId?.order_side,
    order_type: webhookId?.order_type && webhookId?.order_type,
    product_type: webhookId?.product_type && webhookId?.product_type,
    // limit_price:
    //   webhookId?.product_type && webhookId?.product_type === "LIMIT"
    //     ? webhookId?.product_type && webhookId?.product_type
    //     : 0,
    webhook_unique_code:
      webhookId?.webhook_unique_code && webhookId?.webhook_unique_code,
    order_validity: webhookId?.order_validity,
    clients: webhookId?.group_name ? [] : webhookId?.client_details || [],
    group_name: webhookId?.group_name || "",
    is_active: webhookId?.is_active,
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [investedMarginClientsData, setInvestedMarginClientsData] = useState(
    []
  );
  const processRef = useRef(false);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] =
    useState(initialDisableState);

  const [webhookJson, setwebHookJson] = useState({
    // strategy_name: "{{ticker}}",
    exchange: "{{exchange}}",
    symbol: "{{ticker}}",
    order_side: webhookId?.order_side,
    // type:
    //   webhookId?.order_type && webhookId?.order_type === "MARKET"
    //     ? "market"
    //     : "limit",
    product_type:
      webhookId?.product_type && webhookId?.product_type === "NRML"
        ? "delivery"
        : "intraday",
    quantity: 0,
    // validity: "2 Week",
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getClientsIds();
    (async () => {
      const result = await getClientsInvestedMargin();
      setInvestedMarginClientsData(result);
    })();
  }, []);

  useEffect(() => {
    setGroupInputWebhook((prev) => {
      return prev.map(() => webhookGroupDefaultQuantity);
    });
  }, [webhookGroupDefaultQuantity]);

  useEffect(() => {
    setIsSaveButtonDisabled({
      webhookTitle: formData.webhook_title?.trim() ? false : true,
      orderSide: formData.order_side ? false : true,
      // orderType: formData.order_type ? false : true,
      productType: formData.product_type ? false : true,
      // price:
      //   formData.order_type === "MARKET"
      //     ? false
      //     : formData.order_type === "LIMIT" &&
      //       +formData.limit_price &&
      //       formData.limit_price >= 0
      //     ? false
      //     : true,
      webHookUrl: formData.webhook_unique_code?.trim() ? false : true,
      clientDetails: (selectTab === false ? formData.clients : groupClientsData)
        .length
        ? false
        : true,
    });
  }, [formData, selectTab, groupClientsData]);

  const isDisabled =
    isSaveButtonDisabled.orderSide ||
    // isSaveButtonDisabled.orderType ||
    // isSaveButtonDisabled.price ||
    isSaveButtonDisabled.productType ||
    isSaveButtonDisabled.webHookUrl ||
    isSaveButtonDisabled.webhookTitle ||
    isSaveButtonDisabled.clientDetails;

  const updateWebhookJson = () => {
    setwebHookJson((prevJson) => ({
      ...prevJson,
      order_side: webhookId?.order_side,
      // type:
      //   webhookId?.order_type && webhookId?.order_type === "MARKET"
      //     ? "market"
      //     : "limit",
      product_type:
        webhookId?.product_type && webhookId?.product_type === "NRML"
          ? "delivery"
          : "intraday",
    }));
  };

  const updateEditWebhookJson = () => {
    setwebHookJson((prevJson) => ({
      ...prevJson,
      order_side: formData.order_side,
      // type: formData.order_type === "MARKET" ? "market" : "limit",
      product_type: formData.product_type === "NRML" ? "delivery" : "intraday",
    }));
  };

  useEffect(() => {
    updateEditWebhookJson();
  }, [formData.order_side, formData.product_type]);

  const clientsOptions = useMemo(() => {
    const selectedClientsWithIds = formData.clients.map(
      (item) => item.client_id
    );
    return (
      formData.clients.length
        ? clientsData.filter(
            (item) => !selectedClientsWithIds.includes(item.clientId)
          )
        : clientsData
    ).map((client) => ({
      value: client.clientId,
      label: `${
        client.clientName
          ? `${client.clientId} (${client.clientName})`
          : `${client.clientId}`
      }`,
      client_id: client.clientId,
      status: "initiated",
    }));
  }, [clientsData, formData.clients]);

  const closeHandler = () => {
    setOpenModel(false);
    setSelectedOption(null);
    setInputWebhook([]);
    setGroupInputWebhook([]);
    setWebhookGroupDefaultQuantity(1);
    setSelectedGroup([]);
    setSelectTab(false);
    setGroupClientsData([]);
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
    setReGenerateMessage("Regenerated!");
    setTimeout(() => setReGenerateMessage(""), 2000);
  };

  useEffect(() => {
    EncrpytHandler();
  }, []);

  useEffect(() => {
    setFormData(() => ({
      webhook_title: webhookId?.webhook_title && webhookId?.webhook_title,
      order_side: webhookId?.order_side && webhookId?.order_side,
      order_type: webhookId?.order_type && webhookId?.order_type,
      product_type: webhookId?.product_type && webhookId?.product_type,
      // limit_price:
      //   webhookId?.order_type === "LIMIT" ? webhookId.limit_price : 0,
      webhook_unique_code:
        webhookId?.webhook_unique_code && webhookId?.webhook_unique_code,
      order_validity: webhookId?.order_validity,
      clients: webhookId?.group_name ? [] : webhookId?.client_details || [],
      group_name: webhookId?.group_name || "",
      is_active: webhookId?.is_active,
    }));
    updateWebhookJson();

    if (Boolean(webhookId?.group_name)) {
      setSelectedGroup([webhookId.group_name]);
      setSelectTab(Boolean(webhookId?.group_name));
      setGroupInputWebhook(
        webhookId.client_details?.map((item) => +item.quantity) || []
      );
      const updatedGroupClientsData = webhookId?.client_details.map(
        (clData) => {
          const matchedObj = clientsData.find(
            (item) => item.clientId === clData.client_id
          );

          return {
            value: clData?.client_id,
            clientName: matchedObj ? matchedObj?.clientName : "-",
            label: `${
              matchedObj && matchedObj?.clientName
                ? `${clData?.client_id} (${matchedObj?.clientName})`
                : `${clData?.client_id}`
            }`,
            client_id: clData?.client_id,
            status: "initiated",
          };
        }
      );
      setGroupClientsData(updatedGroupClientsData);
    } else {
      setInputWebhook(
        webhookId.client_details?.map((item) => +item.quantity) || []
      );
    }
  }, [webhookId]);

  const newArrayWithoutLabel =
    (selectTab === false ? formData?.clients : groupClientsData)?.map(
      (obj, index) => {
        const { label, value, quantity, status, ...rest } = obj;
        return {
          ...rest,
          quantity: Number(
            selectTab === false ? InputWebhook[index] : groupInputWebhook[index]
          ),
        };
      }
    ) || [];

  const updateWebhookDetailHandler = async () => {
    if (processRef.current) return;
    processRef.current = true;
    const payload = {
      ...formData,
      clients: newArrayWithoutLabel,
      group_name: selectTab === false ? "" : selectedGroup[0] || "",
    };
    try {
      const res = await updateBasketDataHandler(dataId, payload);
      processRef.current = false;
      toast.success(res?.message);
      setOpenModel(false);
      setSelectedOption(null);
      setWebhookGroupDefaultQuantity(1);
      setInputWebhook([]);
      setSelectedGroup([]);
      setGroupClientsData([]);
      setSelectTab(false);
      handleWebhookData();
    } catch (error) {
      console.log("error update webhook", error);
    } finally {
      processRef.current = false;
    }
  };

  useEffect(() => {
    getClientsIds();
  }, []);

  const handleSelectChange = (selected) => {
    setSelectedOption(selected);
  };

  useEffect(() => {
    if (selectedOption) {
      setFormData((prevFormData) => {
        const updatedFormData = {
          ...prevFormData,
          clients: [...prevFormData.clients, selectedOption],
        };
        setInputWebhook((prev) =>
          updatedFormData?.clients.length > prev.length ? [...prev, 1] : prev
        );
        return updatedFormData;
      });
    }
  }, [selectedOption]);

  const handlerDelete = async (id, index) => {
    try {
      setFormData((prevFormData) => {
        if (prevFormData.clients.length === 1) {
          setSelectedOption(null);
          return { ...prevFormData, clients: [] };
        }
        return {
          ...prevFormData,
          clients: prevFormData.clients.filter((row, ind) => ind !== index),
        };
      });
      if (id) {
        const res = await DeleteWebHookClientsDetail(id);
        toast.success(res.message);
      }
      setInputWebhook((prev) => prev.filter((_, ind) => ind !== index));
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchData = async () => {
    const newClientId = (
      selectTab === false ? formData?.clients : groupClientsData
    )?.map((item) => item?.client_id);
    setClientIdData(newClientId);
    let basketPayload = {
      client_ids: newClientId,
    };
    try {
      const res = await MarginDetail(basketPayload);
      setMarginData(res?.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (formData?.clients.length || groupClientsData.length) {
      fetchData();
    }
  }, [formData?.clients, groupClientsData]);

  const handlenetMarginAvailable = (label) => {
    let netMarginAvailable;
    marginData?.map((element) => {
      forOwn(element, (value, key) => {
        if (key === label) {
          netMarginAvailable = value.netMarginAvailable;
        }
      });
    });

    return !isNaN(netMarginAvailable)
      ? formatNumber(+netMarginAvailable, 2)
      : null;
  };

  //   const handlenetBrokerName = (label, marginData) => {
  //     let netMarginAvailable = null; // Initialize netMarginAvailable

  //     if (marginData && marginData.length > 0) {
  //       marginData.forEach((element) => {
  //         for (const key in element) {
  //           if (key === label) {
  //             netMarginAvailable = element[key].Broker;
  //             break; // Exit loop once found
  //           }
  //         }
  //       });
  //     }

  //     return netMarginAvailable;
  //   };

  const handlenetBrokerName = (label) => {
    let netMarginAvailable = null; // Initialize netMarginAvailable
    marginData &&
      marginData.forEach((element) => {
        for (const key in element) {
          if (key === label) {
            netMarginAvailable = element[key].Broker;
            break; // Exit loop once found
          }
        }
      });

    return netMarginAvailable;
  };

  const handleCopy = () => {
    const formattedJson = formatJson(webhookJson);
    navigator.clipboard
      .writeText(formattedJson)
      .then(() => {
        setIsJsonCopied(true);
        // alert("JSON copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const handlerStatus = (e) => {
    setFormData((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  useEffect(() => {
    let timeout;
    if (isJsonCopied) {
      timeout = setTimeout(() => setIsJsonCopied(false), 2000);
    }
    return () => clearTimeout(timeout); // Cleanup timeout
  }, [isJsonCopied]);

  const formatJson = (json) => {
    return JSON.stringify(json, null, 2);
  };

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
        // className={classes.modalContainer}
      >
        <Modal.Body>
          <Row>
            <Col>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ marginTop: "10px" }}>
                  <Text h5 className={classes.TextCss}>
                    WebHook Name
                    <input
                      type="text"
                      className={classes.inputText1}
                      value={formData?.webhook_title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          webhook_title: e.target.value,
                        });
                      }}
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
                        value={formData?.order_side}
                        onChange={(val) => {
                          setFormData({ ...formData, order_side: val });
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

                  {/* <div className={classes.ExpriryData}>
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
                        value={formData?.order_type}
                        onChange={(val) => {
                          setFormData({ ...formData, order_type: val });
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
                  </div> */}

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
                        value={formData?.product_type}
                        onChange={(val) => {
                          setFormData({ ...formData, product_type: val });
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
                      disabled={formData?.order_type === "LIMIT" ? false : true}
                      value={formData?.limit_price}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          limit_price: e.target.value,
                        });
                      }}
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
                        value={`${inputTextData}/${formData?.webhook_unique_code}/`}
                        onChange={handleInputChange}
                        id="inputTextData"
                      />
                    </div>
                    {/* <button
                      className={classes.CopyButton}
                      onClick={handleCopyURL}
                      style={{ marginTop: "10px" }}
                    >
                      Copy URL
                    </button> */}
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
                      checked={formData.is_active}
                      onChange={handlerStatus}
                    />
                  </Row>
                </div>
                <div className="position-relative">
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
          <Row>
            <Navbar.Content
              variant={"highlight"}
              style={{ border: "1px solid #ECEEF0", borderRadius: "8px" }}
            >
              <Row
                style={{ width: "fit-content" }}
                justify="center"
                align="center"
              >
                <div style={{ display: "flex" }}>
                  <Navbar.Link
                    isActive={selectTab === false}
                    onPress={() => setSelectTab(false)}
                    className={`${selectTab === false ? `primary-button` : ""}`}
                    style={{
                      borderRadius:
                        selectTab === false ? "8px 0px 0px 8px" : "",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: "10px",
                      }}
                    >
                      Client
                    </p>
                  </Navbar.Link>
                  <div>
                    <Navbar.Link
                      className={`${
                        selectTab === true ? `primary-button` : ""
                      }`}
                      isActive={selectTab === true}
                      onPress={() => setSelectTab(true)}
                      style={{
                        borderRadius:
                          selectTab === true ? "0px 8px 8px 0px" : "",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "16px",
                          textAlign: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingTop: "10px",
                        }}
                      >
                        Group
                      </p>
                    </Navbar.Link>
                  </div>
                </div>
              </Row>
            </Navbar.Content>
          </Row>
          {/* <Navbar.Content variant={"highlight-solid"}>
            <Row
              css={{
                width: "16.8rem",
              }}
            >
              <Button
                bordered
                borderWeight={"light"}
                auto
                flat
                css={{
                  minWidth: "90px",
                  justifyContent: "center",
                  borderRadius: "0",
                }}
                className={
                  selectTab === false ? classes.buy : classes.unSelectedTab
                }
              >
                <Navbar.Link
                  css={{
                    minWidth: "120px",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    setSelectTab(false);
                  }}
                  variant="highlight-solid"
                  itemCss={{
                    fontWeight: "500",
                    fontSize: "1rem",
                  }}
                >
                  Client
                </Navbar.Link>
              </Button>

              <Button
                className={
                  selectTab === true ? classes.sell : classes.unSelectedTab
                }
                auto
                flat
                bordered
                borderWeight={"light"}
                css={{
                  minWidth: "90px",
                  justifyContent: "center",
                  color: "#838383",
                  borderRadius: "0",
                  borderColor: "$accents3",
                }}
              >
                <Navbar.Link
                  css={{
                    minWidth: "120px",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    setSelectTab(true);
                  }}
                  itemCss={{
                    fontWeight: "500",
                    fontSize: "1rem",
                  }}
                >
                  Group
                </Navbar.Link>
              </Button>
            </Row>
          </Navbar.Content> */}
          <Navbar.Content variant={"highlight-solid"}>
            <Col>
              <Grid md={7}>
                {selectTab === false ? (
                  <Col>
                    <Select
                      value={selectedOption}
                      onChange={handleSelectChange}
                      options={clientsOptions}
                      menuPortalTarget={isClient ? document.body : null}
                      // options={formattedOptions}
                      isSearchable={true}
                      placeholder="Select an option..."
                      styles={customStyles}
                      displayValue="label"
                      selectedValueDecorator={(selected, _options) => {
                        return _options?.value;
                      }}
                    />
                  </Col>
                ) : (
                  <Row>
                    <Col
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="groupDropDown1">
                        <div>
                          <Multiselect
                            className="custom-multiselect"
                            isObject={false}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={function noRefCheck() {}}
                            onSearch={function noRefCheck() {}}
                            selectedValues={selectedGroup}
                            singleSelect={true}
                            onSelect={(item) => {
                              setSelectedGroup(item);
                            }}
                            options={Object?.keys(group_Clients)}
                            placeholder="Select Group"
                            styles={customStyles}
                          ></Multiselect>
                        </div>
                      </div>
                      <div style={{ margin: "0 5px" }}>
                        <Input
                          style={{
                            width: "100px",
                            padding: "5px 10px",
                            border: "1px solid #dfe3e6",
                            borderRadius: "8px",
                            margin: "0px",
                          }}
                          type="number"
                          placeholder="Quantity"
                          value={webhookGroupDefaultQuantity}
                          onChange={(e) =>
                            setWebhookGroupDefaultQuantity(e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Button
                          className={`${
                            !selectedGroup.length ||
                            webhookGroupDefaultQuantity <= 0
                              ? ``
                              : `primary-button`
                          } border-radius-8`}
                          auto
                          disabled={
                            !selectedGroup.length ||
                            webhookGroupDefaultQuantity <= 0
                          }
                          onPress={addWebHooksGroupsClients}
                        >
                          Add
                        </Button>
                      </div>
                    </Col>
                  </Row>
                )}
              </Grid>
            </Col>
          </Navbar.Content>

          {selectTab === false ? (
            <>
              <Row justify="space-between" className="">
                <div className={classes.order_select_clients}></div>
              </Row>
              <Row className={classes.webhookTableScrollar}>
                <table
                  aria-label="Example static collection table"
                  className={classes.table1}
                >
                  <thead>
                    <tr>
                      <th className={classes.th1}>S. No.</th>
                      <th className={classes.th1}>Broker</th>
                      <th className={classes.th1}>Client ID</th>
                      <th className={classes.th1}>Client Name</th>
                      <th className={classes.th1}>Cash Available</th>
                      <th className={classes.th1}>Holdings</th>
                      <th className={classes.th1}>Quantity</th>
                      <th className={classes.th1}>Net Avail. Margin</th>
                      <th className={classes.th1}>Action</th>
                    </tr>
                  </thead>
                  <tbody className={classes.tbody1}>
                    {!!formData.clients.length &&
                      formData.clients.map((row, key) => {
                        const matchedObj = clientsData.find(
                          (item) => item.clientId === row.client_id
                        ) || { clientName: "-" };

                        const matchclientsData = investedMarginClientsData.find(
                          (item) => item.client_code === row.client_id
                        );

                        return (
                          <tr key={row.id} className={classes.tr1}>
                            <td className={classes.td1}>{key + 1}</td>
                            <td className={`${classes.td1} broker-image-table`}>
                              {handlenetBrokerName(row.client_id) ? (
                                <Image
                                  src={`images/brokers/${handlenetBrokerName(
                                    row.client_id
                                  )?.toLowerCase()}.png`}
                                  alt={row.client_id}
                                  width={20}
                                  css={{ margin: "$0px" }}
                                ></Image>
                              ) : (
                                "-"
                              )}
                              {/* {handlenetBrokerName(row.client_id) || "-"} */}
                            </td>
                            <td className={classes.td1}>{row.client_id}</td>
                            <td className={classes.td1}>
                              {matchedObj.clientName}
                            </td>
                            <td className={classes.td1}>
                              {matchclientsData?.available_balance &&
                              matchclientsData?.available_balance !== "NA"
                                ? currencyFormatter(
                                    matchclientsData?.available_balance
                                  )
                                : "-"}
                            </td>
                            <td className={classes.td1}>
                              {matchclientsData?.invested_price_sum &&
                              matchclientsData?.invested_price_sum !== "NA"
                                ? currencyFormatter(
                                    matchclientsData?.invested_price_sum
                                  )
                                : "-"}
                            </td>
                            <td className={classes.td1}>
                              <input
                                type="text"
                                style={{ width: "30%" }}
                                value={InputWebhook[key]}
                                onChange={(e) => {
                                  const updatedInput = [...InputWebhook];
                                  updatedInput[key] = e.target.value;
                                  setInputWebhook(updatedInput);
                                }}
                              />
                            </td>
                            {/* <td className={classes.td1}>
                              {handlenetBrokerName(row.client_id) || "-"}
                            </td> */}
                            <td className={classes.td1}>
                              {handlenetMarginAvailable(row.client_id) || "-"}
                            </td>
                            <td className={classes.td1}>
                              <img
                                src="images/iconsdelete.png"
                                width={30}
                                style={{
                                  cursor: "pointer",
                                  color: "red",
                                  marginLeft: "10px",
                                  width: "20px",
                                }}
                                onClick={() => handlerDelete(row?.id, key)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </Row>
            </>
          ) : (
            <>
              <Row justify="space-between" className="">
                <div className={classes.order_select_clients}></div>
              </Row>
              <Row className={classes.webhookTableScrollar}>
                <table
                  aria-label="Example static collection table"
                  className={classes.table1}
                >
                  <thead>
                    <tr>
                      <th className={classes.th1}>S. No.</th>
                      <th className={classes.th1}>Broker</th>
                      <th className={classes.th1}>Client ID</th>
                      <th className={classes.th1}>Client Name</th>
                      <th className={classes.th1}>Cash Available</th>
                      <th className={classes.th1}>Holdings</th>
                      <th className={classes.th1}>Quantity</th>
                      <th className={classes.th1}>Net Avail. Margin</th>
                    </tr>
                  </thead>
                  <tbody className={classes.tbody1}>
                    {!!groupClientsData?.length &&
                      groupClientsData?.map((row, key) => {
                        const matchclientsData = investedMarginClientsData.find(
                          (item) => item.client_code === row.value
                        );

                        return (
                          <tr key={row.id} className={classes.tr1}>
                            <td className={classes.td1}>{key + 1}</td>
                            <td className={`${classes.td1} broker-image-table`}>
                              {handlenetBrokerName(row.value) ? (
                                <Image
                                  src={`images/brokers/${handlenetBrokerName(
                                    row.value
                                  )?.toLowerCase()}.png`}
                                  alt={row.value}
                                  width={20}
                                  css={{ margin: "$0px" }}
                                ></Image>
                              ) : (
                                "-"
                              )}
                              {/* {handlenetBrokerName(row.value) || "-"} */}
                            </td>

                            <td className={classes.td1}>{row.value}</td>
                            <td className={classes.td1}>{row.clientName}</td>
                            <td className={classes.td1}>
                              {matchclientsData?.available_balance &&
                              matchclientsData?.available_balance !== "NA"
                                ? currencyFormatter(
                                    matchclientsData?.available_balance
                                  )
                                : "-"}
                            </td>
                            <td className={classes.td1}>
                              {matchclientsData?.invested_price_sum &&
                              matchclientsData?.invested_price_sum !== "NA"
                                ? currencyFormatter(
                                    matchclientsData?.invested_price_sum
                                  )
                                : "-"}
                            </td>
                            <td className={classes.td1}>
                              <input
                                type="text"
                                style={{ width: "30%" }}
                                value={groupInputWebhook[key]}
                                onChange={(e) => {
                                  const updatedInput = [...groupInputWebhook];
                                  updatedInput[key] = e.target.value;
                                  setGroupInputWebhook(updatedInput);
                                }}
                              />
                            </td>
                            {/* <td className={classes.td1}>
                              {handlenetBrokerName(row.value) || "-"}
                            </td> */}
                            <td className={classes.td1}>
                              {handlenetMarginAvailable(row.value) || "-"}
                            </td>
                            {/* <td className={classes.td1}>
                        <img
                          src="images/iconsdelete.png"
                          width={30}
                          style={{
                            cursor: "pointer",
                            color: "red",
                            marginLeft: "10px",
                            width: "20px",
                          }}
                          onClick={() => handlerDelete(row?.value, key)}
                        />
                      </td> */}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </Row>
            </>
          )}

          <Row justify="end">
            <Button
              className={"secondary-button border-radius-8"}
              auto
              flat
              onPress={() => {
                closeHandler();
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
                updateWebhookDetailHandler();
              }}
            >
              Update
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default EditWebHook;
