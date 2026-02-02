import { Button, Modal, Row, Link, Text } from "@nextui-org/react";
export default function EmailChecker(props) {
  const { emailCheckHandler } = props;
  const togglehandler = () => {
    props.setToggle(false);
    props.setOpen(!props.open);
  };

  return (
    <div>
      {/* <p>Send Instruction</p> */}
      <Modal closeButton open={props.open} onClose={togglehandler}>
        <Modal.Header>
          <Text id="modal-title" b size={19}>
            <Row justify="center">
              <img
                alt="email logo"
                src="https://static.vecteezy.com/system/resources/previews/020/009/601/original/email-and-mail-icon-black-free-png.png"
                width="70px"
                height="70px"
              />
            </Row>
            <br />
            <br />
            Check Your Email
            <div m="5px">
              <Text h6 weight="normal">
                {" "}
                {`We have sent you a one time password to ${props.email}. Proceed
                to login with the one time password.`}
              </Text>
            </div>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Row justify="center">
            <Button flat type="button" onPress={togglehandler} auto>
              Proceed to Login
            </Button>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Row justify="center">
            {" "}
            <Text css={{ alignItems: "center" }} size={14}>
              Did not receive the email? Check your spam folder or{" "}
              <Link
                href=""
                // css={{ background: "$blue600", color: "White" }}
                onPress={emailCheckHandler}
              >
                Re-Send Email
              </Link>
            </Text>
          </Row>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
