import {
  Button,
  Grid,
  Image,
  Modal,
  Row,
  Spacer,
  Table,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { useGlobalContext } from "../../../../context/GlobalContext";
import { useEffect, useRef, useState, useMemo } from "react";
import Multiselect from "multiselect-react-dropdown";
import { IconTrash } from "@tabler/icons-react";
import DialogueBox from "../../../base/dialogueBox/dialogueBox";

const EditGroup = ({
  clickedGroup,
  setClickedGroup,
  editVisible,
  setEditVisible,
  updateGroupMemory,
}) => {
  const { group_Clients, clientsData, clientCreds } = useGlobalContext();
  const [selectedClients, setSelectedClients] = useState([]); //state for selected clients from multiselect dropdown
  const [selectedClientsWithIds, setSelectedClientsWithId] = useState([]);
  const [clientData, setClientData] = useState([]); //stae to show tables of clients
  const [options, setOptions] = useState([]); //options for multiselct drop down
  const [anyEvent, setAnyEvent] = useState(false); //to check edit event happened eg: delete event or add event
  const [showDialogueBox, setShowDialogueBox] = useState(false);

  const filterClientIdsHandler = (clientsArr) => {
    let selectedClientsId = [];
    for (let key of clientsArr) {
      selectedClientsId.push(key.value);
    }
    return selectedClientsId;
  };

  const OptionsHandler = (clientArr) => {
    const clients = clientsData
      .filter((item) => !clientArr?.includes(item.clientId))
      .map((client) => ({
        value: client.clientId, // Save clientId as the value
        label: `${client.clientName
          ? `${client.clientId} (${client.clientName})`
          : `${client.clientId}`
          }`, // Display clientId (clientName)
      }));

    setOptions(clients);
  };

  //checks for the given client in clients credentials and return it's broker name
  const getBroker = (clientID) => {
    var broker = "null";
    clientCreds.forEach((item, index) => {
      if (item["Client ID"] == clientID) {
        broker = item["Broker"];
      }
    });
    return broker;
  };

  //takes arrays of clients and transform into next ui table data format
  const structureClientsTable = (clientArr) => {
    const tempClients = [];
    clientArr &&
      clientArr.forEach((clientId, index) => {
        const broker = getBroker(clientId);
        tempClients.push({
          Index: index + 1,
          "Client ID": clientId,
          Broker: broker,
        });
      });
    return tempClients;
  };

  useEffect(() => {
    //passing array of clients in the selected group
    const clientArr = group_Clients[clickedGroup];

    if (Array.isArray(clientArr) && clientArr.length) {
      const firstElement = clientArr[0];
      let tempClients = [];
      //preparing array of clients with broker from clients credentials
      if (typeof firstElement === "string") {
        tempClients = structureClientsTable(clientArr);
      } else if (
        typeof firstElement === "object" &&
        !Array.isArray(firstElement) &&
        firstElement !== null
      ) {
        const filterSelectedClientsId = filterClientIdsHandler(clientArr);
        tempClients = structureClientsTable(filterSelectedClientsId);
      }
      setClientData(tempClients);
    } else {
      setClientData([]);
    }

    OptionsHandler(clientArr);
    // setOptions(clients);
  }, [clickedGroup]);

  //during edit click "add" button, when more clients are added to the group
  const addMoreClients = () => {
    //passing list of selected clients from dropdown
    //it returns transformed format for next ui table
    const filterSelectedClientsId = filterClientIdsHandler(selectedClients);
    setSelectedClientsWithId(filterSelectedClientsId);
    const tempClients = structureClientsTable(filterSelectedClientsId);
    //concating recently transformed data
    setClientData((prev) => [...prev, ...tempClients]);
    //removing selected clients from the option of dopdown
    const newOptions = options.filter(
      (item) => filterSelectedClientsId.indexOf(item.value) == -1
    );
    setOptions(newOptions);
    setAnyEvent(true);
    setSelectedClients([]);
  };

  //remove client fron the group and client table
  const removeClient = (index) => {
    const clientID = clientData[index]["Client ID"];

    // Add client back to options
    setOptions(prev => [...prev, { label: clientID, value: clientID }]);

    // Create a new copy of clientData to avoid direct mutation
    const newClientData = [...clientData];
    newClientData.splice(index, 1);

    // Update state with new reference
    setClientData(newClientData);

    // Enable submit button
    setAnyEvent(true);
  };


  //setting changes in memory and global context variable
  const submitHandler = () => {
    let tempGroupClients = group_Clients;
    const updatedClients = clientData.map((item) => item["Client ID"]);
    //default group should conatins clients in the options
    tempGroupClients = {
      ...tempGroupClients,
      // default: options,
    };
    // edited group contains all clients in the table
    tempGroupClients[clickedGroup] = updatedClients;
    //updating the memory
    updateGroupMemory(tempGroupClients);
    closeHandler();
  };

  //hiding the modal
  const closeHandler = () => {
    setShowDialogueBox(false);
    setEditVisible(false);
    setSelectedClients([]);
    setAnyEvent(false);
    //to sync the data on clicking the group
    setClickedGroup("default");
  };

  const sanitizeItems = (items) =>
    items?.filter((item) => item?.label && typeof item.label === "string") || [];


  const cleanSelected = useMemo(() => sanitizeItems(selectedClients), [selectedClients]);

  const cleanOptions = useMemo(() => {
    const selectedValues = new Set(cleanSelected.map((item) => item.value));
    return sanitizeItems(options).filter(
      (option) => !selectedValues.has(option.value)
    );
  }, [options, cleanSelected]);

  return (
    <>
      <Modal
        /* style={{width:'100px', height:'500px'}} */
        closeButton
        blur
        aria-labelledby="modal-title"
        open={editVisible}
        onClose={closeHandler}
        width="80vh"
        minHeight="80vh"
        /* css={{
          height: "50vh",
          //   width: "60vh",
        }} */
        preventClose
      >
        <Modal.Header>
          <Text b size={18}>
            Edit Group: {clickedGroup.toUpperCase()}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Grid.Container justify="center" style={{ position: "relative" }}>
            <Grid css={{ width: "100%" }}>
              <Text b size={18}>
                Add more clients
              </Text>
              <Spacer y={0.2} />

              <Multiselect
                isObject={true}
                onKeyPressFn={function noRefCheck() { }}
                onSearch={function noRefCheck() { }}
                options={cleanOptions}
                selectedValues={cleanSelected}
                onSelect={(items) => setSelectedClients(items)}
                onRemove={(items) => setSelectedClients(items)}
                //replace this with list of available symbols api
                displayValue="label"
                // options={group_Clients.default}
                placeholder="Select clients"
                selectedValueDecorator={(selected, _options) => {
                  return _options?.value || "";
                }}
              ></Multiselect>

              <Spacer y={0.3} />
              <Button
                flat
                auto
                className={selectedClients.length == 0 ? "disable-button" : "primary-button"}
                disabled={selectedClients.length == 0}
                onPress={() => {
                  addMoreClients();
                }}
              >
                Add
              </Button>
            </Grid>
            <Spacer y={1} />
            {!showDialogueBox ? (
              <Grid css={{ width: "100%" }} style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                    <Table.Column>
                      <Row justify="center">Action</Row>
                    </Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {clientData &&
                      clientData.map((clientItem, index) => {
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
                                <Text>{clientItem["Index"]}</Text>
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
                                <Text>{clientItem["Client ID"]}</Text>
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
                                  src={`images/brokers/${clientItem[
                                    "Broker"
                                  ]?.toLowerCase()}.png`}
                                  width={20}
                                />
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
                              <Row css={{ cursor: "pointer" }} justify="center">
                                <Tooltip
                                  content="Delete Group"
                                  onClick={() => {
                                    removeClient(index);
                                  }}
                                >
                                  <IconTrash
                                    type="button"
                                    height={25}
                                    width={25}
                                    color={"#F31260"}
                                    strokeWidth={2}
                                  />
                                </Tooltip>
                              </Row>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                  </Table.Body>
                </Table>
              </Grid>
            ) : null}
            {/* { showDialogueBox ? <DialogueBox message={'Are you sure you wish to cancel, your changes will be discarded'} yesAction={closeHandler} noAction={()=>setShowDialogueBox(false)}/> : null} */}
          </Grid.Container>
        </Modal.Body>
        <Modal.Footer justify="space-between">
          {showDialogueBox ? (
            <DialogueBox
              message={
                "Are you sure you wish to cancel, your changes will be discarded"
              }
              open={showDialogueBox}
              yesAction={closeHandler}
              noAction={() => setShowDialogueBox(false)}
            />
          ) : (
            <Grid.Container className="flex-row justify-end column-gap-10">
              <Button
                color={"error"}
                className="secondary-button"
                // disabled={!anyEvent}
                onPress={() => setShowDialogueBox(true)} /* closeHandler() */
                auto
                style={{
                  // marginLeft: "20px",
                  // marginBottom: "10px",
                  // marginTop: "10px",
                  width: "100px",
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!anyEvent}
                onPress={() => submitHandler()}
                auto
                className="primary-button"
                flat
                style={{
                  // marginLeft: "20px",
                  // marginBottom: "10px",
                  // marginTop: "10px",
                  width: "100px",
                }}
              >
                Save
              </Button>
            </Grid.Container>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditGroup;
