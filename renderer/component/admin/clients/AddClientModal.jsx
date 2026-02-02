import { Modal, Button, Image, Card, Text } from "@nextui-org/react";
import { Menu, MenuItem } from "react-pro-sidebar";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientForm from "./clientForm";
import electron from "electron";
import { useFormState } from "../../hooks/useForm";
import { useGlobalContext } from "../../../context/GlobalContext";
import { message } from "../../../constant/message";
import { clientsState } from "../../../../main/logic/envLogic";
import {
  reconnectAllClients,
  singleClientConnection,
  singleClientUpload,
} from "../../../../services/transactions/transactions.service";
import {
  brokerLogoFormatHandler,
  DOBPattern,
  isValidDOB,
  IsValidEmail,
  LoginStatus,
  warnMessage,
} from "../../../constant/constant";
const ipcRenderer = electron.ipcRenderer || false;

//  "proxy_ip": "192.168.1.22",
//   "port": 8080,
//   "proxy_username": "admin",
//   "proxy_password": "12345"

const commonFields = [
  {
    label: "Client ID",
    field: "Client ID",
    placeHolder: "client id",
    value: "text",
  },
  {
    label: "Client Name",
    field: "ClientName",
    placeHolder: "client name",
    value: "text",
    isMandatory: false,
  },
  { label: "Api Key", field: "apiKey", placeHolder: "api key", value: "text" },
];

const additionalCommonFields = [
  {
    label: "Proxy IP",
    field: "proxy_ip",
    placeHolder: "proxy ip",
    value: "text",
    isMandatory: false,
  },
  {
    label: "Port",
    field: "port",
    placeHolder: "port",
    value: "text",
    isMandatory: false,
  },
  {
    label: "Proxy Username",
    field: "proxy_username",
    placeHolder: "proxy username",
    value: "text",
    isMandatory: false,
  },
  {
    label: "Proxy Password",
    field: "proxy_password",
    placeHolder: "proxy password",
    value: "text",
    isMandatory: false,
  },
];

const lastCommonFields = [
  {
    label: "Email",
    field: "email",
    placeHolder: "email",
    value: "email",
    isMandatory: false,
  },
];

const brokerSpecificFields = {
  IIFL: [
    {
      label: "Secret Key",
      field: "secretKey",
      placeHolder: "secret key",
      value: "text",
    },
  ],
  SMCACE: [
    {
      label: "Secret Key",
      field: "secretKey",
      placeHolder: "secret key",
      value: "text",
    },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    {
      label: "Password",
      field: "password",
      placeHolder: "password",
      value: "text",
    },
  ],
  SMC: [
    {
      label: "Secret Key",
      field: "secretKey",
      placeHolder: "secret key",
      value: "text",
    },
  ],
  MOSWAL: [
    {
      label: "Password",
      field: "password",
      placeHolder: "password",
      value: "text",
    },
    { label: "DOB", field: "dob", placeHolder: "DDMMYYYY", value: "number" },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
  ],
  FPAISA: [
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    {
      label: "App Name",
      field: "appName",
      placeHolder: "app name",
      value: "text",
    },
    {
      label: "App Source",
      field: "appSource",
      placeHolder: "app source",
      value: "text",
    },
    { label: "Pin", field: "pin", placeHolder: "pin", value: "text" },
    {
      label: "Encryption Key",
      field: "encKey",
      placeHolder: "encryption key",
      value: "text",
    },
  ],
  ANGELONE: [
    {
      label: "Password",
      field: "password",
      placeHolder: "password",
      value: "text",
    },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
  ],
  SHAREKHAN: [
    {
      label: "Password",
      field: "password",
      placeHolder: "password",
      value: "text",
    },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    {
      label: "Secret Key",
      field: "secretKey",
      placeHolder: "secret key",
      value: "text",
    },
  ],
  ICICI: [
    {
      label: "Password",
      field: "password",
      placeHolder: "password",
      value: "text",
    },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    {
      label: "Secret Key",
      field: "secretKey",
      placeHolder: "secret Key",
      value: "text",
    },
  ],
  KOTAK: [
    // {
    //   label: "Password",
    //   field: "password",
    //   placeHolder: "password",
    //   value: "text",
    // },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    {
      label: "Consumer key",
      field: "consumerKey",
      placeHolder: "consumer key",
      value: "text",
    },
    {
      label: "Mobile No.",
      field: "mobileNumber",
      placeHolder: "mobile number",
      value: "number",
    },
    { label: "UCC", field: "ucc", placeHolder: "ucc", value: "text" },
    { label: "MPIN", field: "mpin", placeHolder: "mpin", value: "text" },
    // {
    //   label: "Secret Key",
    //   field: "secretKey",
    //   placeHolder: "secret key",
    //   value: "text",
    // },
  ],
  IIFLONT: [
    {
      label: "Password",
      field: "password",
      placeHolder: "password",
      value: "text",
    },
    {
      label: "Secret Key",
      field: "secretKey",
      placeHolder: "secret key",
      value: "text",
    },
    { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
  ],
};

const createBrokerFields = (broker) => [
  ...commonFields,
  ...(brokerSpecificFields[broker] || []),
  ...lastCommonFields,
  ...additionalCommonFields,
];

//---- optimised the static broker array
const brokerArrays = {
  IIFL: createBrokerFields("IIFL"),
  SMC: createBrokerFields("SMC"),
  SMCACE: createBrokerFields("SMCACE"),
  MOSWAL: createBrokerFields("MOSWAL"),
  FPAISA: createBrokerFields("FPAISA"),
  ANGELONE: createBrokerFields("ANGELONE"),
  SHAREKHAN: createBrokerFields("SHAREKHAN"),
  ICICI: createBrokerFields("ICICI"),
  KOTAK: createBrokerFields("KOTAK").filter(
    (item) => item.field !== "apiKey" && item.field !== "Client ID"
  ),
  IIFLONT: createBrokerFields("IIFLONT"),
};

///default initial state set only for moswal broker
const initialState = {
  "Client ID": "",
  // ClientName: "",
  apiKey: "",
  email: "",
  password: "",
  dob: "",
  totp: "",
};

export default function AddClientModal(props) {
  const { setToggle } = props;
  const [selected, setSelected] = useState("MOSWAL");
  const [loading, setloading] = useState(false);
  const [activeItem, setActiveItem] = useState("MOSWAL");
  const [fieldError, setFieldError] = useState(false);
  const [formState, setFormState] = useState(initialState);
  const [isComingSoon, setIsComingSoon] = useState(false);

  const {
    setClientCreds,
    clientCreds,
    loginData,
    setGroup_Clients,
    setClientsData,
  } = useGlobalContext();

  const resetState = () => setFormState(initialState);

  const fields = brokerArrays[selected] || [];

  const handleInputChange = (field, e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    if (selected === "FPAISA" || selected === "ICICI") {
      setIsComingSoon(true);
    } else {
      setIsComingSoon(false);
    }
  }, [selected]);

  const closeHandler = () => {
    setToggle(false);
    setSelected("MOSWAL");
    setActiveItem("MOSWAL");
  };

  const MenuItems = [
    { key: "MOSWAL", label: "MOSWAL", isComingSoon: false },
    { key: "IIFL", label: "IIFL (XTS)", isComingSoon: false },
    { key: "IIFLONT", label: "IIFL (ONT)", isComingSoon: false },
    { key: "ANGELONE", label: "AngelOne", isComingSoon: false },
    { key: "SHAREKHAN", label: "SHAREKHAN", isComingSoon: false },
    { key: "KOTAK", label: "KOTAK", isComingSoon: false },
    { key: "SMCACE", label: "SMC (Ace)", isComingSoon: false },
    { key: "SMC", label: "SMC (XTS)", isComingSoon: false },
    { key: "FPAISA", label: "5Paisa", isComingSoon: true },
    { key: "ICICI", label: "ICICI", isComingSoon: true },
  ];

  const formApiBodyClient = ({
    "Client ID": client_code,
    apiKey,
    secretKey,
    password,
    dob,
    totp,
    email,
    ClientName,
    consumerKey = "",
    mobileNumber = "",
    ucc = "",
    mpin = "",
  }) => {
    return {
      client_code,
      apiKey,
      ...(secretKey && { secretKey }),
      password,
      dob,
      totp,
      email,
      ClientName,
      ...(consumerKey && { consumerKey }),
      ...(mobileNumber && { mobileNumber }),
      ...(ucc && { ucc }),
      ...(mpin && { mpin }),
    };
  };

  const singleClientFormPayload = ({
    "Client ID": client_code,
    apiKey,
    secretKey,
    password,
    dob,
    totp,
    email,
    ClientName,
    consumerKey = "",
    mobileNumber = "",
    ucc = "",
    mpin = "",
    proxy_ip = "",
    port = "",
    proxy_username = "",
    proxy_password = "",
  }) => {
    return {
      client_id: client_code,
      client_name: ClientName,
      broker: selected,
      apiKey: apiKey,
      secretKey: secretKey || "X",
      password: password,
      dob: dob,
      totp: totp,
      appName: "X",
      appSource: "X",
      pin: "X",
      email: email,
      encKey: "X",
      userId: "X",
      isActiveWebSocket: false,
      marketSecretKey: "X",
      marketApiKey: "X",
      consumerKey: consumerKey,
      mobileNumber: mobileNumber,
      ucc: ucc,
      mpin: mpin,
      proxy_ip,
      port,
      proxy_username,
      proxy_password,
    };
  };

  const validateForm = (formInputState) => {
    const {
      email,
      ClientName,
      proxy_ip,
      port,
      proxy_username,
      proxy_password,
      ...rest
    } = formInputState;
    return Object.values(rest).every((value) => String(value)?.trim() !== "");
  };

  const isDisabledSubmit = useMemo(() => {
    if (!formState && typeof formState !== "object") return true;

    const formValid = validateForm(formState);
    if (!formValid) return true;

    return false;
  }, [formState, selected]);

  useEffect(() => {
    const formFields = brokerArrays[selected] || [];
    const updateFormState = formFields.reduce((acc, { field }) => {
      acc[field] = "";
      return acc;
    }, {});
    setFormState(updateFormState);
  }, [selected]);

  //on submit event while adding the client
  const handleSubmit = async (event) => {
    if (formState?.email) {
      const isValid = IsValidEmail(formState?.email);

      if (!isValid) {
        setFieldError("Please enter valid email address");
        return;
      }
    }

    if (formState?.dob) {
      if (!DOBPattern.test(formState?.dob)) {
        setFieldError("Please enter valid DOB format");
        return;
      }
      if (!isValidDOB(formState.dob)) {
        setFieldError("Please enter a valid DOB in DDMMYYYY format");
        return;
      }
    }
    setFieldError("");

    let clientBrokerData = {
      ...formState,
      Broker: selected,
      loginStatus: false,
      rowStatus: {
        status: true,
        data: {},
      },
    };
    var singleClientResponse = [];

    if (loginData && clientCreds.length >= loginData?.allowed_clients) {
      setToggle(false);
      resetState();
      toast.warn(warnMessage.client_limit);
      return;
    }

    setloading(true);

    //1.getting client credentials from electron store :> rows, columns and apibody
    var data = await ipcRenderer.invoke("readMemory-ipc", "clientCreds");

    //2.appending the added data of api body for new client
    const clientApiBody = formApiBodyClient(clientBrokerData);
    const body = {
      [selected]: [clientApiBody],
    };
    try {
      const singleClientResult = await singleClientConnection(body);
      const singleRes = clientsState([singleClientResult.data]);
      singleClientResponse = singleRes;

      const clientData =
        (await ipcRenderer.invoke("readMemory-ipc", "clientStatus")) || [];

      let filterClientData = clientData.filter(
        (client) => client.name !== formState["Client ID"]
      );

      let apiStatus = [...filterClientData, ...singleRes].map(
        (item, index) => ({
          ...item,
          id: index + 1,
        })
      );

      const payload = singleClientFormPayload(formState);

      try {
        const response = await singleClientUpload({
          ...payload,
          dealer_id: loginData?.user_id,
        });
        if (response && Array.isArray(response?.rows)) {
          const clientsDetails = response?.rows.map((item) => ({
            clientId: item["Client ID"] || "",
            clientName: item.ClientName || "",
            email: item.email || "",
            userId: item.userId || "",
          }));

          setClientsData(clientsDetails);

          try {
            const resSingleClient = await reconnectAllClients();
            if (resSingleClient && Array.isArray(resSingleClient?.rows)) {
              setClientCreds(resSingleClient?.rows);
            }
          } catch (error) {
            console.log("error in single client reconnect", error);
          }
        }
      } catch (error) {
        console.log("error in single client upload", error);
      }

      if (data) {
        if (data.apiBody[selected]) {
          data.apiBody[selected].push(clientApiBody);
        } else {
          data.apiBody[selected] = [];
          data.apiBody[selected].push(clientApiBody);
        }
      } else {
        data = {
          rows: [],
          columns: [],
          apiBody: {},
        };
        data.apiBody[selected] = [];
        data.apiBody[selected].push(clientApiBody);
      }

      try {
        // const res = await clientBrokerConnection(data.apiBody);
        // apiStatus = clientsState(res.data)

        //calling clients login api for all brokers present in the excel sheet
        if (apiStatus.length) {
          await ipcRenderer.invoke("set-clientStatusApiRes", {
            apiStatus: apiStatus,
          });
        }
      } catch (error) {
        console.log("error broker client", error);
      }

      if (apiStatus !== "error" && apiStatus) {
        apiStatus?.forEach((item) => {
          if (item.name === clientBrokerData["Client ID"]) {
            clientBrokerData["loginStatus"] =
              item.status === "success"
                ? LoginStatus.LOGGED_IN
                : LoginStatus.LOGGED_OUT;
          }
        });
      }

      if (data) {
        let filterRowData = data.rows.filter(
          (client) => client?.["Client ID"] !== formState["Client ID"]
        );

        let updatedRowData = [...filterRowData, clientBrokerData].map(
          (item, index) => ({
            ...item,
            id: index + 1,
          })
        );

        data.rows = updatedRowData;
      }
    } catch (error) {
      console.log("single client failed", error);
    }

    // //calling ipc to save data into electron store
    // var ipcReqBody = {
    //   field: "clientCreds",
    //   subField: "All",
    //   data: data,
    // };
    // var result = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);

    //adding new client to the default group
    var groupData = await ipcRenderer.invoke("readMemory-ipc", "group");
    if (!groupData) {
      groupData = {};
      groupData["default"] = [];
    }
    groupData.default.push(clientBrokerData["Client ID"]);
    const ipcReqBody = {
      field: "group",
      subField: "All",
      data: groupData,
    };
    const result = await ipcRenderer.invoke("updateMemory-ipc", ipcReqBody);

    //setting client status
    // await setAddedClientStatus(clientBrokerData);
    //setting props to display rows and groups
    // setClientCreds(data.rows);

    // const clientsDetails = data?.rows.map((item) => ({
    //   clientId: item["Client ID"] || "",
    //   clientName: item.ClientName || "",
    //   email: item.email || "",
    //   userId: item.userId || "",
    // }));

    // setClientsData(clientsDetails);

    setGroup_Clients(groupData);
    if (singleClientResponse[0]?.status === "success") {
      setSelected("MOSWAL");
      // setSelected(new Set(["Select Broker"]));

      toast.success(`${selected} ${message.client_added}`);
    } else {
      toast.error(message.wrong_credetial);
    }
    // onSubmit(
    //   (formData) => {
    //     // Handle success callback
    //   },
    //   (errorData, formData) => {
    //     // Handle error callback
    //   }
    // );
    //closing the modal
    setToggle(false);
    setloading(false);
    resetState();
  };

  const brokerSelectHandler = (item) => {
    setSelected(item.key);
    setActiveItem(item.key);
    setFieldError("");
  };

  return (
    <Modal
      style={{
        width: "100%",
      }}
      className="single-client-upload-modal"
      closeButton
      open={props.toggle}
      onClose={closeHandler}
      width="750px"
      blur
    >
      <Modal.Header
        css={{ justifyContent: "left" }}
        style={{
          fontSize: "20px",
          fontWeight: "500",
          padding: "0px",
          paddingLeft: "32px",
        }}
      >
        Add Client
      </Modal.Header>
      <Modal.Body
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
          paddingTop: "0px",
          paddingBottom: "0px",
        }}
      >
        <Card.Body
          css={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
            width: "100%",
            margin: "$0",
            paddingBottom: "$0",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "270px",
              overflowY: "auto",
              borderRadius: "8px",
              background: "#f7f6f9",
            }}
            className=""
          >
            <Text
              h5
              size={"$md"}
              style={{ paddingLeft: "15px", paddingTop: "10px" }}
            >
              Select Broker
            </Text>
            <Menu
              style={{ paddingTop: "10px" }}
              value={selected}
              onValueChange={setSelected}
            >
              {MenuItems.map((item) => {
                const brokerLowerCase = item.key.toLowerCase();

                return (
                  <MenuItem
                    className="single-modal-broker-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0px",
                      color:
                        activeItem === item.key
                          ? "#fff"
                          : item.isComingSoon
                            ? "#b3b3b3"
                            : "gray",
                      backgroundColor:
                        activeItem === item.key ? "#3c57a2" : "transparent", // Highlight active item
                      transition: "background-color 0.3s ease",
                      cursor: item.isComingSoon ? "not-allowed" : "pointer",
                    }}
                    key={item.key}
                    value={item.label}
                    onClick={() => {
                      item.isComingSoon ? undefined : brokerSelectHandler(item);
                    }}
                  >
                    <Image
                      className="single-modal-broker-image"
                      src={brokerLogoFormatHandler(brokerLowerCase)}
                      width={20}
                      alt={item.label}
                    />
                    <div style={{ fontWeight: "500" }}>{item.label}</div>
                    {item.isComingSoon && (
                      <div
                        className="primary-text-color"
                        style={{
                          fontWeight: "500",
                          fontSize: "10px",
                          marginTop: "5px",
                        }}
                      >
                        Coming soon...
                      </div>
                    )}
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
          {isComingSoon ? (
            <div style={{ width: "400px" }} className="flex-row justify-center">
              <h5 className="primary-text-color">Coming Soon...</h5>
            </div>
          ) : (
            <ClientForm
              setSelected={setSelected}
              resetState={resetState}
              loading={loading}
              fields={fields}
              formState={formState}
              handleInputChange={handleInputChange}
              error={fieldError}
            />
          )}
        </Card.Body>

        <Modal.Footer
          css={{
            justifyContent: "right",
            width: "100%",
            paddingTop: "$0",
            paddingBottom: "$3",
            marginBottom: "$5",
          }}
        >
          {!isComingSoon && (
            <>
              <Button
                className="secondary-button border-radius-8"
                auto
                flat
                onClick={() => {
                  closeHandler();
                }}
              >
                Cancel
              </Button>
              <Button
                className={`${isDisabledSubmit || loading
                  ? `disable-button`
                  : `primary-button`
                  } border-radius-8`}
                disabled={isDisabledSubmit || loading}
                type="submit"
                auto
                flat
                onPress={handleSubmit}
              >
                Submit
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}
