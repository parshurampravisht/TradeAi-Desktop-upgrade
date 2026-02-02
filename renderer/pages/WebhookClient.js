import {
  Button,
  Row,
  Navbar,
  Grid,
  Input,
  Col,
  Image,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { forOwn } from "lodash";
import { useGlobalContext } from "../context/GlobalContext";
import classes from "./CreateWebhook.module.css";
import Select from "react-select";
import { MarginDetail } from "../../services/transactions/transactions.service";

import Multiselect from "multiselect-react-dropdown";
import "react-toastify/dist/ReactToastify.css";
import { currencyFormatter } from "../helpers";
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

const WebhookClient = ({ selectTab, setSelectTab }) => {
  const {
    getClientsIds,
    clients,
    group_Clients,
    selectedGroup,
    setSelectedGroup,
    addWebHooksGroupsClients,
    groupInputList,
    initialArray,
    setInitialArray,
    InputWebhook,
    setInputWebhook,
    groupInputWebhook,
    setGroupInputWebhook,
    webhookGroupDefaultQuantity,
    setWebhookGroupDefaultQuantity,
    groupClientsData,
    clientsData,
    getClientsInvestedMargin,
  } = useGlobalContext();
  // const [clientOptions, setClientOptions] = useState("");
  const [clientidData, setClientIdData] = useState([]);
  const [marginData, setMarginData] = useState([]);
  const [DulicateClient, setDulicateClient] = useState("");
  const [investedMarginClientsData, setInvestedMarginClientsData] = useState(
    []
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures that the component has access to the document object
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

  // useEffect(() => {
  //   setClientOptions(clients.current.clients);
  // }, [clients.current.clients]);

  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelectChange = (selected) => {
    setSelectedOption(selected);
  };
  // useEffect(() => {
  //   if (selectedOption) {
  //     setInitialArray((prevArray) => [...prevArray, selectedOption]);
  //   }
  // }, [selectedOption]);

  useEffect(() => {
    if (selectedOption) {
      setDulicateClient((prevArray) => [...prevArray, selectedOption]);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (selectedOption?.value !== DulicateClient[0]?.client_id) {
      setInitialArray((prevArray) => {
        const updatedData = [...prevArray, selectedOption];
        setInputWebhook((prev) =>
          updatedData.length > prev.length ? [...prev, 1] : prev
        );
        return updatedData;
      });
    }
  }, [selectedOption]);

  const clientsOptions = useMemo(() => {
    const selectedClientsWithIds = initialArray.map((item) => item.value);
    return (
      initialArray.length
        ? clientsData.filter(
            (item) => !selectedClientsWithIds.includes(item.clientId)
          )
        : clientsData
    ).map((client) => ({
      value: client.clientId,
      clientName: client.clientName,
      label: `${
        client.clientName
          ? `${client.clientId} (${client.clientName})`
          : `${client.clientId}`
      }`,
      client_id: client.clientId,
      status: "initiated",
    }));
  }, [clientsData, initialArray]);

  // const formattedOptions =
  //   clientOptions &&
  //   clientOptions?.map((option) => ({
  //     value: option,
  //     label: option,
  //     client_id: option,
  //     status: "initiated",
  //   }));

  const handlerDelete = (id, index) => {
    setInitialArray((prevArray) => {
      const filterData = prevArray.filter((row) => row.value !== id);
      if (!filterData?.length) setSelectedOption({});
      return filterData;
    });
    setInputWebhook((prev) => prev.filter((_, ind) => ind !== index));
    setDulicateClient([]);
  };

  const fetchData = async () => {
    const newClientId = (
      selectTab === false ? initialArray : groupClientsData
    ).map((item) => item.value);
    setClientIdData(newClientId);
    let basketPayload = {
      client_ids: newClientId,
    };
    try {
      const res = await MarginDetail(basketPayload);
      setMarginData(res?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (initialArray.length || groupClientsData.length) {
      fetchData();
    }
  }, [initialArray, groupClientsData]);

  const handlenetMarginAvailable = (label) => {
    let netMarginAvailable;
    marginData &&
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

  const handlenetBrokerName = (label) => {
    let netMarginAvailable = null; // Initialize netMarginAvailable
    // if (marginData && marginData.length > 0) {
    marginData &&
      marginData?.forEach((element) => {
        for (const key in element) {
          if (key === label) {
            netMarginAvailable = element[key].Broker;
            break; // Exit loop once found
          }
        }
      });
    // }

    return netMarginAvailable;
  };

  return (
    <div>
      <Row>
        <Navbar.Content
          variant={"highlight"}
          style={{ border: "1px solid #ECEEF0", borderRadius: "8px" }}
        >
          <Row style={{ width: "fit-content" }} justify="center" align="center">
            <div style={{ display: "flex" }}>
              <Navbar.Link
                isActive={selectTab === false}
                onPress={() => setSelectTab(false)}
                className={`${selectTab === false ? `primary-button` : ""}`}
                style={{
                  borderRadius: selectTab === false ? "8px 0px 0px 8px" : "",
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
                  className={`${selectTab === true ? `primary-button` : ""}`}
                  isActive={selectTab === true}
                  onPress={() => setSelectTab(true)}
                  style={{
                    borderRadius: selectTab === true ? "0px 8px 8px 0px" : "",
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

      <Row>
        <Col>
          <Grid md={7}>
            {selectTab === false ? (
              <Col style={{ marginTop: "20px" }}>
                <Select
                  value={selectedOption}
                  onChange={handleSelectChange}
                  options={clientsOptions}
                  // options={formattedOptions}
                  isSearchable={true}
                  placeholder="Select Client"
                  styles={customStyles}
                  menuPortalTarget={isClient ? document.body : null}
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
                    marginTop: "20px",
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
                      color="primary"
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
      </Row>

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
                {!!initialArray?.length &&
                  initialArray?.map((row, key) => {
                    const matchclientsData = investedMarginClientsData.find(
                      (item) => item.client_code === row.value
                    );
                    return (
                      <tr key={row.id} className={classes.tr1}>
                        <td
                          style={{ width: "fit-content" }}
                          className={classes.td1}
                        >
                          {key + 1}
                        </td>
                        <td className={`${classes.td1} broker-image-table`}>
                          {handlenetBrokerName(row.value) ? (
                            <Image
                              src={`images/brokers/${handlenetBrokerName(
                                row.value
                              )?.toLowerCase()}.png`}
                              alt={row.value}
                              width={20}
                              css={{ margin: "$0px" }}
                              style={{ margin: "0px" }}
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
                            value={InputWebhook[key]}
                            onChange={(e) => {
                              const updatedInput = [...InputWebhook];
                              updatedInput[key] = e.target.value;
                              setInputWebhook(updatedInput);
                            }}
                          />
                        </td>

                        <td className={classes.td1}>
                          {handlenetMarginAvailable(row.value) || "-"}
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
                            onClick={() => handlerDelete(row?.value, key)}
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
    </div>
  );
};

export default WebhookClient;
