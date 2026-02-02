import React, { useState } from "react";
import {
  Modal,
  Input,
  Row,
  Container,
  Checkbox,
  Button,
  Text,
  Card,
  Link,
  Grid,
  Spacer,
} from "@nextui-org/react";
import EmailChecker from "./emailchecker";
import { forgotPassword } from "../../../../services/auth/auth.service";
import { toast } from "react-toastify";
import { EMAIL_REGEX } from "../../../constant/constant";
function ResetPassword(props) {
  const [touched, setIsTouched] = useState(false);
  const [open, setOpen] = useState(false); //props for email checker component (modal functioning)
  const [isValid, setIsValid] = useState(false); // using it for validation in this component (in future we have to transform it in independently)
  const [email, setEmail] = useState(""); // use to handle the values in input field
  // const emailref = useRef("");

  //used to open other prompt for email checker component (binding)
  const emailCheckHandler = async () => {
    const res = await forgotPassword({ email: email });

    if (
      res?.error === false &&
      res !== null &&
      res?.message !== "User does not exist"
    ) {
      // window.alert("Please log in with the new password sent to your email");
      toast.info("Please log in with the new password sent to your email");
      setOpen(true);
    } else {
      // window.alert(res?.message + ". Please enter correct email!");
      toast.error("Something went wrong!");
    }
  };

  //validation of email funciton
  function IsValidEmail(email) {
    // return email.includes("@") && email.includes(".");
    let validateEmail = EMAIL_REGEX.test(email);
    return validateEmail;
  }
  //alert handler for user
  const alertHandler = (e) => {
    //  const fieldValue = document.getElementById("inputField");
    //
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValid(IsValidEmail(newEmail));
    setIsTouched(true);
  };

  //open of model handler
  const handler = async () => {
    props.setToggle(true);
  };

  //close of modal handler
  const toggleClosehandler = () => {
    props.setToggle(false);
    setIsTouched(false);
    setEmail("");
    //
  };

  return (
    <>
      <Link className="primary-text-color" auto onPress={handler}>
        {" "}
        Forgot password
      </Link>
      <div>
        <Modal
          closeButton
          open={props.toggle}
          onClose={toggleClosehandler}
          aria-label="reset password"
          blur
          animated={!open}
        >
          <Modal.Header>
            <Text id="modal-title" b size={19}>
              Reset Password{" "}
              <div mx="5px">
                <Text h6 weight="normal">
                  Enter email associated with your account and we'll send an
                  email with instructions to reset your password.
                </Text>
              </div>
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Input
              type="email"
              clearable
              bordered
              fullWidth
              value={email}
              color="secondary"
              size="md"
              onChange={alertHandler}
              placeholder="Email address"
            />
            <Text
              style={{
                color: isValid ? "green" : "red",
                fontStyle: isValid ? "normal" : "italic",
              }}
            >
              {touched && !isValid && "please enter correct email id"}
            </Text>
          </Modal.Body>
          <Modal.Footer justify="space-between">
            <Button
              auto
              type="submit"
              light
              style={{ justifyContent: "left" }}
              onClick={toggleClosehandler}
            >
              Back
            </Button>
            {touched && (
              <Button
                auto
                flat
                disabled={!isValid}
                type="submit"
                css={{ background: "$blue600", color: "White" }}
                onPress={emailCheckHandler}
              >
                Send Instructions
                <EmailChecker
                  open={open}
                  emailCheckHandler={emailCheckHandler}
                  setOpen={setOpen}
                  setToggle={props.setToggle}
                  email={email}
                />
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
export default ResetPassword;
