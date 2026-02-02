import React, { useState, useEffect, useCallback } from "react";
import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;
import {
  Card,
  Grid,
  Text,
  Button,
  Row,
  Table,
  Tooltip,
  Col,
} from "@nextui-org/react";
import { IconTrash, IconEye, IconPencil } from "@tabler/icons-react";
import CreateGroup from "./components/createGroup";
import { useGlobalContext } from "../../../context/GlobalContext";
import FilterSearch from "../../hooks/filterSearch";
import ShowClients from "./components/showClients";
import EditGroup from "./components/editGroup";
import CommonConfirmationModal from "../../common/CommonConfirmationModal";

function GroupBase() {
  //state to show create group modal
  const [createVisible, setCreateVisible] = useState(false);
  //state contains group as key and clients as an array
  const { group_Clients, setGroup_Clients } = useGlobalContext();

  const [forceRender, setForceRender] = useState(false);

  const [clientsVisible, setClientsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  //points to the group which is clicked on action column
  const [clickedGroup, setClickedGroup] = useState("default");
  const [rowData, setRowData] = useState(group_Clients);
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filteredData) => {
    setRowData(filteredData);
  };
  //contains group names

  let groupKeys = group_Clients ? Object.keys(rowData) : [];

  useEffect(() => {
    setRowData(group_Clients);
  }, [group_Clients]);

  //removes group and reassigns clients to default group

  const removeGroup = useCallback(() => {
    const groupKey = clickedGroup;
    if (groupKey === "default") {
      return;
    }

    const updatedGroupData = { ...group_Clients };
    const currentGroupClient = updatedGroupData[groupKey] || [];
    const defaultGroupClient = updatedGroupData["default"];
    updatedGroupData["default"] = defaultGroupClient.concat(currentGroupClient);

    delete updatedGroupData[groupKey];

    updateGroupMemory(updatedGroupData);
    setForceRender(!forceRender);
    setIsOpen(false);
  }, [clickedGroup, group_Clients]);

  //updates memory in group and sets groupClient state
  const updateGroupMemory = async (groupData) => {
    const ipcReqBody = {
      field: "group",
      subField: "All",
      data: groupData,
    };

    setGroup_Clients(groupData);
    var memoryResult = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);
  };

  return (
    <>
      {/* create group modal */}
      {group_Clients ? (
        <CreateGroup
          setCreateVisible={setCreateVisible}
          createVisible={createVisible}
          updateGroupMemory={updateGroupMemory}
        />
      ) : (
        ""
      )}
      <CommonConfirmationModal
        isOpen={isOpen}
        title={`Delete Group Confirmation`}
        handleClose={() => setIsOpen(false)}
        handleConfirm={removeGroup}
      />
      <Grid.Container gap={2} justify="center" style={{ height: "70vh" }}>
        <Grid xs={30} sm={30} md={40} lg={55} css={{ height: "70vh" }}>
          <Card
            variant="bordered"
            borderWeight="light"
            css={{
              mw: "400%",
              p: "$10",
              height: "fit-content",
              maxHeight: "fit-content",
              borderColor: "transparent",
            }}
            NormalWeights="light"
          >
            <Card.Header style={{ paddingTop: "1.5rem" }}>
              <Row>
                <Col>
                  <Text h4>Group Management</Text>
                </Col>

                <Col
                  style={{ marginBottom: "15px" }}
                  justify="center"
                  align="right"
                  css={{ mr: "$3" }}
                >
                  <FilterSearch
                    data={group_Clients}
                    fieldToFilter="Group Name"
                    onFilterChange={handleFilterChange}
                  />
                </Col>
                <Col
                  css={{
                    width: "fit-content",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button
                    flat
                    className="primary-button border-radius-8"
                    size="sm"
                    css={{
                      width: "10rem",
                      justifyContent: "center",
                    }}
                    onPress={() => setCreateVisible(true)}
                  >
                    Create Group
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            {/* shows group names */}
            <Card.Body
              style={{
                paddingTop: "0px",
                paddingBottom: "0px",
                //  height: "55vh"
              }}
            >
              {/* <ShowGroups
                updateGroupMemory={updateGroupMemory}
                groupData={group_Clients}
              /> */}
              {group_Clients ? (
                <ShowClients
                  clickedGroup={clickedGroup}
                  clientsVisible={clientsVisible}
                  setClientsVisible={setClientsVisible}
                />
              ) : (
                ""
              )}
              {group_Clients ? (
                <EditGroup
                  clickedGroup={clickedGroup}
                  setClickedGroup={setClickedGroup}
                  editVisible={editVisible}
                  setEditVisible={setEditVisible}
                  updateGroupMemory={updateGroupMemory}
                />
              ) : (
                ""
              )}
              {/* <div style={{ marginBottom: "$4" }}> */}
              <Card
                variant="bordered"
                borderWeight="light"
                css={{
                  borderColor: "transparent",

                  width: "100%",
                  p: "$3",
                  //borderRadius: "10px",
                  // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* </div> */}
                <div style={{ marginTop: "$4" }}>
                  <Table
                    // style={{height: "350px", maxHeight:"350px"}}
                    compact
                    striped
                    sticked
                    hoverable
                  >
                    <Table.Header>
                      <Table.Column>
                        <Row justify="center">Group ID</Row>
                      </Table.Column>
                      <Table.Column>
                        <Row justify="center">Group Name</Row>
                      </Table.Column>
                      <Table.Column>
                        <Row justify="center">Action</Row>
                      </Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {Array.isArray(groupKeys) &&
                        groupKeys.map((item, index) => {
                          return (
                            <Table.Row key={item.toString()}>
                              <Table.Cell
                                css={{
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  borderColor: "$gray200",
                                  padding: "$5",
                                }}
                              >
                                <Row justify="center">
                                  <Text>{index + 1}</Text>
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
                                  {/* {filteredGroupKeys ?  filteredGroupKeys.map(filteredItem=><Text>{filteredItem}</Text>):  <Text>{item}</Text>} */}
                                  <Text>{item.toUpperCase()}</Text>
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
                                  <Tooltip
                                    content="view group"
                                    onClick={() => {
                                      setClickedGroup(item);
                                      setClientsVisible(true);
                                    }}
                                  >
                                    <IconEye
                                      height={25}
                                      width={25}
                                      strokeWidth={2}
                                      color={"#000"}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </Tooltip>
                                  <Tooltip
                                    content="edit group"
                                    onClick={() => {
                                      if (item !== "default") {
                                        setClickedGroup(item);
                                        setEditVisible(true);
                                      } else {
                                        console.log("not editing default!");
                                      }
                                    }}
                                  >
                                    <IconPencil
                                      height={25}
                                      width={25}
                                      strokeWidth={2}
                                      className="primary-text-color"
                                      // color={"#0072f5"}
                                      style={{
                                        margin: "0px 10px 0px 10px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip
                                    content="Delete Group"
                                    onClick={() => {
                                      if (item !== "default") {
                                        setIsOpen(true)
                                        setClickedGroup(item)
                                      } else {
                                        console.log("not deleting default!");
                                      }
                                    }}
                                  >
                                    <IconTrash
                                      type="button"
                                      height={25}
                                      width={25}
                                      color={"#F31260"}
                                      strokeWidth={2}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </Tooltip>
                                </Row>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                    </Table.Body>
                    {/* <Row> */}
                    <Table.Pagination
                      size={"sm"}
                      Margin
                      align="center"
                      rowsPerPage={6}
                      onPageChange={(page) => console.log({ page })}
                    />
                    {/* </Row> */}
                  </Table>
                </div>
              </Card>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
}

export default GroupBase;
