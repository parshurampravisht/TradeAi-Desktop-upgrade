import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Modal,
  Row,
  Spacer,
  Text,
  Input,
} from "@nextui-org/react";
import { SingleClientOfflineHandler } from "../../../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AddSingleOfflineClient = ({
  handleOfflineData,
  SignleOfflineClient,
  setSignleOfflineClient,
  fileOffline,
}) => {
  const [ClientIdOffline, setClientIdOffline] = useState("");
  const [StockSymbolItem, setStockSymbolItem] = useState("");
  const [ClientName, setClientName] = useState("");
  const [singleEmail, setsingleEmail] = useState("");
  const [Error, setError] = useState("");

  const handlerSubmitHoldings = async () => {
    if (
      ClientIdOffline === "" ||
      StockSymbolItem === "" ||
      ClientName === "" ||
      singleEmail === ""
    ) {
      setError("All fields are required.");
    } else {
      const payload = {
        clientCode: ClientIdOffline,
        clientName: ClientName,
        brokerName: StockSymbolItem,
        email: singleEmail,
        user: localStorage.getItem("user_id"),
      };
      setError("");
      const res = await SingleClientOfflineHandler(payload);
      toast.success(res?.Message);
      setSignleOfflineClient(false);
      handleOfflineData();
    }
  };

  return (
    <>
      <Modal
        scroll
        open={SignleOfflineClient}
        preventClose
        width="500px"
        css={{ height: "auto" }}
      >
        <Modal.Header>
          {" "}
          <Text h4 size={"$lg"} css={{ fontFamily: "$sans" }}>
            {" "}
            Add Client
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
                  onChange={(e) => setClientName(e.target.value)}
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
                  Email Id
                </Text>

                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  name="singleEmail"
                  onChange={(e) => setsingleEmail(e.target.value)}
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
            onClick={() => {
              setSignleOfflineClient(false);
              setError("");
            }}
          >
            {" "}
            Cancel
          </Button>

          <Button
            className={`border-radius-8 primary-button`}
            auto
            flat
            onClick={handlerSubmitHoldings}
            // css={{ background: "$blue600", color: "white" }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default AddSingleOfflineClient;
