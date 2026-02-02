/**********************************************************************
 * Author: Upendra Singh
 * Date: 2024-07-08
 * Description: This page is desinged to configure email body.
 * Features:
 * - User can edit or save email body with limited restriction
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
  Spacer,
  Input,
} from "@nextui-org/react";
import { useGlobalContext } from "../../../context/GlobalContext";
import {
  getEmailTemplate,
  setupEmailTemplate,
} from "../../../../services/email/emailConfig.service";
import dynamic from "next/dynamic";
const MyRichTextEditor = dynamic(
  () => import("../../common/MyRichTextBoxEditor"),
  {
    ssr: false,
  }
);
//import Editor from "react-rte"; //RichText

function EmailTemplate() {
  const { setAdminComponent } = useGlobalContext();
  useEffect(() => {
    handlerShowTemplateData();
  }, []);
  // Setting Edit/Save Edits State
  const [value, setValue] = useState();
  const [initialValue, setInitialValue] = useState();
  const SubjectRef = useRef(null);
  const onChange = (newValue) => {
    setValue(newValue);
  };

  const handlerShowTemplateData = async () => {
    try {
      const res = await getEmailTemplate();
      if (res.statusText === "OK") {
        SubjectRef.current.value = res?.data?.data?.subject;
        setInitialValue(res?.data?.data?.content);
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker like AppSignal
      toast.success("Oops! something went wrong.");
    }
  };

  const handleSave = async () => {
    try {
      const template = {};
      if (SubjectRef.current.value !== "") {
        template.subject = SubjectRef.current.value;
      }
      if (value !== "") {
        template.content = value.toString("html");
      }
      if (Object.keys(template).length > 0) {
        const res = await setupEmailTemplate(template);
        if (res.statusText === "OK") {
          toast.success("Email template saved successfully!");
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
          <Card css={{ mw: "500%", p: "$1", width: "200%" }}>
            <Card.Header css={{}}>
              <Row>
                <Col>
                  <Text h4>Email Template Setup</Text>
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
            <Card.Body css={{ py: "$5" }}>
              <Row>
                <Col>
                  <Text h6 css={{ fontWeight: "$bold" }}>
                    Subject:
                  </Text>
                  <Input
                    bordered
                    borderWeight="light"
                    ref={SubjectRef}
                    name="subject"
                    placeholder="Enter subject"
                    fullWidth
                  ></Input>
                </Col>
              </Row>
              <Spacer x={1} />
              <Row>
                <Col>
                  <Text h6 css={{ fontWeight: "$bold" }}>
                    Body:
                  </Text>
                  <MyRichTextEditor
                    value={value}
                    onChange={onChange}
                    initialText={initialValue}
                  />
                </Col>
              </Row>
            </Card.Body>

            <Card.Divider />

            <Card.Footer>
              <Row justify="flex-end">
                <Button
                  type="submit"
                  id="btn"
                  onClick={handleSave}
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

export default EmailTemplate;
