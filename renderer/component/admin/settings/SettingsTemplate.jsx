/**********************************************************************
 * Author: ParshuRam Saini
 * Date: 2025-02-20
 * Description: This page is desinged to configure Settings information.
 * Features:
 * - User can edit or save records limit for future option data
 **********************************************************************/
import React, { useEffect, useState } from "react";
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
} from "@nextui-org/react";
import { useGlobalContext } from "../../../context/GlobalContext";
import { warnMessage } from "../../../constant/constant";

function SettingsTemplate() {
  const { recordsLimit, setRecordsLimit } = useGlobalContext();
  const [cloneRecordsLimit, setCloneRecordsLimit] = useState();

  useEffect(() => {
    setCloneRecordsLimit(recordsLimit);
  }, [recordsLimit]);

  const savehandler = () => {
    if (
      cloneRecordsLimit < 30
      // || cloneRecordsLimit > 60
    ) {
      toast.warn(warnMessage.records_limit); //
      return;
    }
    toast.success(warnMessage.success_records_limit_message);
    localStorage.setItem("records_limit", cloneRecordsLimit);
    setRecordsLimit(+cloneRecordsLimit);
  };

  return (
    <>
      <Grid.Container gap={2} justify="center">
        <Grid sm={12} md={12}>
          <Card css={{ mw: "500%", p: "$10", width: "200%" }}>
            <Card.Header css={{}}>
              <Row>
                <Col>
                  <Text h4>Settings Configuration</Text>
                </Col>
                <Spacer x={2} />
              </Row>
            </Card.Header>

            <Card.Divider />

            <Card.Body css={{ py: "$10" }}>
              <Row>
                <Row className="flex-row justify-center align-center">
                  <Text
                    h6
                    css={{
                      fontWeight: "$bold",
                      width: "130px",
                      marginBottom: "0px",
                    }}
                  >
                    Records Limit:
                  </Text>
                  <Input
                    style={{ width: "50px" }}
                    className="settings-input border-radius-8"
                    bordered
                    borderWeight="light"
                    name="first_name"
                    placeholder="60"
                    fullWidth
                    value={cloneRecordsLimit}
                    onChange={(e) => {
                      let value = e.target.value;
                      // if (value.length > 2) return;
                      setCloneRecordsLimit(value);
                    }}
                    type="number"
                    max={2}
                  ></Input>
                </Row>
                <Spacer x={1} />
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
                  onClick={savehandler}
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

export default SettingsTemplate;
