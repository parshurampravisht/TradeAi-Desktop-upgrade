import { Modal, Table, Link, Text } from "@nextui-org/react";
import { useGlobalContext } from "../../../../../context/GlobalContext";

export default function LastBids(props) {
  const { selectedValueSymbol } = useGlobalContext();
  const handler = () => {
    if (!selectedValueSymbol ) {
      props.setToggle(true);
    }
  };
  const closeModalHandler = () => {
    props.setToggle(false);
  };
  const columns = [
    { key: "sno", label: "sno" },
    { key: "BIDQTY", label: "BIDQTY" },
    { key: "Bidrate", label: "Bidrate" },
    { key: "AskQTY", label: "AskQTY" },
    { key: "Askrate", label: "Askrate" },
  ];
  const data = [
    { key: 1, sno: 1, BIDQTY: 500, Bidrate: 40, AskQTY: 500, Askrate: 40 },
    { key: 2, sno: 2, BIDQTY: 1000, Bidrate: 10, AskQTY: 1000, Askrate: 10 },
    { key: 3, sno: 3, BIDQTY: 50, Bidrate: 70, AskQTY: 50, Askrate: 60 },
    { key: 4, sno: 4, BIDQTY: 3000, Bidrate: 20, AskQTY: 3000, Askrate: 2900 },
    { key: 5, sno: 5, BIDQTY: 400, Bidrate: 100, AskQTY: 400, Askrate: 550 },
  ];
  const totalQuantity = (data) => {
    let sum = 0;
    for (const item of data) {
      sum += item.BIDQTY;
    }
    return sum;
  };
  const totalRate = (data) => {
    let sum = 0;
    for (const item of data) {
      sum += item.Bidrate;
    }
    return sum;
  };
  const resultTable = [
    {
      key: 6,
      sno: "Total",
      BIDQTY: totalQuantity(data),
      Bidrate: totalRate(data),
      AskQTY: totalQuantity(data),
      Askrate: totalRate(data),
    },
  ];
  data.push(resultTable[0]);
  

  return (
    <div>
      <Link auto onPress={handler}>
        <Text
          h6
          color={selectedValueSymbol !== "Symbol" ? "#0072F5" : "#808080"}
        >
          Last Bid/Ask History
        </Text>
      </Link>
      <Modal closeButton open={props.toggle} onClose={closeModalHandler} blur>
        <Modal.Header>{props.symbol}</Modal.Header>
        <Modal.Body>
          <Table>
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column key={column.key}>{column.label}</Table.Column>
              )}
            </Table.Header>
            <Table.Body items={data}>
              {(item) => (
                <Table.Row key={item.key}>
                  {(columnKey) => <Table.Cell>{item[columnKey]}</Table.Cell>}
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
}
