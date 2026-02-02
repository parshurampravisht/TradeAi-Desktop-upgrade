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
import {
  updateEditHoldingHandler,
  OptionHoldingHandler,
} from "../../../../services/transactions/transactions.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useDebounce } from "../../hooks/useDebounce";
import CustomOption from "../../dashboard/watchlist/order/orderComponents/helpers/customOptionReactSelect";
import CustomMenuList from "../../dashboard/watchlist/order/orderComponents/helpers/CustomMenuListSelect";
import CustomSelect from "../../../layout/customSelect";

const customStyles = {
  menu: (provided) => ({
    ...provided,
    maxHeight: "250px",
    overflowY: "visible",
    maxHeight: "none",
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "250px",
    overflowY: "auto",
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999, // Ensure it's rendered on top of the modal
  }),
  option: (provided) => ({
    ...provided,
  }),
};

const SingleHoldingModal = ({ EditHolding, setEditHolding, editOffline }) => {
  const [ClientIdItem, setClientIdItem] = useState(editOffline?.clientCode);
  const [BrokerNameItem, setBrokerNameItem] = useState(editOffline?.brokerName);
  const [OfflineClientName, setOfflineClientName] = useState(
    editOffline?.clientName
  );
  const [StockSymbolItem, setStockSymbolItem] = useState(null); // Changed to null for single select
  const [BuyPriceItem, setBuyPriceItem] = useState("");
  const [QuantityItem, setQuantityItem] = useState("");
  const [Error, setError] = useState("");
  const [OptionData, setOptionData] = useState([]);
  const [loading, setLoading] = useState(false); // State to handle loading

  useEffect(() => {
    setClientIdItem(editOffline?.clientCode || "");
    setBrokerNameItem(editOffline?.brokerName || "");
    setOfflineClientName(editOffline?.clientName || "");
  }, [editOffline]);

  const handlerSubmitHoldings = async () => {
    if (
      ClientIdItem === "" ||
      BrokerNameItem === "" ||
      StockSymbolItem === null ||
      BuyPriceItem === "" ||
      QuantityItem === "" ||
      OfflineClientName === ""
    ) {
      setError("All fields are required.");
    } else {
      const payload = {
        client_id: ClientIdItem,
        client_name: OfflineClientName,
        broker_name: BrokerNameItem,
        symbol: StockSymbolItem.label, // Access the value of selected option
        buy_price: BuyPriceItem,
        quantity: QuantityItem,
      };
      setError("");
      const res = await updateEditHoldingHandler(payload);
      toast.success(res?.Message);
      setEditHolding(false);
      setStockSymbolItem(null);
    }
  };

  // const formattedOptions = OptionData.map((option) => ({
  //   value: option.value, // Assuming option has a value property
  //   label: option.label, // Assuming option has a label property
  // }));

  return (
    <>
      <Modal
        className="offline-holding-modal"
        scroll
        open={EditHolding}
        preventClose
        width="700px"
        css={{ height: "auto", minHeight: "75vh", zIndex: "999" }}
      >
        <Modal.Header>
          <Text h4 size={"$lg"} css={{ fontFamily: "$sans" }}>
            Add holdings
          </Text>
        </Modal.Header>
        <Modal.Body css={{ border: "$accents2" }}>
          <Spacer y={-1.7} />
          <Modal.Body>
            <Row>
              <Col md={4}>
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
                  value={ClientIdItem}
                  onChange={(e) => setClientIdItem(e.target.value)}
                />
              </Col>
              <Spacer x={1} />
              <Col md={4}>
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
                  value={OfflineClientName}
                  onChange={(e) => setOfflineClientName(e.target.value)}
                />
              </Col>
              <Spacer x={1} />

              <Col md={4}>
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
                  value={BrokerNameItem}
                  onChange={(e) => setBrokerNameItem(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Stock Symbol
                </Text>
                {/* <Select
                  value={StockSymbolItem}
                  onChange={(selectedOption) =>
                    setStockSymbolItem(selectedOption)
                  }
                  // options={OptionData}
                  options={formattedOptions}
                  components={{
                    Option: CustomOption,
                    MenuList: CustomMenuList,
                  }}
                  styles={customStyles}
                  isSearchable={true}
                  placeholder="Select Symbol"
                  onInputChange={handleInputChange}
                  isLoading={loading} // Show loading indicator when fetching options
                  menuPortalTarget={document.body} // Render dropdown outside the modal
                /> */}
                <CustomSelect
                  value={StockSymbolItem}
                  onChange={(selectedOption) =>
                    setStockSymbolItem(selectedOption)
                  }
                  placeholder="Select Symbol"
                  customStyles={customStyles}
                  exchangeType={""}
                />
              </Col>
              <Spacer x={1} />
              <Col md={4}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Buy Price
                </Text>
                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  value={BuyPriceItem}
                  onChange={(e) => setBuyPriceItem(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Text
                  h5
                  size={"$md"}
                  css={{
                    fontFamily: "$sans",
                  }}
                >
                  Quantity
                </Text>
                <Input
                  bordered
                  borderWeight="light"
                  fullWidth
                  value={QuantityItem}
                  onChange={(e) => setQuantityItem(e.target.value)}
                />
              </Col>
              <Col md={4}></Col>
              <Col md={4}></Col>
            </Row>
            {Error && (
              <Row>
                <Col>
                  <Text color="error">{Error}</Text>
                </Col>
              </Row>
            )}
          </Modal.Body>
        </Modal.Body>
        <Modal.Footer className="" style={{ padding: "10px" }}>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            onClick={() => {
              setStockSymbolItem(null);
              setEditHolding(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="primary-button border-radius-8"
            auto
            flat
            onClick={handlerSubmitHoldings}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SingleHoldingModal;
