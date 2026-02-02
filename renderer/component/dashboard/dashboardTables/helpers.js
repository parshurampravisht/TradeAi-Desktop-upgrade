import { statusInfo } from "../../../../shared/constants";

export const getSymbolsListNetPositions = (loadSymbols, tableData = []) => {
  let symbols = loadSymbols;
  tableData?.forEach((row) => {
    let symbolName = row.Symbol;

    if (!symbols.includes(symbolName)) {
      symbols.push(symbolName);
    }
  });

  return symbols;
};

export const getSymbolsListHoldings = (loadSymbols, tableData = []) => {
  let symbols = loadSymbols;
  tableData?.forEach((row) => {
    let symbolName = row.ScripName;

    if (symbolName && !symbols.includes(symbolName)) {
      symbols.push(symbolName);
    }
  });

  return symbols;
};

export const filterClientIdsHandler = (clientsArr) => {
  let selectedClientsId = [];
  for (let key of clientsArr) {
    selectedClientsId.push(key.value);
  }
  return selectedClientsId;
};

export const statusHandler = (params) => {
  return statusInfo[params.value] || params.value;
};

export function formatNumber(nums, dec = 2) {
  return Number.isInteger(+nums) ? +nums : +nums.toFixed(dec);
}

export const formatSymbolWithPrice = (symbolData) => {
  const parts = symbolData?.split(" ");

  if (!parts?.length) return symbolData;

  const strikeWithDecimal = parts?.pop();
  const strikeWithoutDecimal = parseInt(strikeWithDecimal, 10); // Convert to an integer to remove decimals

  const formattedSymbol = [...parts, strikeWithoutDecimal]?.join(" ");
  return formattedSymbol;
};
