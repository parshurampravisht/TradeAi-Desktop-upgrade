import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAuthState } from "../../../redux/slice/authSlice";
import "react-toastify/dist/ReactToastify.css";
import {
  Modal,
  Input,
  Row,
  Button,
  Text,
  Image,
  Loading,
  Checkbox,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import { useGlobalContext } from "../../../context/GlobalContext";
import {
  login,
  SubscribeWebhookDetail,
} from "../../../../services/auth/auth.service";
import ResetPassword from "./resetpassword";
import ResendEmail from "./resendEmail";
import { baseAuthURL } from "../../../../environments/environment";
import { reconnectAllClients } from "../../../../services/transactions/transactions.service";
// const Store = require("electron-store");

export default function Login(props) {
  const [toggle, setToggle] = useState(false);
  const [show, setShow] = useState(false);
  const [loader, setLoader] = useState(false);
  const [modaltoggle, setModalToggle] = useState(false); //for opening of modal
  const [rememberMe, setRememberMe] = useState(false);
  const [isHideValue, setIsHideValue] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [shouldSubmit, setShouldSubmit] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem("hasVisited");
    localStorage.removeItem("access_token");
  }, []);

  const {
    checked,
    setPrimaryNav,
    setLoginData,
    connectToLastClients,
    clientCreds,
  } = useGlobalContext();
  //prop for signup or login panel
  const [errorMsg, setErrorMsg] = useState("");
  //pops for radio button

  const router = useRouter();
  //prop for input field
  // const inputRefName = useRef(null);
  // const inputRefPass = useRef(null);
  const payload = {
    email: loginForm.email,
  };

  const dispatch = useDispatch();

  const cacheEmail = localStorage.getItem("loginEmail");
  const cachePassword = localStorage.getItem("loginPassword");
  useEffect(() => {
    if (cacheEmail && cachePassword) {
      setRememberMe(true);
      setLoginForm({ email: cacheEmail, password: cachePassword });
    }
  }, [cacheEmail, cachePassword]);

  useEffect(() => {
    if (!isHideValue || (cacheEmail && cachePassword)) return;
    const timeoutId = setTimeout(() => {
      setIsHideValue(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (shouldSubmit) {
      submit();
      setShouldSubmit(false); // Resetting the flag
    }
  }, [shouldSubmit]);

  const submit = async () => {
    //const dispatch = useDispatch();
    try {
      setLoader(true);
      let error = {};
      if (
        loginForm.email?.trim().length === 0 ||
        loginForm.password?.trim().length === 0
      ) {
        error = "Please fill email or password field first!!";
        setErrorMsg(error);
        setLoader(false);
      } else {
        const Loginpayload = {
          email: loginForm.email,
          password: loginForm.password,
        };
        const res = await login(Loginpayload);
        localStorage.setItem("createdBy", res?.data?.first_name);
        localStorage.setItem("modifyBy", res?.data?.last_name);
        localStorage.setItem("user_id", res?.data?.user_id);
        if (rememberMe) {
          localStorage.setItem("loginEmail", loginForm.email);
          localStorage.setItem("loginPassword", loginForm.password);
        } else {
          localStorage.removeItem("loginEmail");
          localStorage.removeItem("loginPassword");
        }

        if (res?.status !== "success") {
          setLoader(false);
          setErrorMsg(res?.message);
        } else if (res.data.is_verified !== true) {
          setLoader(false);
          setErrorMsg("Please verify your email first");
          setShow(true);
        } else {
          setLoader(true);
          const resData = {};
          resData["status"] = res.status;
          resData["token"] = res.token;
          resData["is_verified"] = res.data.is_verified;
          resData["firstname"] = res.data.first_name;
          resData["lastname"] = res.data.last_name;
          resData["address"] = res.data.address;
          resData["email"] = res.data.email_id;
          resData["phone"] = res.data.phone;
          resData["profile_pic"] = res.data.profile_pic;
          resData["is_sub_broker"] = res.data?.is_sub_broker;
          resData["user_id"] = res.data?.user_id;
          resData["change_password"] = res.data?.change_password;
          resData["allowed_clients"] = res.data?.allowed_clients;
          // const store = new Store();
          // store.set("logedInUserData", resData);

          // NEW (use IPC):
          await window.electronAPI.setStore("logedInUserData", resData);

          setLoginData(resData); //setting gloabl variable for login data
          setErrorMsg("");
          window.localStorage.setItem("IsOnline", "YES");
          dispatch(setAuthState(true));
          let getAllUploadedClientRes = null;
          try {
            getAllUploadedClientRes = await reconnectAllClients();
            await connectToLastClients(
              getAllUploadedClientRes,
              res.data?.user_id
            );
          } catch (error) {
            console.log("error", error);
          }
          router.push(
            `/${getAllUploadedClientRes && getAllUploadedClientRes?.rows?.length
              ? "equity"
              : "admin"
            }`
          );
        }
        if (res?.data?.user_id) {
          const resDetail = await SubscribeWebhookDetail(
            baseAuthURL,
            res?.data?.user_id
          );
          return resDetail;
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
    setIsHideValue(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setShouldSubmit(true);
    }
  };

  useEffect(() => {
    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, []); // Ensure that this effect runs only once

  useEffect(() => {
    const records = localStorage.getItem("records_limit");
    if (!records) localStorage.setItem("records_limit", 30); //
  }, []);

  //to set primary nav when checkbox is clicked
  useEffect(() => {
    if (checked == "TradeTez") {
      setPrimaryNav([
        {
          name: "Admin",
          path: "/admin",
          icon: "admin.svg",
          isVisible: true,
        },
        {
          name: "Dashboard",
          path: "/equity",
          icon: "dashboard.png",
          isVisible: true,
        },
      ]);
    } else {
      setPrimaryNav([
        {
          name: "Dashboard",
          path: "/equity",
          icon: "dashboard.png",
          isVisible: true,
        },
      ]);
    }
  }, [checked]);

  return (
    <>
      <Modal.Header>
        <Text id="modal-title" size={18} weight={"bold"}>
          Welcome to &nbsp;
          <Text b size={18}>
            {/* {checked} */}
            TradeAi1
          </Text>
          <div align="center" mx="2px">
            <Image src="../images/logo.svg" height={"60px"} />
          </div>
        </Text>
      </Modal.Header>

      <Modal.Body>
        <label>
          <Text
            color="#2C2C2C"
            size={"$md"}
            css={{ pl: "$4", fontFamily: "$sans" }}
          >
            {" "}
            Email
          </Text>
        </label>
        <Input
          className="border-radius-8"
          bordered
          borderWeight="light"
          fullWidth
          size="lg"
          placeholder="Email"
          // value={loginForm.email}
          {...(isHideValue && { value: loginForm.email })}
          name="email"
          contentLeft={<img src="../images/email.png" width={20} />}
          onChange={handleInputChange}
        />
        <label>
          {" "}
          <Text
            color="#2C2C2C"
            size={"$md"}
            css={{ pl: "$4", fontFamily: "$sans" }}
          >
            {" "}
            Password
          </Text>
        </label>
        <Input.Password
          className="border-radius-8"
          bordered
          borderWeight="light"
          fullWidth
          size="lg"
          placeholder="Password"
          // value={loginForm.password}
          {...(isHideValue && { value: loginForm.password })}
          name="password"
          contentLeft={<img src="../images/password.png" width={20} />}
          onChange={handleInputChange}
        />
        <label>
          {" "}
          <Text
            className="flex-row align-center"
            size={"$md"}
            css={{ pl: "$0", fontFamily: "$sans" }}
          >
            <Checkbox
              className="custom-checkbox"
              css={{ marginRight: "$3" }}
              isSelected={rememberMe}
              onChange={(e) => setRememberMe((prev) => !prev)}
            />
            Remember Me
          </Text>
        </label>

        <Row justify="space-between">
          {show && (
            <ResendEmail
              open={modaltoggle}
              setOpen={setModalToggle}
              payload={payload}
            />
          )}

          <Text size={14}>
            <ResetPassword toggle={toggle} setToggle={setToggle} />
          </Text>
        </Row>

        {errorMsg ? <Text color="error">{errorMsg}</Text> : ""}
      </Modal.Body>
      <Modal.Footer>
        <Button
          auto
          flat
          onPress={submit}
          onKeyPress={(event) => handleKeyPress(event)}
          type="submit"
          className="primary-button border-radius-8"
          css={{ mb: "$6", mr: "$9" }}
        >
          {loader ? <Loading type="spinner" size="md" /> : "Login"}
        </Button>
      </Modal.Footer>
    </>
  );
}
