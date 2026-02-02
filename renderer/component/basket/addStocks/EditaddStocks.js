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
import { useRef, useState, useEffect, useMemo } from "react";
import ClientTable from "./clientsTable";
import { IconPlus } from "@tabler/icons-react";
import PrevBasket from "../prevBasket/prevBasket";
import EditClient from "../addClient/EditClient";
import { getLTPService } from "../../../../services/transactions/transactions.service";
import { useDebounce } from "../../hooks/useDebounce";
import useFetchOptions from "../../hooks/useFetchOption";
import { ExchangeSquareOff2 } from "../../../constant/constant";

export default function EditaddStocks(props) {
  const {
    setSymbolTableWithScripcode,
    symbolTableWithScripcode,
    setSymbolTableWithLTP,
    setSymbolTable,
    selectedSymbols,
    setSelectedSymbols,
    PNLData,
    setFlag,
  } = props;
  const [dataItem, setItem] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [basketName, setBasketName] = useState("");
  const [EditclientValue, setEditclientValue] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const { allSymbols, equityBasketType, setEquityBasketType } =
    useGlobalContext();
  const { finalData } = useFinalData();

  const exchangeType = "C";
  const debouncedSearchTerm = useDebounce(searchValue, 800);
  const { optionData, setOptionData, loading, fetchOptions } =
    useFetchOptions(exchangeType);

  const modifiedOptionData = useMemo(() => {
    return (
      dataItem.length
        ? optionData.filter((item) => !dataItem.includes(item.label))
        : optionData
    ).map((item) => ({
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
  }, [optionData, dataItem]);

  const handleInputChange = (inputValue) => {
    setSearchValue(inputValue);
  };

  useEffect(() => {
    if (debouncedSearchTerm?.trim()) {
      fetchOptions(debouncedSearchTerm);
    } else {
      setOptionData([]);
    }
  }, [debouncedSearchTerm]);

  // const symbolNamesListNSE = useMemo(() => {
  //   return (
  //     (dataItem.length
  //       ? symbolNamesNSE.current.filter(
  //           (item) => !dataItem.includes(item.label)
  //         )
  //       : symbolNamesNSE.current
  //     )
  //       .sort((a, b) => {
  //         const nameA = a.value.toUpperCase();
  //         const nameB = b.value.toUpperCase();
  //         if (nameA < nameB) {
  //           return -1;
  //         }
  //         if (nameA > nameB) {
  //           return 1;
  //         }
  //         // names must be equal
  //         return 0;
  //       })
  //       .map((elem) => elem.label) || []
  //   );
  // }, [symbolNamesNSE.current, dataItem]);

  useEffect(() => {
    const selectedPnlData = PNLData.reduce((acc, current) => {
      const symbolExists = acc.find((order) => order.symbol === current.symbol);
      if (!symbolExists) {
        acc.push(current);
      }
      return acc;
    }, []).map((item) => ({
      Exch: item.exchange,
      Scripcode: item.scrip_code,
      label: item.symbol,
      displayLabel: `${item.symbol} (${
        ExchangeSquareOff2[item.exchange] || item.exchange
      })`,
    }));

    createSymbolTable(selectedPnlData);
    setItem(selectedPnlData);
    setSelectedSymbols(selectedPnlData);

    if (props.basketDetailsRef.current) {
      setBasketName(props.basketDetailsRef.current.name);
    }
  }, [props.PNLData, props.basketDetailsRef]);

  const handleClose = (action) => {
    if (action === "create") {
      props.setCurrentState("addClient");
    }
  };

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

  const createSymbolTable = async (symbols = []) => {
    const data = symbols.map((sym, idx) => {
      return {
        sno: idx,
        orderType: equityBasketType,
        symbol: sym,
        // weightage: props.basketDetailsRef.current["margin"],
        weightage: props?.Weightage?.used_margin,
      };
    });
    props.setSymbolTable(data);
    const symbolData = symbols.map((item) => item.Scripcode);

    const filterData = [...allSymbols.current]?.filter((item) =>
      symbolData.includes(item.Scripcode)
    );

    setSymbolTableWithScripcode(filterData);
    await getLtpDataHandler(filterData);
  };

  const handleEditClick = () => {
    setEditMode(!editMode);
    props.basketDetailsRef.current.name = basketName;
  };

  const handleNameChange = (event) => {
    setBasketName(event.target.value);
  };

  let active = props.symbolTable.length === 0;

  return (
    <Grid.Container gap={0} justify="center">
      {EditclientValue ? (
        <Grid sm={24} md={20} lg={10} className="basket2-wrap">
          <Card
            css={{
              height: "",
              width: "85%",
              margin: "0 auto",
              "@media(min-width:1367px)": {
                width: "100%",
                height: "70vh",
              },
            }}
          >
            <Card.Header
              css={{
                background: "#fff",
                // background: "#E5F2FF",
                height: "",
              }}
            >
              <Row css={{ display: "flex", justifyContent: "space-between" }}>
                <Col
                  css={{ width: "fit-content", ml: "$10" }}
                  className="basket2-img basket-icon-color"
                >
                  <div style={{ display: "flex" }}>
                    <div>
                      <Image
                        src="../../../images/basket-fill-blue.png"
                        width={30}
                      />
                    </div>

                    {/* <div style={{ width: "9rem", marginTop: "5px", marginLeft: "10px " }}>
                      {props?.Weightage?.name}
                    </div> */}
                  </div>
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
                      value={basketName}
                      onChange={handleNameChange}
                    />
                  ) : (
                    <Text h4 className="primary-text-color" css={{ mt: "$0" }}>
                      {basketName}
                    </Text>
                  )}
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              <Row css={{ paddingLeft: "$10", paddingRight: "$10" }}>
                <Col colspan={2} className="order_select_clients2">
                  <Multiselect
                    className="basket2-input"
                    isObject={true}
                    onRemove={(item) => {
                      let newItems = item;
                      setSelectedSymbols([...item]);
                      createSymbolTable(item);
                      setItem(item);
                    }}
                    displayValue={"displayLabel"}
                    onSearch={handleInputChange}
                    // onSearch={function noRefCheck() {}}
                    onSelect={(item) => {
                      setSelectedSymbols([...item]);
                      createSymbolTable(item);
                      setItem(item);
                    }}
                    // selectedValues={symbolTable}
                    selectedValues={dataItem}
                    options={modifiedOptionData}
                    // options={optionData}
                    // options={symbolNamesListNSE}
                    // options={symbolNames.current}
                    placeholder="Search Symbols"
                    loading={loading}
                    emptyRecordMsg={"No options available"}
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
                    props.setCurrentState("list");
                    setEquityBasketType("BUY");
                  }}
                >
                  Cancel
                </Button>
              </Col>

              <Col>
                <Row style={{ marginLeft: "24rem" }}>
                  <Spacer x={0.4} />
                  <Button
                    className={`${
                      active ? `` : `primary-button`
                    } basket2-f-button-blue border-radius-8`}
                    disabled={active}
                    flat
                    auto
                    css={{
                      width: "120px",
                      color: "White",
                      backgroundColor: "$blue700",
                    }}
                    onClick={() => setEditclientValue(false)}
                  >
                    Edit Client
                  </Button>
                </Row>
              </Col>
            </Row>
          </Card.Footer>
        </Grid>
      ) : (
        <EditClient
          basketDetailsRef={props?.basketDetailsRef}
          dataItem={dataItem}
          selectedSymbols={selectedSymbols}
          setSelectedSymbols={setSelectedSymbols}
          setSymbolTable={setSymbolTable}
          PNLData={props?.PNLData}
          symbolTableWithLTP={props.symbolTableWithLTP}
          EditclientValue={setEditclientValue}
          symbolTableWithScripcode={symbolTableWithScripcode}
          Weightage={props?.Weightage}
          setFlag={setFlag}
        />
      )}
    </Grid.Container>
  );
}
