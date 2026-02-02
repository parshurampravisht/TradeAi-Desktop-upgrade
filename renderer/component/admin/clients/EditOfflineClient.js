import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Modal,
  Row,
  Spacer,
  Text,
  Input,
} from "@nextui-org/react";
import { updateEditOfflineHandler } from "../../../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const EditOfflineClient = ({
  EditOfflineClientData,
  setEditOfflineClientData,
  handleOfflineData,
  editId,
  editOffline,
  setLoading,
}) => {
  const [ClientIdOffline, setClientIdOffline] = useState(
    editOffline?.clientCode
  );
  const [StockSymbolItem, setStockSymbolItem] = useState(
    editOffline?.brokerName
  );
  const [ClientNameEdit, setClientNameEdit] = useState(editOffline?.clientName);
  const [EditEmailClient, setEditEmailClient] = useState(editOffline?.email);
  const [Error, setError] = useState("");

  useEffect(() => {
    setClientIdOffline(editOffline?.clientCode || "");
    setStockSymbolItem(editOffline?.brokerName || "");
    setClientNameEdit(editOffline?.clientName || "");
    setEditEmailClient(editOffline?.email || "");
  }, [editOffline]);

  const handlerSubmitHoldings = async () => {
    if (
      ClientIdOffline === "" ||
      StockSymbolItem === "" ||
      ClientNameEdit === ""
    ) {
      setError("All fields are required.");
    } else {
      const payload = {
        clientCode: ClientIdOffline,
        clientName: ClientNameEdit,
        brokerName: StockSymbolItem,
        user: localStorage.getItem("user_id"),
        email: EditEmailClient,
      };
      setError("");
      const res = await updateEditOfflineHandler(editId, payload);
      toast.success(res?.Message);
      setEditOfflineClientData(false);
      handleOfflineData();
    }
  };

  return (
    <>
      <Modal
        scroll
        open={EditOfflineClientData}
        preventClose
        width="500px"
        css={{ height: "auto" }}
      >
        <Modal.Header>
          {" "}
          <Text h4 size={"$lg"} css={{ fontFamily: "$sans" }}>
            {" "}
            Edit Client
          </Text>
        </Modal.Header>
        <Modal.Body css={{ border: "$accents2" }}>
          <div
            style={{
              alignItems: "center",
              width: "fit-content",
            }}
          ></div>
          <Spacer y={-1.7} />

          <Modal.Body>
            <Row>
              <Col md={12}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Client Id
                </Text>

                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  name="ClientIdOffline"
                  value={ClientIdOffline}
                  onChange={(e) => setClientIdOffline(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Client Name
                </Text>

                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  name="ClientNameEdit"
                  value={ClientNameEdit}
                  onChange={(e) => setClientNameEdit(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Broker Name
                </Text>

                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  name="StockSymbolItem"
                  value={StockSymbolItem}
                  onChange={(e) => setStockSymbolItem(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Email
                </Text>

                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  name="EditEmailClient"
                  value={EditEmailClient}
                  onChange={(e) => setEditEmailClient(e.target.value)}
                />
              </Col>
            </Row>
          </Modal.Body>
          {Error && (
            <Row>
              <Col>
                <Text color="error">{Error}</Text>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer style={{ margin: "5px" }}>
          <Button
            className={`border-radius-8 secondary-button`}
            auto
            flat
            onClick={() => setEditOfflineClientData(false)}
          >
            {" "}
            Cancel
          </Button>

          <Button
            className={`border-radius-8 primary-button`}
            auto
            flat
            onClick={handlerSubmitHoldings}
            css={{ background: "$blue600", color: "white" }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default EditOfflineClient;
