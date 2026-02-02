import {
  Col,
  Container,
  Grid,
  Image,
  Input,
  Row,
  Table,
  Text,
} from "@nextui-org/react";

const OrderInputGroups = ({
  groupInputList,
  setGroupInputList,
  Ltp,
  lotSize,
  currentData,
}) => {
  const handleInputChange = (e, index) => {
    const { value } = e.target;

    setGroupInputList((prevList) =>
      prevList.map((item, ind) =>
        ind === index ? { ...item, Quantity: value } : item
      )
    );
  };

  const checkOrderStatus = (index, stockData, requiredMargin) => {
    // const price = 100;
    // const qty = groupInputList[index]["Quantity"];
    const margin = groupInputList[index]["CashMargin"];

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

  // const checkOrderStaus = (index) => {
  //   // const price = 100;
  //   const qty = groupInputList[index]["Quantity"];
  //   const margin = groupInputList[index]["CashMargin"];

  //   if (qty == 0) {
  //     return <img src="images/user_notConnected.svg" />;
  //   } else if (qty * Ltp * lotSize > margin) {
  //     return <img src="images/user_notConnected.svg" />;
  //   } else {
  //     return <img src="images/user_connected.svg" />;
  //   }
  // };

  const requiredMarginFormat = (obj, item) => {
    if (
      !obj ||
      !Object.keys(obj).length ||
      Ltp === undefined ||
      currentData?.ltp === 0
    )
      return 0;

    return currentData?.orderSide === "Sell"
      ? "-"
      : +currentData?.ltp * item["Quantity"] * +currentData?.lotSize;
  };

  return (
    <>
      <Grid>
        <Table style={{ zIndex: 99 }} compact striped sticked hoverable>
          <Table.Header>
            <Table.Column css={{ paddingRight: 10 }}>Broker</Table.Column>
            <Table.Column>Client Id</Table.Column>
            <Table.Column>No. of Lots</Table.Column>
            <Table.Column>Margin</Table.Column>
            <Table.Column>Requried Margin</Table.Column>
            <Table.Column>Status</Table.Column>
          </Table.Header>
          <Table.Body>
            {groupInputList &&
              groupInputList.map((item, index) => {
                const requiredMargin = requiredMarginFormat(currentData, item);

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
                        width: "200px",
                      }}
                    >
                      <Input
                        underlined
                        value={
                          item["Quantity"] && +item["Quantity"] <= 0
                            ? 0
                            : item["Quantity"]
                        }
                        // initialValue={item["Quantity"]}
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
                      <Text h6>{item["CashMargin"]}</Text>
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
                        {requiredMargin === "-"
                          ? requiredMargin
                          : requiredMargin?.toFixed(2)}
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
                        {checkOrderStatus(index, currentData, requiredMargin)}
                      </Text>
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

export default OrderInputGroups;
