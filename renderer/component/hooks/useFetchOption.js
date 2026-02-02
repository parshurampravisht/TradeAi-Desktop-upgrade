import { useState, useCallback } from "react";
import {
  SearchStocksHandler,
  SearchStocksGroupByHandler,
} from "../../../services/transactions/transactions.service";
import { monthOrder } from "../../constant/constant";

const useFetchOptions = (exchangeType = "", groupBySymbolName = false) => {
  const [optionData, setOptionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const symbolsListSortHandler = (data) => {
    const sortedData = data.sort((a, b) => {
      const regex = /(\d{2})\s([A-Z]{3})\s\d{4}/i;
      const [, dayA, monthA] = a?.label.match(regex) || [];
      const [, dayB, monthB] = b?.label.match(regex) || [];

      // Compare months first, using the monthOrder object
      const monthComparison =
        (monthOrder[monthA?.toUpperCase()] || 0) -
        (monthOrder[monthB?.toUpperCase()] || 0);

      if (monthComparison !== 0) {
        return monthComparison;
      }

      // If months are the same, compare days numerically
      return (parseInt(dayA) || 0) - (parseInt(dayB) || 0);
    });

    return sortedData;
  };

  const fetchOptions = useCallback(async (inputValue) => {
    if (inputValue.length < 2) {
      return;
    }
    setLoading(true);
    try {
      let payload = { full_name: inputValue, exch_type: exchangeType };
      const res = await (groupBySymbolName
        ? SearchStocksGroupByHandler(payload)
        : SearchStocksHandler({ ...payload, search_type_code: 1 })); // search type code  1 ---> start with, 2 ---> contains, 3 or else ---> exact versions

      if (exchangeType === "D") {
        const resultData = symbolsListSortHandler(res?.data || []);
        setOptionData(resultData);
      } else {
        setOptionData(res?.data || []);
      }
    } catch (error) {
      console.error("Error fetching options", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { optionData, setOptionData, loading, fetchOptions };
};

export default useFetchOptions;
