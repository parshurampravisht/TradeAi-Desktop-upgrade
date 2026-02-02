import { Modal, Button, Text, Input, Row, Checkbox } from "@nextui-org/react";
import React, { useRef, useState } from "react";
import { updateDetails } from "../../../../services/auth/auth.service";
import { useGlobalContext } from "../../../context/GlobalContext";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
function ForgotPassword(props) {
  const router = useRouter();
  const { loginData, setLoginData } = useGlobalContext();
  const [toggle, setToggle] = useState(false);
  const [message, setmessage] = useState("");
  const inputNewPassword = useRef(null);
  const inputConfirmPassword = useRef(null);
  const validatePassword = (password, confirmPassword) => {
    // Password validation (length > 0 and match with confirmPassword)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const result = regex.test(password) && regex.test(confirmPassword);
    return result;
  };
  const handler = () => {
    
    setToggle(true);
  };
  const togglehandler = () => {
    
    setToggle(false);
  };
  const validator = (e) => {
    const defaultValue = e.target.value;
    if (defaultValue.length < 8) {
      setmessage({
        message: `please enter 8 characters atleast , ${
          8 - defaultValue.length
        }`,
      });
    }
  };
  const handleSubmit = async () => {
    
    const changePasswordPayload = {
      email: loginData?.email,
      password: inputConfirmPassword?.current?.value?.trim(),
    };
    if (
      changePasswordPayload.password !== "" &&
      validatePassword(
        inputNewPassword?.current?.value,
        inputConfirmPassword?.current?.value
      ) &&
      inputNewPassword?.current?.value === inputConfirmPassword?.current?.value
    ) {
      const res = await updateDetails(changePasswordPayload);
      if (res?.status === "success") {
        /* toast.success(
          "Your password was changed successfully! You can now login with your new password!"
        ); */
        // window.alert(
        //   "Your password was changed successfully! You can now login with your new password!"
        // );
        props.setShowChangePasswordModal(false);
        props.setShow(true);
        localStorage.removeItem("access_token");
        router.push("/equity");
      } else {
        // window.alert("Something went wrong!");
      }
    } else {
      // window.alert("Password and confirm Password do not match !");
    }
  };
  return (
    <div>
      {/* <Button auto shadow onPress={handler}>
        Open me{" "}
      </Button> */}
      <Modal
        closeButton
        open={toggle}
        onClose={togglehandler}
        aria-label="forgot password"
      >
        <Modal.Header>
          <Text id="modal-title" b size={18}>
            Create a New password
            <div mx="4px">
              {" "}
              <Text h6 weight="normal">
                "Password must be at least 8 characters, contain one uppercase,
                one lowercase, and one numeric character"
              </Text>
            </div>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input.Password
            label="New Password"
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="New password"
            ref={inputNewPassword}
            // value={}
          />
          <Input.Password
            label="Confirm New Password"
            clearable
            bordered
            fullWidth
            color="success"
            size="lg"
            placeholder="Confirm new password"
            ref={inputConfirmPassword}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            onPress={togglehandler}
            style={{ justifyContent: "left" }}
          >
            Close
          </Button>
          <Button
          auto
            flat
            disabled={
              inputNewPassword.current.value !== inputNewPassword.current.value
            }
            type="Submit"
          
            onSubmit={
              handleSubmit
            }
          >
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default ForgotPassword;