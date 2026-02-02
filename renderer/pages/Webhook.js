import React, { useEffect, useState, useRef, useCallback } from "react";
import classes from "./Webhook.module.css";
import { Card, Text } from "@nextui-org/react";
import CreateWebhook from "./CreateWebhook";
import {
  getWebhookData,
  DeleteBasketHandler,
  updateBasketIdHandler,
} from "../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IconEye, IconPencil } from "@tabler/icons-react";
import EditWebHook from "./EditWebHook";
import ViewJsonWebhook from "./ViewJsonWebhook";
import { environment } from "../../environments/environment";
import Image from "next/image";

const Webhook = () => {
  const [openModel, setOpenModel] = useState(false);
  const [EditopenModel, setEditopenModel] = useState(false);
  const [viewJson, setViewJson] = useState(false);
  const [WebhookData, setWebhookData] = useState([]);
  const [webhookId, setWebhookId] = useState("");
  const [dataId, setDataId] = useState("");

  const handleWebhookData = async () => {
    try {
      const res = await getWebhookData();
      const result = res.map((item, index) => ({ ...item, index: index + 1 }));
      setWebhookData(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleWebhookData();
  }, []);

  const handlerBasketDelete = async (id) => {
    try {
      const res = await DeleteBasketHandler(id);
      toast.success(res?.message);
      setWebhookData((prev) =>
        prev
          .filter((item) => item.id !== id)
          .map((elem, ind) => ({ ...elem, index: ind + 1 }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleWebhookDetail = async (id, data) => {
    setDataId(id);
    try {
      const res = await updateBasketIdHandler(id);
      setWebhookId(res);
    } catch (error) {
      console.error(error);
    }
    if (data === "json") {
      setViewJson(!viewJson);
    } else if (data === "edit") {
      setEditopenModel(true);
    }
  };

  return (
    <>
      <div className={classes.webhookcard}>
        <CreateWebhook
          openModel={openModel}
          setOpenModel={setOpenModel}
          handleWebhookData={handleWebhookData}
        />
        <EditWebHook
          openModel={EditopenModel}
          setOpenModel={setEditopenModel}
          webhookId={webhookId}
          handleWebhookData={handleWebhookData}
          dataId={dataId}
        />

        <ViewJsonWebhook
          openModel={viewJson}
          setOpenModel={setViewJson}
          webhookId={webhookId}
          handleWebhookData={handleWebhookData}
          dataId={dataId}
        />
        <Card.Body>
          <Text h5 css={{ fontWeight: "$bold" }}>
            WebHook Detail
          </Text>
          <div>
            <button
              className={`${classes.webhookButton} primary-button border-radius-8`}
              onClick={() => setOpenModel(true)}
            >
              Create Webhook +
            </button>
          </div>
          <table
            aria-label="Example static collection table"
            className={classes.table1}
          >
            <thead>
              <tr>
                <th className={classes.th1}>S. No.</th>
                <th className={classes.th1}>Webhook Name</th>
                <th className={classes.th1}>URL</th>
                <th className={classes.th1}>Expiry</th>
                <th className={classes.th1}>Order Side</th>
                <th className={classes.th1}>Product Type</th>
                <th className={classes.th1}>Order Type</th>
                <th className={classes.th1}>Action</th>
              </tr>
            </thead>
            <tbody className={classes.tbody1}>
              {WebhookData?.map((item, index) => {
                return (
                  <tr className={classes.tr1} key={item.id}>
                    <td className={classes.td1}>{item.index}</td>
                    <td className={classes.td1}>{item?.webhook_title}</td>
                    <td className={classes.td1}>
                      <UrlWebhook item={item} />
                    </td>
                    <td
                      className={classes.td1}
                    >{`${item?.order_validity} days`}</td>
                    <td className={classes.td1}>{item?.order_side}</td>
                    <td className={classes.td1}>{item?.product_type}</td>
                    <td className={classes.td1}>{item?.order_type}</td>
                    <td className={classes.td1}>
                      <IconEye
                        height={20}
                        width={20}
                        strokeWidth={1}
                        color={"#000"}
                        onClick={() => handleWebhookDetail(item?.id, "json")}
                        style={{ cursor: "pointer" }}
                      />
                      <IconPencil
                        type="button"
                        height={20}
                        width={20}
                        color={"#000"}
                        strokeWidth={1}
                        data-action="edit"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleWebhookDetail(item?.id, "edit")}
                      />
                      <Image
                        src="images/iconsdelete.png"
                        width={20}
                        height={20}
                        style={{
                          cursor: "pointer",
                          color: "red",
                          marginLeft: "10px",
                          width: "20px",
                        }}
                        onClick={() => handlerBasketDelete(item?.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card.Body>
      </div>
    </>
  );
};
export default Webhook;

function UrlWebhook({ item }) {
  const imageRef = useRef(null);

  const copyURL = useCallback(() => {
    // const url = imageRef.current.getAttribute("title");
    const url = `${environment.webhookBaseUrl}/websocket/tradeView-data/${item?.webhook_unique_code}/`
    const tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("URL copied to clipboard: " + url);
  }, [item?.webhook_unique_code]);

  return (
    <>
      <div style={{ width: "1.3rem" }}>
        <Image
          src="./images/urlweb.svg"
          style={{ cursor: "pointer" }}
          title={`${environment.webhookBaseUrl}/websocket/tradeView-data/${item?.webhook_unique_code}/`}
          ref={imageRef}
          onClick={copyURL}
          width={25}
          height={25}
          alt="Copy URL"
        />
      </div>
    </>
  );
}
