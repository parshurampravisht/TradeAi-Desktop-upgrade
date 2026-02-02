"use client";
import { useState } from "react";
import { Modal, Row, Navbar, Spacer, Card } from "@nextui-org/react";

import Login from "./login/login";
import SignUp from "./signup/signUp";
import ForgotPassword from "../admin/board/forgotPasswordModal";

const AuthBase = () => {
  //for modal visibility
  const [visible, setVisible] = useState(true);
  //prop for signup or login panel
  const [show, setShow] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const closeHandler = async () => {
    setVisible(false);
  };

  return (
    <div>
      <Modal
        preventClose
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
        width="38rem"
      >
        <Spacer y={0.8}></Spacer>
        <Navbar.Content variant={"highlight-rounded"}>
          <Row justify="center" align="center">
            <Card
              variant="bordered"
              css={{ maxWidth: "220px", borderColor: "transparent" }}
            >
              <Card.Body css={{ p: "$3" }}>
                <Row justify="center" align="center">
                  <Navbar.Link
                    className={show ? "nav-primary-button border-radius-8" : ""}
                    isActive={show}
                    css={{
                      minWidth: "80px",
                      justifyContent: "center",
                      fontFamily: "$sans",
                      minHeight: "38px",
                    }}
                    onPress={() => setShow(true)}
                  >
                    Login
                  </Navbar.Link>
                  <Navbar.Link
                    className={!show ? "nav-primary-button border-radius-8" : ""}
                    isActive={!show}
                    css={{
                      minWidth: "80px",
                      minHeight: "38px",
                      justifyContent: "center",
                      fontFamily: "$sans",
                    }}
                    onPress={() => setShow(false)}
                  >
                    Signup
                  </Navbar.Link>
                </Row>
              </Card.Body>
            </Card>
          </Row>
        </Navbar.Content>
        {show && !showChangePasswordModal ? (
          <Login setShowChangePasswordModal={setShowChangePasswordModal} />
        ) : !show && !showChangePasswordModal ? (
          <SignUp setShow={setShow} show={show} />
        ) : showChangePasswordModal ? (
          <ForgotPassword setShow={setShow} />
        ) : null}
      </Modal>
    </div>
  );
};

export default AuthBase;
