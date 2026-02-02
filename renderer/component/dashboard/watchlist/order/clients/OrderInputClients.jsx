import {
  Col,
  Container,
  Image,
  Input,
  Row,
  Text,
  Table,
  Tooltip,
  Button,
  Grid,
} from "@nextui-org/react";
import { IconLink, IconTrash } from "@tabler/icons-react";

const OrderInputClients = ({
  clientInputList,
  setClientInputList,
  csvUploadStatus,
}) => {
  const price = 100;

  

  //update function, when a particular cell is changed
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    

    const list = [...clientInputList];
    list[index][name] = value;
    setClientInputList(list || []);
  };

  //to delete a row
  const removeOrder = (index) => {
    setClientInputList((prevClientInputList) =>
      prevClientInputList.filter((value, i) => i != index)
    );
  };

  //to check order status with respect to margin and quantity for csv file
  const checkOrderStaus = (index) => {
    const qty = clientInputList[index]["Quantity"];
    const margin = clientInputList[index]["CashMargin"];
    if (qty == 0) {
      return "fill Qty";
    } else if (qty * price > margin) {
      return "Invalid Qty";
    } else {
      return "Executable";
    }
  };

  //to make column dynamic

  return (
    <>
      <Table compact shadow="false" bordered striped sticked>
        <Table.Header>
          <Table.Column css={{ paddingRight: 10 }}>Broker</Table.Column>
          <Table.Column>Client ID</Table.Column>
          <Table.Column>Quantity</Table.Column>
          <Table.Column>Margin</Table.Column>
          <Table.Column>Status</Table.Column>
          <Table.Column>Actions</Table.Column>
        </Table.Header>
        <Table.Body>
          {clientInputList &&
            clientInputList.map((item, index) => {
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
                      initialValue={item["Quantity"]}
                      width="100%"
                      name="Quantity"
                      onBlur={(e) => handleInputChange(e, index)}
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
                    <Input
                      underlined
                      initialValue={item["CashMargin"]}
                      width="100%"
                      name="CashMargin"
                      onBlur={(e) => handleInputChange(e, index)}
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
                      css={{ width: "2rem" }}
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
    </>
  );
};

export default OrderInputClients;
