import {
  Button,
  Modal,
  Row,
  Navbar,
  Grid,
  Card,
  Col,
  Image,
  Text,
} from "@nextui-org/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { forOwn } from "lodash";
import { useGlobalContext } from "../../context/GlobalContext";
import classes from "./BasketModel.module.css";
import { useRouter } from "next/router";
import Select from "react-select";
import {
  MarginDetail,
  BasketInstance,
} from "../../../services/transactions/transactions.service";
import Multiselect from "multiselect-react-dropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatNumber } from "../dashboard/dashboardTables/helpers";
import { warnMessage } from "../../constant/constant";

const BasketAddToCartModel = ({
  cartModel,
  serCartModel,
  basketId,
  setAddToCart,
  orderType,
}) => {
  const {
    getClientsIds,
    clients,
    group_Clients,
    selectedGroup,
    setSelectedGroup,
    addClients,
    groupInputList,
    setGroupInputList,
    clientsData,
  } = useGlobalContext();

  const [tabBasket, setTabBasket] = useState(false);
  const [selectTab, setselectTabs] = useState(false);
  const [clientOptions, setClientOptions] = useState("");
  const [initialArray, setInitialArray] = useState([]);
  const [clientidData, setClientIdData] = useState([]);
  const [marginData, setMarginData] = useState([]);
  const [InputDatalist, setInputDatalist] = useState([1]);
  const [GroupInput, setGroupInput] = useState([1]);
  const [isExecuteButtonDisabled, setIsExecuteButtonDisabled] = useState(true);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const processRef = useRef(false);

  const clientsOptions = useMemo(() => {
    const selectedClientsWithIds = initialArray.map((item) => item.value);
    return (
      initialArray.length
        ? clientsData.filter(
          (item) => !selectedClientsWithIds.includes(item.clientId)
        )
        : clientsData
    ).map((client) => ({
      value: client.clientId, // Save clientId as the value
      label: `${client.clientName
        ? `${client.clientId} (${client.clientName})`
        : `${client.clientId}`
        }`, // Display clientId (clientName)
      client_id: client.clientId,
      status: "initiated",
    }));
  }, [clientsData, initialArray]);

  const closeHandler = () => {
    serCartModel(false);
    setGroupInputList([]);
  };

  useEffect(() => {
    getClientsIds();
  }, []);
  const router = useRouter();

  useEffect(() => {
    setClientOptions(clients.current.clients);
  }, [clients.current.clients]);

  const [selectedOption, setSelectedOption] = useState({});

  const handleSelectChange = (selected) => {
    setSelectedOption(selected);
  };

  useEffect(() => {
    setIsExecuteButtonDisabled(
      (selectTab ? groupInputList : initialArray).length ? false : true
    );
  }, [initialArray, selectTab, groupInputList]);

  /// --- it's for update client quantity and client data ----
  useEffect(() => {
    if (Object.keys(selectedOption).length) {
      // setInitialArray([selectedOption]);
      setInitialArray((prevArray) => {
        const updatedData = prevArray.length
          ? [...prevArray, selectedOption]
          : [selectedOption];
        setInputDatalist((prev) =>
          updatedData.length > prev.length ? [...prev, 1] : prev
        );
        return updatedData;
      });
    }
  }, [selectedOption]);

  useEffect(() => {
    if (groupInputList.length) {
      let temp = [];
      for (let i = 0; i < groupInputList.length; i++) {
        temp.push(1);
      }
      setGroupInput(temp);
    }
  }, [groupInputList]);

  // const formattedOptions =
  //   clientOptions &&
  //   clientOptions?.map((option) => ({
  //     value: option,
  //     label: option,
  //     client_id: option,
  //     status: "initiated",
  //   }));

  const handlerDelete = (id) => {
    setInitialArray((prevArray) => {
      const filterData = prevArray.filter((row) => row.value !== id);
      if (!filterData?.length) setSelectedOption({});
      return filterData;
    });
  };

  const fetchData = async () => {
    const newClientId = initialArray?.map((item) => item.value);
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

  const ExecuteHandler = async (execute) => {
    if (processRef.current) return;
    processRef.current = true;
    setIsSubmit(true);

    const newClientId = initialArray?.map((item) => item.value);
    const newArrayWithoutLabel = initialArray?.map((obj, index) => {
      const { label, value, ...rest } = obj;
      return {
        ...rest,
        multiply_of: Number(InputDatalist[index]) || 1,
      };
    });
    setClientIdData(newClientId);
    let basketPayload = {
      is_excute: execute,
      // is_excute: orderType === "LIMIT" ? 0 : execute,
      clients: newArrayWithoutLabel,
      basket_id: basketId,
    };
    try {
      const res = await BasketInstance(basketPayload);
      toast.success(res?.message);
      setMarginData(res?.data || []);
      setAddToCart([]);
      router.push("/FOBasket");
    } catch (error) {
      console.error(error);
    } finally {
      processRef.current = false;
    }
  };

  const GroupExecuteHandler = async (execute) => {
    if (processRef.current) return;
    processRef.current = true;
    setIsSubmit(true);

    const ModifyField = groupInputList?.map((item, index) => {
      const {
        ClientId: client_id,
        Broker,
        Quantity,
        CashMargin,
        CapsPerSymbol,
        ...rest
      } = item;
      return {
        client_id,
        multiply_of: Number(GroupInput[index]) || 1,
        status: "initiated",
        ...rest,
      };
    });

    const payloadgorup = {
      is_excute: execute,
      // is_excute: orderType === "LIMIT" ? 0 : execute,
      basket_id: basketId,
      clients: ModifyField,
    };
    try {
      const res = await BasketInstance(payloadgorup);
      setMarginData(res?.data);
      if (execute === 1) {
        toast.success(warnMessage.success_order_message);
        router.push("/FOBasket");
      } else {
        toast.success(res?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      processRef.current = false;
      setIsConfirmModal(false);
    }
  };

  useEffect(() => {
    if (initialArray) {
      fetchData();
    }
  }, [initialArray]);
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

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      maxHeight: "120px",
      overflowY: "auto",
      zIndex: "999999",
    }),
  };

  const confirmCloseHandler = () => {
    setIsConfirmModal(false);
    setIsSubmit(false);
  };

  return (
    <div>
      <style>{`
          .nextui-c-grJsex-ikUaMfZ-css {
            max-width: 60rem !important;
          }
        `}</style>
      <Modal
        aria-labelledby="modal-title"
        open={cartModel}
        preventClose
        className={classes.modalContainer}
        css={{
          ...(isConfirmModal && { width: "500px", margin: "0 auto" }),
        }}
      >
        {isConfirmModal ? (
          <Modal.Body>
            <Col
              className="flex-row align-center justify-center"
              justify="center"
            >
              <Text justify="center" b h3>
                Confirmation
              </Text>
            </Col>
            <Row>
              <Text h5>
                Please confirm the order by clicking Submit button.
              </Text>
            </Row>
            <div className={classes.SqaureCss}>
              <Button
                className="secondary-button border-radius-8"
                auto
                flat
                onPress={confirmCloseHandler}
                style={{ padding: "0px 35px" }}
                color="default"
              >
                Cancel
              </Button>
              <Button
                className={`${isSubmit ? `` : `primary-button`
                  } border-radius-8`}
                auto
                flat
                disabled={isSubmit}
                color="error"
                css={{
                  width: "7rem",
                }}
                onPress={() => {
                  selectTab === false
                    ? ExecuteHandler(1)
                    : GroupExecuteHandler(1);
                }}
              >
                Submit
              </Button>
            </div>
          </Modal.Body>
        ) : (
          <Modal.Body>
            <Navbar.Content variant={"highlight-solid"}>
              <Col
                css={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <Grid md={15}>
                  <Card.Body>
                    <Row
                      css={{
                        width: "16.8rem",
                        marginLeft: "-12px",
                        marginBottom: "-17px",
                      }}
                    >
                      <Button
                        bordered
                        borderWeight={"light"}
                        auto
                        flat
                        css={{
                          background: "#F7F6F9",
                          borderColor: "$green600",
                          minWidth: "90px",
                          justifyContent: "center",
                          color: "#838383",
                          borderRadius: "0",
                          borderColor: "$accents3",
                        }}
                        className={tabBasket === false ? classes.buy : ""}
                      >
                        <Navbar.Link
                          css={{
                            minWidth: "120px",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            setTabBasket(false);
                            setselectTabs(false);
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
                        className={tabBasket === true ? classes.sell : ""}
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
                            setTabBasket(true);
                            setselectTabs(true);
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
                  </Card.Body>
                </Grid>
                {selectTab === false ? (
                  <Col style={{ marginTop: "20px" }}>
                    <Select
                      value={selectedOption}
                      onChange={handleSelectChange}
                      options={clientsOptions}
                      // options={formattedOptions}
                      isSearchable={true}
                      placeholder="Select an option..."
                      style={{ width: "20rem" }}
                      styles={customStyles}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      formatOptionLabel={({ label, value }, { context }) =>
                        context === "menu" ? label : value
                      }
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
                      <div
                        className="groupDropDown1"
                        style={{ marginTop: "15px", width: "20%" }}
                      >
                        <div>
                          <Multiselect
                            isObject={false}
                            onKeyPressFn={function noRefCheck() { }}
                            // onRemove={function noRefCheck() {}}
                            onRemove={(item) => {
                              setSelectedGroup([...item]);
                            }}
                            onSearch={function noRefCheck() { }}
                            selectedValues={selectedGroup}
                            singleSelect={true}
                            onSelect={(item) => {
                              setSelectedGroup(item);
                            }}
                            style={{ width: "15rem !important" }}
                            options={Object?.keys(group_Clients)}
                            placeholder="Select Group"
                          ></Multiselect>
                        </div>
                      </div>
                      <div>
                        <Button
                          className={`${!selectedGroup.length
                            ? `disable-button`
                            : `primary-button`
                            } border-radius`}
                          auto
                          // color="primary"
                          disabled={!selectedGroup.length}
                          onPress={() => {
                            addClients();
                            // setCheckValid(!checkValid);
                          }}
                          style={{ marginTop: "15px" }}
                        >
                          Add
                        </Button>
                      </div>
                    </Col>
                  </Row>
                )}
              </Col>
            </Navbar.Content>
            {selectTab === false ? (
              <>
                <Row justify="space-between" className="">
                  <div className={classes.order_select_clients}></div>
                </Row>
                <Row>
                  <table
                    aria-label="Example static collection table"
                    className={classes.table1}
                  >
                    <thead>
                      <tr>
                        <th className={classes.th1}>S. No.</th>
                        <th className={classes.th1}>Client Id</th>
                        <th className={classes.th1}>Multiple</th>
                        <th className={classes.th1}>Required Margin</th>
                        <th className={classes.th1}>Available Margin</th>
                        <th className={classes.th1}>Action</th>
                      </tr>
                    </thead>
                    <tbody className={classes.tbody1}>
                      {initialArray?.map((row, index) => {
                        return (
                          <tr key={row.id} className={classes.tr1}>
                            <td className={classes.td1}>{index + 1}</td>
                            <td className={classes.td1}>{row.value}</td>
                            <td className={classes.td1}>
                              <input
                                type="text"
                                style={{ width: "30%" }}
                                value={InputDatalist[index]}
                                onChange={(e) => {
                                  const updatedInput = [...InputDatalist];
                                  updatedInput[index] = e.target.value;
                                  setInputDatalist(updatedInput);
                                }}
                              />
                            </td>
                            <td className={classes.td1}>--</td>
                            <td className={classes.td1}>
                              {handlenetMarginAvailable(row.value)}
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
                                onClick={() => handlerDelete(row?.value)}
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
              <table
                aria-label="Example static collection table"
                className={classes.table1}
              >
                <thead>
                  <tr>
                    <th className={classes.th1}>S. No.</th>
                    <th className={classes.th1}>Broker</th>
                    {/* <th className={classes.th1}>Client Name</th> */}
                    <th className={classes.th1}>Client Id</th>
                    <th className={classes.th1}>Multiple</th>
                    <th className={classes.th1}>Available Margin</th>
                    {/* <th className={classes.th1}>Action</th> */}
                  </tr>
                </thead>
                <tbody className={classes.tbody1}>
                  {groupInputList?.length > 0
                    ? groupInputList?.map((element, index) => {
                      return (
                        <tr key={element.id} className={classes.tr1}>
                          <td className={classes.td1}>{index + 1}</td>
                          <td
                            className={`${classes.td1} group-broker-fno-broker`}
                          >
                            {
                              <Image
                                src={`images/brokers/${element[
                                  "Broker"
                                ].toLowerCase()}.png`}
                                width={20}
                              />
                            }
                          </td>
                          {/* <td className={classes.td1}>{element?.clientName}</td> */}
                          <td className={classes.td1}>{element?.ClientId}</td>

                          <td className={classes.td1}>
                            <input
                              type="text"
                              style={{ width: "30%" }}
                              value={GroupInput[index]}
                              onChange={(e) => {
                                const updatedGroupInput = [...GroupInput];
                                updatedGroupInput[index] = e.target.value;
                                setGroupInput(updatedGroupInput);
                              }}
                            />
                          </td>
                          <td className={classes.td1}>
                            <Text h6>
                              {!isNaN(element?.CashMargin)
                                ? formatNumber(+element?.CashMargin, 2)
                                : null}
                            </Text>
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
                                // onClick={() => handlerDelete(element?.value)}
                              />
                            </td> */}
                        </tr>
                      );
                    })
                    : ""}
                </tbody>
              </table>
            )}

            <Row justify="end">
              <Button
                className="secondary-button border-radius-8"
                auto
                flat
                onPress={closeHandler}
              >
                Cancel
              </Button>
              {/* <Button
              auto
              flat
              // onPress={closeHandler}
              style={{ marginLeft: "15px" }}
              color="primary"
              css={{
                backgroundColor: "#4680c2",
                color: "white",
              }}
              onClick={() =>
                selectTab === false ? ExecuteHandler(0) : GroupExecuteHandler(0)
              }
            >
              Draft
            </Button> */}
              <Button
                className={`${isExecuteButtonDisabled ? `` : `primary-button`
                  } border-radius-8`}
                auto
                flat
                disabled={isExecuteButtonDisabled}
                onClick={() =>
                  // selectTab === false ? ExecuteHandler(1) : GroupExecuteHandler(1)
                  setIsConfirmModal(true)
                }
                style={{ marginLeft: "15px" }}
              >
                Execute Order
              </Button>
            </Row>
          </Modal.Body>
        )}
      </Modal>
    </div>
  );
};

export default BasketAddToCartModel;
