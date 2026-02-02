import {
  Image,
  Input,
  Row,
  Text,
  Table,
  Button,
  Grid,
} from "@nextui-org/react";
import { IconTrash } from "@tabler/icons-react";
import { useGlobalContext } from "../../../../../context/GlobalContext";
import { currencyFormatter } from "../../../../../helpers";
import { formatNumber } from "../../../dashboardTables/helpers";

const clientColumnHeader = [
  {
    id: 1,
    headerName: "Broker",
  },
  {
    id: 2,
    headerName: "Client ID",
  },
  {
    id: 3,
    headerName: "Quantity",
  },
  {
    id: 4,
    headerName: "Cash Available",
  },
  {
    id: 5,
    headerName: "Margin",
  },
  {
    id: 6,
    headerName: "Required Margin",
  },
  {
    id: 7,
    headerName: "Status",
  },
  {
    id: 8,
    headerName: "Actions",
  },
];

const OrderInputCsv = ({
  clientInputList,
  setClientInputList,
  csvUploadStatus,
  setCheckValid,
  deleteOrder,
  clientTableListData,
  clients,
  leverageData,
  product
}) => {
  const { singleLtp, selectedSymbol, selectedValueSymbol } = useGlobalContext();
  //update function, when a particular cell is changed
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const list = [...clientInputList];
    // list[index][name] = value;
    let isnum = /^\d+$/.test(value);
    if (isnum) {
      if (parseInt(value) >= 0) {
        list[index][name] = parseInt(value);
      } else {
        list[index][name] = "";
      }
    } else {
      list[index][name] = "";
    }
    setClientInputList(list || []);
    setCheckValid((checkValid) => !checkValid);
  };

  //to delete a row
  const removeOrder = (index) => {
    setClientInputList((prevClientInputList) =>
      prevClientInputList.filter((value, i) => i != index)
    );
    const order = clientInputList.filter((value, i) => i != index);
    deleteOrder(order);
    // setCheckValid((checkValid) => !checkValid);
  };

  //to check order status with respect to margin and quantity for csv file

  ("images/user_connected.svg");
  ("images/user_notConnected.svg");
  const checkOrderStaus = (index) => {
    const price = singleLtp
      ? Number(singleLtp)
      : // ? Number(singleLtp[selectedSymbol.values().next().value]["Price"])
      1;
    const qty = clientInputList[index]["Quantity"];
    const margin = clientInputList[index]["CashMargin"];
    if (qty == 0) {
      return <img src="images/user_notConnected.svg" />;
    } else if (qty * price > margin) {
      return <img src="images/user_notConnected.svg" />;
    } else {
      return <img src="images/user_connected.svg" />;
    }
  };

  return (
    <>
      <Grid>
        <Table compact striped sticked hoverable>
          <Table.Header>
            {clientColumnHeader.map(({ id, headerName }, ind) => {
              return (
                <Table.Column
                  css={{ paddingRight: ind === 0 ? 10 : 0 }}
                  key={id.toString()}
                >
                  {headerName}
                </Table.Column>
              );
            })}
          </Table.Header>
          <Table.Body>
            {clientInputList &&
              clientInputList.map((item, index) => {
                const marginData =
                  item?.CashMargin === "NA"
                    ? "-"
                    : currencyFormatter(item["CashMargin"], 2);
                let requriedMargin =
                  singleLtp === null ? "" : singleLtp * item["Quantity"];
                // singleLtp === null
                //   ? ""
                //   : singleLtp[selectedValueSymbol]["Price"] &&
                //   singleLtp[selectedValueSymbol]["Price"] *
                //   item["Quantity"];

                const requiredMarginValue =
                  product !== "MTF" ? requriedMargin : typeof requriedMargin === "number" && typeof leverageData?.finalmargin === "number"
                    ? (requriedMargin * leverageData.finalmargin) / 100
                    : null;

                const formatRequiredMargin =
                  requiredMarginValue && requiredMarginValue > 0
                    ? formatNumber(requiredMarginValue)
                    : "-";


                const clientCashAvalData = clientTableListData.find(
                  (elem) => elem.client_code === item.ClientId
                ) || { available_balance: "-" };

                return (
                  <Table.Row key={index}>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Image
                        src={`images/brokers/${item[
                          "Broker"
                        ].toLowerCase()}.png`}
                        width={20}
                      />
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      {item["ClientId"]}
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                        width: "100px",
                      }}
                    >
                      <Input
                        underlined
                        value={
                          item["Quantity"] && +item["Quantity"] <= 0
                            ? 0
                            : item["Quantity"]
                        }
                        width="100%"
                        name="Quantity"
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text>
                        {clientCashAvalData?.available_balance === "-"
                          ? clientCashAvalData?.available_balance
                          : currencyFormatter(
                            clientCashAvalData?.available_balance
                          )}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text>{marginData}</Text>
                    </Table.Cell>

                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text>{formatRequiredMargin}</Text>
                    </Table.Cell>

                    {/* <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text>{item["CapsPerSymbol"]}</Text>
                    </Table.Cell> */}

                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                        width: "50px",
                      }}
                    >
                      <Text>{checkOrderStaus(index)}</Text>
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Button
                        auto
                        color="error"
                        css={{
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "100px",
                          marginBottom: "5px",
                        }}
                        onPress={() => removeOrder(index)}
                        icon={
                          <IconTrash
                            type="button"
                            height={20}
                            width={20}
                            color={"#fff"}
                            strokeWidth={2}
                          />
                        }
                      ></Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table>
      </Grid>
    </>
  );
};

export default OrderInputCsv;
