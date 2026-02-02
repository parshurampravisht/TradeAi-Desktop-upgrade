import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomMultiValue } from "../order/orderComponents/helpers/customOptionReactSelect";
import { Button, Input, Modal, Row, Text, Loading } from "@nextui-org/react";
import { useGlobalContext } from "../../../../context/GlobalContext";
import { useState, useEffect } from "react";
import useFetchOptions from "../../../hooks/useFetchOption";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  ExchangeShortName,
  ExchangeFullName,
  fullExchangeType,
} from "../../../../constant/constant";
import {
  addWatchlistDetails,
  createWatchlist,
} from "../../../../../services/transactions/transactions.service";
import CustomSelect from "../../../../layout/customSelect";

const customStyles = {
  menu: (base) => ({
    ...base,
    zIndex: 9999, // For extra safety
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "250px",
    overflowY: "auto",
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999, // Ensure it's rendered on top of the modal
  }),
  option: (provided) => ({
    ...provided,
  }),
};

const AddUpdateWatchlist = ({ visible, setVisible, createUpdate }) => {
  const {
    loginData,
    watchlistMasterData,
    setWatchlistMasterData,
    selectedCurrentWatchlist,
    setSelectedCurrentWatchlist,
    selectedWatchlistSymbolData,
    setSelectedWatchlistSymbolData,
    getSymbolLtpHandler,
    registerSymbolForLiveData,
  } = useGlobalContext();

  const [searchValue, setSearchValue] = useState("");

  const exchangeType = "";
  const debouncedSearchTerm = useDebounce(searchValue, 800);
  const { optionData, setOptionData, loading, fetchOptions } =
    useFetchOptions(exchangeType);

  const [optDropdown, setOptDropdown] = useState([
    { label: "Select Symbol", value: "Select Symbol" },
  ]);
  const [watchlistCreds, setWatchlistCreds] = useState({
    watchlistName: "",
    watchlistSymbols: [],
  }); //contains a single watchlist name
  const [isSubmitDisabled, SetIsSubmitDisabled] = useState({
    watchlistName: true,
    symbolSelectedList: true,
  });
  const [loader, setLoader] = useState(false);
  const [isMount, setIsMount] = useState(false);

  useEffect(() => {
    SetIsSubmitDisabled((prev) => ({
      ...prev,
      watchlistName:
        createUpdate !== "create"
          ? false
          : watchlistCreds.watchlistName.trim()
            ? false
            : true,
      symbolSelectedList: watchlistCreds.watchlistSymbols?.length
        ? false
        : true,
    }));
  }, [watchlistCreds, createUpdate]);

  const closeHandler = () => {
    setVisible(false);
    setWatchlistCreds({
      watchlistName: "",
      watchlistSymbols: [],
    });
  };

  const createUpdateWatchlist = async () => {
    //adding newly created watchlist name
    //to get unique symbols

    if (!loginData.hasOwnProperty("user_id")) {
      toast.warn(`Please Login again`);
      return;
    }
    setLoader(true);

    const payload = {
      userId: loginData.user_id,
      watchlistName: watchlistCreds.watchlistName,
      isSelected: false,
    };

    try {
      let res = null;
      if (createUpdate == "create") {

        const watchlistExists = watchlistMasterData
          .map((item) => item.watchlistName.toLowerCase())
          .includes(watchlistCreds.watchlistName.toLowerCase());

        if (watchlistExists) {
          setVisible(false);
          setLoader(false);
          return toast.error(`Watchlist name already exists`);
        }
        res = (await createWatchlist(payload)) || null;
      }

      if (res) {
        let responseWatchlistDetails = [];
        setSelectedCurrentWatchlist(res);

        setWatchlistMasterData((prev) => [...prev, res]);
        for (let item of watchlistCreds.watchlistSymbols) {
          const watchlistDetails = {
            userId: loginData.user_id,
            watchlistId: res.watchlistId,
            symbolName: item.symbolName,
            symbolValue: item.value,
            exchange: item.Exch,
            exchangeType: item.ExchType,
            scripCode: item.Scripcode,
            lotSize: item.LotSize,
          };
          try {
            const resDetails = await addWatchlistDetails(watchlistDetails);
            responseWatchlistDetails.push(resDetails);
          } catch (error) {
            console.log("details error", error);
          }
        }
        const watchlistSymbolLtpData = await getSymbolLtpHandler(
          responseWatchlistDetails
        );
        setSelectedWatchlistSymbolData(watchlistSymbolLtpData || []);

        toast.success(`${watchlistCreds.watchlistName} Watchlist Created`);
      }

      if (createUpdate == "update") {
        let updateSymbolsDetails = [];
        let duplicateSymbols = [];
        for (let item of watchlistCreds.watchlistSymbols) {
          const watchlistDetails = {
            userId: loginData.user_id,
            watchlistId: selectedCurrentWatchlist.watchlistId,
            symbolName: item.symbolName,
            symbolValue: item.value,
            exchange: item.Exch,
            exchangeType: item.ExchType,
            scripCode: item.Scripcode,
            lotSize: item.LotSize,
          };
          const isExistsStocks = selectedWatchlistSymbolData.some(
            (elem) => elem["symbolName"] === item.symbolName
          );
          if (isExistsStocks) {
            duplicateSymbols.push(item.symbolName);
            continue;
          }
          try {
            const resDetails = await addWatchlistDetails(watchlistDetails);
            updateSymbolsDetails.push(resDetails);
          } catch (error) {
            console.log("details error", error);
          }
        }

        if (duplicateSymbols.length > 0) {
          setVisible(false);
          setLoader(false);
          toast.warn(
            `${duplicateSymbols.join(", ")} symbol${duplicateSymbols.length > 1 ? "s" : ""
            } already exist in Watchlist`
          );
        }

        if (updateSymbolsDetails.length) {
          const watchlistSymbolLtpData = await getSymbolLtpHandler(
            updateSymbolsDetails
          );

          const registerPayload = updateSymbolsDetails.map((item) => ({
            value: item.symbolName,
            Scripcode: +item.scripCode,
            Exch: ExchangeFullName[item.exchange],
            ExchType: fullExchangeType[item.exchangeType] || item.exchangeType,
          }));

          await registerSymbolForLiveData("register", registerPayload, true);
          setSelectedWatchlistSymbolData((prev) => [
            ...prev,
            ...watchlistSymbolLtpData,
          ]);
          toast.success(
            `Watchlist Symbol${updateSymbolsDetails.length > 1 ? "s" : ""
            } Added`
          );
        }
      }
    } catch (error) {
      console.log("create watchlist error", error);
    }
    setVisible(false);
    setLoader(false);
  };

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

  useEffect(() => {
    if (!isMount) setIsMount(true);
  }, []);

  return (
    <>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        preventClose
        open={visible}
        onClose={closeHandler}
        width="450px"
        className="border-radius-8"
      >
        <Modal.Header css={{ mt: "$0" }}>
          <Text h4>
            {createUpdate == "create" ? "Create Watchlist" : "Add Symbols"}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Row
            style={{ marginTop: "0px" }}
            className="width-100 flex-col watchlist-input-wrapper"
          >
            <label style={{ marginBottom: "5px" }}>Watchlist Name</label>
            <Input
              className={`border-radius-8`}
              maxLength={41}
              bordered
              borderWeight="light"
              placeholder="Watchlist Name"
              labelPlaceholder={
                createUpdate == "create"
                  ? ""
                  : `${selectedCurrentWatchlist?.watchlistName?.toUpperCase()}`
              }
              disabled={createUpdate == "update"}
              onChange={(event) => {
                setWatchlistCreds((prev) => ({
                  ...prev,
                  watchlistName: event.target.value,
                }));
              }}
            />
            {(watchlistCreds.watchlistName?.trim() === "" ||
              watchlistCreds.watchlistName.length > 40) &&
              createUpdate === "create" && (
                <div>
                  <small className="disable-text-color font-weight-500">
                    Watchlist name should be 1-40 characters long
                  </small>
                </div>
              )}
          </Row>
          <Row className="flex-col">
            <label style={{ marginBottom: "5px" }}>Select Symbol</label>
            <div className="watchlistDropdown width-100">
              <div>
                <CustomSelect
                  onChange={(selectedSymbolList) => {
                    if (selectedSymbolList?.length === 0) {
                      setWatchlistCreds((prev) => ({
                        ...prev,
                        watchlistSymbols: [],
                      }));
                      return;
                    }

                    const customizedSymbolsArray = selectedSymbolList.map(
                      (symbol) => {
                        const {
                          Scripcode,
                          Exch,
                          ExchType,
                          label,
                          symbolName,
                          LotSize,
                        } = symbol;

                        return {
                          Scripcode: Scripcode,
                          label: `${label} (${Exch === "NSE"
                            ? "NSE"
                            : Exch === "BSE"
                              ? "BSE"
                              : Exch === "MCX"
                                ? "MCX"
                                : "NSE"
                            })`,
                          value: symbolName,
                          LotSize: LotSize,
                          ExchType: ExchType === "C" ? "CASH" : ExchType,
                          symbolName: label,
                          Exch: ExchangeShortName[Exch],
                        };
                      }
                    );

                    setWatchlistCreds((prev) => ({
                      ...prev,
                      watchlistSymbols: customizedSymbolsArray,
                    }));
                  }}
                  components={{
                    MultiValue: CustomMultiValue,
                  }}
                  maxMenuHeight={200}
                  isMulti={true}
                  placeholder="Select Symbol"
                  customStyles={customStyles}
                  exchangeType={""}
                />
              </div>
            </div>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            onPress={() => {
              setVisible(false);
            }}
          >
            Close
          </Button>
          <Button
            className={`${loader ||
              isSubmitDisabled.watchlistName ||
              isSubmitDisabled.symbolSelectedList
              ? `disable-button`
              : `primary-button`
              } border-radius-8`}
            auto
            flat
            disabled={
              loader ||
              isSubmitDisabled.watchlistName ||
              isSubmitDisabled.symbolSelectedList
            }
            onPress={() =>
              loader ||
                isSubmitDisabled.watchlistName ||
                isSubmitDisabled.symbolSelectedList
                ? undefined
                : createUpdateWatchlist()
            }
          >
            {loader ? <Loading type="spinner" size="md" /> : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddUpdateWatchlist;
