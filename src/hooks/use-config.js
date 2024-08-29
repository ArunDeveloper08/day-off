import axios from "axios";
import { create } from "zustand";

// Function to fetch initial configuration from the external API
const fetchInitialConfig = async (tradeType) => {
  const { data } = await axios.get(`${tradeType.url}/setting/getConfig`);
  // return data.data;
  const {
    WMA,
    id,
    instrument_token,
    interval,
    primaryFuture,
    primaryTradeEntry,
    primaryTradeExit,
    secondaryFuture,
    secondaryTradeEntry,
    secondaryTradeExit,
    supportSlope,
    symbol,
    tradeInTime,
    tradeIndex,
    tradeOutTime,
    support,
    resistance,
  } = data.data;
  return {
    id,
    symbol,
    instrument_token,
    WMA,
    interval,
    tradeInTime,
    primaryFuture,
    primaryTradeEntry,
    primaryTradeExit,
    tradeIndex,
    tradeOutTime,
    secondaryFuture,
    secondaryTradeEntry,
    secondaryTradeExit,
    // supportSlope,
    // support,
    // resistance,
  };
};

// Function to update the configuration on the server
const updateConfigOnServer = async (newConfig, url) => {
  const data = await fetch(`${url}/setting/setConfig`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newConfig),
  });
  return data;
};

export const useConfig = create((set) => {
  const state = {
    tradeConfig: {},
    config: {
      WMA: "",
      createdAt: "",
      id: "",
      instrument_token: "",
      interval: "",
      isRunning: "",
      mainTrade: "",
      primaryFuture: "",
      primaryTradeEntry: "",
      primaryTradeExit: "",
      secondaryFuture: "",
      secondaryTradeEntry: "",
      secondaryTradeExit: "",
      supportSlope: "",
      supportTimeInMin: "",
      symbol: "",
      tradeInTime: "",
      tradeIndex: "",
      tradeOutTime: "",
      updatedAt: "",
    },
    setConfig: (newConfig) => set({ config: newConfig }),
    fetchConfig: async (tradeConfig) => {
      const res = await fetchInitialConfig(tradeConfig);
      set((state) => ({
        ...state,
        config: res,
      }));
    },
    setTradeConfig: (newTradeType) =>
      set((state) => ({ ...state, tradeConfig: newTradeType })),
    updateConfig: async (newConfig, url) => {
      const res = await updateConfigOnServer(newConfig, url);
      const { data } = await res.json();
      const {
        WMA,
        id,
        instrument_token,
        interval,
        primaryFuture,
        primaryTradeEntry,
        primaryTradeExit,
        secondaryFuture,
        secondaryTradeEntry,
        secondaryTradeExit,
        supportSlope,
        symbol,
        tradeInTime,
        tradeIndex,
        tradeOutTime,
      } = data;
      set((state) => ({
        ...state,
        config: {
          id,
          symbol,
          instrument_token,
          WMA,
          interval,
          tradeInTime,
          primaryFuture,
          primaryTradeEntry,
          primaryTradeExit,
          tradeIndex,
          tradeOutTime,
          secondaryFuture,
          secondaryTradeEntry,
          secondaryTradeExit,
          supportSlope,
        },
      }));
      return data;
    },
  };
  // Fetch initial configuration when the store is created
  // fetchInitialConfig(state.tradeType).then((initialConfig) => {
  //   set({ config: initialConfig });
  // });

  return state;
});

