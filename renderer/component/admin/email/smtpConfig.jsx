/**********************************************************************
 * Author: Upendra Singh
 * Date: 2024-07-07
 * Description: This page is desinged to configure SMTP information.
 * Features:
 * - User can edit or save SMTP details to send email
 **********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  Grid,
  Text,
  Col,
  Button,
  Row,
  Input,
  Spacer,
  Switch,
} from "@nextui-org/react";
import { useGlobalContext } from "../../../context/GlobalContext";
import {
  getEmailSMTP,
  setupEmailSMTP,
} from "../../../../services/email/emailConfig.service";

function SmtpConfig() {
  const { setAdminComponent } = useGlobalContext();
  const EmailRef = useRef(null);
  const PasswrodRef = useRef(null);
  const SMTPRef = useRef(null);
  const PortRef = useRef(null);
  const [tlsStatus, setTlsStatus] = useState(true);

  useEffect(() => {
    handlerShowSMTPData();
  }, []);

  //This funtion is written to show SMTP information
  const handlerShowSMTPData = async () => {
    try {
      const res = await getEmailSMTP();
      if (res.statusText === "OK" && res?.data?.data) {
        EmailRef.current.value = res?.data?.data?.smtp_username;
        PasswrodRef.current.value = res?.data?.data?.smtp_password;
        SMTPRef.current.value = res?.data.data?.smtp_host;
        PortRef.current.value = res?.data.data?.smtp_port;
        setTlsStatus(res?.data?.data?.use_tls);
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker like AppSignal
      toast.success("Oops! something went wrong.");
    }
  };

  //This funtion is written to toggle TLS state
  const handlerTlsState = async () => {
    try {
      let tlsStatus1 = !tlsStatus;
      setTlsStatus(tlsStatus1);
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker like AppSignal
      toast.success("Oops! something went wrong.");
    }
  };

  //This funtion is written to save SMTP information
  const handleClick = async () => {
    try {
      const smtp = {};
      if (EmailRef.current.value !== "") {
        smtp.smtp_username = EmailRef.current.value;
      }
      if (SMTPRef.current.value !== "") {
        smtp.smtp_host = SMTPRef.current.value;
      }
      if (PortRef.current.value !== "") {
        smtp.smtp_port = PortRef.current.value;
      }
      if (PasswrodRef.current.value !== "") {
        smtp.smtp_password = PasswrodRef.current.value;
      }
      smtp.use_tls = tlsStatus;
      if (Object.keys(smtp).length > 0) {
        const res = await setupEmailSMTP(smtp);
        if (res.statusText === "OK") {
          toast.success("SMTP configured successfully!");
        } else {
          toast.success("Oops! something went wrong.");
        }
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker like AppSignal
      toast.success("Oops! something went wrong.");
    }
  };

  return (
    <>
      <Grid.Container gap={2} justify="center">
        <Grid sm={12} md={12}>
          <Card css={{ mw: "500%", p: "$10", width: "200%" }}>
            <Card.Header css={{}}>
              <Row>
                <Col>
                  <Text h4>Email Configuration</Text>
                </Col>
                <Spacer x={2} />
                <Col css={{ textAlign: "right" }}>
                  <img
                    src="../images/email_setting.png"
                    height="30px"
                    onClick={() => setAdminComponent("emailTemplate")}
                    style={{ cursor: "pointer" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Divider />

            <Card.Body css={{ py: "$10" }}>
              <Row>
                <Col>
                  <Text h6 css={{ fontWeight: "$bold" }}>
                    Email:
                  </Text>
                  <Input
                    className="border-radius-8"
                    bordered
                    borderWeight="light"
                    ref={EmailRef}
                    name="first_name"
                    placeholder="ex. abc@gmail.com"
                    fullWidth
                  ></Input>
                </Col>
                <Spacer x={1} />
                <Col>
                  <Text h6 css={{ fontWeight: "$bold" }}>
                    Password:
                  </Text>
                  <Input
                    className="border-radius-8"
                    type="password"
                    bordered
                    borderWeight="light"
                    fullWidth
                    ref={PasswrodRef}
                    name="port"
                    placeholder="password"
                  ></Input>
                </Col>
              </Row>
              <Spacer y={1} />

              <Row>
                <Col>
                  <Text h6 css={{ fontWeight: "$bold" }}>
                    SMTP:
                  </Text>
                  <Input
                    className="border-radius-8"
                    bordered
                    borderWeight="light"
                    fullWidth
                    ref={SMTPRef}
                    name="smtp"
                    placeholder="ex. smtp.gmail.com"
                  ></Input>
                </Col>
                <Spacer x={1} />
                <Col>
                  <Row>
                    <Col>
                      <Text h6 css={{ fontWeight: "$bold" }}>
                        Port:
                      </Text>
                      <Input
                        className="border-radius-8"
                        bordered
                        borderWeight="light"
                        placeholder="ex. 87"
                        ref={PortRef}
                        name="port"
                      ></Input>
                    </Col>
                    <Spacer x={1} />
                    <Col>
                      <Text h6 css={{ fontWeight: "$bold" }}>
                        Use TLS:
                      </Text>
                      <Switch
                        checked={tlsStatus}
                        onChange={handlerTlsState}
                        style={{
                          height: "20px",
                          marginTop: "5px",
                        }}
                        defaultChecked
                        // color="warning"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Spacer y={1} />
            </Card.Body>

            <Card.Divider />

            <Card.Footer>
              <Row justify="flex-end">
                <Button
                  className="primary-button border-radius-8"
                  type="submit"
                  id="btn"
                  onClick={handleClick}
                  flat
                  size="sm"
                >
                  Save Changes
                </Button>
              </Row>
            </Card.Footer>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
}

export default SmtpConfig;
