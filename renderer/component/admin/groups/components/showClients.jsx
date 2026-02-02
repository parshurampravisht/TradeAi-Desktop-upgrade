import { Grid, Image, Modal, Row, Table, Text } from "@nextui-org/react";
import { useGlobalContext } from "../../../../context/GlobalContext";
import { useEffect, useState } from "react";
import { brokerLogoFormatHandler } from "../../../../constant/constant";

const ShowClients = ({ clickedGroup, clientsVisible, setClientsVisible }) => {
  const { group_Clients, clientCreds } = useGlobalContext();
  const [clientData, setClientdata] = useState([]);
  //showing clicked clicked group clients in the table
  useEffect(() => {
    const tempClients = [];
    //iterating clients for the selected group
    if (group_Clients[clickedGroup]) {
      group_Clients[clickedGroup].forEach((clientId, index) => {
        const broker = getBroker(clientId);
        tempClients.push({
          Index: index + 1,
          "Client ID": clientId,
          Broker: broker,
        });
      });
      setClientdata(tempClients);
    }


  }, [clickedGroup, group_Clients]);
  //get broker name for the clients in the group from client credentials
  const getBroker = (clientID) => {
    var broker = "null";
    clientCreds.forEach((item, index) => {
      if (item["Client ID"] == clientID) {
        broker = item["Broker"];
      }
    });
    return broker;
  };

  const closeHandler = () => {
    setClientsVisible(false);
  };
  return (
    <>
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={clientsVisible}
        onClose={closeHandler}
        width="60vh"
        css={{
          height: "50vh",
          //   width: "60vh",
        }}
      >
        <Modal.Header>
          <Text b size={18}>
            {clickedGroup.toUpperCase()}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Grid.Container justify="center">
            <Grid css={{ width: "100%" }}>
              <Table compact striped sticked hoverable>
                <Table.Header>
                  <Table.Column>
                    <Row justify="center">S no.</Row>
                  </Table.Column>
                  <Table.Column>
                    <Row justify="center">Client ID</Row>
                  </Table.Column>
                  <Table.Column>
                    <Row justify="center">Broker</Row>
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {clientData &&
                    clientData.map((item, index) => {
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
                            <Row justify="center">
                              <Text>{item["Index"]}</Text>
                            </Row>
                          </Table.Cell>

                          <Table.Cell
                            css={{
                              borderStyle: "solid",
                              borderWidth: "1px",
                              borderColor: "$gray200",
                              padding: "$5",
                            }}
                          >
                            <Row justify="center">
                              <Text>{item["Client ID"]}</Text>
                            </Row>
                          </Table.Cell>

                          <Table.Cell
                            css={{
                              borderStyle: "solid",
                              borderWidth: "1px",
                              borderColor: "$gray200",
                              padding: "$5",
                            }}
                          >
                            <Row justify="center">
                              <Image
                                src={brokerLogoFormatHandler(item["Broker"])}
                                width={20}
                              />
                            </Row>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                </Table.Body>
              </Table>
            </Grid>
          </Grid.Container>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
};

export default ShowClients;
