import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    return "Cannot Access context before initialization.";
  }
  return context;
};

export const DataProvider = ({ children }) => {
  let symbolDetails = JSON.parse(localStorage.getItem("symbolDetails"));
  const [contextData, setContextData] = useState({
    symbolDetails: symbolDetails,
    symbol: "",
    name: "",
    expiry: "",
    token: "",
    exchange: "",
    instrumenttype: "",
  });
  useEffect(() => {
    if (!contextData.symbolDetails) return;
    setContextData((p) => {
      localStorage.setItem(
        "symbolDetails",
        JSON.stringify(contextData.symbolDetails)
      );
      return {
        ...p,
        name: p.symbolDetails.name,
        symbol: p.symbolDetails.symbol,
        token: p.symbolDetails.token,
        exchange: p.symbolDetails.exch_seg,
      };
    });
  }, [contextData.symbolDetails]);
  const value = {
    contextData,
    setContextData: (newData) => setContextData(newData),
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
