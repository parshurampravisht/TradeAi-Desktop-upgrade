import {
  Table,
  Row,
  Col,
  Tooltip,
  User,
  Text,
  Input,
  Badge,
  Image,
  Grid,
  Spacer,
  Container,
  Card,
  Button,
} from "@nextui-org/react";
import { IconButton } from "./IconButton";
import { useState, useEffect, useContext, useRef } from "react";
import { IconAlertTriangle, IconLink, IconSearch } from "@tabler/icons-react";

import electron from "electron";
import { IconLinkOff } from "@tabler/icons-react";
import { useGlobalContext } from "../../../context/GlobalContext";
const ipcRenderer = electron.ipcRenderer || false;

const SectionClientGroup = () => {
  const [user, setUser] = useState([]);
  const originalUsers = useRef([]); // storing clients data from the user
  const { fixClient } = useGlobalContext();
  const [selectedKeys, setSelectedKeys] = useState(new Set(["NIDHI972"]));
  const columns = [
    { name: "NAME", uid: "name" },
    { name: "Broker", uid: "broker" },
    { name: "ACTIONS", uid: "actions" },
    { name: "STATUS", uid: "status" },
  ];

  useEffect(() => {
    const getClientsIds = async () => {
      //clients data from the electron store
      var cln = await ipcRenderer.invoke("readMemory-ipc", "clientStatus");
      setUser(cln);
      //initiating users with all clients
      originalUsers.current = cln;
    };
    getClientsIds();
  }, []);

  const filterAccounts = (searchTerm) => {
    //if no client is clicked, return all the clients
    if (searchTerm == "") {
      return originalUsers.current;
    } else if (searchTerm !== "") {
      //return clients who matches the search string
      return originalUsers.current.filter((clname) => {
        return clname.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    } else {
      return "There doesn't seem to be an account associated with this profile. Please add an account to continue.";
    }
  };

  //on search filter the clients
  const handleChange = (event) => {
    //  Get input value from "event"
    const clients = filterAccounts(event.target.value);
    setUser(clients);
  };

  //when some client is clicked send that client name to the equity page using hook
  const selectClient = (user) => {
    //may be required in future for currently clicked client name
    // const id = JSON.parse(JSON.stringify(user))["currentKey"];
    const names = [];
    for (const entry of user) {
      if (entry != "a" && entry != "l") {
        //these values will come when all checks are selected at once
        const name = originalUsers.current[entry - 1].name;
        names.push(name);
      }
    }
    fixClient(names);
    console.log("left sider :> client selected 2");
  };

  //updating in electron store
  const changeStatus = async (user) => {
    console.log("left sider :> action clicked 1");
    const ipcReqBody = {
      idx: user.id - 1,
    };
    //changing user status
    const result = await ipcRenderer.invoke("set-clientStatus", ipcReqBody);
    console.log(result);
    //updating user in hook
    setUser(result);
    originalUsers.current = result;
    console.log("left sider :> action clicked 2");
  };

  const renderCell = (activeUser, columnKey) => {
    const cellValue = activeUser[columnKey];
    const id = activeUser["id"] - 1;
    console.log("-------cell value--------------", user[id]["actions"]);
    console.log(cellValue);
    switch (columnKey) {
      case "name":
        return (
          <>
            <Row justify="center" align="center">
              <Col css={{ d: "flex" }}>
                {!user[id]["actions"] ? (
                  // <Tooltip
                  //   content={user[id]["actions"] ? "logged out" : "logged"}
                  //   onClick={(event) => {
                  //     console.log("event ::> ", event);
                  //     changeStatus(activeUser);
                  //   }}
                  // >
                  <Row justify="center" align="center">
                    {" "}
                    <IconAlertTriangle height={15} color={"orange"} />
                  </Row>
                ) : (
                  //</Tooltip>
                  ""
                )}
                <Text
                  b
                  size={14}
                  css={{
                    tt: "capitalize",
                    color: `${user[id]["actions"] ? "#000" : "grey"}`,
                  }}
                >
                  {cellValue}
                </Text>
              </Col>
            </Row>
          </>
        );
      case "broker":
        console.log("--------------------brokername----------------");
        console.log(`images/brokers/${cellValue.toLowerCase()}.png`);
        return (
          <Image
            src={`images/brokers/${cellValue.toLowerCase()}.png`}
            css={{
              filter: `grayscale(${user[id]["actions"] ? "0%" : "100%"})`,
            }}
            width={20}
          ></Image>
        );
      case "status":
        // return <Badge color="primary" variant="dot" size="xl" />;
        return (
          <Image
            src={
              user[id]["actions"]
                ? "images/user_connected.svg"
                : "images/user_notConnected.svg"
            }
            width={20}
            height={20}
          ></Image>
        );

      case "actions":
        return (
          <Row justify="center" align="center">
            <Col css={{ d: "flex" }}>
              <Tooltip
                content={user[id]["actions"] ? "logout" : "login"}
                onClick={(event) => {
                  console.log("left sider :> action clicked 0", event);
                  changeStatus(activeUser);
                }}
              >
                <IconButton>
                  {/* //#D9D9D9 */}
                  {user[id]["actions"] ? (
                    <IconLink type="button" height={20} color={"#000"} />
                  ) : (
                    <IconLinkOff
                      type="button"
                      height={20}
                      color={"#D9D9D9"}
                    ></IconLinkOff>
                  )}
                </IconButton>
              </Tooltip>
            </Col>
          </Row>
        );
      default:
        return cellValue;
    }
  };
  return (
    <>
      <Grid
        css={{
          m: "$0",
          p: "$3",
          height: "auto",
          maxWidth: "300px",
        }}
      >
        <Row justify="center" align="center">
          <Input
            labelPlaceholder="Search Client"
            type="search"
            onChange={handleChange}
            css={{
              height: "auto",
              minWidth: "100%",
            }}
            contentRight={<IconSearch />}
          />
        </Row>
        <Spacer y={0.2} />
        {/* <Row justify="center" align="center">
          <Button
            color={"warning"}
            css={{
              width: "80px",
            }}
            auto
            shadow
            size="sm"
          >
            Reset
          </Button>
        </Row> */}
        <Text
          align="center"
          h1
          size={30}
          css={{
            textGradient: "180deg, #3CC6F2 15.62%, #4779BD 100%",
            mt: "$5",
            mb: "$0",
          }}
          weight="bold"
        >
          Client Details
        </Text>
        <Grid
          css={{
            overflowY: "auto",
            // minHeight: "18vh",
            height: "58.3vh", //height changes here
          }}
        >
          <Table
            bordered
            // compact
            css={{
              height: "auto",
              minWidth: "100%",
            }}
            hoverable
            headerLined
            sticked
            selectionMode="multiple"
            showSelectionCheckboxes={false}
            // selectedKeys={new Set([1, 2, 3])}
            onSelectionChange={(user) => {
              selectClient(user);
            }}
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column
                  key={column.uid}
                  hideHeader={column.uid === "actions"}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body items={user}>
              {(item) => (
                <Table.Row key={item.key}>
                  {(columnKey) => {
                    return (
                      <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                    );
                  }}
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Grid>
      </Grid>
    </>
  );
};

export default SectionClientGroup;
