import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Image,
  Text,
  Checkbox,
  Row,
  Col,
  Spacer,
} from "@nextui-org/react";

import { useGlobalContext } from "../../../context/GlobalContext";
import LoadingModal from "../LoadingModal";
import { signup } from "../../../../services/auth/auth.service";

const SignUp = (props) => {
  const { checked, setSignUpData, SignUpData, loginData } = useGlobalContext();
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    is_sub_broker: true,
  });
  const [isShowFormErrors, setIsShowFormErrors] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [actionConfirmation, setActionConfirmation] = useState(false);
  const [toggle, setToggle] = useState(false); // for opening of modal
  const [confirmTouched, setConfirmTouched] = useState(false); // user touched the confirm pasword field or not

  const validateEmail = (email) => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    // Basic phone number validation (numeric and length <= 10)
    return /^\d{10}$/.test(phone);
  };

  const validatePassword = (password) => {
    // Password validation (length > 0 and match with confirmPassword)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const result = regex.test(password);

    return result;
  };

  useEffect(() => {
    // Check for email validity on each keystroke
    if (formData.email.length > 0) {
      if (!validateEmail(formData.email)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "Please enter a valid email address",
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
      }
    }

    // Check for phone number validity on each keystroke
    if (formData.phone.length > 0) {
      if (!validatePhone(formData.phone)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          phone: "Please enter a valid phone number (numeric, max 10 digits)",
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, phone: "" }));
      }
    }

    // Check for password validity on each keystroke
    if (formData.password.length > 0) {
      let flag = validatePassword(formData.password);
      if (flag !== true) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password:
            "Password must be at least 8 characters, contain one uppercase, one lowercase, and one numeric character",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "",
        }));
      }
    } else {
      if (formData.password.length >= 8) {
        let flag = validatePassword(formData.password);
        if (flag !== true) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password:
              "Password must be at least 8 characters, contain one uppercase, one lowercase, and one numeric character",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: "",
          }));
        }
      }
    }

    if (confirmTouched === true) {
      let flag = validatePassword(formData.password);
      if (flag !== true) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password:
            "Password must be at least 8 characters, contain one uppercase, one lowercase, and one numeric character",
        }));
      } else if (formData.password !== formData.confirmPassword) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "Password does not match ",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "",
          confirmPassword: "",
        }));
      }
    }
  }, [formData]);

  const handleChange = (e, field) => {
    // Update the form data when the user types
    e.preventDefault();

    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const submit = async () => {
    setIsShowFormErrors(true);
    const errors = {};
    if (
      formData.firstName === "" ||
      formData.lastName === "" ||
      formData.email === "" ||
      formData.password === "" ||
      formData.confirmPassword === ""
    ) {
      errors.message = "Please fill all (*) marked fields first";
    } else {
      if (!validateEmail(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!validatePhone(formData.phone)) {
        errors.phone =
          "Please enter a valid phone number (numeric, max 10 digits)";
      }

      if (!validatePassword(formData.password)) {
        errors.password =
          "Password must be at least 8 characters, contain one uppercase, one lowercase, and one numeric character";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.ConfirmPassword = "Password and confirm Password do not match";
      }
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Continue with the form submission
      const SignupPayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        address: "Noida",
        phone: formData.phone,
        password: formData.password,
        is_sub_broker:
          props.formType !== "create-user"
            ? formData.is_sub_broker
              ? "True"
              : "False"
            : "False",
        requestFrom:
          props.title === "Create New Dealer" ? "" : "main-app-signup-screen",
        user_id:
          props.formType === "create-user" ? loginData?.user_id : undefined,
      };

      const res = await signup(SignupPayload);

      if (res.status !== "success") {
        if (props.formType !== "create-user") {
          errors.message = `${res.message}`;
        } else {
          errors.message = `${res.message}`;
        }
      } else {
        setToggle(true);
        if (props.formType === "create-user") {
          props.close();
        }
      }
      setIsShowFormErrors(false);
      setFormErrors(errors);
      setErrors({
        email: "",
        password: "",
        phone: "",
      });
    }
  };

  return (
    <>
      <Modal.Header>
        {!props.title ? (
          <Text id="modal-title" size={18}>
            Create Account to &nbsp;
            <Text b size={18}>
              {/* {checked} */}
              TradeAi1
            </Text>
          </Text>
        ) : (
          <Text id="modal-title" size={18}>
            {props.title}
          </Text>
        )}
      </Modal.Header>

      <Modal.Body css={{ width: "fit-content" }}>
        <Row>
          <Col className="signup-input-wrapper">
            <label> First Name *</label>
            <Input
              // label="First Name *"
              bordered
              className="signup-input-wrapper border-radius-8"
              borderWeight="light"
              // color="secondary"
              size="lg"
              placeholder="First name"
              contentLeft={<img src="../images/name.png" width={45} />}
              // value={formData.firstName}
              onChange={(e) => handleChange(e, "firstName")}
              maxLength={20}
            />
            {/* {formData.firstName.length ===  0 ? <Text color="error">please enter first name</Text>:""} */}
          </Col>
          <Spacer y={1} />
          <Col className="signup-input-wrapper">
            <label>Last Name *</label>
            <Input
              // label="Last Name *"
              bordered
              className="border-radius-8"
              borderWeight="light"
              // color="secondary"
              size="lg"
              placeholder="Last Name"
              contentLeft={<img src="../images/name.png" width={40} />}
              // value={formData.lastName}
              onChange={(e) => handleChange(e, "lastName")}
              maxLength={20}
            />
          </Col>
        </Row>
        <Row>
          <Col className="signup-input-wrapper">
            <label>Email *</label>
            <Input
              // label="Email *"
              bordered
              className="border-radius-8"
              borderWeight="light"
              // color="secondary"
              size="lg"
              placeholder="Email"
              contentLeft={<Image src="../images/email.png" width={20} />}
              // value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              maxLength={50}
            />
            {isShowFormErrors &&
              (formData.email.length === 0 || errors.email) && (
                <Text color="error">{errors.email}</Text>
              )}
          </Col>
          <Spacer y={1} />
          <Col className="signup-input-wrapper">
            <label>Phone No *</label>
            <Input
              // label="Phone No"
              bordered
              className="border-radius-8"
              borderWeight="light"
              // color="secondary"
              size="lg"
              type="number"
              placeholder="Phone No"
              contentLeft={<Image src="../images/phonecall.png" width={25} />}
              // value={formData.phone}
              onChange={(e) => handleChange(e, "phone")}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E" || e.key === ".") {
                  e.preventDefault();
                }
              }}
              maxLength={10}
            />
            {isShowFormErrors &&
              (formData.phone.length === 0 ||
                formData.phone.length > 10 ||
                errors.phone) && <Text color="error">{errors.phone}</Text>}
          </Col>
        </Row>
        <Row>
          <Col className="signup-input-wrapper">
            <label>Password *</label>
            <Input.Password
              // label="Password *"
              bordered
              className="border-radius-8"
              fullWidth
              borderWeight="light"
              // color="secondary"
              size="lg"
              placeholder="Password"
              contentLeft={<img src="../images/password.png" width={40} />}
              // value={formData.password}
              onChange={(e) => handleChange(e, "password")}
              maxLength={20}
            />
          </Col>
          <Spacer y={1} />
          <Col className="signup-input-wrapper">
            <label>Confirm Password * </label>
            <Input.Password
              // label="Confim Password *"
              bordered
              className="border-radius-8"
              fullWidth
              borderWeight="light"
              // color="secondary"
              size="lg"
              placeholder="Confirm Password"
              contentLeft={<img src="../images/password.png" width={10} />}
              // value={formData.confirmPassword}
              onChange={(e) => {
                handleChange(e, "confirmPassword");
                setConfirmTouched(true);
              }}
              maxLength={20}
            />
          </Col>
        </Row>

        {props.formType !== "create-user" ? (
          <Checkbox
            className="custom-checkbox"
            onChange={(e) => {
              setFormData({ ...formData, is_sub_broker: e });
            }}
            isSelected={true}
          >
            <Text size={12}>
              SubBroker (check the box if you want to signup as a SubBroker)
            </Text>
          </Checkbox>
        ) : null}

        {/* {(formData.password.length > 0 || formData.password.length < 8 || errors.password) ? (
          <Text color="error">{errors.password}</Text>
        ) :formData.confirmPassword.length === 0 || errors.confirmPassword ? (
          <Text color="error">{errors.confirmPassword}</Text>
        ) : (
          ""
        )} */}
        {isShowFormErrors &&
          (errors.password ? (
            <Text color="error">{errors.password}</Text>
          ) : (
            <Text color="error">{errors.confirmPassword}</Text>
          ))}

        <Text size={14}>
          All fields marked with an asterisk ( * ) are mandatory.
        </Text>
        {formErrors ? <Text color="error">{formErrors.message}</Text> : ""}
      </Modal.Body>
      <Modal.Footer>
        {props.formType === "create-user" ? (
          <Button
            className="secondary-button border-radius-8"
            color={"error"}
            onPress={() => {
              setActionConfirmation(true);
            }}
            auto
          >
            Cancel
          </Button>
        ) : null}

        <Button
          auto
          className="primary-button border-radius-8"
          flat
          onPress={submit}
          css={{ mr: "$9" }}
        >
          {toggle ? (
            <LoadingModal
              toggle={toggle}
              setToggle={setToggle}
              setShow={props.setShow}
              show={props.show}
              formType={props.formType}
            />
          ) : (
            <Text style={{ color: "#ffffff" }} className="">
              {props.formType !== "create-user" ? "Signup" : "Create"}
            </Text>
          )}
        </Button>

        {actionConfirmation ? (
          <Modal
            className="signup-confirmation-modal"
            open={actionConfirmation}
          >
            <Modal.Body>
              Are you sure you want to cancel, form details will be lost?
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="secondary-button border-radius-8 "
                onPress={() => setActionConfirmation(false)}
              >
                No
              </Button>
              <Button
                className="primary-button border-radius-8"
                color={"warning"}
                onPress={() => {
                  setActionConfirmation(false);
                  props.close();
                }}
              >
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        ) : null}
      </Modal.Footer>
    </>
  );
};

export default SignUp;
