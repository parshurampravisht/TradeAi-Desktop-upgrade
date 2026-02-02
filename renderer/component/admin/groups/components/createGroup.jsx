import { Button, Input, Modal, Spacer, Text } from "@nextui-org/react";
import Multiselect from "multiselect-react-dropdown";
import { useGlobalContext } from "../../../../context/GlobalContext";
import { useState, useMemo, useCallback, useEffect } from "react";

const CreateGroup = (props) => {
  const { group_Clients, clientsData } = useGlobalContext();
  const [groupName, setGroupName] = useState(''); //group name taken from input
  const [selectedClientsGroup, setSelectedClientsGroup] = useState([]); //clients selected from dropdown

  const clients = useMemo(() => {
    return clientsData.map((client) => ({
      value: client.clientId, // Save clientId as the value
      label: `${client.clientName
        ? `${client.clientId} (${client.clientName})`
        : `${client.clientId}`
        }`, // Display clientId (clientName)
    }));
  }, [clientsData]);

  const closeHandler = () => {
    props.setCreateVisible(false);
    setGroupName('')
    setSelectedClientsGroup([])
  };

  const isButtonDisabled = useMemo(() => {

    if (!groupName.trim() || !selectedClientsGroup.length) return true

    return false

  }, [groupName, selectedClientsGroup])

  const submitHandler = useCallback(async () => {
    const selected_clients = selectedClientsGroup || []; //clients selected from dropdown

    if (!groupName || !selected_clients.length) return;

    var default_clients = group_Clients.default || []; //clients in default group

    let selectedClientsId = selected_clients.map((item) => item.value)
    // //removing common clients selected to create group from default clients
    // default_clients = selectedClientsId.filter(
    //   (item) => !selected_clients.includes(item)
    // );

    const groupData = {
      ...group_Clients,
      default: default_clients,
    };

    //making new key as new group name and assigning the selected clients
    groupData[groupName] = selectedClientsId;

    //setting memory and group key/array datstructure
    props.updateGroupMemory(groupData);
    props.setCreateVisible(false);
    setGroupName('');
    setSelectedClientsGroup([]);
  }, [groupName, selectedClientsGroup, group_Clients]);


  useEffect(() => {

    return () => {
      setGroupName('')
      setSelectedClientsGroup([])
    }
  }, [])

  return (
    <>
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={props.createVisible}
        onClose={closeHandler}
        width="80vh"
        className="create-group-modal"
        css={{
          minHeight: "50vh",
          // height: "80vh",
          //   width: "60vh",
        }}
      >
        <Modal.Header className="flex-row justify-start">
          <Text b size={18}>
            Create Group
          </Text>
        </Modal.Header>
        <Modal.Body className="group-input-wrapper">
          <Input
            style={{ borderRadius: "4px", margin: "0px" }}
            clearable
            bordered
            borderWeight="light"
            width="100%"
            size="md"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
            }}
          />
          {/* <Spacer y={0.2} /> */}
          {/* multiselect code to choose groups from default clients */}
          <div
            style={{ height: "300px", overflowX: "hidden", overflowY: "auto" }}
            className={"createGroupCustomDropdown"}
          >
            <Multiselect
              isObject={true}
              onKeyPressFn={function noRefCheck() { }}
              onRemove={(item) => {
                setSelectedClientsGroup(item);
              }}
              onSearch={function noRefCheck() { }}
              onSelect={(item) => {
                //item contains all the selected values till now
                setSelectedClientsGroup(item);
              }}
              //replace this with list of available symbols api
              options={clients}
              displayValue="label"
              // options={group_Clients.default}
              placeholder="Select clients"
              selectedValueDecorator={(selected, _options) => {
                return _options?.value;
              }}
            ></Multiselect>
          </div>
        </Modal.Body>
        <Modal.Footer >
          <Button className="secondary-button" auto flat onPress={closeHandler}>
            Close
          </Button>
          <Button
            className={`${isButtonDisabled ? `disable-button` : `primary-button`
              } border-radius-8`}
            disabled={isButtonDisabled}
            auto
            flat
            onPress={submitHandler}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateGroup;
