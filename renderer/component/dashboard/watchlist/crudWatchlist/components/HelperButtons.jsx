import { useRouter } from "next/router";
import { useGlobalContext } from "../../../../../context/GlobalContext";
import { memo, useCallback } from "react";
import { deleteWatchlistDetails } from "../../../../../../services/transactions/transactions.service";
import {
  ExchangeFullName,
  fullExchangeType,
} from "../../../../../constant/constant";

const HelperButtons = (props) => {
  const {
    setSymbolApi,
    setSelectedWatchlistSymbolData,
    registerSymbolForLiveData,
  } = useGlobalContext();
  const router = useRouter();

  const cellData = props.cell;

  const buySell = (order) => {
    props.setBuySell(order === "buy");

    let symbol = {
      Scripcode: +cellData?.scripCode,
      label: cellData?.symbolName,
      value: cellData?.symbolName,
      LotSize: 1,
      ExchType: cellData?.exchangeType,
      symbolName: cellData?.symbolName,
      Exch: cellData?.exchange,
      LTP: +cellData?.LTP,
    };

    if (cellData?.exchangeType === "CASH") setSymbolApi(symbol);

    props.apiBody.current = {
      ...props.apiBody.current,
      sym: cellData?.symbolName,
      BuySell: order === "buy" ? "B" : "S",
      SelectValue: cellData,
    };

    props.setPlaceOrderVisible(true);
    setTimeout(
      () =>
        router.push({
          pathname:
            cellData?.exchangeType === "CASH" ? "/cash&equity" : "/options",
          // pathname: "/cash&equity",
          query: { state: Boolean(order === "buy") },
        }),
      0
    );
  };

  const handlerWatchList = useCallback(() => {
    router.push("/buy");
  }, [router]);

  const handleDelete = async () => {
    try {
      const result = await deleteWatchlistDetails(cellData?.id);
      const registerPayload = [
        {
          value: cellData.symbolName,
          Scripcode: +cellData.scripCode,
          Exch: ExchangeFullName[cellData.exchange],
          ExchType:
            fullExchangeType[cellData.exchangeType] || cellData.exchangeType,
        },
      ];

      await registerSymbolForLiveData("unregister", registerPayload, true);
      setSelectedWatchlistSymbolData((prev) =>
        prev.filter((item) => item.id !== cellData?.id)
      );
    } catch (error) {
      console.log("delete watch details error", error);
    }
  };

  return (
    <div className="flex-row column-gap-5 align-center">
      <button
        style={{
          backgroundColor: "#13a452",
          color: "white",
          borderRadius: "5px 0px 0px 5px",
          borderWidth: "0px",
          padding: "2px",
          paddingTop: "0px",
          cursor: "pointer",
          width: "30px",
        }}
        onClick={() => buySell("buy", cellData)}
      >
        B
      </button>

      <button
        style={{
          backgroundColor: "#f31260",
          color: "white",
          borderRadius: "0px 0px 0px 0px",
          borderWidth: "0px",
          padding: "2px",
          paddingTop: "0px",
          cursor: "pointer",
          width: "30px",
        }}
        onClick={() => buySell("sell")}
      >
        S
      </button>

      <button
        style={{
          backgroundColor: "orange",
          color: "white",
          borderRadius: "0px 5px 5px 0px",
          borderWidth: "0px",
          padding: "2px",
          paddingTop: "0px",
          cursor: "pointer",
          width: "30px",
        }}
        onClick={handleDelete}
      >
        D
      </button>
    </div>
  );
};

export default memo(HelperButtons);
