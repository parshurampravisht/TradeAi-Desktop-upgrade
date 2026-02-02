import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Grid,
  Text,
  Col,
  Button,
  Row,
  Input,
  Image,
  Spacer,
  Badge,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../../../context/GlobalContext";
import { login, updateDetails } from "../../../../services/auth/auth.service";
const gitHubUrl = "https://api.github.com/users/deekshasharma";

function ProfileBase() {
  const { loginData, setLoginData } = useGlobalContext();

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

  // Setting Edit/Save Edits State
  const [active, setActive] = useState(false);
  const [editedConfirmPassword, setEditConfirmPassword] = useState("");

  const togglehandler = () => {
    setActive(true);
  };
  const handleClick = async () => {
    if (active) {
      // if (passwordRef.current !== editedConfirmPassword) {
      //   alert("Password and Confirm Password must match.");
      //   return; // Prevent further execution if not matching
      // }
      const updatedFields = {};
      if (firstNameRef.current.value !== "") {
        updatedFields.first_name = firstNameRef.current.value;
      }
      if (lastNameRef.current.value !== "") {
        updatedFields.last_name = lastNameRef.current.value;
      }
      if (emailRef.current.value !== "") {
        updatedFields.email = emailRef.current.value;
      }
      if (phoneRef.current.value !== "") {
        updatedFields.phone = phoneRef.current.value;
      }
      if (passwordRef.current.value !== "") {
        updatedFields.password = passwordRef.current.value;
      }

      if (Object.keys(updatedFields).length > 0) {
        const res = await updateDetails(updatedFields);

        if (res.status === "success") {
          toast.success(res?.message);
          setLoginData({
            firstname: res.data.first_name,
            lastname: res.data.last_name,
            email: res.data.email_id,
            phone: res.data.phone,
          });
        }
      }
    }
    setActive(false);
  };

  //API for Fetching Profile Data
  // const [userData, setUserData] = useState({});
  // useEffect(() => {
  // getGitHubUserWithFetch();
  // }, []);

  // const getGitHubUserWithFetch = async () => {};

  return (
    <>
      <Grid.Container gap={2} justify="center">
        <Grid sm={12} md={6}>
          <Card css={{ mw: "500%", p: "$10", width: "200%" }}>
            <Card.Header>
              <Badge
                size="xs"
                flat
                enableShadow
                disableOutline
                //content={"Edit"}
                placement="bottom-right"
              >
                <Image
                  alt="nextui logo"
                  src="images/profile.png"
                  width="60px"
                  height="60px"
                />
              </Badge>
              <Grid.Container css={{ pl: "$8" }}>
                <Grid xs={12}>
                  <Text h3 css={{ lineHeight: "$xs" }}>
                    {`${
                      loginData?.firstname
                        ? loginData?.firstname[0].toUpperCase() +
                          loginData?.firstname.slice(1)
                        : ""
                    } ${
                      loginData?.lastname
                        ? loginData?.lastname[0].toUpperCase() +
                          loginData?.lastname.slice(1)
                        : ""
                    } `}
                  </Text>
                </Grid>
                <Grid xs={12}>
                  <Text css={{ color: "$accents8" }}>{loginData.user_id}</Text>
                </Grid>
              </Grid.Container>
            </Card.Header>

            <Card.Divider />

            <Card.Body css={{ py: "$10" }}>
              <Row>
                <Col>
                  <Text>First Name:</Text>
                  <Input
                    className="border-radius-8"
                    initialValue={loginData.firstname}
                    bordered
                    borderWeight="light"
                    disabled={!active}
                    ref={firstNameRef}
                    name="first_name"
                    fullWidth
                    // label="First Name:"
                  ></Input>
                </Col>
                <Spacer x={1} />
                <Col>
                  <Text>Last Name:</Text>
                  <Input
                    className="border-radius-8"
                    initialValue={loginData.lastname}
                    bordered
                    borderWeight="light"
                    disabled={!active}
                    fullWidth
                    ref={lastNameRef}
                    name="last_name"
                    // label="Last Name:"
                  ></Input>
                </Col>
              </Row>
              <Spacer y={1} />

              <Row>
                <Col>
                  <Text> Email:</Text>
                  <Input
                    className="border-radius-8"
                    initialValue={loginData.email}
                    bordered
                    borderWeight="light"
                    disabled={true}
                    fullWidth
                    ref={emailRef}
                    name="email"
                    // label="Email Address:"
                  ></Input>
                </Col>
                <Spacer x={1} />
                <Col>
                  <Text>Phone Number:</Text>
                  <Input
                    className="border-radius-8"
                    bordered
                    initialValue={loginData.phone}
                    borderWeight="light"
                    fullWidth
                    name="phone"
                    ref={phoneRef}
                    disabled={!active}
                    // label="Phone Number:"
                  ></Input>
                </Col>
              </Row>
              <Spacer y={1} />
              <Row>
                <Input.Password
                  className="border-radius-8"
                  disabled={!active}
                  bordered
                  fullWidth
                  ref={passwordRef}
                  borderWeight="light"
                  name="password"
                  label="Enter Password:"
                  placeholder=""
                ></Input.Password>
                <Spacer x={1} />
                <Input.Password
                  className="border-radius-8"
                  disabled={!active}
                  bordered
                  fullWidth
                  label="Re-enter Password:"
                  borderWeight="light"
                  placeholder=""
                  onblur={(e) => setEditConfirmPassword(e.target.value)}
                ></Input.Password>
              </Row>
            </Card.Body>

            <Card.Divider />

            <Card.Footer>
              <Row justify="flex-end">
                {active ? (
                  <Button
                    className="primary-button border-radius-8"
                    type="submit"
                    id="btn"
                    onClick={handleClick}
                    flat
                    size="sm"
                  >
                    Save changes
                  </Button>
                ) : (
                  <Button
                    className="primary-button border-radius-8"
                    auto
                    flat
                    onClick={togglehandler}
                  >
                    Edit
                  </Button>
                )}
              </Row>
            </Card.Footer>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
}

export default ProfileBase;
