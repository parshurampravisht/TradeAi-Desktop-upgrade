// replace file content for switching environments
export const baseAuthURL =
  process.env.NODE_ENV == "development"
    ? "tradeai1.wealthwisers.in"
    // ? "tradeai1-dev.wealthwisers.in"
    : "tradeai1.wealthwisers.in";
const baseDevAuthURl = `http://tradeai1-dev.wealthwisers.in`;
console.log("BaseURL: ", baseAuthURL);
export const environment = {
  production: false,
  brokerPlaceUrl: "http://127.0.0.1:6001/api/prod",
  authBaseUrl: `http://${baseAuthURL}/api/prod`,
  webhookBaseUrl: `http://${baseAuthURL}`,
  awsbrokerBaseUrl: baseDevAuthURl,
};