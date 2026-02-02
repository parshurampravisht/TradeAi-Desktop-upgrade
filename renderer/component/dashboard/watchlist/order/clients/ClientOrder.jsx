import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;
import {
  Button,
  Card,
  Col,
  Divider,
  Grid,
  Image,
  Row,
  Spacer,
  Text,
  Navbar,
  Input,
} from "@nextui-org/react";

import Multiselect from "multiselect-react-dropdown";
import OrderInputClients from "./OrderInputClients";

import { IconEraser, IconPlus } from "@tabler/icons-react";
import OrderInputCsv from "./OrderInputCsv";

import { useGlobalContext } from "../../../../../context/GlobalContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { GetOfflineClientAll } from "../../../../../../services/transactions/transactions.service";

const ClientOrder = ({
  apiBody,
  clients,
  clientInputList,
  setClientInputList,
  setCheckValid,
  checkValid,
  buySell,
  leverageData,
  product
}) => {
  //validate clients in clientCreds v/s orderclient sheet

  const {
    singleLtp,
    addDynamicInputs,
    handleFileChange,
    selectedValueSymbol,
    switch_GpCl,
    setswitch_GpCl,
    getClientsIds,
    offlineRowData,
    setOfflineRowData,
    ClientBrokerData1,
    setClientBrokerData1,
    getClientsInvestedMargin,
    clientsData,
    equityQty,
    setEquityQty,
  } = useGlobalContext();
  const [selectedClients, setSelectedClients] = useState([]); //state for selected clients from multiselect dropdown
  const [clientOptions, setClientOptions] = useState(clients.current.clients);
  const [options, setOptions] = useState([]);
  const [clientTableListData, setClientTableListData] = useState([]);

  useEffect(() => {
    const list = localStorage.getItem("offlineClient");
    if (list) {
      setOfflineRowData(list && list !== "undefined" && list !== "null" ? JSON.parse(list) : []);
    }
  }, []);

  const updatedOfflineClients = useMemo(() => {
    return (
      offlineRowData.map((item) => {
        const { clientCode, ...rest } = item;
        return { ...rest, clientId: clientCode };
      }) || []
    );
  }, [offlineRowData]);

  //csv
  const colorGrid = buySell ? "#E9FFDB" : "#FDEEEF";

  const subSectionHeight = singleLtp ? "58vh" : "70vh";
  const handleDownloadSampleFile = async () => {
    // Triggering a file download for the sample file
    const result = "set2";

    const res = await ipcRenderer.invoke("ipc-saveSampleCSV", result);
    if (res) {
      // toast.success("file download successfull")
      alert("file download successfull");
    }
  };
  const handleDeleteOrder = (order) => {
    const array = [];
    const selected = [];
    clients.current.clients.forEach((data) => {
      let found = false;
      order.forEach((cli) => {
        if (data === cli.ClientId) {
          found = true;
        }
      });
      if (!found) {
        array.push(data);
      } else {
        selected.push(data);
      }
    });
    setClientOptions(array);
    // setSelectedClients(selected)
    setSelectedClients([]);
    clients.current.selectedClients = selected;
  };

  const handleOfflineData1 = async () => {
    try {
      // if (switch_GpCl === "Offline") {
      const userId = localStorage.getItem("user_id");
      const list = await GetOfflineClientAll(userId);
      setClientBrokerData1(list?.clients);
      // }
    } catch (error) {
      console.error(error);
    }
  };

  // const clientsOptionsData = useMemo(() => {
  //   const allClientsData = [...clientsData, ...updatedOfflineClients];
  //   let filterClientArr = [];
  //   if (clientInputList && Array.isArray(clientInputList)) {
  //     filterClientArr = clientInputList.map((item) => item.clientId);
  //   }
  //   return (
  //     clientInputList && Array.isArray(clientInputList)
  //       ? allClientsData.filter(
  //         (item) => !filterClientArr.includes(item.clientId)
  //       )
  //       : allClientsData
  //   ).map((client) => ({
  //     value: client?.clientId, // Save clientId as the value
  //     label: `${client.clientName
  //       ? `${client.clientId} (${client.clientName})`
  //       : `${client.clientId}`
  //       }`, // Display clientId (clientName)
  //   }));
  // }, [clientsData, clientInputList]);

  const clientsOptionsData = useMemo(() => {
    const allClientsData = [...clientsData, ...updatedOfflineClients];

    // Extract all selected client IDs (normalize casing)
    const selectedClientIds = Array.isArray(clientInputList)
      ? clientInputList.map((item) => String(item.ClientId).trim().toLowerCase())
      : [];

    // Filter out clients that are already selected
    const availableClients = allClientsData.filter(
      (client) =>
        !selectedClientIds.includes(String(client.clientId).trim().toLowerCase())
    );

    // Convert to dropdown format
    return availableClients.map((client) => ({
      value: client.clientId,
      label: client.clientName
        ? `${client.clientId} (${client.clientName})`
        : client.clientId,
    }));
  }, [clientsData, updatedOfflineClients, clientInputList]);

  useEffect(() => {
    handleOfflineData1();
    (async () => {
      const result = await getClientsInvestedMargin();
      if (Array.isArray(result)) {
        setClientTableListData(result);
      }
    })();
  }, []);

  useEffect(() => {
    setClientOptions(clients.current.clients);
  }, [clients.current.clients]);

  let offline_Data =
    ClientBrokerData1.length > 0
      ? ClientBrokerData1.map((element) => element?.name)
      : [];

  return (
    <>
      <Card
        variant="bordered"
        css={{
          width: "100%",
          height: "30%",
          background: "#F7F7F7",
          // overflow: "scroll",
          flexGrow: "1",
          "@media (min-width: 768px)": {
            height: singleLtp ? "calc(100vh - 240px)" : "calc(95vh - 260px)",
            borderColor: "transparent",
          },
        }}
      >
        {/* <ToastContainer
          position="top-center"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        /> */}
        {/* inside card header, multiselect doesnot show all data */}
        <Card.Header>
          <Row justify="space-between">
            <Navbar.Content
              // hideIn="xs"
              variant={"highlight"}
            >
              <Row
                justify="center"
                align="center"
                css={{ p: "$3", pl: "$9" }}
              // className="btclient"
              >
                <Navbar.Link
                  className={`${switch_GpCl == "client" ? `primary-button` : ``
                    } border-radius-8`}
                  isActive={switch_GpCl == "client"}
                  onPress={() => setswitch_GpCl("client")}
                >
                  <Text
                    h2
                    // color="#2C2C2C"
                    css={{ mt: "$11", fontFamily: "$sans" }}
                    size={"$lg"}
                  >
                    Clients
                  </Text>
                </Navbar.Link>
                <Navbar.Link
                  className={`${switch_GpCl == "group" ? `primary-button` : ``
                    } border-radius-8`}
                  isActive={switch_GpCl == "group"}
                  onPress={() => setswitch_GpCl("group")}
                >
                  <Text
                    h2
                    // color="#2C2C2C"
                    css={{ mt: "$11", fontFamily: "$sans" }}
                    size={"$lg"}
                  >
                    Groups
                  </Text>
                </Navbar.Link>
              </Row>
            </Navbar.Content>
            {/* <Spacer x={28} /> */}

            <div style={{ display: "flex", padding: "10px 0" }}>
              {/* <Col
                style={{
                  width: "fit-content",
                }}
              >
                <Button
                  auto
                  flat
                  onClick={async () => await handleDownloadSampleFile()}
                  css={{
                    background: "transparent",
                    borderRadius: "7px",
                    padding: "0 5px",
                    margin: "0 10px 0 0",
                    border: "1px solid #000",
                    width: "30px",
                    height: "30px",
                  }}
                >
                  {" "}
                  <Image
                    src="./images/icons8-file 1.svg"
                    width={18}
                    height={18}
                  // css={{ ml: "$1" }}
                  />
                </Button>{" "}
              </Col>
              <Col>
                <Card
                  // isPressable={false}
                  variant="bordered"
                  borderWeight="light"
                  css={{
                    width: "3rem",
                    background: "transparent",
                    marginTop: "$.8",
                    borderColor: "#000",
                    // padding: "3px 0px",
                    margin: "0 10px 0 0",
                    borderRadius: "7px",
                    height: "30px",
                    width: "30px",
                  }}
                  isHoverable={selectedValueSymbol !== "Symbol"}
                >
                  <label>
                    <Image
                      src="./images/upload.svg"
                      width={18}
                      height={30}
                      // objectFit="fill"
                      css={{ mt: "$" }}
                    />
                    {selectedValueSymbol !== "Symbol" ? (
                      <input
                        type="file"
                        onChange={handleFileChange}
                        id="TT"
                        name="OrderFile"
                        accept=".xlsx"
                        hidden
                        value={""}
                      />
                    ) : null}
                  </label>
                </Card>
              </Col> */}
            </div>
          </Row>
        </Card.Header>
        <Row
          css={{ paddingLeft: "$12" }}
          justify="space-between"
          className="flex-row align-end"
        >
          <div className="flex-row align-center equity_order_select_clients width-100 c-input">
            <Multiselect
              className="width-100 custom-multiSelect"
              isObject={true}
              onKeyPressFn={function noRefCheck() { }}
              onRemove={(item) => {
                //item contains all the selected values till now
                const selectedValuesIds = item.map((item) => item.value);

                //using spread operator to add array into the object
                clients.current["selectedClients"] = selectedValuesIds;

                // apiBody.current = {
                //   ...apiBody.current,
                //   ...{ clients: item },
                // };
                setSelectedClients(item);
              }}
              onSearch={function noRefCheck() { }}
              selectedValues={selectedClients}
              onSelect={(item) => {
                //item contains all the selected values till now
                //using spread operator to add array into the object
                const selectedValuesIds = item.map((item) => item.value);

                clients.current["selectedClients"] = [
                  ...new Set([
                    ...clients.current["selectedClients"],
                    ...selectedValuesIds,
                  ]),
                ];

                apiBody.current = {
                  ...apiBody.current,
                  ...{ clients: selectedValuesIds },
                };
                setSelectedClients(item);
              }}
              //replace this with list of available symbols api
              // options={clientOptions}
              options={clientsOptionsData}
              // options={options}
              placeholder="Select clients"
              displayValue="label"
              selectedValueDecorator={(selected, _options) => {
                return _options?.value;
              }}
            ></Multiselect>

            <div style={{ marginLeft: "15px" }}>
              {/* csv file import and download of template   */}
              <Row justify="space-between" align="center">
                <Col
                  style={{ cursor: "pointer" }}
                  css={{ pr: "$2" }}
                  className={
                    clients.current["selectedClients"]?.length == 0
                      ? ""
                      : "equity-plus-button"
                  }
                >
                  {/* <Tooltip content={"Add clients"}> */}
                  <Button
                    auto
                    className={`${clients.current["selectedClients"]?.length == 0
                      ? ``
                      : `primary-button`
                      } border-radius-8`}
                    // color="secondary"
                    disabled={
                      // selectedValueSymbol == "Symbol" ||
                      clients.current["selectedClients"]?.length == 0
                    }
                    onPress={async () => {
                      await getClientsIds();

                      addDynamicInputs();
                      //to reset the variables for selected clients of multiselect
                      setSelectedClients([]);
                      // clients.current["selectedClients"] = [];
                      setCheckValid(!checkValid);
                    }}
                    icon={
                      <IconPlus
                        type="button"
                        height={25}
                        width={100}
                        color={"#fff"}
                        strokeWidth={2}
                      />
                    }
                  ></Button>
                  {/* </Tooltip> */}
                </Col>
              </Row>
            </div>
          </div>

          <Row
            className="flex-row column-gap-10 justify-end align-end"
            style={{ margin: "0 15px", width: "300px" }}
          >
            <Col style={{ width: "110px" }}>
              <Input
                type="number"
                label={"Total Quantity"}
                onChange={(event) => {
                  setEquityQty(event.target.value);
                }}
              />
            </Col>

            <Button
              className={`${equityQty > 0 && clientInputList?.length
                ? `primary-button`
                : `disable-button`
                } border-radius`}
              auto
              // color="primary"
              disabled={!(equityQty > 0) && !clientInputList}
              onPress={() => {
                if (equityQty > 0 && clientInputList?.length) {
                  setClientInputList((prev) =>
                    prev.map((item) => ({ ...item, Quantity: +equityQty }))
                  );
                }
              }}
            >
              Add
            </Button>
          </Row>
        </Row>
        <Spacer y={0} />
        {/* <Divider></Divider> */}
        <Card.Body className="c-table">
          <OrderInputCsv
            leverageData={leverageData}
            product={product}
            clientInputList={clientInputList}
            setClientInputList={setClientInputList}
            setCheckValid={setCheckValid}
            deleteOrder={(order) => handleDeleteOrder(order)}
            clients={clients}
            clientTableListData={clientTableListData}
          />
        </Card.Body>
      </Card>
    </>
  );
};

export default ClientOrder;
