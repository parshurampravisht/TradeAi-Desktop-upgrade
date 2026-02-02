import { Modal, Table, Link } from "@nextui-org/react";
export default function LastAsk(props) {
  const handler = () => {
    props.setToggle(true);
  };
  const closeModalHandler = () => {
    props.setToggle(false);
  };
  const columns = [
    { key: "BIDQTY", label: "BIDQTY" },
    { key: "Bidrate", label: "Bidrate" },
    { key: "AskQTY", label: "AskQTY" },
    { key: "Askrate", label: "Askrate" },
  ];
  const data = [
    { key: 1, BIDQTY: 500, Bidrate: 40, AskQTY: 500, Askrate: 40 },
    { key: 2, BIDQTY: 1000, Bidrate: 10, AskQTY: 1000, Askrate: 10 },
    { key: 3, BIDQTY: 50, Bidrate: 70, AskQTY: 50, Askrate: 60 },
    { key: 4, BIDQTY: 3000, Bidrate: 20, AskQTY: 3000, Askrate: 2900 },
    { key: 5, BIDQTY: 400, Bidrate: 100, AskQTY: 400, Askrate: 550 },
  ];
  return (
    <div>
      <Link auto onPress={handler}>
        Last Asks History
      </Link>
      <Modal closeButton open={props.toggle} onClose={closeModalHandler} blur>
        <Modal.Header>Asks</Modal.Header>
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
