import { Row, Text, Input, Grid, Collapse } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons-react";
import { useGlobalContext } from "../../../context/GlobalContext";
import electron from "electron";
import { useRef } from "react";
const ipcRenderer = electron.ipcRenderer || false;

const Groups = () => {
  const { group_Clients, fixClient, resetSelectAllHandler } =
    useGlobalContext();
  const groupClientStatus = useRef(null);
  const [userData, setUserData] = useState(group_Clients);
  const [filterValue, setFilterValue] = useState("");

  const getClientStatus = (clientId, clientsStatus) => {
    const status = clientsStatus.filter(
      (clientStatus) => clientStatus["name"] == clientId
    );
    return status[0];
  };

  useEffect(() => {
    const fun = async () => {
      var clientsStatus = await ipcRenderer.invoke(
        "readMemory-ipc",
        "clientStatus"
      ); //saved status of clients
      const groupNames = Object.keys(group_Clients); //all group names
      var tempGroupClientStatus = {}; //stores final transformed data
      groupNames.forEach((groupName, index) => {
        var tempClientData = [];
        group_Clients[groupName].forEach((clientId) => {
          const clientStaus = getClientStatus(clientId, clientsStatus);
          tempClientData.push(clientStaus);
        });

        tempGroupClientStatus[groupName] = tempClientData;
      });
      groupClientStatus.current = tempGroupClientStatus;
    };
    fun();
  }, []);

  const groupClientHandler = (e) => {
    resetSelectAllHandler();
    const textContent = e.target.textContent;
    if (textContent in group_Clients) {
      const value = group_Clients[textContent];
      const stringifiedValues = value.map((item) => item.toString());
      fixClient(stringifiedValues);
    } else {
    }
  };

  const handleFilter = (filteredData) => {
    setUserData(filteredData);
  };

  const handleFilterChange = (event) => {
    const inputValue = event.target.value;
    setFilterValue(inputValue);

    let filteredData = null;
    if (group_Clients instanceof Array) {
      filteredData = group_Clients.filter((item) => {
        const fieldData = item["Group Name"].toString().toLowerCase();
        return fieldData && fieldData.includes(inputValue.toLowerCase());
      });
    } else if (typeof group_Clients === "object") {
      const filteredKeys = Object.keys(group_Clients).filter((key) =>
        key.toLowerCase().includes(inputValue.toLowerCase())
      );
      filteredData = {};
      filteredKeys.forEach((key) => {
        filteredData[key] = group_Clients[key];
      });
    }
    handleFilter(filteredData);
  };

  let groupKeys = group_Clients ? Object.keys(userData) : null;

  return (
    <>
      <Grid
        css={{
          width: "18rem",
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: "10vh",
          height: "50vh",
        }}
      >
        <Row justify="center" align="center">
          <Input
            initialValue={filterValue}
            labelPlaceholder="Group Name"
            type="search"
            onChange={handleFilterChange}
            css={{
              height: "auto",
              minWidth: "15.5rem",
              border: "1px solid #ccc",
              boxShadow: "none",
              borderRadius: "8px",
            }}
            contentRight={<IconSearch />}
          />
        </Row>
        <Collapse.Group
          css={{ height: "auto", padding: "$0", margin: "$0" }}
          // shadow
          splitted
          onClick={(e) => groupClientHandler(e)}
        >
          {groupKeys &&
            groupKeys.map((groupName, ind) => {
              return (
                <Collapse
                  key={ind.toString()}
                  title={
                    <Text
                      style={{
                        fontSize: "16px",
                        paddingTop: "10px !important",
                        paddingBottom: "10px !important",
                      }}
                    >
                      {groupName}
                    </Text>
                  }
                >
                  <Grid
                    css={{
                      borderColor: "transparent",
                      overflowY: "auto",
                      minHeight: "20vh",
                      height: "21vh",
                    }}
                  >
                    {group_Clients[groupName].map((clientName, index) => (
                      <Text key={index.toString()} h6>
                        {clientName}
                      </Text>
                    ))}
                  </Grid>
                </Collapse>
              );
            })}
        </Collapse.Group>
      </Grid>
    </>
  );
};

export default Groups;
