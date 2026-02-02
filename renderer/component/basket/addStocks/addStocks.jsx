import {
  Button,
  Card,
  Col,
  Row,
  Spacer,
  Text,
  Image,
  Grid,
  Input,
} from "@nextui-org/react";
import { IconPencil } from "@tabler/icons-react";
import Multiselect from "multiselect-react-dropdown";
import { useGlobalContext } from "../../../context/GlobalContext";
import { useFinalData } from "../../../context/finalBasketContext";
import { useMemo, useRef } from "react";
import ClientTable from "./clientsTable";
import { IconPlus } from "@tabler/icons-react";
import PrevBasket from "../prevBasket/prevBasket";
import { useState, useEffect } from "react";
import { getLTPService } from "../../../../services/transactions/transactions.service";
import { useDebounce } from "../../hooks/useDebounce";
import useFetchOptions from "../../hooks/useFetchOption";

export default function AddStocks(props) {
  const { setSymbolTableWithScripcode, setSymbolTableWithLTP, rowData } = props;
  const [editMode, setEditMode] = useState(false);
  const [basketName, setBasketName] = useState(
    props.basketDetailsRef.current.name
  );
  const { allSymbols, equityBasketType, setEquityBasketType } =
    useGlobalContext();
  const { finalData } = useFinalData();
  const [searchValue, setSearchValue] = useState("");

  const exchangeType = "C";
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const { optionData, setOptionData, loading, fetchOptions } =
    useFetchOptions(exchangeType);

  const modifiedOptionData = useMemo(() => {
    return optionData.map((item) => ({
      ...item,
      label: item.label,
      displayLabel: `${item.label} (${
        item.Exch === "NSE"
          ? "NSE"
          : item.Exch === "BSE"
          ? "BSE"
          : item.Exch === "MCX"
          ? "MCX"
          : ""
      })`, // Include Exch
    }));
  }, [optionData]);

  const handleInputChange = (inputValue) => {
    setSearchValue(inputValue);
  };

  useEffect(() => {
    if (debouncedSearchTerm?.trim()) {
      fetchOptions(debouncedSearchTerm);
    } else {
      // setOptionData([]);
    }
  }, [debouncedSearchTerm]);

  const getLtpDataHandler = async (symbol_Data) => {
    if (!symbol_Data.length) return;

    try {
      let temp = [];
      for (let i = 0; i < symbol_Data.length; i++) {
        temp.push({
          [symbol_Data[i].Exch === "B" ? "BSE" : "NSE"]:
            symbol_Data[i].Scripcode,
        });
      }
      let ltpResponse = await getLTPService({
        scripcodes: temp,
      });

      if (ltpResponse?.length) {
        const formatLTPData =
          ltpResponse?.map((item, ind) => ({
            ...item,
            label: symbol_Data[ind].label,
          })) || [];

        setSymbolTableWithLTP(formatLTPData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleClose = (action) => {
    if (action === "create") {
      props.setCurrentState("addClient");
    }
  };

  // for symbol table to be modified!!
  const createSymbolTable = async (symbols) => {
    let data = symbols.map((sym, idx) => {
      return {
        sno: idx,
        orderType: equityBasketType,
        symbol: sym.label,
        weightage: props.basketDetailsRef.current["margin"],
      };
    });
    const symbolData = symbols.map((item) => item.Scripcode);
    const filterData = [...allSymbols.current]?.filter((item) =>
      symbolData.includes(item.Scripcode)
    );

    setSymbolTableWithScripcode(filterData);
    props.setSymbolTable((prev) => [...data]);
    await getLtpDataHandler(filterData);
  };
  // props.setBasketData({
  //   basketname: props.basketDetailsRef.current.name,
  //   margin: props.basketDetailsRef.current.value,
  //   symbolTable: props.symbolTable,
  // });
  const handleEditClick = () => {
    setEditMode(!editMode);
    props.basketDetailsRef.current.name = basketName;
  };
  const handleNameChange = (event) => {
    setBasketName(event.target.value);
  };
  let active = props.symbolTable.length === 0 ? true : false;

  return (
    <Grid.Container gap={0} justify="center">
      <Grid sm={24} md={20} lg={10} className="basket2-wrap">
        <Card
          css={{
            height: "",
            width: "85%",
            margin: "0 auto",
            border: "1px solid #E5F2FF",
            "@media(min-width:1367px)": {
              width: "100%",
              height: "70vh",
            },
          }}
        >
          <Card.Header
            css={{
              background: "#fff",
              height: "",
            }}
          >
            <Row css={{ display: "flex", justifyContent: "space-between" }}>
              <Col
                css={{ width: "fit-content", mt: "$5", ml: "$10" }}
                className="basket2-img primary-text-color basket-icon-color"
              >
                <Image src="../../../images/basket-fill-blue.png" width={30} />
              </Col>
              <Spacer y={1} />
              <Col css={{ mt: "$3" }} className="basket2-name">
                {editMode ? (
                  <Input
                    type="text"
                    css={{
                      mt: "$1",
                      width: "100%",
                      maxWidth: "100vw",
                    }}
                    onChange={handleNameChange}
                  />
                ) : (
                  <Text h4 className="primary-text-color" css={{ mt: "$2" }}>
                    {basketName}
                  </Text>
                )}
              </Col>

              {/* <Spacer x={30} /> */}
              <div>
                {/* <Col css={{ mr: "$5",display: 'flex' }}>
                <Button
                  auto
                  flat
                  css={{ background: "transparent", mt: "$2", }}
                  onClick={handleEditClick}
                >
                  {editMode ? (
                    "save"
                  ) : (
                    <IconPencil
                      height={25}
                      width={25}
                      strokeWidth={2}
                      color={"#000000"}
                    />
                  )}
                </Button>
                <Button
                  auto
                  flat
                  css={{ background: "transparent", mt: "$2" }}
                  onClick={handleEditClick}
                >
                  {editMode ? (
                    "save"
                  ) : (
                    <IconPencil
                      height={25}
                      width={25}
                      strokeWidth={2}
                      color={"#000000"}
                    />
                  )}
                </Button>
              </Col> */}
              </div>

              <Col css={{ ml: "$10", display: "none" }}>
                <Button
                  auto
                  flat
                  css={{ background: "transparent", mt: "$5" }}
                  onClick={handleEditClick}
                >
                  {editMode ? (
                    "save"
                  ) : (
                    <IconPencil
                      height={25}
                      width={25}
                      strokeWidth={2}
                      color={"#0072f5"}
                    />
                  )}
                </Button>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body>
            <Row css={{ paddingLeft: "$10", paddingRight: "$10" }}>
              <Col colspan={2} className="order_select_clients2">
                <Multiselect
                  className="basket2-input"
                  isObject={true}
                  onKeyPressFn={function noRefCheck() {}}
                  onRemove={(item) => {
                    //item contains all the selected values till now
                    let newItems = item;
                    props.setSelectedSymbols([...item]);
                    createSymbolTable(item);
                  }}
                  onSearch={handleInputChange}
                  onSelect={(item) => {
                    //item contains all the selected values till now
                    let newItems = item;
                    props.setSelectedSymbols([...item]);
                    createSymbolTable(item);
                  }}
                  //replace this with list of available symbols api

                  options={modifiedOptionData}
                  // options={symbolNamesListNSE}
                  // options={symbolNames.current}
                  loading={loading}
                  emptyRecordMsg={"No options available"}
                  selectedValues={props.selectedSymbols}
                  placeholder="Search Symbols"
                  displayValue="displayLabel"
                  selectedValueDecorator={(selected, _options) => {
                    return _options?.displayLabel;
                  }}
                ></Multiselect>
                <Spacer x={1} />
              </Col>
            </Row>

            <Row css={{ paddingLeft: "$10", paddingRight: "$10" }}>
              <ClientTable
                selectedSymbols={props.selectedSymbols}
                basketDetailsRef={props.basketDetailsRef}
                symbolTable={props.symbolTable}
              />
            </Row>
            <Spacer y={2} />
          </Card.Body>
        </Card>

        <Card.Footer
          className="basket2-f-button"
          css={{
            width: "85%",
            "@media(min-width:1920px)": {
              width: "100%",
            },
          }}
        >
          <Row>
            <Col>
              <Button
                className="secondary-button border-radius-8"
                flat
                auto
                bordered
                css={{ width: "120px" }}
                onClick={() => {
                  props.setCurrentState(rowData.length ? "list" : "empty");
                  // props.setSymbolTable([]); //setting the symbol table to be empty while closing
                  props.setFlag(!props.basketflag);
                  setEquityBasketType("BUY");
                }}
              >
                Cancel
              </Button>
            </Col>

            <Col>
              <Row justify="right">
                {/* <Button
                    flat
                    auto
                    bordered
                    css={{ width: "120px", borderColor: "$gray500" }}
                  >
                    Save
                  </Button> */}
                <Spacer x={0.4} />
                <Button
                  className={`${
                    active ? `` : `primary-button`
                  } border-radius-8`}
                  // className="basket2-f-button-blue"
                  disabled={active}
                  flat
                  auto
                  css={{
                    width: "120px",
                  }}
                  onClick={() => handleClose("create")}
                >
                  Add Client
                </Button>
              </Row>
            </Col>
          </Row>
        </Card.Footer>
      </Grid>
    </Grid.Container>
  );
}
