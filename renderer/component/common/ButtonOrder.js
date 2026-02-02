import React from "react";
const ButtonOrder = () => {
  <div>
    <>
      <Row justify="center" align="center">
        <Navbar.Content
          variant={"highlight-solid"}
          activeColor={buySell ? "success" : "error"}
        >
          <Card>
            <Card.Body css={{ p: "$3" }}>
              <Row justify="center" align="center">
                <Navbar.Link
                  isActive={buySell}
                  css={{
                    minWidth: "60px",
                    justifyContent: "center",
                    color: "$success",
                  }}
                  onClick={() => {
                    setBuySell(true);
                    apiBody.current = { ...apiBody.current, BuySell: "B" };
                    setPlaceOrderVisible(true);
                    router.push("/cash&equity");
                  }}
                >
                  <Text
                    h4
                    color="#2C2C2C"
                    size={"$lg"}
                    css={{ pl: "$5", fontFamily: "$sans", mt: "$10" }}
                  >
                    {" "}
                    Equity
                  </Text>
                </Navbar.Link>
                <Navbar.Link
                  isActive={!buySell}
                  css={{
                    minWidth: "60px",
                    justifyContent: "center",
                    color: "$error",
                  }}
                  onClick={() => {
                    setBuySell(false);
                    // apiBody.current = {
                    //   ...apiBody.current,
                    //   BuySell: "S",
                    // };
                    router.push("/options");
                    setPlaceOrderVisible(true);
                  }}
                >
                  <Text
                    h4
                    color="#2C2C2C"
                    size={"$lg"}
                    css={{ pl: "$5", fontFamily: "$sans", mt: "$10" }}
                  >
                    {" "}
                    F&O
                  </Text>
                </Navbar.Link>
                <Spacer x={0.2} />
                <Dropdown>
                  <Dropdown.Button
                    auto
                    flat
                    css={{ background: "transparent" }}
                  >
                    <Text
                      color="#2C2C2C"
                      size={"$lg"}
                      css={{
                        mt: "$3",
                        fontFamily: "$sans",
                        color: "$blue600",
                      }}
                    >
                      {" "}
                      Basket
                    </Text>
                  </Dropdown.Button>
                  <Dropdown.Menu
                    style={{ minWidth: "13rem !important" }}
                    css={{ minWidth: "13px !important" }}
                  >
                    <Dropdown.Item>
                      <span onClick={handleFOBasket}>F&O Basket</span>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <span onClick={handleRouterBasket}>Equity Basket</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>
            </Card.Body>
          </Card>
        </Navbar.Content>
      </Row>
    </>
  </div>;
};
export default ButtonOrder;
