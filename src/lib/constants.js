export const BASE_URL_FUTURE_LIVE = "http://192.168.31.8:5001";
// export const BASE_URL_FUTURE_LIVE = "https://www.pesonline12.in/sharemarketFuture";
export const BASE_URL_FUTURE_BACK = "http://192.168.31.8:5001/test";
// export const BASE_URL_FUTURE_BACK = "https://www.pesonline12.in/sharemarketFuture/test";
export const BASE_URL_COMMODITY_LIVE = "http://192.168.1.241:5003";
export const BASE_URL_COMMODITY_BACK = "http://192.168.1.241:5005";
// export const BASE_URL_OVERALL = "https://www.pesonline12.in/teststock";

// local URL
// export const BASE_URL_OVERALL = "http://192.168.1.11:5006";
// export const BASE_URL_OVERALL2 = "http://192.168.1.11:5010";

// pesonline9 URL
// export const BASE_URL_OVERALL = "http://122.180.30.61:5009";
// export const BASE_URL_OVERALL2 = "http://122.180.30.61:5011";


// export const ANGEL_BASE_URL =  "http://122.180.30.61:4001/api/v1/angel-one";
// export const ANGEL_BASE_URL_LOCAL ="http://122.180.30.61:4001";


// pesonline12 URL
export const BASE_URL_OVERALL = "http://122.180.30.52:5009";
export const BASE_URL_OVERALL2 = "http://122.180.30.52:5011";


export const ANGEL_BASE_URL =  "http://122.180.30.52:4001/api/v1/angel-one";
export const ANGEL_BASE_URL_LOCAL ="http://122.180.30.52:4001";



export const Trade_type_Options = {
  "Future Main": {
    label: "Future Main",
    name: "futureMain",
    url: BASE_URL_FUTURE_LIVE,
    isLive: true,
  },

  "Future BackTesting": {
    label: "Future BackTesting",
    name: "futureBack",
    url: BASE_URL_FUTURE_BACK,
    isLive: false,
  },

  "Commodity Main": {
    label: "Commodity Main",
    name: "commodityMain",
    url: BASE_URL_COMMODITY_LIVE,
    isLive: true,
  },
  "Commodity BackTesting": {
    label: "Commodity BackTesting",
    name: "commodityBack",
    url: BASE_URL_COMMODITY_BACK,
    isLive: false,
  },
};

