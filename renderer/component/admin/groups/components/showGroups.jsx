import { IconTrash, IconEye, IconPencil } from "@tabler/icons-react";
import { useGlobalContext } from "../../../../context/GlobalContext";
import {
  Button,
  Row,
  Table,
  Text,
  Tooltip,
  Col,
  Input,
  Card,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import ShowClients from "./showClients";
import EditGroup from "./editGroup";
import FilterSearch from "../../../hooks/filterSearch";

const ShowGroups = ({ updateGroupMemory, groupData }) => {
  const [forceRender, setForceRender] = useState(false);

  const [clientsVisible, setClientsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  //points to the group which is clicked on action column
  const [clickedGroup, setClickedGroup] = useState("default");

  const [rowData, setRowData] = useState(groupData);

  const handleFilterChange = (filteredData) => {
    setRowData(filteredData);
  };
  //contains group names

  let groupKeys = groupData ? Object.keys(rowData) : null;
  useEffect(() => {
    setRowData(groupData);
  }, [groupData]);

  //removes group and reassigns clients to default group

  const removeGroup = (groupKey) => {
    if (groupKey === "default") {
      return;
    }

    const updatedGroupData = { ...groupData };
    const currentGroupClient = updatedGroupData[groupKey] || [];
    const defaultGroupClient = updatedGroupData["default"];
    updatedGroupData["default"] = defaultGroupClient.concat(currentGroupClient);

    delete updatedGroupData[groupKey];

    updateGroupMemory(updatedGroupData);
    setForceRender(!forceRender);
  };

  return (
    <>
      {groupData ? (
        <ShowClients
          clickedGroup={clickedGroup}
          clientsVisible={clientsVisible}
          setClientsVisible={setClientsVisible}
        />
      ) : (
        ""
      )}
      {groupData ? (
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
        <Row>
          <Col justify="center" align="center" css={{ margin: "$1" }}>
            <FilterSearch
              data={groupData}
              fieldToFilter="Group Name"
              onFilterChange={handleFilterChange}
            />
          </Col>
        </Row>

        {/* </div> */}
        <div style={{ marginTop: "$4" }}>
          <Table compact striped sticked hoverable>
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
              {groupKeys &&
                groupKeys.map((item, index) => {
                  return (
                    <Table.Row key={item}>
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
                              color={"#0072f5"}
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
                                removeGroup(item);
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
            <Table.Pagination
              size={"sm"}
              Margin
              align="center"
              rowsPerPage={3}
              onPageChange={(page) => console.log({ page })}
            />
          </Table>
        </div>
      </Card>
    </>
  );
};

export default ShowGroups;
