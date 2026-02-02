import React, { useMemo, useState } from "react";
import {
  Card,
  Row,
  Text,
  Spacer,
  Navbar,
  Dropdown,
  Button,
  Image,
  Tooltip,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import UploadExcelSheetModal from "../trade-excel/UploadExcelSheetModal";
// import EquityIcon from "../../public/images/equity.svg";
// import FOIcon from "../../public/images/f&o.svg";
// import TradeExcelIcon from "../../public/images/excel.svg";
// import BasketIcon from "../../public/images/basket.svg";
import { RiFileExcel2Line } from "react-icons/ri";
import { TbChartLine } from "react-icons/tb";
import { BsBasket } from "react-icons/bs";
import { IoCashOutline } from "react-icons/io5";
import { useGlobalContext } from "../../context/GlobalContext";

function TopRightNavigationButton() {
  const router = useRouter()
  // const { isUploadTradeExcel, setIsUploadTradeExcel } = useGlobalContext()

  const currentRoute = router.pathname;

  const activeTab = useMemo(() => {
    switch (currentRoute) {
      case "/cash&equity":
        return "/cash&equity";
      case "/options":
        return "/options";
      case "/trade-excel":
        return "/trade-excel";
      case "/basket":
        return "/basket";
    }
  }, [currentRoute]);

  const handleFOBasket = () => {
    router.push("/FOBasket");
  };

  const handleRouterBasket = (e) => {
    e.preventDefault();
    router.push("/basket");
  };

  return (
    <>
      {/* <UploadExcelSheetModal
        setToggle={setIsUploadTradeExcel}
        toggle={isUploadTradeExcel}
      /> */}
      <Navbar.Content variant={"highlight-solid"} activeColor="success">
        <Row
          css={{ p: "$2", overflow: "hidden" }}
          justify="center"
          align="center"
          className="flex-row column-gap-10"
        >
          <Tooltip content={'Equity'} placement="bottom" className="flex-row align-center justify-center">
            <button
              className={`nav-button flex-row align-center justify-center border-radius-8 ${activeTab === "/cash&equity" ? 'active-sub-primary-tab' : 'primary-outline-button'} cursor-pointer font-weight-500`}
              onClick={() => {
                router.push("/cash&equity");
              }}
            >

              <IoCashOutline
                className="svg-wrapper"
              />
              {/* <EquityIcon className="svg-wrapper" style={{ width: 30, height: 30 }} /> */}
              <span className="tab-label-text">
                Equity
              </span>
            </button>
          </Tooltip>

          <Tooltip content={'F&O'} placement="bottom" className="flex-row align-center justify-center">
            <button
              className={`nav-button flex-row align-center justify-center border-radius-8 ${activeTab === "/options" ? 'active-sub-primary-tab' : 'primary-outline-button'} cursor-pointer font-weight-500`}
              onClick={() => {
                router.push("/options");
              }}
            >
              <TbChartLine className="svg-wrapper" />
              {/* <FOIcon className="svg-wrapper" style={{ fill: "#3c57a2", width: 30, height: 30 }} /> */}
              <span className="tab-label-text">
                F&O
              </span>
            </button>
          </Tooltip>
          <Tooltip content={'Trade Excel'} placement="bottom" className="flex-row align-center justify-center">
            <button
              className={`nav-button flex-row align-center justify-center border-radius-8 ${activeTab === "/trade-excel" ? 'active-sub-primary-tab' : 'primary-outline-button'} cursor-pointer font-weight-500`}
              onClick={() => {
                // setIsUploadTradeExcel(true);
                router.push("/trade-excel");
              }}
            >
              {/* <TradeExcelIcon className="svg-wrapper" style={{ width: 30, height: 30 }} /> */}
              <RiFileExcel2Line className="" style={{ width: "25px", height: "25px" }} />
              <span className="tab-label-text">
                Trade Excel
              </span>
            </button>
          </Tooltip>
          <Dropdown className="flex-row align-center">
            <Tooltip content={'Basket'} placement="bottom">
              <Dropdown.Button
                style={{ zIndex: 99 }}
                auto
                flat
                className={`nav-button flex-row align-center border-radius-8 ${activeTab === "/basket" ? 'active-sub-primary-tab' : 'primary-outline-button'}`}
              >
                <Text
                  style={{
                    color: "inherit",
                  }}
                  className="flex-row align-center column-gap-10 cursor-pointer font-weight-500 basket-dropdown-btton"
                >
                  <BsBasket
                    className={`basket-icon`}
                    style={{
                      width: "25px",
                      height: "25px"
                    }}
                  />
                  <span className="tab-label-text">
                    Basket
                  </span>
                </Text>
              </Dropdown.Button>
            </Tooltip>
            <Dropdown.Menu
              style={{ minWidth: "13rem !important" }}
              css={{ minWidth: "13px !important" }}
            >
              <Dropdown.Item>
                <span
                  onClick={() => {
                    handleFOBasket();
                  }}
                >
                  F&O Basket
                </span>
              </Dropdown.Item>
              <Dropdown.Item>
                <span onClick={handleRouterBasket}>Equity Basket</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Row>
      </Navbar.Content >
    </>
  );
}

export default TopRightNavigationButton;
