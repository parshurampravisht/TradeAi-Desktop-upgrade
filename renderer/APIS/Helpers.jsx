//making development and production keys same
const parseSharesKeys = (obj) => {
  //getting original keys
  const keys = Object.keys(obj);
  //new object and passing updated keys
  var newobj = {};
  //iterating on each key of
  keys.forEach((item, indx) => {
    var nstObj = {};
    var ky = Object.keys(obj[item]);
    var uky = ky.map((itm, idx) => itm.replace(/_/g, ""));
    uky.forEach((itm, idx) => {
      // 
      return (nstObj[itm] = obj[item][ky[idx]]);
    });
    newobj[item] = nstObj;
  });

  return newobj;
};

//function to parse the table keys to standardize keys for development and production
const parseTableKeys = (obj) => {
  //updated array to return
  var newobj = [];
  //iterating on each object in the array
  obj.forEach((item, indx) => {
    //elementary object
    var nstObj = {};
    //elementry object keys
    var ky = Object.keys(item);
    //elementry object updated keys
    var uky = ky.map((itm, idx) => itm.replace(/_/g, ""));
    // for each updated keyframes, forming a new elementry object
    uky.forEach((itm, idx) => {
      // 
      //updated key = old corresponding key
      nstObj[itm] = item[ky[idx]];
    });
    newobj.push(nstObj);
  });

  return newobj;
};

const parseTradeBook = (tableBody) => {};

//rearranging orderbook columns
const parseOrderBook = (tableBody) => {
  var newTableBody = [];
  const columns = [
    "Broker",
    "ClientID",
    "Symbol",
    "OrderType",
    "Price",
    "Quantity",
    "OrderTime",
  ];
  //adding data into new table with specified columns order above
  tableBody.forEach((item) => {
    var newItem = {};
    columns.forEach((col) => {
      newItem[col] = item[col];
    });
    newTableBody.push(newItem);
  });

  return newTableBody;
};

//common function to divert to orderbook and tradebook for rearrangement
const parseTableBook = (tableBody, tableName) => {
  
  if (tableName == "orderbook") {
    tableBody = parseOrderBook(tableBody);
  }
  if (tableName == "tradebook") {
    // tableBody = parseTradeBook(tableBody);
  }
  return tableBody;
};

module.exports = { parseSharesKeys, parseTableKeys, parseTableBook };
