import { Card, Col, Row, Text, Image, Spacer } from "@nextui-org/react";
const SymbolCard = ({
  symbolName,
  percentageChange,
  ltp,
  sign,
  unitChange,
  buySell,
}) => {
  const Colorgrid = buySell ? "#E9FFDB" : "#FDEEEF";
  return (
    <>
      <Card
        // isHoverable
        variant="bordered"
        css={{
          mt: "$5",
          bgColor: Colorgrid,
          width: "14rem",
          height: "5.4rem",
        }}
      >
        <Row>
          <Col css={{ p: "$6" }}>
            <Row justify="flex-start">
              {symbolName.length >= 9 ? (
                <Text h5 css={{ lineHeight: "$xs", fontWeight: "$bold" }}>
                  {symbolName == "Symbol" ? "-" : symbolName}
                </Text>
              ) : (
                <Text h4 css={{ lineHeight: "$xs", fontWeight: "$bold" }}>
                  {symbolName == "Symbol" ? "-" : symbolName}
                </Text>
              )}
            </Row>
            <Col
              css={{ pt: "$5", minWidth: "5vw" }}
              // justify="center"
            >
              <Text
                css={{
                  color: "$accents8",
                  lineHeight: "$xs",
                  fontSize: "1.4rem",
                  fontStyle: "Poppins",
                  fontWeight: "500",
                }}
              >
                {ltp ? ltp : "-"}
              </Text>
            </Col>
          </Col>

          <Col css={{ pt: "$5", pl: "$3" }}>
            {(() => {
              switch (sign) {
                case "-":
                  return (
                    <Card
                      css={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "$red600",
                        fontSize: "$sm",
                        backgroundColor: "$red200",
                        p: "$2",
                        width: "1.5rem",
                      }}
                    >
                      <img
                        src="./images/Rectangle 1095.svg"
                        width={12}
                        alt=""
                      />
                    </Card>
                  );
                default:
                  return (
                    <Card
                      css={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        fontSize: "$sm",
                        backgroundColor: "$green200",
                        color: "$green600",
                        p: "$2",
                        width: "1.5rem",
                      }}
                    >
                      <img src="./images/Rectangle 1094.svg" width={12} />
                      {/* <IconArrowUp size={13} /> */}
                    </Card>
                  );
              }
            })()}
          </Col>

          <Col justify="center" css={{ pt: "$6", mr: "$13" }}>
            <Row justify="flex-end">
              <Text
                color={sign === "-" ? "$red600" : "$green600"}
                css={{ fontSize: ".9rem" }}
              >
                {sign === "-" ? "" : "+"}
                {unitChange ? unitChange.toFixed(2) : "-"}
              </Text>
            </Row>
            <Spacer y={0.4} />
            <Row justify="flex-end">
              <Spacer x={0.1} />
              <Text
                color={sign === "-" ? "$red600" : "$green600"}
                css={{ fontSize: " .9rem", fontStyle: "Poppins" }}
              >
                {sign === "-" ? "" : "+"}
                {percentageChange ? percentageChange.toFixed(2) + "%" : "-"}
              </Text>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default SymbolCard;
