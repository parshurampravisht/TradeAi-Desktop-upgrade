import { Button, Grid, Input, Table, Image, Text } from "@nextui-org/react";
import { IconTrash } from "@tabler/icons-react";
import { currencyFormatter } from "../../../helpers";
import { useGlobalContext } from "../../../context/GlobalContext";
import { useEffect } from "react";

const ClientTable = (props) => {
  const { currentData } = props;
  //update function, when a particular cell is changed
  const { LTPData } = useGlobalContext();

  // const handleInputChange = (e, index) => {
  //   const { name, value } = e.target;

  //   const list = [...props.clientTableData];
  //   list[index][name] = value;
  //   props.setClientTableData(list);
  //   // setCheckValid((checkValid) => !checkValid);
  // };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const updatedList = [...props.clientTableData];
    updatedList[index][name] = value;

    const quantity = +updatedList[index]["Quantity"];
    const ltp = currentData?.ltp;
    const lotSize = +currentData?.lotSize;
    const isSell = currentData?.orderSide === "Sell";

    const requiredMargin =
      !currentData ||
      !Object.keys(currentData).length ||
      props?.Ltp === undefined ||
      !ltp ||
      quantity <= 0 ||
      isSell
        ? "-"
        : ltp * quantity * lotSize;

    updatedList[index].requiredMargin = requiredMargin;

    props.setClientTableData(updatedList);
  };

  //to delete a row
  const removeOrder = (client_id) => {
    props.setClientTableData((prevClientInputList) =>
      prevClientInputList.filter((item, i) => item.ClientId != client_id)
    );
    // setCheckValid((checkValid) => !checkValid);
  };

  // const checkOrderStaus = (index) => {
  //   // const price = 100;
  //   const qty = props.clientTableData[index]["Quantity"];
  //   const margin = props.clientTableData[index]["CashMargin"];
  //   if (qty == 0) {
  //     return <img src="images/user_notConnected.svg" />;
  //   } else if (qty * props.Ltp * props.lotSize > margin) {
  //     return <img src="images/user_notConnected.svg" />;
  //   } else {
  //     return <img src="images/user_connected.svg" />;
  //   }
  // };

  const checkOrderStatus = (index, stockData, requiredMargin) => {
    // const price = 100;
    // const qty = props.clientTableData[index]["Quantity"];
    const margin = props.clientTableData[index]["CashMargin"];
    const isValidStatus =
      !stockData ||
      !Object.keys(stockData).length ||
      stockData?.orderSide === "Sell" ||
      requiredMargin === "-"
        ? true
        : requiredMargin > margin
        ? false
        : true;

    if (isValidStatus) return <img src="images/user_connected.svg" />;
    else return <img src="images/user_notConnected.svg" />;
  };

  const requiredMarginFormat = (obj, item) => {
    if (
      !obj ||
      !Object.keys(obj).length ||
      props?.Ltp === undefined ||
      currentData?.ltp === 0
    )
      return 0;

    return currentData?.orderSide === "Sell" || currentData?.ltp === undefined
      ? "-"
      : +currentData?.ltp * item["Quantity"] * +currentData?.lotSize;
  };

  useEffect(() => {
    if (!Array.isArray(props.clientTableData)) return [];

    props.setClientTableData((prev) => {
      return prev.map((item) => {
        const quantity = +item["Quantity"];
        const ltp = currentData?.ltp;
        const lotSize = +currentData?.lotSize;
        const isSell = currentData?.orderSide === "Sell";

        const requiredMargin =
          !currentData ||
          !Object.keys(currentData).length ||
          props?.Ltp === undefined ||
          !ltp ||
          quantity <= 0 ||
          isSell
            ? "-"
            : ltp * quantity * lotSize;

        return {
          ...item,
          requiredMargin,
        };
      });
    });
  }, [currentData]);

  return (
    <>
      <Grid css={{ width: "100%" }} className="op-chain-table">
        <Table style={{ zIndex: 99 }} compact striped sticked hoverable>
          <Table.Header>
            <Table.Column css={{ paddingRight: 10 }}>Broker</Table.Column>
            <Table.Column>Client ID</Table.Column>
            <Table.Column>No. of Lots</Table.Column>
            <Table.Column>Total Quantity</Table.Column>
            <Table.Column>Margin</Table.Column>
            <Table.Column>Requried Margin</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Actions</Table.Column>
          </Table.Header>
          <Table.Body>
            {props.clientTableData.map((item, index) => {
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
                      src={`images/brokers/${item["Broker"].toLowerCase()}.png`}
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
                    }}
                  >
                    <Input
                      underlined
                      initialValue={
                        item["Quantity"] && +item["Quantity"] <= 0
                          ? 0
                          : item["Quantity"]
                      }
                      width="100%"
                      name="Quantity"
                      value={
                        item["Quantity"] && +item["Quantity"] <= 0
                          ? 0
                          : item["Quantity"]
                      }
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
                      {+item["Quantity"] * props.lotSize <= 0
                        ? 0
                        : +item["Quantity"] * props.lotSize}
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
                    <Text>{currencyFormatter(item["CashMargin"], 2)}</Text>
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
                      {item.requiredMargin === "-" || !item?.requiredMargin
                        ? "-"
                        : item.requiredMargin?.toFixed(2)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell
                    css={{
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderColor: "$gray200",
                      padding: "$5",
                      width: "50px",
                    }}
                  >
                    <Text>
                      {checkOrderStatus(
                        index,
                        currentData,
                        item.requiredMargin
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
                    <Button
                      auto
                      color="error"
                      css={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "100px",
                        marginBottom: "5px",
                      }}
                      onPress={() => removeOrder(item.ClientId)}
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

export default ClientTable;
