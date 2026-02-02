import React, { useEffect, useState } from "react";
import { Button, Row, Col, Input, Modal, Text } from "@nextui-org/react";
import Image from "next/image";
import { getClientData } from "../../../services/transactions/transactions.service";
import { useGlobalContext } from "../../context/GlobalContext";
import { IsValidEmail, phonePattern } from "../../constant/constant";

const formData = [
  {
    id: 121,
    label: "Name",
    placeholder: "Enter name",
    type: "text",
    field: "fullName",
  },
  {
    id: 122,
    label: "Email",
    placeholder: "Enter email",
    type: "email",
    field: "email",
  },
  {
    id: 123,
    label: "Phone",
    placeholder: "Enter phone no.",
    type: "number",
    field: "phone",
  },
];

const initialState = {
  fullName: "",
  email: "",
  phone: "",
};

function SubscriptionScreenModal({ toggle, setToggle }) {
  const [clientForm, setClientForm] = useState(initialState);
  const [error, setError] = useState("");

  const { loginClientUserData, setLoginClientUserData } = useGlobalContext();

  const updateClientForm = (data) => {
    setClientForm({
      fullName: `${data?.first_name} ${data?.last_name}`,
      email: data?.email_id,
      phone: data?.phone,
    });
  };

  const closeHandler = (data) => {
    setToggle(false);
    updateClientForm(data);
    setError("");
  };

  const handleInputChange = (field, value) => {
    setClientForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const SubmitHandler = () => {
    const isValidEmail = IsValidEmail(clientForm.email);

    if (!isValidEmail) {
      // toast.error("Please enter valid email address");
      setError("Please enter valid email address");
      return;
    }

    if (!phonePattern.test(clientForm.phone)) {
      // toast.error("Please enter valid phone number");
      setError("Please enter valid phone number");
      return;
    }
    setError("");
  };

  useEffect(() => {
    updateClientForm(loginClientUserData);
  }, [loginClientUserData]);

  useEffect(() => {
    (async () => {
      if (Object.keys(loginClientUserData).length) {
        updateClientForm(loginClientUserData);
      } else {
        const loginUserResponse = await getClientData();
        updateClientForm(loginUserResponse.data);
        setLoginClientUserData(loginUserResponse.data);
      }
    })();
  }, []);

  return (
    <div>
      <Modal
        scroll
        open={toggle}
        preventClose
        width="715px"
        css={{ height: "fit-content" }}
        className={"membership-screen-modal"}
        blur
      >
        <Modal.Header
          className={"flex-col align-center justify-center"}
          style={{
            margin: "0px",
            padding: "0px",
            border: "1px solid #FF00002E",
            borderRadius: "12px",
          }}
        >
          <div
            style={{ background: "#FF00002E", padding: "10px 18px 15px 10px" }}
            className="flex-row align-center justify-between width-100 height-90px"
          >
            <Image
              style={{ margin: "0px" }}
              src={"/images/logo.svg"}
              height={60}
              width={200}
            />
            <Text
              h2
              css={{
                fontFamily: "inherit",
                fontSize: "20px",
                fontWeight: "700",
                margin: "0px",
                letterSpacing: "0.4px",
              }}
            >
              TradeAi1 2024 Trial
            </Text>
          </div>
          <div
            className={"flex-row justify-start align-center width-100"}
            style={{ padding: "10px 18px 15px 10px" }}
          >
            <div style={{ width: "80px" }}>
              <Image
                style={{ margin: "0px" }}
                src={"/images/membership/timer.png"}
                height={56}
                width={56}
              />
            </div>
            <div className="flex-col justify-start align-start">
              <Text
                h2
                css={{
                  fontFamily: "inherit",
                  fontSize: "20px",
                  fontWeight: "700",
                  margin: "0px",
                  letterSpacing: "0.4px",
                }}
              >
                {loginClientUserData?.subscription?.is_active
                  ? `Your ${
                      loginClientUserData?.subscription?.plan_name
                    } plan expires in ${
                      loginClientUserData?.subscription?.days_left < 2
                        ? "Today"
                        : `${loginClientUserData?.subscription?.days_left} days`
                    }.`
                  : `Your trial has expired`}
              </Text>
              {!loginClientUserData?.subscription?.is_active && (
                <p
                  style={{
                    color: "#667085",
                    fontSize: "14px",
                    fontWeight: "400",
                    letterSpacing: "0.4px",
                  }}
                >
                  You can continue to use TradeAi1 2024 by purchasing the
                  software.
                </p>
              )}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body css={{ padding: "22px 0px 22px 10px" }}>
          <div
            style={{ margin: "0px" }}
            className="flex-row justify-start align-center"
          >
            <Text
              h2
              css={{
                fontFamily: "inherit",
                fontSize: "20px",
                fontWeight: "700",
                margin: "0px",
                letterSpacing: "0.4px",
              }}
            >
              Upgrade to a Plus membership
            </Text>
          </div>
          <p
            style={{
              color: "#667085",
              fontSize: "14px",
              fontWeight: "400",
              letterSpacing: "0.4px",
            }}
          >
            Please check these details and send a request.
          </p>
          <Row
            style={{ marginBottom: "0px" }}
            className="column-gap-10 membership-form-wrapper"
          >
            {formData.map(({ label, placeholder, type, id, field }, index) => {
              return (
                <Col key={id.toString()}>
                  <Text
                    h5
                    size={"$md"}
                    css={{
                      fontFamily: "inherit",
                      color: "#606060",
                      margin: "0px",
                      marginBottom: "4px",
                    }}
                  >
                    {label}
                  </Text>

                  <Input
                    className="form1-input width-100"
                    style={{
                      border: "1px solid #EFEFEF",
                      background: "#FDFDFD",
                      borderRadius: "5px",
                      margin: "0px",
                      padding: "0px 10px",
                    }}
                    borderWeight="light"
                    fullWidth
                    type={type}
                    placeholder={placeholder}
                    value={clientForm[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                </Col>
              );
            })}
          </Row>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </Modal.Body>
        <Modal.Footer className="column-gap-10">
          {loginClientUserData?.subscription?.is_active && (
            <Button
              className="flex-row justify-between secondary-button border-radius-8"
              style={{
                margin: "0px",
                width: "190px",
              }}
              auto
              flat
              onClick={() => closeHandler(loginClientUserData)}
            >
              <div
                className="flex-row align-center justify-center"
                style={{ marginRight: "5px" }}
              >
                <Image
                  style={{ margin: "0px" }}
                  src={"/images/membership/clock_icon.png"}
                  height={16}
                  width={16}
                />
              </div>
              Continue with Trial
            </Button>
          )}
          <Button
            style={{
              margin: "0px",
              width: "220px",
            }}
            auto
            flat
            className="primary-button border-radius-8"
            onClick={SubmitHandler}
          >
            <div
              className="flex-row align-center justify-center"
              style={{ marginRight: "5px" }}
            >
              <Image
                style={{ margin: "0px" }}
                src={"/images/membership/upgrade_icon_bolt.png"}
                height={20}
                width={25}
                alt="Upgrade"
              />
            </div>
            Upgrade to Plus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SubscriptionScreenModal;
