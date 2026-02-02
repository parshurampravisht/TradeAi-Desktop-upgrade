import { Card, Text, Spacer, Col, Row } from "@nextui-org/react";
import { useGlobalContext } from "../../../context/GlobalContext";
import { useEffect } from "react";

export default function SymbolIndicator() {
  const {
    niftyPrevClosePrice,
    bankNiftyPrevClosePrice,
    sensexPrevClosePrice,
    crudeOilPrevClosePrice,
    goldPrevClosePrice,
    silverPrevClosePrice,
    shares,
    exchangeLiveDataHandler,
  } = useGlobalContext();

  const symbolConfig = {
    NIFTY: { previousClosePrice: niftyPrevClosePrice },
    BANKNIFTY: { previousClosePrice: bankNiftyPrevClosePrice },
    SENSEX: { previousClosePrice: sensexPrevClosePrice },
    CRUDEOIL: { previousClosePrice: crudeOilPrevClosePrice },
    GOLD: { previousClosePrice: goldPrevClosePrice },
    SILVER: { previousClosePrice: silverPrevClosePrice },
  };

  // const exchangeLiveDataHandler = () => {
  //   if (!exchangeDetails.length) return;

  //   const handleMessage = (msg) => {
  //     if (msg.type == "connectionConfirmation") {
  //       setIsIndexesSubscribed(true);
  //     }
  //   };

  //   if (currentSocketBroker === "MOSWAL") {
  //     liveDataProcess.on("message", handleMessage);
  //   } else if (
  //     currentSocketBroker === "IIFL" ||
  //     currentSocketBroker === "SMC"
  //   ) {
  //     liveDataProcessIIFLSMC.on("message", handleMessage);
  //   }
  // };

  const Symbol = ({ symbolName, percentageChange, ltp, sign, unitChange }) => {
    return (
      <Card
        className="border-radius-8 cursor-pointer"
        variant="bordered"
        css={{
          $$cardColor: "$colors$white",
          width:
            ["GOLD", "SILVER"].includes(symbolName) || isNaN(percentageChange)
              ? "8rem"
              : "100%",
          // width: "",
          borderColor: "transparent",
          "@media (max-width: 1098px)": {
            // width: symbolName?.length >= 8 ? "7rem" : "6rem",
            width: "100%",
          },
        }}
      >
        <Row
          // css={{ p: "$5" }}
          style={{ padding: "4px 8px" }}
          className="flex-row align-center justify-between column-gap-4"
        >
          <Col>
            <Row className="flex-row align-center justify-start">
              <Text
                h6
                css={{
                  marginBottom: "0px",
                  lineHeight: "$xs",
                  fontWeight: 700,
                  // width: "70px",
                  marginRight: "0px",
                  fontSize: "11px",
                  color: "#838383",
                  letterSpacing: "0.2px",
                  "@media (max-width: 1098px)": {
                    fontSize: "9px",
                  },
                }}
              >
                {symbolName}
              </Text>
              <Card
                css={{
                  backgroundColor: "transparent",
                  p: "$2",
                  width: "1.5rem",
                  boxShadow: "none",
                }}
              >
                <img
                  src={
                    sign === "-"
                      ? `./images/red_exchange.svg`
                      : `./images/green_exchange.svg`
                  }
                  alt={sign === "-" ? `red_exchanage` : `green_exchange`}
                  width={12}
                />
              </Card>
            </Row>
            <Col css={{ mt: "0", minWidth: "4vw" }}>
              <Text
                css={{
                  fontStyle: "Poppins",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: "#2C2C2C",
                  letterSpacing: "0.2px",
                  "@media (max-width: 1098px)": {
                    fontSize: "9px",
                  },
                }}
              >
                {ltp}
              </Text>
            </Col>
          </Col>

          <Col>
            <Row justify="flex-end">
              <Text
                color={sign === "-" ? "#F30E5E" : "#1FA459"}
                css={{
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "0.2px",
                  "@media (max-width: 1098px)": {
                    fontSize: "9px",
                  },
                }}
              >
                {["GOLD", "SILVER"].includes(symbolName)
                  ? "-"
                  : sign === "-" || isNaN(unitChange)
                    ? ""
                    : "+"}
                {["GOLD", "SILVER"].includes(symbolName) ? "-" : unitChange}
              </Text>
            </Row>
            <Row justify="flex-end">
              <Text
                color={sign === "-" ? "#F30E5E" : "#1FA459"}
                css={{
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "0.2px",
                  "@media (max-width: 1098px)": {
                    fontSize: "9px",
                  },
                }}
              >
                {["GOLD", "SILVER"].includes(symbolName)
                  ? "-"
                  : sign === "-" || isNaN(percentageChange)
                    ? ""
                    : "+"}
                {`${["GOLD", "SILVER"].includes(symbolName)
                  ? "-"
                  : isNaN(percentageChange)
                    ? "--"
                    : `${percentageChange}%`
                  }`}
              </Text>
            </Row>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <>
      <Row css={{ minWidth: "89px" }}>
        {shares &&
          // <Symbol
          //   symbolName="NIFTY"
          //   ltp={shares["NIFTY"]["Price"].toFixed(2)}
          //   sign={
          //     shares["NIFTY"]["Price"] - niftyPrevClosePrice > 0 ? "+" : "-"
          //   }

          //   percentageChange={
          //     shares["NIFTY"]["Price"] == 0
          //       ? 0
          //       : (
          //           ((shares["NIFTY"]["Price"] - niftyPrevClosePrice) /
          //             shares["NIFTY"]["Price"]) *
          //           100
          //         ).toFixed(2)
          //   } //dev
          //   unitChange={(shares["NIFTY"]["Price"] == 0
          //     ? 0
          //     : shares["NIFTY"]["Price"] - niftyPrevClosePrice
          //   ).toFixed(2)} //de
          // />
          Object.keys(symbolConfig).map((symbolName) => {
            let { previousClosePrice } = symbolConfig[symbolName];
            let price = parseFloat(shares?.[symbolName]?.Price) || 0;

            // if (subscribe_exchange.includes(symbolName)) {
            //   previousClosePrice = +shares?.[symbolName]?.Average || 0;
            //   price = +shares?.[symbolName]?.LTP || 0;
            // }

            const ltp = price.toFixed(2);
            const sign = price - previousClosePrice > 0 ? "+" : "-";

            const percentageChange =
              price == 0 || previousClosePrice === 0 || !previousClosePrice
                ? "--"
                : (((price - previousClosePrice) / price) * 100)?.toFixed(2);

            const unitChange =
              price == 0 || previousClosePrice === 0 || !previousClosePrice
                ? "--"
                : (price - previousClosePrice)?.toFixed(2);

            return (
              <Col css={{ m: "$3" }} onClick={() => exchangeLiveDataHandler()}>
                <Symbol
                  symbolName={symbolName}
                  ltp={ltp}
                  sign={sign}
                  unitChange={unitChange}
                  percentageChange={percentageChange}
                />
              </Col>
            );
          })}
      </Row>
    </>
  );
}
