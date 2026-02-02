import { Button, Input, Modal, Row, Link, Text } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { resendEmail } from "../../../../services/auth/auth.service";
import { useEffect } from "react";

export default function ResendEmail(props) {
  const fetchData = async () => {
    const res = await resendEmail(props.payload);
    
  };
  useEffect(() => {
    if(props.open){

      fetchData();
    }
  }, [props.payload]);
const handler = ()=>{
  props.setOpen(true);
}
  const togglehandler = () => {
    

    props.setOpen(!props.open);
  };

  return (
    <div>
       <Link auto onPress={handler}>
        {" "}
        Resend email
      </Link>
      {/* <p>Send Instruction</p> */}
      <Modal closeButton open={props.open} onClose={togglehandler}>
        <Modal.Header>
          <Text id="modal-title" b size={19}>
            <Row justify="center">
              <img
                alt="email logo"
                src="email.png"
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
                We have sent you instruction for resetting password to your
                email i.e {props.payload.email}
              </Text>
            </div>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Row justify="center">
            <Button light type="submit" auto>
              Open Email app{" "}
            </Button>
          </Row>
          <Row justify="center">
            <Button light type="submit" auto>
              Skip , I' ll comfirm later
            </Button>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Row justify="center">
            {" "}
            <Text css={{ alignItems: "center" }} size={14}>
              Did not receive the email? Check your spam folder or{" "}
              <Link href=""> try again</Link>
            </Text>
          </Row>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
