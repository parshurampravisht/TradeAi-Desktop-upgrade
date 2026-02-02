import { Collapse, Grid, Text, Row, css, Card, Col } from "@nextui-org/react";

const NormalWatchlist = ({ shares }) => {
  var keys = Object.keys(shares);

  keys = keys.filter(function (symbol) {
    return symbol !== "NIFTYBANK" && symbol !== "NIFTY";
  });

  const Symbol = ({ symbolName, percentageChange, ltp, sign, unitChange }) => {
    return (
      <Row>
        <Col css={{ p: "$0", m: "$0" }} justify="flex-start">
          <Row justify="flex-start">
            <Text h5 css={{ lineHeight: "$xs" }}>
              {symbolName}
            </Text>
          </Row>
          <Row justify="flex-start">
            <Text h6 css={{ color: "$accents8" }}>
              ₹ {ltp}
            </Text>
          </Row>
        </Col>

        <Col css={{ pl: "$5" }} justify="flex-end">
          <Row justify="flex-end">
            <Text
              color={sign === "-" ? "$red600" : "$green600"}
              css={{ lineHeight: "$xs" }}
            >
              {sign === "-" ? "" : "+"}
              {percentageChange}%
            </Text>
          </Row>
          <Row justify="flex-end">
            <Text
              color={sign === "-" ? "$red600" : "$green600"}
              css={{ lineHeight: "$xs" }}
            >
              {sign === "-" ? "" : "+"}
              {unitChange}
            </Text>
          </Row>
        </Col>
      </Row>
    );
  };
  return (
    <>
      <Grid css={{ height: "27vw" }}>
        {" "}
        <Row justify="center" align="center">
          <Collapse.Group shadow splitted bordered>
            {keys.map((key, idx) => {
              return (
                <Collapse
                  shadow
                  index="1"
                  showArrow={false}
                  title={
                    <Symbol
                      symbolName={key}
                      ltp={shares[key]["Price"]}
                      //prod
                      // sign={shares[key]["ChangePCT"] > 0 ? "+" : "-"}
                      // percentageChange={shares[key]["ChangePCT"].toFixed(2)}
                      // unitChange={shares[key]["ChangePNT"].toFixed(2)}

                      //dev
                      sign={shares[key]["ChangePCT"] > 0 ? "+" : "-"}
                      percentageChange={shares[key]["ChangePCT"].toFixed(2)}
                      unitChange={shares[key]["ChangePNT"].toFixed(2)}
                    />
                  }
                >
                  <Text h5 color="#889096">
                    Last Trade
                  </Text>
                  <Row justify="space-between">
                    <Col justify="flex-start">
                      <Text h6>LTP:</Text>
                    </Col>
                    <Col justify="flex-end">
                      <Row justify="flex-end">
                        <Text>{shares[key]["Price"]}</Text>
                      </Row>
                    </Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>
                      <Text h6>Volume:</Text>
                    </Col>
                    <Col>
                      <Row justify="flex-end">
                        <Text>{shares[key]["Volume"]}</Text>
                      </Row>
                    </Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>
                      <Text h6>LTQ:</Text>
                    </Col>
                    <Col>
                      <Row justify="flex-end">
                        <Text>{shares[key]["LTQ"]}</Text>
                      </Row>
                    </Col>
                  </Row>
                  {/* <Row justify="space-between">
                    <Col>
                      <Text h6>Upper Circuit:</Text>
                    </Col>
                    <Col>
                      <Text>{shares[key]["Upper_circuit"]}</Text>
                    </Col>
                  </Row>

                  <Row justify="space-between">
                    <Col>
                      <Text>Lower Circuit:</Text>
                    </Col>
                    <Col>
                      <Text>{shares[key]["Lower_circuit"]}</Text>
                    </Col>
                  </Row> */}

                  {/* <Text>{shares[key]["Change_PCT"]}</Text>
                  <Text>{shares[key]["Change_PNT"]}</Text> */}
                </Collapse>
              );
            })}
          </Collapse.Group>
        </Row>
      </Grid>
    </>
  );
};

export default NormalWatchlist;
