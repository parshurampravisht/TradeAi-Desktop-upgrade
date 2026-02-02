import { createContext, useContext, useMemo, useRef, useState } from "react";

const RightSiderContext = createContext({});

export const useGlobalContext = () => useContext(RightSiderContext);

export const RightSiderContextProvider = ({ children }) => {
  const [loadSymbols, setLoadSymbols] = useState([
    "NIFTY",
    "BANKNIFTY",
    "SENSEX",
  ]);
  const watchlistSymbols = useRef({});
  const [selected, setSelected] = useState(new Set(["empty"]));
  const [reqShares, setReqShares] = useState({});
  const [watchlists, setWatchlists] = useState([]);

  const selectedValue = useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );

  return (
    <RightSiderContext.Provider
      value={{
        loadSymbols,
        setLoadSymbols,
        watchlistSymbols,
        selected,
        setSelected,
        reqShares,
        setReqShares,
        watchlists,
        setWatchlists,
        selectedValue,
      }}
    >
      {children}
    </RightSiderContext.Provider>
  );
};
