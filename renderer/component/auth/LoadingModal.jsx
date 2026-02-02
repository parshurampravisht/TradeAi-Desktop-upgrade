import { Modal, Loading, Text, Checkbox, Button } from "@nextui-org/react";
import Router, { useRouter } from "next/router";
import { useState } from "react";
export default function LoadingModal(props) {
  const router = useRouter();
  const [open, setOpen] = useState(props.toggle);
  const [isAgreed, setIsAgreed] = useState(false);

  const closehandler = () => {
    setOpen(!props.toggle);
  };

  const handleRouteEvent = () => {
    setIsAgreed(true);
    props.setShow(true);

    // if (isAgreed) {
    //   // window.location.href = "/home";
    //
    //   props.setShow(true);
    //
    // } else if (!isAgreed) {
    //   props.setToggle(false);
    //
    // }
  };
  return (
    <div>
      <Text>Sign Up</Text>
      <Modal
        preventClose
        closeButton
        open={props.toggle}
        onClose={closehandler}
        blur
      >
        <Modal.Header>
          <Text>Notification</Text>
          <Loading />
        </Modal.Header>
        <Modal.Body>
          {props.formType !== "create-user" ? (
            <Text>
              A verification email has been sent to the registered email ID of
              the user for completing the sign up process.
            </Text>
          ) : (
            <Text>
              An email has been sent to your registered email id for completing
              the sign up process.
            </Text>
          )}
          {/* <Checkbox isRequired onClick={handlerAgree} color="success">
            {" "}
            Agree
          </Checkbox> */}
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat onPress={handleRouteEvent}>
            Ok
            {}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
