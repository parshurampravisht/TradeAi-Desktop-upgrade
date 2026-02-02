import {
  Table,
  Row,
  Col,
  Tooltip,
  User,
  Text,
  Input,
  Image,
  Grid,
  Spacer,
  Button,
} from "@nextui-org/react";
import { IconButton } from "./IconButton";
import { useState, useEffect, useRef, useMemo } from "react";
import { IconAlertTriangle, IconLink, IconSearch } from "@tabler/icons-react";
import electron from "electron";
import { IconLinkOff } from "@tabler/icons-react";
import { useGlobalContext } from "../../../context/GlobalContext";
import { GetOfflineClientAll } from "../../../../services/transactions/transactions.service";
import { brokerLogoFormatHandler } from "../../../constant/constant";
const ipcRenderer = electron.ipcRenderer || false;

const ClientStatusSelector = ({
  originalUsers,
  selectedClients,
  setSelectedClients,
}) => {
  const { fixClient, user, clientsData, setUser, resetSelectAllHandler } =
    useGlobalContext();

  const [searchClientValue, setSearchClientValue] = useState("");

  const columns = [
    { name: "NAME", uid: "name" },
    { name: "Broker", uid: "broker" },
  ];

  const clientObject = useMemo(() => {
    return clientsData.reduce((acc, client) => {
      acc[client.clientId] = client.clientName;
      return acc;
    }, {});
  }, [clientsData]);

  useEffect(() => {
    const getClientsIds = async () => {
      try {
        var cln = await ipcRenderer.invoke("readMemory-ipc", "clientStatus");
        //Offline clients List
        const userId = localStorage.getItem("user_id");
        const list = await GetOfflineClientAll(userId);
        let allUserList = [...cln, ...list?.clients];
        setUser(allUserList);
        originalUsers.current = allUserList;
        // originalUsers.current = cln;
      } catch (error) {
        console.error("Failed to fetch client IDs:", error);
      }
    };
    getClientsIds();
  }, []);

  const filterAccounts = (searchTerm) => {
    //if no client is clicked, return all the clients
    if (searchTerm == "") {
      return originalUsers.current;
    } else if (searchTerm !== "") {
      //return clients who matches the search string
      return originalUsers?.current?.filter((clname) => {
        return clname?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      });
    } else {
      return "There doesn't seem to be an account associated with this profile. Please add an account to continue.";
    }
  };

  //on search filter the clients
  const handleChange = (event) => {
    //  Get input value from "event"
    setSearchClientValue(event?.target.value);
    const clients = filterAccounts(event?.target?.value);
    setUser(clients);
  };

  //when some client is clicked send that client name to the equity page using hook
  // const selectClient = (userName) => {
  //   const names = [];

  //   const selectedClientIds = new Set(userName);
  //   setSelectedClients(selectedClientIds);

  //   for (const entry of selectedClientIds) {
  //     if (entry !== "a" && entry !== "l") {
  //       // Skip "a" and "l"
  //       const name = user[entry]?.name;
  //       // const name = originalUsers?.current[entry]?.name;

  //       if (name) {
  //         names.push(name);
  //       }
  //     }
  //   }
  //   // setActiveClient((prevObj) => {
  //   //   return Object.fromEntries(
  //   //     Object.keys(prevObj).map((key) => [key, names.includes(key)])
  //   //   );
  //   // });

  //   fixClient(names);
  // };

  const handlerUnSelectAll = () => {
    setSelectedClients([]);
    fixClient([]);
  };

  function extractNames(arr) {
    return arr.length > 0 ? arr && arr?.map((item) => item?.name) : [];
  }
  const handlerAllClient = () => {
    originalUsers?.current;
    const namesData = extractNames(originalUsers?.current);

    if (searchClientValue?.trim()) {
      setSearchClientValue("");
      const clients = filterAccounts("");
      setUser(clients);
    }
    setSelectedClients(namesData);
    // setSelectedClients(new Set());
    fixClient(namesData);
  };

  //updating in electron store
  const changeStatus = async (id) => {
    const ipcReqBody = {
      idx: id,
    };
    //changing user status
    const result = await ipcRenderer.invoke("set-clientStatus", ipcReqBody);
    //updating user in hook
    setUser(result);
    originalUsers.current = result;
  };

  const toggleSelection = (clientId) => {
    resetSelectAllHandler();
    setSelectedClients((prev) => {
      const isSelected = prev.includes(clientId);
      const selectClientArr = isSelected
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId];

      fixClient(selectClientArr);
      return selectClientArr;
    });
  };

  return (
    <>
      <Grid
        css={{
          m: "$0",
          p: "$3",
          height: "auto",
          maxWidth: "330px",
        }}
      >
        <Row justify="center" align="center">
          <Input
            labelPlaceholder="Search Client"
            type="search"
            onChange={handleChange}
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
        <Spacer y={0.2} />
        <Row>
          <Button
            className="primary-button"
            css={{
              width: "80px",
            }}
            style={{ marginLeft: "20px", marginTop: "10px" }}
            auto
            size="sm"
            onClick={() => {
              selectedClients.length &&
                selectedClients.length === originalUsers.current.length
                ? handlerUnSelectAll()
                : handlerAllClient();
            }}
          >
            {selectedClients.length &&
              selectedClients.length === originalUsers.current.length
              ? "UnSelect All Client"
              : "All Client"}
          </Button>
        </Row>

        <Grid
          css={{
            "& div": {
              boxShadow: "none",
            },
          }}
        >
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <div
              className="custom-table"
              style={{
                height: "max-content",
                paddingTop: "10px",
                width: "17rem",
              }}
            >
              <header className="custom-left-sider-table-header flex-row justify-between">
                {columns.map((column) => (
                  <div key={column.uid} className="custom-table-column">
                    {column.name}
                  </div>
                ))}
              </header>

              <section
                className="custom-table-body left-sider-client-table"
                style={{
                  cursor: "pointer",
                }}
              >
                {Array.isArray(user) && user.length > 0 ? (
                  user.map((item, index) => (
                    <div
                      key={index}
                      className="custom-table-row"
                      style={{
                        backgroundColor: selectedClients.includes(item.name)
                          ? "#cee4fe"
                          : "white",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                      }}
                      onClick={() => toggleSelection(item.name)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {!user[index]["actions"] && (
                            <Tooltip
                              content={
                                user[index]["actions"] ? "logged out" : "logged"
                              }
                              onClick={(event) => {
                                event.stopPropagation(); // Prevents row click
                                changeStatus(index);
                              }}
                            >
                              <IconAlertTriangle height={15} color="orange" />
                            </Tooltip>
                          )}
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: "13px",
                              color: user[index]["actions"] ? "#000" : "grey",
                              textTransform: "capitalize",
                              marginLeft: "10px",
                            }}
                          >
                            {`${user[index]["name"]} ${clientObject[user[index]["name"]]
                                ? `(${clientObject[user[index]["name"]]})`
                                : ""
                              }`}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          width: "50px",
                        }}
                      >
                        <Image
                          src={brokerLogoFormatHandler(user[index]["broker"])}
                          style={{
                            filter: user[index]["actions"]
                              ? "none"
                              : "grayscale(100%)",
                          }}
                          width={20}
                          alt={user[index]["broker"]}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{ width: "100%", height: "250px" }}
                    className="custom-table-row no-data flex-row align-center justify-center"
                  >
                    Clients not Available
                  </div>
                )}
              </section>
            </div>
          </div>
        </Grid>
      </Grid>
      <style jsx>{`
        .table-container {
          max-height: 300px; /* Adjust as needed */
          overflow-y: auto;
        }
      `}</style>
    </>
  );
};

export default ClientStatusSelector;
