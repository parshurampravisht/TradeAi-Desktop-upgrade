import {
  Button,
  Card,
  Col,
  Divider,
  Text,
  Dropdown,
  Grid,
  Input,
  Row,
  Spacer,
  Navbar,
} from "@nextui-org/react";
import { useMemo, useState } from "react";
import OrderInputGroups from "./OrderInputGroups";
import CashEquityGroups from "./CashEquityGroups";
import { useGlobalContext } from "../../../../../context/GlobalContext";
import Multiselect from "multiselect-react-dropdown";

function GroupOrder({
  apiBody,
  clients,
  groupInputList,
  setGroupInputList,
  buySell,
  checkValid,
  cashEquity = false,
  setCheckValid,
  groupData,
  setGroupData,
  groupListData,
  selectedStockLiveData
}) {
  const {
    singleLtp,
    group_Clients,
    selectedGroup,
    setSelectedGroup,
    selectedValueGroup,
    addClients,

    switch_GpCl,
    setswitch_GpCl,
    qty,
    setQty,
    equityQty,
    setEquityQty,
  } = useGlobalContext();
  const colorGrid = buySell ? "#E9FFDB" : "#FDEEEF";

  const subSectionHeight = singleLtp
    ? "calc(100vh - 240px)"
    : "calc(100vh - 160px)";
  return (
    <>
      <Grid>
        <Card
          variant="bordered"
          css={{
            width: "59vw",
            height: subSectionHeight,
            background: "#F7F7F7",
            borderColor: "transparent",
          }}
        >
          {/* inside card header, multiselect doesnot show all data */}
          <Card.Header>
            <Row>
              <Navbar.Content
                // hideIn="xs"
                variant={"highlight"}
              >
                <Row
                  justify="center"
                  align="center"
                  css={{ p: "$3" }}
                // className="btclient"
                >
                  <Navbar.Link
                    className={`${switch_GpCl == "client" ? `primary-button` : ``
                      } border-radius-8`}
                    isActive={switch_GpCl == "client"}
                    onPress={() => setswitch_GpCl("client")}
                  >
                    <Text
                      h2
                      // color="#2C2C2C"
                      css={{ mt: "$11", fontFamily: "$sans" }}
                      size={"$lg"}
                    >
                      Clients
                    </Text>
                  </Navbar.Link>
                  <Navbar.Link
                    className={`${switch_GpCl == "group" ? `primary-button` : ``
                      } border-radius-8`}
                    isActive={switch_GpCl == "group"}
                    onPress={() => setswitch_GpCl("group")}
                  >
                    <Text
                      h2
                      // color="#2C2C2C"
                      css={{ mt: "$11", fontFamily: "$sans" }}
                      size={"$lg"}
                    >
                      Groups
                    </Text>
                  </Navbar.Link>
                </Row>
              </Navbar.Content>
            </Row>
          </Card.Header>
          <Row
            className="flex-row align-end"
            justify="space-around"
            css={{ pl: "$10" }}
          >
            <Col>
              {/* <Dropdown>
                <Dropdown.Button flat css={{ pl: "$17", pr: "$17" }}>
                  {selectedValueGroup}
                </Dropdown.Button>
                <Dropdown.Menu
                  aria-label="Single selection actions"
                  color="secondary"
                  disallowEmptySelection
                  disabledKeys={["empty"]}
                  selectionMode="single"
                  selectedKeys={selectedGroup}
                  onSelectionChange={(group) => setSelectedGroup(group)}
                >
                  {group_Clients ? (
                    Object.keys(group_Clients).map((item, index) => (
                      <Dropdown.Item key={item}>{item}</Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item key="empty">empty</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown> */}
              <div className="groupDropDown">
                <Multiselect
                  isObject={false}
                  onKeyPressFn={function noRefCheck() { }}
                  // onRemove={function noRefCheck() {}}
                  onRemove={(item) => {
                    setSelectedGroup([...item]);
                  }}
                  onSearch={function noRefCheck() { }}
                  selectedValues={selectedGroup}
                  singleSelect={true}
                  onSelect={(item) => {
                    //item contains all the selected values till now
                    apiBody.current = {
                      ...apiBody.current,
                      ...{ clients: item },
                    };
                    setSelectedGroup(item);
                  }}
                  //replace this with list of available symbols api
                  options={Object?.keys(group_Clients)}
                  placeholder="Select Group"
                ></Multiselect>
              </div>
            </Col>

            <Row className="flex-row align-end">
              <Col>
                <Input
                  label={
                    !cashEquity ? "Total Quantity" : "% of Cash + Invested Amt"
                  }
                  type="number"
                  onChange={(event) => {
                    //naming the new watchlist
                    apiBody.current = {
                      ...apiBody.current,
                      qty: Number(event.target.value),
                    };
                    setQty(apiBody.current.qty);
                  }}
                />
                {/* <Input
                  placeholder={
                    !cashEquity ? "Total Quantity" : "% of Portfolio"
                  }
                  onChange={(event) => {
                    //naming the new watchlist
                    apiBody.current = {
                      ...apiBody.current,
                      qty: Number(event.target.value),
                    };
                    setQty(apiBody.current.qty);
                  }}
                /> */}
              </Col>

              <Button
                style={{ marginLeft: "12px" }}
                className={`${qty <= 0 || !selectedGroup.length || (cashEquity && !selectedStockLiveData?.LTP)
                  ? `disable-button`
                  : `primary-button`
                  } border-radius`}
                auto
                // color="primary"
                disabled={qty <= 0 || !selectedGroup.length || (cashEquity && !selectedStockLiveData?.LTP)}
                onPress={() => {
                  if (cashEquity) {
                    groupListData();
                  }
                  addClients();
                  setCheckValid(!checkValid);
                }}
              >
                Add
              </Button>
            </Row>
            <Row className="flex-row column-gap-5 justify-center align-end">
              <Col style={{ width: "110px" }}>
                {/* <Input
                  type="number"
                  placeholder={"Total Quantity"}
                  onChange={(event) => {
                    setEquityQty(event.target.value);
                  }}
                /> */}
                <Input
                  label="Total Quantity"
                  type="number"
                  onChange={(event) => {
                    setEquityQty(event.target.value);
                  }}
                />
              </Col>

              <Button
                style={{ marginLeft: "12px" }}
                className={`${equityQty > 0 && groupData?.length && (cashEquity && selectedStockLiveData?.LTP)
                  ? `primary-button`
                  : `disable-button`
                  } border-radius`}
                auto
                // color="primary"
                disabled={!(equityQty > 0) || !groupData?.length || (cashEquity && !selectedStockLiveData?.LTP)}
                onPress={() => {
                  if (equityQty > 0 && groupData?.length) {
                    setGroupData((prev) =>
                      prev.map((item) => ({
                        ...item,
                        shares_qty_with_invested:
                          item.shares_qty_with_invested === "NA"
                            ? "NA"
                            : +equityQty,
                      }))
                    );
                  }
                }}
              >
                Add
              </Button>
            </Row>
          </Row>
          <Spacer x={0.5} />
          <Divider></Divider>
          <Card.Body>
            {!cashEquity ? (
              <OrderInputGroups
                groupInputList={groupInputList}
                setGroupInputList={setGroupInputList}
              />
            ) : (
              <CashEquityGroups
                groupData={groupData}
                setGroupInputList={setGroupInputList}
              />
            )}
          </Card.Body>
        </Card>
      </Grid>
    </>
  );
};

export default GroupOrder;
