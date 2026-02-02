import { Card, Navbar, Row, Spacer, Text } from "@nextui-org/react";
import { useState } from "react";
import CmdCli from "./cmdCli";
import InputParam from "./inputParameter";
import TradeView from "./tradeView";

const MainView = ({
  showtable,
  setshowtable,
  tableColumns,
  filteredbody,
  setFilteredbody,
  cloneFilteredbody,
  setCloneFilteredbody,
  isDataLoading,
}) => {
  const [showView, setShowView] = useState("tradeView");

  const showViewComponent = (showView) => {
    switch (showView) {
      //   case "tradeview":
      //     return (
      //       <TradeView
      //         showtable={showtable}
      //         setshowtable={setshowtable}
      //         tableColumns={tableColumns}
      //         filteredbody={filteredbody}
      //       ></TradeView>
      //     );

      case "terminal":
        return <CmdCli></CmdCli>;

      case "inputParam":
        return <InputParam></InputParam>;
      default:
        return (
          <TradeView
            showtable={showtable}
            setshowtable={setshowtable}
            tableColumns={tableColumns}
            filteredbody={filteredbody}
            setFilteredbody={setFilteredbody}
            cloneFilteredbody={cloneFilteredbody}
            setCloneFilteredbody={setCloneFilteredbody}
            isDataLoading={isDataLoading}
          ></TradeView>
        );
    }
  };
  return (
    <>
      <Row css={{ width: "100%" }} justify="flex-start">
        {/* <Navbar.Content
          // hideIn="xs"
          variant={"highlight-solid"}
        >
          <Card
            css={{
              minWidth: "200px",
              maxWidth: "600px",
            }}
            // previously 700
          >
            <Card.Body css={{ p: "$3" }}>
              <Row justify="flex-start" align="center">
                <Navbar.Link
                  isActive={showView === "tradeView"}
                  onPress={() => setShowView("tradeView")}
                >
                  TradeView
                </Navbar.Link>
                <Navbar.Link
                  isActive={showView === "terminal"}
                  onPress={() => setShowView("terminal")}
                >
                  Terminal
                </Navbar.Link>
                <Navbar.Link
                  isActive={showView === "inputParam"}
                  onPress={() => setShowView("inputParam")}
                >
                  InputParam
                </Navbar.Link>
              </Row>
            </Card.Body>
          </Card>
        </Navbar.Content> */}
      </Row>
      {/* <Spacer y={0.4}></Spacer> */}
      {showViewComponent(showView)}
    </>
  );
};

export default MainView;
