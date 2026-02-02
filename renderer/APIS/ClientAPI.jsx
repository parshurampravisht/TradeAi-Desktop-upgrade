import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;

const connect_clients_api = async (data) => {
  const options = {
    method: "POST",
    headers: {
      key: "trial",
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNfaWQiOm51bGwsImV4cCI6MTY4NjU1MjcwNn0.GliW6UsvnfAKajRQCKNzZn-1k7NOlEm85xQGAjZ4I9Y",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  try {
    const response = await fetch("http://192.168.2.171:6969/connect", options);
    
    const json = await response.json();
    
    return json;
  } catch (error) {
    
    
    return error;
  }
};

module.exports = { connect_clients_api };
