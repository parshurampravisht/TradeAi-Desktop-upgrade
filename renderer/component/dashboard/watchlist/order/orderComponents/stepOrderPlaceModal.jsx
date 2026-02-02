import {
  Button,
  Modal,
  Row,
  Spacer,
  Text,
  Loading,
  Navbar,
  Card,
  Dropdown,
  Radio,
  Col,
  Container,
  Image,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../../../../../context/GlobalContext";
import Multiselect from "multiselect-react-dropdown";

const navigate = (currentStep, setCurrentStep, clicked) => {
  if (clicked == "next") {
    if (currentStep == "symbol") {
      setCurrentStep("clients/groups");
    } else if (currentStep == "clients/groups") {
      setCurrentStep("uploadClients");
    }
  }

  if (clicked == "prev") {
    if (currentStep == "clients/groups") {
      setCurrentStep("symbol");
    } else if (currentStep == "uploadClients") {
      setCurrentStep("clients/groups");
    }
  }
};

const StepOrderPlaceModal = ({ apiBody, setPlaceOrderVisible }) => {
  const [currentStep, setCurrentStep] = useState("symbol");
  const [bulkManual, setBulkManual] = useState("bulk");
  const submitRef = useRef(false);
  const {
    selectedSymbol,
    setSelectedSymbol,
    selectedValueSymbol,
    symbolNames,
    setSingleLtp,
    switch_GpCl,
    setswitch_GpCl,
    clients,
    setSymbolApi,
    addDynamicInputs,
    handleFileChange,
    selectedValueGroup,
    selectedGroup,
    groupClients,
    setSelectedGroup,
    addClients,
    stepOrderVisible,
    setStepOrderVisible,
  } = useGlobalContext();

  const closeHandler = () => {
    
    setStepOrderVisible(false);
    setCurrentStep("symbol");
    setBulkManual("bulk");
    if (!submitRef.current) {
      setSelectedSymbol(new Set(["Symbol"]));
      setSingleLtp(null);
    }
    submitRef.current = false;
  };

  //return client component: multiselect
  const clientComponent = () => {
    return (
      <Multiselect
        isObject={false}
        onKeyPressFn={function noRefCheck() {}}
        onRemove={function noRefCheck() {}}
        onSearch={function noRefCheck() {}}
        onSelect={(item) => {
          //item contains all the selected values till now

          // 
          // 
          var arr = [];

          
          //using spread operator to add array into the object
          clients.current["selectedClients"] = item;
          
          apiBody.current = {
            ...apiBody.current,
            ...{ clients: item },
          };
        }}
        //replace this with list of available symbols api
        options={clients.current["clients"]}
        placeholder="Select clients"
      ></Multiselect>
    );
  };

  const groupComponent = () => {
    return (
      <Dropdown>
        <Dropdown.Button flat css={{ pl: "$17", pr: "$17" }}>
          {selectedValueGroup}
        </Dropdown.Button>
        <Dropdown.Menu
          aria-label="Single selection actions"
          color="secondary"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedGroup}
          onSelectionChange={(group) => setSelectedGroup(group)}
        >
          {Object.keys(groupClients.current).map((item, index) => (
            <Dropdown.Item key={item}>{item}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const groupClientComponent = () => {
    return (
      <>
        {bulkManual == "bulk" ? (
          <div>
            <Row justify="space-between" align="center">
              <Col css={{ paddingRight: 10 }}>
                <Card
                  isPressable
                  css={{ width: "60px", background: "#fff" }}
                  isHoverable
                  variant="flat"
                >
                  <label>
                    <Image src="images/csv.svg" width={40}></Image>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      id="TT"
                      name="OrderFile"
                      accept=".xlsx"
                      hidden
                      value={""}
                    />
                  </label>
                </Card>
              </Col>
            </Row>
          </div>
        ) : null}
        {bulkManual == "manual"
          ? switch_GpCl == "client"
            ? clientComponent()
            : groupComponent()
          : null}
      </>
    );
  };

  const submit = () => {
    submitRef.current = true;
    
    if (switch_GpCl == "client" && bulkManual == "manual") {
      addDynamicInputs();
    } else if (switch_GpCl == "group" && bulkManual == "manual") {
      addClients();
    }
    setStepOrderVisible(false);
    setPlaceOrderVisible(true);
    setCurrentStep("symbol");
    setBulkManual("bulk");
    
  };

  const currentComponent = (currentStep) => {
    switch (currentStep) {
      case "symbol":
        return (
          <>
            {/* <Text align="center"> Choose Symbol</Text> */}
            <Row justify="center">
              <Dropdown>
                <Dropdown.Button flat css={{ pl: "$17", pr: "$17" }}>
                  {selectedValueSymbol}
                </Dropdown.Button>
                <Dropdown.Menu
                  aria-label="Single selection actions"
                  color="secondary"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={selectedSymbol}
                  onSelectionChange={(symbol) => setSymbolApi(symbol)}
                >
                  {symbolNames.current.map((item, index) => (
                    <Dropdown.Item key={item}>{item}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Row>
          </>
        );
      case "clients/groups":
        return (
          <>
            <Row justify="center">
              <Radio.Group
                orientation="horizontal"
                value={switch_GpCl}
                onChange={setswitch_GpCl}
              >
                <Radio value="client" color="success">
                  Clients
                </Radio>
                <Radio value="group" color="success">
                  Group
                </Radio>
                <Radio value="both" color="success">
                  Both
                </Radio>
              </Radio.Group>
            </Row>
          </>
        );
      case "uploadClients":
        return (
          <>
            <Row justify="center">
              <Radio.Group
                orientation="horizontal"
                value={bulkManual}
                onChange={setBulkManual}
              >
                <Radio value="bulk" color="success">
                  Bulk
                </Radio>

                <Radio value="manual" color="success">
                  Manual
                </Radio>
              </Radio.Group>
            </Row>
            <Spacer y={1} />
            <Row justify="space-around">{groupClientComponent()}</Row>
          </>
        );
    }
  };

  return (
    <div>
      <Modal
        aria-labelledby="modal-title"
        open={stepOrderVisible}
        closeButton
        preventClose
        onClose={closeHandler}
        width="60vh"
        css={{
          height: "50vh",
          //   width: "60vh",
        }}
        // blur
      >
        <Modal.Body>
          <Row justify="center">
            <Navbar.Content
              // hideIn="xs"
              variant={"highlight"}
            >
              <Card>
                <Card.Body css={{ p: "$3" }}>
                  <Row justify="center" align="center">
                    <Navbar.Link
                      isActive={currentStep == "symbol"}
                      //   onPress={() => setCurrentStep("symbol")}
                    >
                      Symbol
                    </Navbar.Link>
                    <Navbar.Link
                      isActive={currentStep == "clients/groups"}
                      //   onPress={() => setCurrentStep("clients/groups")}
                    >
                      Clients/Groups
                    </Navbar.Link>
                    <Navbar.Link
                      isActive={currentStep == "uploadClients"}
                      //   onPress={() => setCurrentStep("uploadClients")}
                    >
                      Upload Clients
                    </Navbar.Link>
                  </Row>
                </Card.Body>
              </Card>
            </Navbar.Content>
          </Row>
          <Spacer y={2} />
          {currentComponent(currentStep)}
          <Spacer y={5} />
        </Modal.Body>
        <Modal.Footer>
          <Row justify="space-between">
            {/* <Button auto flat color="error" onPress={closeHandler}>
              Submit
            </Button> */}
            <Button
              size="md"
              disabled={currentStep == "symbol"}
              auto
              flat
              onPress={() => navigate(currentStep, setCurrentStep, "prev")}
            >
              Prev
            </Button>
            <Button
              size="md"
              // disabled={currentStep == "uploadClients"}
              auto
              flat
              css={{
                display: `${currentStep == "uploadClients" ? "none" : "block"}`,
              }}
              onPress={() => navigate(currentStep, setCurrentStep, "next")}
            >
              Next
            </Button>
            <Button
              size="md"
              // disabled={currentStep == "uploadClients"}
              auto
              flat
              color="success"
              css={{
                display: `${
                  currentStep !== "uploadClients" ? "none" : "block"
                }`,
              }}
              onPress={() => submit()}
            >
              Submit
            </Button>
          </Row>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StepOrderPlaceModal;
