import { Exchange, ExchangeSquareOff } from "../constant/constant";
const currencyFormatter = (number, fixed = 1) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });
  const value = number && number !== "NA" ? Number(number).toFixed(fixed) : "0";
  return formatter.format(value);
};

const numberFormatter = (number, fixed = 1) => {
  const value = number && number !== "NA" ? Number(number).toFixed(fixed) : "0";
  return new Intl.NumberFormat("en-IN", { style: "decimal" }).format(value);
};

const valueFormatterInPercentage = (currency, fixed = 1) => {
  const formatter = new Intl.NumberFormat("en-IN", { style: "percent" });
  const value =
    currency && currency !== "NA" ? Number(currency).toFixed(fixed) : "0";
  return formatter.format(value);
};

const numberwithDecimalWholeFormat = (n, fixed) => {
  let result = n - Math.floor(n) !== 0;
  const updateResult = result ? n.toFixed(fixed) : n;
  return +updateResult;
};

const getSquareOffExchange = (exch) => {
  if (exch === Exchange.NSE) {
    return ExchangeSquareOff.NSE;
  } else if (exch === Exchange.BSE) {
    return ExchangeSquareOff.BSE;
  } else if (exch === Exchange.MCX) {
    return ExchangeSquareOff.MCX;
  } else {
    return exch;
  }
};

const LoadingComponent = () => (
  <div
    style={{
      color: "blue",
      border: "1px solid blue",
      padding: "10px",
      borderRadius: "5px",
    }}
  >
    Loading...
  </div>
);
export {
  currencyFormatter,
  numberFormatter,
  numberwithDecimalWholeFormat,
  valueFormatterInPercentage,
  getSquareOffExchange,
  LoadingComponent,
};
