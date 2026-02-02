export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\d{10}$/;
export const DOBPattern = /^\d{8}$/; //DDMMYYYY
export const Exchange = { NSE: "NSE", BSE: "BSE", MCX: "MCX" };
export const mcxfo_converter_mcx = { MCXFO: "MCX" };
export const ExchangeSquareOff = {
  NSE: "NSECM",
  BSE: "BSECM",
  MCX: "MCX",
  NFO: "NSEFO",
};
export const ExchangeSquareOff2 = {
  NSECM: "NSE",
  BSECM: "BSE",
  MCX: "MCX",
  MCXFO: "MCX",
};
export const ExchangeShortName = {
  NSE: "N",
  BSE: "B",
  MCX: "M",
  NSEFO: "N",
  BSEFO: "B",
};
export const ExchangeNameDerivatives = {
  NSE: "NSEFO",
  BSE: "BSEFO",
  MCX: "MCX",
  N: "NSEFO",
  B: "BSEFO",
};
export const fullExchangeType = {
  D: "DERIVATIVES",
};
export const ExchangeFullName = { N: "NSE", B: "BSE", M: "MCX" };
export const OrderType = { MARKET: "MARKET" };
export const ProductType = { NORMAL: "NRML", INTRA: "MIS" };
export const LoginStatus = {
  LOGGED_IN: "LoggedIn",
  LOGGED_OUT: "LoggedOut",
  WEBSOCKET_CONNECTED: "WebsocketConnected",
};

export var liveDataParam = {
  Exchange: null,
  ScripCode: null,
  Time: null,
  EpochTime: null,
  Type: null,
  LTP: null,
  LTP_Qty: null,
  Type: null,
  Volume: null,
  Average: null,
  OpenInterest: null,
  UpperCktLimit: null,
  LowerCktLimit: null,
  BidRate: null,
  BidQty: null,
  BidOrder: null,
  OfferRate: null,
  OfferQty: null,
  OfferOrder: null,
  Level: null,
  Type: null,
  Open: null,
  High: null,
  Low: null,
  PrevDayClose: null,
  BidAsk: [],
};

//Index list
export const indexes = [
  { label: "NIFTY", value: "NIFTY", exch: "NSE", Scripcode: 26000 },
  { label: "FINNIFTY", value: "FINNIFTY", exch: "NSE", Scripcode: 26037 },
  { label: "BANKNIFTY", value: "BANKNIFTY", exch: "NSE", Scripcode: 26009 },
  { label: "MIDCPNIFTY", value: "MIDCPNIFTY", exch: "NSE", Scripcode: 26074 },
  { label: "SENSEX", value: "SENSEX", exch: "BSE", Scripcode: 999901 },
  { label: "BANKEX", value: "BANKEX", exch: "BSE", Scripcode: 100 },
  { label: "SENSEX50", value: "SENSEX50", exch: "BSE", Scripcode: 100 },
];

export const IsValidEmail = (email) => {
  // return email.includes("@") && email.includes(".");
  let validateEmail = EMAIL_REGEX.test(email);
  return validateEmail;
};

export const orderTypeFormat = {
  SLL: "STOPLIMIT", // need to change in backend,  for the timeing it's handled from frontend
  // SLL: "Stop Loss",
  SLM: "Stop Loss",
};

export const orderTypeFormatTradeWithExcel = {
  SLL: "STOPLIMIT",
  SLM: "STOPMARKET",
  MKT: "MARKET",
  LIMIT: "LIMIT",
};

export const productType = {
  INTRADAY: "MIS",
  DELIVERY: "NRML",
};
export const shortProductType = {
  MIS: "INTRADAY",
  NRML: "DELIVERY",
  MTF: "MTF"
};
export const conversionProductType = {
  NRML: "INTRADAY",
  MIS: "DELIVERY",
};

export const fullConversionOrderType = {
  MKT: "MARKET",
  SL: "STOP LOSS LIMIT",
  SM: "STOP LOSS MARKET",
  Lim: "LIMIT",
};

export const statusMap = {
  "trigger pending": "Pending",
  pending: "Pending",
};

export const monthOrder = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

export const warnMessage = {
  client_limit: `The client's upload has exceeded the allowed limit.`,
  records_limit: `The records limit must be set between a minimum of 30 and a maximum of 60.`,
  success_records_limit_message: `Records limit updated successfully.`,
  success_order_message: `Order sent successfully.`,
  success_squareoff_message: `Square-off placed Successfully.`,
};

export let subscribe_exchange = ["CRUDEOIL", "GOLD", "SILVER"];

export const variety_type = {
  AMO: "NORMAL",
  NORMAL: "NORMAL",
};

export const iiflUrlkey = "https://ttblaze.iifl.com/apimarketdata";


export const isValidDOB = (dob) => {
  if (!/^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])\d{4}$/.test(dob)) return false;

  const day = parseInt(dob.slice(0, 2), 10);
  const month = parseInt(dob.slice(2, 4), 10);
  const year = parseInt(dob.slice(4), 10);

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export function brokerLogoFormatHandler(brokerLogo) {

  if (!brokerLogo) return ''

  const brokerLowerCase = (brokerLogo || '').toLowerCase()
  const brokerLogoLink = ["iiflont", "iifl", "iiflxts"].includes(brokerLowerCase)
    ? `images/brokers/${brokerLowerCase}.svg`
    : `images/brokers/${brokerLowerCase}.png`

  return brokerLogoLink
}