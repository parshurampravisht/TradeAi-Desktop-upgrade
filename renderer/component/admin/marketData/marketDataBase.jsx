import { Button, Card, Input, Row, Spacer, Grid,Col } from "@nextui-org/react";
import { useGlobalContext } from "../../../context/GlobalContext";
import { useFormState } from "../../hooks/useForm";
import { ToastContainer, toast } from "react-toastify";

const MarketDataBase = () => {
  const { liveDataProcess } = useGlobalContext();
  const marketCreds = [
    { label: "ClientCode", placeHolder: "Client Code", value: "text" },
    { label: "PanOrDOB", placeHolder: "Pan or DOB", value: "text" },
    { label: "Password", placeHolder: "Password", value: "text" },
    { label: "ApiKey", placeHolder: "API Key", value: "text" },
    { label: "Totp", placeHolder: "TOTP", value: "text" },
  ];
  const initialState = {};
  marketCreds.forEach((creds) => {
    initialState[creds.label] = "";
  });
  const { formState, handleInputChange, onSubmit, error } =
    useFormState(initialState);
  const dataCollection = (label, e) => {
    const inputData = e.target.value;
    
    handleInputChange({ [label]: inputData }); // Use handleInputChange to update form state
    
  };
  const shouldSubmit = () =>{
    if(formState.ClientCode === "" || formState.ApiKey === "" || formState.PanOrDOB==="" || formState.Password === "" || formState.Totp === "")
      return true
    return false
  }
  const handleSubmit = () => {
    
    //event triggers when child process terminates
   
    liveDataProcess.send({
      action: "initiate",
      data: formState,
    });
  };
  return (
    <>
      <Card>
        <Card.Body>
          <Grid css={{ height: "50%" }}>
            {marketCreds.map((creds, index) => (
              <Row key={index}>
                <Spacer y={3.4} />
                <Col>
                <Row justify="center">
                <label>{creds.placeHolder}</label>

                </Row>
                <Row justify="center">

                <Input
                  initialValue={formState[creds.label]}
                  css={{width:"70%"}}
                  bordered
                  borderWeight="light"
                 
                  // status={!valid ? "default":"error"}

                  // label={creds.placeHolder}
                  type={creds.value}
                  placeholder={creds.placeHolder}
                  onBlur={(e) => dataCollection(creds.label, e)}
                />
                </Row>
                </Col>
                <Spacer x={1.5} />
              </Row>
            ))}
          </Grid>
        </Card.Body>
        <Card.Footer css={{ justifyContent: "center" }}>
          <Button type="submit" auto flat disabled={shouldSubmit()} onClick={()=>{
            handleSubmit()
            toast.info("Successfully connected")
            }}>
            {" "}
            Submit
          </Button>
        </Card.Footer>
      </Card>
    </>
  );
};

export default MarketDataBase;
