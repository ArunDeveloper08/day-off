import { BASE_URL_OVERALL } from "@/lib/constants";
import { useLiveSocket } from "@/providers/live-socket-provider";
import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CandleChart from "../components/LiveGraph";

import "react-toastify/dist/ReactToastify.css";
// import { groupBy } from "./dashboard";

import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

// import { scaleTime, scaleLinear } from "d3-scale";
// import { Button } from "@mui/material";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal";

const HelpingChart = () => {
  const { theme, setTheme } = useTheme();
  const intervalRef = useRef(null);
  const debounceRef = useRef(null); // Add ref for debouncing
  const [intractiveData, setIntractiveData] = useState([]);
  // const [master, setMaster] = useState("");
 // const [ceTargetValue, setCeTargetValue] = useState(null);
  // const [peTargetValue, setPeTargetValue] = useState(null);
  const [ceStopLoss, setCeStopLoss] = useState(null);
  const [peStopLoss, setPeStopLoss] = useState(null);
  // const [chartType, setChartType] = useState("canvas");
  const [chartType, setChartType] = useState("svg");
  const [trends3, setTrends3] = useState([]);
  const [alert3, setAlert3] = useState([]);
  const [entryLine, setEntryLine] = useState([]);
  const [bearishLine, setBearishLine] = useState([]);
  const [trendLineValue, setTrendLineValue] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const previousValues = useRef({});
  const [buyTrendLineDate, setBuyTrendLineDate] = useState();
  // const [checkButtonBull , setCheckButtonBull] = useState(false);
  // const [checkButtonBear , setCheckButtonBear] = useState(false);
  // const [selectedInterval, setSelectedInterval] = useState("ONE_MINUTE");

 // let tradeIndex = "";
  // const timeScale = useRef(scaleTime().domain([0, 1]));
  // const priceScale = useRef(scaleLinear().domain([0, 1]));
  // const [entryLine2, setEntryLine2] = useState([]);

  useEffect(() => {
    setTheme("light");
  }, []);

  const location = useLocation();
  // const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [apiData, setApiData] = useState([]);

  const [data, setData] = useState({
    loading: false,
    data: {},
    error: "",
  });

  const [values, setValues] = useState({
    date: null,
    WMA: 1,
    interval: "FIVE_MINUTE",
    candleType: "HeikinAshi",
    trendLineActive: 1,
    rangeBoundPercent: null,
  });

  useEffect(() => {
    if (data?.data?.identifier) {
      document.title = `${data?.data?.identifier}`;
      //tradeIndex = data.data.tradeIndex;
    }
  }, [data?.data?.identifier]);

  // useEffect(() => {
  //   if (data.data) {
  //     ({
  //       date: data.data.masterChartPrevDate,
  //       WMA: data.data.WMA,
  //       interval: null,
  //       candleType: data.data.candleType,
  //       rangeBoundPercent: data.data.rangeBoundPercent,
  //       trendLineActive: data.data.trendLineActive,
  //     });
  //   }
  // }, [data]);

  const { socket, isConnected } = useLiveSocket();
  // let width = useMemo(() => window.screen.width, []);
  // let height = useMemo(() => window.screen.height, []);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const [socketData, setSocketData] = useState([]);
  const [showRow, setShowRow] = useState({
    showAvg: false,
    candle: true,
    dynamicExitValue: false,
    dynamicEntryValue: false,
    arrow: false,
    trendLine: false,
    initialLow: false,
    Last_Highest_LTP: false,
    rangeBoundLine: false,
    MouseCoordinates: true,
    movingAvg: false,
    fibonacci: false,
    equidistantChannel: false,
    volume: false,
    RangeBoundTargetProfit: false,
    monthlyHigh: false,
    weekly: false,
    fourHourly: false,
    hourly: false,
    daily: false,
    suppRes: false,
    toolTip: false,
    allTrendLine: false,
    ceTrendLine: true,
    peTrendLine: true,
    alertLine: true,
    entryLine: true,
    rsi: false,
    atr: false,
    bearishLine: false,
    bollingerBand : false
  });
  const [hideConfig, setHideConfig] = useState(true);
  // const [supportTrendLine, setSupportTrendLine] = useState([]);
  // const [resistanceTrendLine, setResistanceTrendLine] = useState([]);
  const { onOpen } = useModal();

  // const [testingMode, setTestingMode] = useState(() => {
  //   const storedMode = localStorage.getItem(`testingMode_${id}`);
  //   return storedMode === "true";
  // });

  const [apiResponseReceived, setApiResponseReceived] = useState(false);
  const [testingMode, setTestingMode] = useState("");
  // const hasInitializedTrends = useRef(false);
  const manualIntervalRef = useRef(null);

  if (!id) return null;

  const getTradeConfig = async () => {
    setData((p) => ({ ...p, loading: true }));
    try {
      const { data } = await axios.get(
        `${BASE_URL_OVERALL}/config/get?id=${id}`
      );
      setData((p) => ({ ...p, data: data.data }));
      if (data?.data?.buyTrendLineDate == null) {
        setBuyTrendLineDate((new Date().toISOString().split("T")[0])?.slice(0,10));
      } else {
        setBuyTrendLineDate(data?.data?.buyTrendLineDate);
      }

      setValues((prev) => {
        // Use manualInterval if the user has selected one

        const interval = manualIntervalRef.current ?? data.data?.interval;

        return {
          ...prev,
          interval: interval, // Preserve the manually selected interval
          candleType: data.data?.candleType,
          trendLineActive: data.data?.trendLineActive,
          WMA: data.data?.WMA,
        };
      });
    } catch (error) {
      setData((p) => ({
        ...p,
        error: error?.response?.data.message || error?.message,
      }));
    } finally {
      setData((p) => ({ ...p, loading: false }));
    }
  };

  const mergeEntryLines = (apiLines, stateLines) => {
    const apiLineNames = new Set(apiLines?.map((apiLine) => apiLine.name));
    const updatedUserLines = stateLines?.map((userLine) => {
      const matchingApiLine = apiLines.find(
        (apiLine) => apiLine.name === userLine.name
      );
      return matchingApiLine
        ? { ...userLine, ...matchingApiLine } // Merge API updates into user-drawn lines
        : userLine;
    });

    const mergedLines = [
      ...updatedUserLines,
      ...apiLines.filter((apiLine) => !apiLineNames.has(apiLine.name)),
    ];

    console.log("Merged Entry Lines:", mergedLines);
    return mergedLines;
  };

  // const getChartData = () => {
  //   axios
  //     .post(`${BASE_URL_OVERALL}/chart/helper?id=${id}`)
  //     .then((res) => {
  //       // Set other data from the API
  //       setApiData(res.data.data);
  //     //  setCeTargetValue(res.data.data?.[0]?.CETargetLevelValue);
  //       //setPeTargetValue(res.data.data?.[0]?.PETargetLevelValue);
  //       setCeStopLoss(res.data.data?.[0]?.CEStopLoss);
  //       setPeStopLoss(res.data.data?.[0]?.PEStopLoss);
  //       setIntractiveData(res.data);

  //       // Log API data for debugging

  //       // Merge entry lines if there are buyTrendLines
  //       if (res?.data?.buyTrendLines?.length > 0) {
  //         // const hasResistance = res?.data?.buyTrendLines?.some(item => item.name === "Resistance");
  //         // const hasSupport = res?.data?.buyTrendLines?.some(item => item.name === "Support");

  //         // if (hasResistance) {
  //         //     setCheckButtonBull(true);
  //         //     setEntryLine(res?.data?.buyTrendLines);
  //         // }

  //         // if (hasSupport) {
  //         //     setCheckButtonBear(true);
  //         //     setBearishLine(res?.data?.buyTrendLines)
  //         // }

  //         setEntryLine(res?.data?.buyTrendLines);
  //         setApiResponseReceived(true); // After state update
  //       }

  //       // Process alert lines
  //       if (res?.data?.analysisLine?.length > 0) {
  //         setAlert3(res.data?.analysisLine);
  //         setApiResponseReceived(true);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  //console.log("buyTrendline", buyTrendLineDate);

  // Refined rounding function
  
  const getChartData = async () => {
    const maxRetries = 5; // Maximum number of retries
    let attempts = 0;     // Counter for attempts
  
    while (attempts < maxRetries) {
      try {
        const res = await axios.post(`${BASE_URL_OVERALL}/chart/helper?id=${id}`);
  
        // Set other data from the API
        setApiData(res.data.data);
        setCeStopLoss(res.data.data?.[0]?.CEStopLoss);
        setPeStopLoss(res.data.data?.[0]?.PEStopLoss);
        setIntractiveData(res.data);
  
        // Merge entry lines if there are buyTrendLines
        if (res?.data?.buyTrendLines?.length > 0) {
          setEntryLine(res?.data?.buyTrendLines);
          setApiResponseReceived(true);
        }
  
        // Process alert lines
        if (res?.data?.analysisLine?.length > 0) {
          setAlert3(res.data?.analysisLine);
          setApiResponseReceived(true);
        }
  
        // Exit loop on success
        return;
      } catch (err) {
        attempts++;
        console.log(`Attempt ${attempts} failed:`, err);
  
        // Wait for a short period before retrying
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
        }
      }
    }
  
    // If all retries fail
    console.log('All retry attempts failed.');                                              
  };
  
  
  const roundToNearestTime = (time, interval) => {
    const date = new Date(time);
    const minutes = date.getMinutes();

    const intervalMapping = {
      ONE_MINUTE: 1,
      THREE_MINUTE: 3,
      FIVE_MINUTE: 5,
      FIFTEEN_MINUTE: 15,
      THIRTY_MINUTE: 30,
      ONE_HOUR: 60,
      ONE_DAY: 1440,
      ONE_WEEK: 10080,
    };

    const intervalInMinutes = intervalMapping[interval];

    if (intervalInMinutes < 60) {
      const roundedMinutes =
        Math.floor(minutes / intervalInMinutes) * intervalInMinutes;
      date.setMinutes(roundedMinutes, 0, 0);
    } else {
      date.setMinutes(0, 0, 0);
      if (interval === "ONE_DAY") {
        date.setHours(0);
      } else if (interval === "ONE_WEEK") {
        const day = date.getDay();
        date.setDate(date.getDate() - day); // Start of the week
      }
    }

    return date;
  };

  // const filterAndTransformLines = (trendLines, data, interval) => {
  //   return trendLines?.map((line) => {
  //     const roundedStartTime = roundToNearestTime(line.startTime, interval);
  //     const roundedEndTime = roundToNearestTime(line.endTime, interval);

  //     if (isNaN(roundedStartTime) || isNaN(roundedEndTime)) {
  //       console.error("Invalid rounded start or end time");
  //       return line; // Return the original line if there's an error
  //     }

  //     // Find closest index for start and end times in the data
  //     const startIndex = data?.findIndex(
  //       (candle) =>
  //         new Date(candle.timestamp).getTime() >= roundedStartTime.getTime()
  //     );
  //     const endIndex = data?.findIndex(
  //       (candle) =>
  //         new Date(candle.timestamp).getTime() >= roundedEndTime.getTime()
  //     );

  //     if (startIndex === -1 || endIndex === -1) {
  //       console.error(
  //         "Could not find corresponding data points for trendline:",
  //         line
  //       );
  //       return line; // Return the original line if indices are not found
  //     }

  //     // If it's the first time the line is being drawn, capture the prices
  //     if (!line.originalStartPrice || !line.originalEndPrice) {
  //       line.originalStartPrice = line.start[1]; // Store the original price when first drawn
  //       line.originalEndPrice = line.end[1]; // Store the original price when first drawn
  //     }

  //     // Use the stored original prices for the trendline
  //     return {
  //       ...line,
  //       startTime: roundedStartTime.toISOString(),
  //       endTime: roundedEndTime.toISOString(),
  //       start: [startIndex, line.originalStartPrice || startCandle.close], // Use original price if stored
  //       end: [endIndex, line.originalEndPrice || endCandle.close], // Use original price if stored
  //     };
  //   });
  // };

  // Adjust the trendline's start and end time when the interval changes

  const filterAndTransformLines = (trendLines, data, interval) => {
    return trendLines?.map((line) => {
      const roundedStartTime = roundToNearestTime(line.startTime, interval);
      const roundedEndTime = roundToNearestTime(line.endTime, interval);

      if (isNaN(roundedStartTime) || isNaN(roundedEndTime)) {
        console.warn("Invalid rounded start or end time for line:", line.name);
        return line; // Return original line if error occurs
      }

      const startIndex = data?.findIndex(
        (candle) =>
          new Date(candle.timestamp).getTime() >= roundedStartTime.getTime()
      );
      const endIndex = data?.findIndex(
        (candle) =>
          new Date(candle.timestamp).getTime() >= roundedEndTime.getTime()
      );

      if (startIndex === -1 || endIndex === -1) {
        console.error(
          "Could not find corresponding data points for trendline:",
          line.name
        );
        return line; // Return original line if indices are not found
      }

      return {
        ...line,
        startTime: roundedStartTime.toISOString(),
        endTime: roundedEndTime.toISOString(),
        start: [startIndex, line.start[1] || data[startIndex]?.close],
        end: [endIndex, line.end[1] || data[endIndex]?.close],
      };
    });
  };

  useEffect(() => {
    if (!apiResponseReceived) return;

    // if (
    //   !data?.data?.haveTradeOfPEBuy &&
    //   !data?.data?.haveTradeOfCEBuy &&
    //   !data?.data?.haveTradeOfPE &&
    //   !data?.data?.haveTradeOfCE &&
    //   !data?.data?.haveTradeOfFUTBuy &&
    //   !data?.data?.haveTradeOfFUTSell
    // ) {

    const updatedEntryLines = filterAndTransformLines(
      entryLine,
      apiData,
      values?.interval
    );
    setEntryLine((prev) =>
      JSON.stringify(prev) !== JSON.stringify(updatedEntryLines)
        ? updatedEntryLines
        : prev
    );
    // }

    const updatedAlertLines = filterAndTransformLines(
      alert3,
      apiData,
      values?.interval
    );
    setAlert3((prev) =>
      JSON.stringify(prev) !== JSON.stringify(updatedAlertLines)
        ? updatedAlertLines
        : prev
    );
  }, [apiResponseReceived, apiData, values?.interval]);


  const handleSelect = (key, value) => {

    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "interval") {
      manualIntervalRef.current = value;
    }
            
    if (key === "interval" && apiResponseReceived) {
      const updatedEntryLines = filterAndTransformLines( 
        entryLine,
        apiData,
        value
      );
      const updatedAlertLines = filterAndTransformLines(alert3, apiData, value);

      setEntryLine((prev) =>
        JSON.stringify(prev) !== JSON.stringify(updatedEntryLines)
          ? updatedEntryLines
          : prev
      );
      setAlert3((prev) =>
        JSON.stringify(prev) !== JSON.stringify(updatedAlertLines)
          ? updatedAlertLines
          : prev
      );
      setApiResponseReceived(false);
    }
  };

  // const prevTrendLineActive = useRef(values.trendLineActive);

  const handleSubmit = () => {
    axios
      .put(`${BASE_URL_OVERALL}/config/editMaster?id=${id}`, {
        ...values,
        
      })
      .then((res) => {
        alert("Successfully Updated");
        // Call getChartData only if trendLineActive has NOT changed
        // if (prevTrendLineActive.current === values.trendLineActive) {
        getChartData();
        getTradeConfig();
        setApiResponseReceived(true);
        // }
        // Update the previous value to the current value
        // prevTrendLineActive.current = values.trendLineActive;
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.message || "An error occurred");
      });
  };
  const handleSubmit2 = () => {
    axios
      .put(`${BASE_URL_OVERALL}/config/editMaster?id=${id}`, {
      buyTrendLineDate
        
      })
      .then((res) => {
        alert("Successfully Updated");
        // Call getChartData only if trendLineActive has NOT changed
        // if (prevTrendLineActive.current === values.trendLineActive) {
        getChartData();
       // getTradeConfig();
        setApiResponseReceived(true);
        // }
        // Update the previous value to the current value
        // prevTrendLineActive.current = values.trendLineActive;
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.message || "An error occurred");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    getTradeConfig();
    const interval = setInterval(getTradeConfig, 12 * 1000);
    // intervalRef.current = interval;

    return () => clearInterval(interval);
  }, []);     

  const prevHaveTradeOfCE = useRef(false); // Start with false
  const prevHaveTradeOfPE = useRef(false); // Start with false

  useEffect(() => {
    const { haveTradeOfCE, haveTradeOfPE } = data?.data || {};
    // Detect transition from false to true (for CE)
    if (haveTradeOfCE && !prevHaveTradeOfCE.current) {
      console.log("CE Trade became active");
      getChartData(); // Call API once when CE becomes true
    }
    // Detect transition from false to true (for PE)
    if (haveTradeOfPE && !prevHaveTradeOfPE.current) {
      console.log("PE Trade became active");
      getChartData(); // Call API once when PE becomes true
    }
    // Detect transition from true to false (for CE)
    if (!haveTradeOfCE && prevHaveTradeOfCE.current) {
      console.log("CE Trade became inactive");
      getChartData(); // Call API once when CE becomes false
    }
    // Detect transition from true to false (for PE)
    if (!haveTradeOfPE && prevHaveTradeOfPE.current) {
      console.log("PE Trade became inactive");
      getChartData(); // Call API once when PE becomes false
    }
    // Update refs to track the latest values
    prevHaveTradeOfCE.current = haveTradeOfCE;
    prevHaveTradeOfPE.current = haveTradeOfPE;
  }, [
    data?.data?.haveTradeOfCE,
    data?.data?.haveTradeOfPE,
    data?.data?.haveTradeOfCEBuy,
    data?.data?.haveTradeOfPEBuy,
  ]);

  useEffect(() => {
    getChartData();
    // if (!values) return;
    const interval = setInterval(getChartData,  120 * 1000);
    //  intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [
    data?.data?.haveTradeOfCE,
    data?.data?.haveTradeOfPE,
    data?.data?.haveTradeOfCEBuy,
    data?.data?.haveTradeOfPEBuy,
    data?.data?.haveTradeOfFUTSell,
    data?.data?.haveTradeOfFUTBuy,
    trendLineValue?.dataForIndex7?.CESellLinePrice,
    trendLineValue?.dataForIndex7?.PESellLinePrice,
  ]);

  // const memoizedTrendLines = useMemo(() => {
  //   let supports = [];
  //   let resistances = [];

  //   intractiveData?.trendLines?.forEach((trendLine) => {
  //     const stroke = trendLine.appearance.stroke;

  //     if (stroke === "green" || stroke === "violet") {
  //       resistances.push(trendLine);
  //     } else if (stroke === "red" || stroke === "orange") {
  //       supports.push(trendLine);
  //     }
  //   });

  //   return { supports, resistances };
  // }, [intractiveData.trendLines]);

  // useEffect(() => {
  //   setSupportTrendLine(memoizedTrendLines.supports);
  //   setResistanceTrendLine(memoizedTrendLines.resistances);
  // }, [memoizedTrendLines]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        getChartData();
        intervalRef.current = setInterval(getChartData, 12 * 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalRef.current);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [id, values]);

  // useEffect(() => {
  //   if (!isConnected || !data?.data?.instrument_token) return;
  //   socket?.on("getLiveData", (socketdata) => {
  //     socketdata.token = Number(socketdata?.token?.replace(/"/g, ""));
  //     if (socketdata.token === data?.data.instrument_token) {
  //       setSocketData(socketdata);
  //     }
  //   });
  // }, [socket, data, isConnected]);

  useEffect(() => {
    if (!isConnected || !data?.data?.instrument_token) return;
    //  console.log("Hii")
    socket?.on("getLiveData", (socketdata) => {
      //console.log(socketdata)
      //  Check if token is a string before applying replace
      if (typeof socketdata?.token === "string") {
        socketdata.token = Number(socketdata?.token?.replace(/"/g, ""));
      } else {
        // If it's not a string, attempt to convert it to a number directly
        socketdata.token = Number(socketdata?.token);
      }

      // Proceed if the token matches the instrument token
      if (socketdata.token === data?.data.instrument_token) {
        setSocketData(socketdata);
        setApiData((prevApiData) => {
          if (!prevApiData || prevApiData.length === 0) return prevApiData;

          // Clone the previous data to avoid direct mutation
          const updatedData = [...prevApiData];

          // Replace the `close` value in the last candle with `last_traded_price`
          updatedData[updatedData.length - 1] = {
            ...updatedData[updatedData.length - 1],
            close: socketData.last_traded_price,
          };

          return updatedData;
        });
      }
    });

    return () => {
      socket?.off("getLiveData"); // Clean up the event listener when the component unmounts
    };
  }, [socket, data, isConnected]);
  // console.log("socketData",socketData)

  useEffect(() => {
    // console.log("Hiiiiii")
    if (!isConnected || !data?.data?.instrument_token) return;

    const { instrument_token } = data.data; // Extract instrument token
    // console.log("instrument Token",instrument_token)
    const handleTradeUpdate = (socketData) => {
      //  console.log("socketData",socketData)
      if (Array.isArray(socketData)) {
        const matchingData = socketData.filter(
          (item) => Number(item.instrument_token) === instrument_token
        );
        if (matchingData?.length > 0) {
          setFilteredData(matchingData); // Append matching data
        }
      } else {
        console.warn("Socket Data Is Not An Array");
      }
    };
    socket.on("tradeUpdate", handleTradeUpdate);
    return () => {
      socket.off("tradeUpdate", handleTradeUpdate);
    };
  }, [socket, isConnected, data?.data?.instrument_token]);

  //  console.log("filteredData", filteredData);

  useEffect(() => {
    if (filteredData?.length > 0) {
      const currentValues = {                                      
        CEStopLossForIndex7: filteredData?.[0]?.CEStopLossForIndex7,
        CEStopLossForIndex17: filteredData?.[0]?.CEStopLossForIndex17,
        PEStopLossForIndex7: filteredData?.[0]?.PEStopLossForIndex7,
        PEStopLossForIndex17: filteredData?.[0]?.PEStopLossForIndex17,
        FUTStopLossForIndex7: filteredData?.[0]?.FUTStopLossForIndex7,
        FUTStopLossForIndex17: filteredData?.[0]?.FUTStopLossForIndex17,
      };

      // Iterate through the current values
      Object.entries(currentValues).forEach(([key, value]) => {
        const prevValue = previousValues.current[key];

        // If the value transitioned from non-zero to zero, call the API
        if (prevValue !== undefined && prevValue !== 0 && value === 0) {
          console.log(
            `Field ${key} transitioned from ${prevValue} to ${value}`
          );
          getChartData(); // Call the API once per valid transition
        }

        // Update the previous values
        previousValues.current[key] = value;
      });
    }
  }, [filteredData]);

  const today = new Date().toISOString().split("T")[0];

  const getHighLowLines = async () => {
    try {
      await axios.get(`${BASE_URL_OVERALL}/chart/makeHighLow?id=${id}`);
      alert("High Low Reset !");
      getChartData();
    } catch (error) {
      alert("Some error Occured" , error);
    }
  };

  const getTrendLinesValue = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/trendLinesValues/get?id=${id}`
      );
      setTrendLineValue(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateTrendLines = async (
    trendline,
    textList1,
    alert3,
    entryLine
  ) => {
    // Helper to send data to the API
    // console.log(alert3)
    const sendDataToAPI = async (data) => {
      try {
        await axios.put(`${BASE_URL_OVERALL}/config/edit`, { id, ...data });
        alert("Successfully saved.");
        await getTrendLinesValue();
        await getChartData();
      } catch (err) {
        console.error("Error saving data:", err);
      }
    };

    // Check if any trend line is incomplete
    const incompleteLineExists = trendline?.some(
      (line) => line?.endTime === undefined && line?.startTime
    );
    const incompleteLineExists3 = alert3?.some(
      (line) => line?.endTime === undefined && line?.startTime
    );
    const incompleteLineExists2 = entryLine
      ?.slice(0, 4) // Get only the first 4 elements
      .some((line) => line?.endTime === undefined && line?.startTime);

    // Handle trendline saving
    if (showRow?.trendLine) {
      if (trendline?.length === 0) {
        return sendDataToAPI({
          trendLines: trendline,
          textLabel: JSON.stringify(textList1),
        });
      }
      if (trendline?.length > 0 && trendline?.length < 10) {
        alert(
          `You have only ${trendline.length} Trend lines. Please add ${
            10 - trendline.length
          } more trend lines.`
        );
        return;
      }
      if (incompleteLineExists) {
        alert(
          "Please ensure all trend lines remain inside the chart. The endpoint cannot be outside the chart."
        );
        return;
      }
    }

    // Handle entryLine saving
    if (showRow?.entryLine) {
      if (incompleteLineExists2) {
        alert(
          "Please ensure all Entry lines remain inside the chart. The endpoint cannot be outside the chart."
        );
        return;
      }
      // Only call API for entryLine if conditions are met
      if (entryLine?.length === 0) {
        sendDataToAPI({ buyTrendLines: entryLine });
      } else if (entryLine?.length >= 4) {
        sendDataToAPI({ buyTrendLines: entryLine });
      } else if (entryLine?.length > 0 && entryLine.length < 4) {
        alert(
          `You have only ${entryLine.length} Entry lines. Please add ${
            4 - entryLine.length
          } more entry lines.`
        );
        return;
      }
    }

    // Handle alertLine saving
    if (showRow?.alertLine) {
      if (incompleteLineExists3) {
        alert(
          "Please ensure all Analysis lines remain inside the chart. The endpoint cannot be outside the chart."
        );
        return;
      }

      // Always call API for alert lines if they exist
      if (alert3?.length > 0 || alert3.length == 0) {
        sendDataToAPI({ analysisLine: alert3 });
      }

      // Ensure entry lines are saved if alert3 exists
      // if (alert3?.length > 0 || entryLine?.length > 0) {
      //   sendDataToAPI({ buyTrendLines: entryLine });
      // }
    }
  };

  useEffect(() => {
    if (!id) return;
    getTrendLinesValue();
    const interval = setInterval(getTrendLinesValue, 7 * 1000);
    // intervalRef.current = interval;

    return () => clearInterval(interval);
  }, []);

  const setCETrendLine = () => {
    setShowRow((prevState) => {
      const newCeTrendLineState = !prevState.ceTrendLine;
      const { peTrendLine } = prevState;

      let newTrends;
      if (newCeTrendLineState && peTrendLine) {
        newTrends = [
          ...memoizedTrendLines.resistances,
          ...memoizedTrendLines.supports,
        ];
      } else if (newCeTrendLineState) {
        newTrends = memoizedTrendLines.resistances;
      } else {
        newTrends = peTrendLine ? memoizedTrendLines.supports : [];
      }

      setTrends3(newTrends);

      return {
        ...prevState,
        ceTrendLine: newCeTrendLineState,
        allTrendLine: false,
      };
    });
  };

  const setPETrendLine = () => {
    setShowRow((prevState) => {
      const newPeTrendLineState = !prevState.peTrendLine;
      const { ceTrendLine } = prevState;

      let newTrends;
      if (newPeTrendLineState && ceTrendLine) {
        newTrends = [
          ...memoizedTrendLines.resistances,
          ...memoizedTrendLines.supports,
        ];
      } else if (newPeTrendLineState) {
        newTrends = memoizedTrendLines.supports;
      } else {
        newTrends = ceTrendLine ? memoizedTrendLines.resistances : [];
      }

      setTrends3(newTrends);

      return {
        ...prevState,
        peTrendLine: newPeTrendLineState,
        allTrendLine: false,
      };
    });
  };

  const getTestMode = () => {
    axios
      .get(`${BASE_URL_OVERALL}/config/getMasterTestMode?id=${id}`)
      .then((res) => {
        setTestingMode(res?.data?.data?.[0]?.testMode);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleTestingMode = async () => {
    try {
      const newMode = !testingMode;
      setTestingMode(newMode);

      // localStorage.setItem(`testingMode_${id}`, newMode);

      const response = await axios.put(
        `${BASE_URL_OVERALL}/config/testMode?id=${id}&status=${newMode}`
      );
      await getTestMode();
      alert(response.data.message);
    } catch (err) {
      console.log("Error while toggling Testing mode", err);
    }
  };

  useEffect(() => {
    getTestMode();
  }, []);

  const getValue = (key) => data.data[key];
  // const getValue = (key) => filteredData?.[0]?.[key] ?? data.data[key];
  const openChartInNewTab = () => {
    // Open the /future/pcrchart route in a new tab
    window.open("/future/pcrchart", "_blank");
  };
   
   
  return (
    <div className="p-2">                                                                                                     
      {/* {data.error ? (
        "Some Error Occcured"
      ) : ( */}
      <>
        <h2 className="text-center font-semibold text-[18px] font-mono text-red-600 sm:text-[20px] md:text-[20px]">
          {data?.data?.identifier} &nbsp;{" "}
          <button className="text-[20px] text-center font-semibold text-red-700">
            LTP : {socketData?.last_traded_price} &nbsp; OI PCR :{" "}
            {id == 1405 && (
              <span>
                {data?.data?.PCR?.toFixed(1)} &nbsp; COI PCR :{" "}
                {data?.data?.COIPCR?.toFixed(1)} &nbsp; RSI :{" "}
                {data?.data?.RSI_Value?.toFixed(1)} &nbsp;
              </span>
            )}
            {data?.data?.lastHighestLTP > 0 && (
              <span>Last High LTP : {data?.data?.lastHighestLTP}</span>
            )}
            &nbsp;
            {
              // (data?.data?.haveTradeOfPEBuy ||
              //   data?.data?.haveTradeOfPE ||
              //   data?.data?.haveTradeOfFUTSell) &&
              data?.data?.lastLowestLTP > 0 && (
                <span> Last Lowest LTP : {data?.data?.lastLowestLTP} </span>
              )
            }
          </button>
          &nbsp; &nbsp;
          <Button
            size="sm"
            onClick={() => setHideConfig((prev) => !prev)}
            className="text-sm md:text-md"
          >
            {hideConfig ? "Hide Config Data" : "Show Config Data"}
          </Button>
          &nbsp; &nbsp;
          <Button
            size="xs"
            className="p-1 text-[13px] md:text-[16px]"
            onClick={getHighLowLines}
          >
            High/Low line
          </Button>
          &nbsp; &nbsp;
        </h2>

        {hideConfig && (
          <>
            <div>
              <div className="flex flex-wrap font-semibold py-2  justify-start">

                {/* <p className=" text-[13px] md:text-[16px]">
                   Terminal : {data?.data?.terminal}
                </p>
                <p className="text-red-600  text-[13px] md:text-[16px]">
                  Candle :
                  {values?.interval === "minute"
                    ? "1 minute"
                    : values?.interval}
                </p> */}
                {/* <p className=" text-[13px] md:text-[16px]">
                    Identifier:
                    {data?.data?.identifier}
                  </p> */}
                {/* <p className=" text-[13px] md:text-[16px]">
                  Trade Index: {data?.data?.tradeIndex}
                </p> */}

                {/* {data?.data?.tradeIndex != 4 && data?.data?.tradeIndex != 7 && (
                  <>
                    <p className=" text-[13px] md:text-[16px]">
                      SMA1 : {data?.data?.SMA1}
                    </p>
                    <p className=" text-[13px] md:text-[16px]">
                      SMA2 : {data?.data?.SMA2}
                    </p>
                  </>
                )} */}
                <p className="text-red-500 text-[13px] md:text-[16px]">
                  {ceStopLoss && `CE Stop Loss : ${ceStopLoss?.toFixed(1)}`}
                </p>
                <p className="text-red-500 text-[13px] md:text-[16px]">
                  {peStopLoss && `PE Stop Loss : ${peStopLoss?.toFixed(1)}`}
                </p>
                {/* Here put socket Data */}
                {/* CE Buy Status */}
                <p
                  className={`${
                    getValue("haveTradeOfCE")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  CE Buy Status: {getValue("haveTradeOfCE") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* PE Buy Status */}
                <p
                  className={`${
                    getValue("haveTradeOfPE")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  PE Buy Status: {getValue("haveTradeOfPE") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* CE SELL Status */}
                <p
                  className={`${
                    getValue("haveTradeOfCEBuy")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  CE SELL Status:{" "}
                  {getValue("haveTradeOfCEBuy") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* PE SELL Status */}
           
                <p
                  className={`${
                    getValue("haveTradeOfPEBuy")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  PE SELL Status:{" "}
                  { getValue("haveTradeOfPEBuy") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* FUT Buy Status */}
                <p
                  className={`${
                    getValue("haveTradeOfFUTBuy")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  FUT Buy Status:{" "}
                  {getValue("haveTradeOfFUTBuy") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* FUT Sell Status */}
                <p
                  className={`${
                    getValue("haveTradeOfFUTSell")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  FUT Sell Status:{" "}
                  {getValue("haveTradeOfFUTSell") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                <button
                  onClick={toggleTestingMode}
                  className={`${
                    testingMode === 1
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  } px-1 border-muted-foreground rounded-sm text-[13px] md:text-[16px]`}
                >
                  {testingMode === 1 ? "Test Mode ON" : "Test Mode OFF"}
                </button>
                &nbsp;
                {id == 1405 && (
                  <button
                    onClick={openChartInNewTab}
                    className="bg-green-600 text-white px-1 border-muted-foreground rounded-sm text-[13px] md:text-[16px]"
                  >
                    PCR Chart
                  </button>
                )}
              </div>

              <div className="flex flex-wrap   font-semibold py-2  justify-start">
                <p
                  className={`${
                    getValue("haveTradeOfHedgeCE")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  CE Buy Hedge :{" "}
                  {getValue("haveTradeOfHedgeCE") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* PE Buy Hedge */}
                <p
                  className={`${
                    getValue("haveTradeOfHedgePE")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  PE Buy Hedge :{" "}
                  {getValue("haveTradeOfHedgePE") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* CE SELL Hedge */}
                <p
                  className={`${
                    getValue("haveTradeOfHedgeCESell")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  CE SELL Hedge:{" "}
                  {getValue("haveTradeOfHedgeCESell") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* PE SELL Hedge */}
                <p
                  className={`${
                    getValue("haveTradeOfHedgePESell")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  PE SELL Hedge:{" "}
                  {getValue("haveTradeOfHedgePESell") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* FUT Buy Hedge */}
                <p
                  className={`${
                    getValue("haveTradeOfHedgeFUTBuy")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  FUT Buy Hedge:{" "}
                  {getValue("haveTradeOfHedgeFUTBuy") ? "True" : "False"}
                </p>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* FUT Sell Hedge */}
                <p
                  className={`${
                    getValue("haveTradeOfHedgeFUTSell")
                      ? "text-[#dc2626] font-bold text-[13px] md:text-[16px]"
                      : "text-green-600 font-bold text-[13px] md:text-[16px]"
                  }`}
                >
                  FUT Sell Hedge:{" "}
                  {getValue("haveTradeOfHedgeFUTSell") ? "True" : "False"}
                </p>
              </div>

              {data.data.tradeIndex == 4 && (
                <div>
                  {trendLineValue && (
                    <p className="font-semibold text-[13px] md:text-[16px] ">
                      R1 :{trendLineValue?.Resistance1CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; R2 :
                      {trendLineValue.Resistance2CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; R3 :
                      {trendLineValue.Resistance3CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; R4 :
                      {trendLineValue.Resistance4CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; S1 :
                      {trendLineValue.Support1CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; S2 :
                      {trendLineValue.Support2CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; S3 :
                      {trendLineValue.Support3CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp; S4 :
                      {trendLineValue.Support4CurrPrice?.toFixed(1)}
                      &nbsp; &nbsp;
                      {trendLineValue?.zone?.CEZone?.low} --LTP Zone--
                      {trendLineValue?.zone?.CEZone?.high}
                      &nbsp; &nbsp; &nbsp; &nbsp;
                      {trendLineValue?.zone?.PEZone?.low} --LTP Zone--
                      {trendLineValue?.zone?.PEZone?.high}
                      &nbsp; &nbsp; &nbsp; &nbsp;
                      <span className="text-green-600">
                        Call Target Level :
                        {trendLineValue?.callTargetLevelPrice?.toFixed(1)}
                      </span>
                      &nbsp; &nbsp;
                      <span className="text-red-600">
                        PE Target Level :
                        {trendLineValue?.putTargetLevelPrice?.toFixed(1)}
                      </span>
                      &nbsp; &nbsp; Time :{formatDate(trendLineValue.timestamp)}
                    </p>
                  )}
                </div>
              )}
              
              {data.data.tradeIndex == 7 && (
                <div>
                  {trendLineValue && (
                    <p className="font-semibold text-[13px] md:text-[16px]">
                      Resistance :
                      {filteredData &&
                        filteredData?.[0]?.resistance?.toFixed(1)}
                      &nbsp; &nbsp; Support :
                      {filteredData && filteredData?.[0]?.support?.toFixed(1)}
                      &nbsp; &nbsp; Call Target :
                      {filteredData &&
                        filteredData?.[0]?.callTarget?.toFixed(1)}
                      &nbsp; &nbsp; Put Target :
                      {filteredData && filteredData?.[0]?.putTarget?.toFixed(1)}
                      &nbsp; &nbsp;
                      {trendLineValue?.dataForIndex7?.CESellLinePrice > 0 && (
                        <span>
                          CE Buy TrendLine Price :
                          {trendLineValue?.dataForIndex7?.CESellLinePrice?.toFixed(
                            1
                          )}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      {trendLineValue?.dataForIndex7?.PESellLinePrice > 0 && (
                        <span>
                          PE Buy TrendLine Price :
                          {trendLineValue?.dataForIndex7?.PESellLinePrice?.toFixed(
                            1
                          )}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      {trendLineValue?.dataForIndex7?.PEBuyLinePrice > 0 && (
                        <span>
                          PE Sell TrendLine Price :
                          {trendLineValue?.dataForIndex7?.PEBuyLinePrice?.toFixed(
                            1
                          )}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      {trendLineValue?.dataForIndex7?.CEBuyLinePrice > 0 && (
                        <span>
                          CE Sell TrendLine Price :
                          {trendLineValue?.dataForIndex7?.CEBuyLinePrice?.toFixed(
                            1
                          )}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      {trendLineValue?.dataForIndex7?.FUTBuyLinePrice > 0 && (
                        <span>
                          FUT Sell Price :
                          {trendLineValue?.dataForIndex7?.FUTBuyLinePrice?.toFixed(
                            1
                          )}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      {trendLineValue?.dataForIndex7?.FUTSellLinePrice > 0 && (
                        <span>
                          FUT Buy Price :
                          {trendLineValue?.dataForIndex7?.FUTSellLinePrice?.toFixed(
                            1
                          )}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      {filteredData?.[0]?.CEStopLossForIndex7 > 0 ? (
                        <span>
                          CE Buy Stop Loss :
                          {filteredData?.[0]?.CEStopLossForIndex7?.toFixed(1)}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      &nbsp; &nbsp;
                      {filteredData?.[0]?.CEStopLossForIndex17 > 0 ? (
                        <span>
                          CE Sell Stop Loss :
                          {filteredData?.[0]?.CEStopLossForIndex17?.toFixed(1)}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      &nbsp; &nbsp;
                      {filteredData?.[0]?.PEStopLossForIndex7 > 0 ? (
                        <span>
                          PE Buy Stop Loss :
                          {filteredData?.[0]?.PEStopLossForIndex7?.toFixed(1)}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      &nbsp; &nbsp;
                      {filteredData?.[0]?.PEStopLossForIndex17 > 0 ? (
                        <span>
                          PE Sell Stop Loss :
                          {filteredData?.[0]?.PEStopLossForIndex17?.toFixed(1)}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      &nbsp; &nbsp;
                      {filteredData?.[0]?.FUTStopLossForIndex7 > 0 ? (
                        <span>
                          FUT Buy Stop Loss :
                          {filteredData?.[0]?.FUTStopLossForIndex7?.toFixed(1)}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      &nbsp; &nbsp;
                      {filteredData?.[0]?.FUTStopLossForIndex17 > 0 ? (
                        <span>
                          FUT Sell Stop Loss :
                          {filteredData?.[0]?.FUTStopLossForIndex17?.toFixed(1)}
                        </span>
                      ) : (
                        <span></span>
                      )}
                      {/* Time : {formatDate(trendLineValue?.timestamp)} */}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between flex-wrap gap-1 md:gap-y-1">
                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      pivot: !p.pivot,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.pivot ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
                  }`}
                >
                  Pivot Line
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      candle: !p.candle,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.candle
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Candle
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      dynamicExitValue: !p.dynamicExitValue,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.dynamicExitValue
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  D_Exit Value
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      Last_Highest_LTP: !p.Last_Highest_LTP,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.Last_Highest_LTP
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Last High LTP
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      rangeBoundLine: !p.rangeBoundLine,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.rangeBoundLine
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Range Bound
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      movingAvg: !p.movingAvg,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.movingAvg
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Moving Avg
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      volume: !p.volume,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.volume
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  volume
                </button>
                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      bollingerBand: !p.bollingerBand,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.bollingerBand
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Bollinger 
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      monthlyHigh: !p.monthlyHigh,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.monthlyHigh
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Monthly
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      weekly: !p.weekly,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.weekly
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Weakly
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      daily: !p.daily,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.daily ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
                  }`}
                >
                  Daily
                </button>

                {/* <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      fourHourly: !p.fourHourly,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.fourHourly
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Four Hourly
                </button> */}

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      hourly: !p.hourly,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.hourly
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Hourly
                </button>

                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      toolTip: !p.toolTip,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.toolTip
                      ? "bg-blue-500 text-gray-100"
                      : "bg-gray-300 "
                  }`}
                >
                  Tool Tip
                </button>
                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      rsi: !p.rsi,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.rsi ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
                  }`}
                >
                  RSI
                </button>
                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      atr: !p.atr,
                    }))
                  }
                  className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.atr ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
                  }`}
                >
                  ATR
                </button>
                {/* <button
                    onClick={()=>navigate("/future/pcrchart")}
                    className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                      
                         "bg-green-500 text-gray-100"
                        
                    }`}
                  >
                    PCR Chart
                  </button> */}

                {data?.data?.index == 4 && (
                  <>
                    <button
                      onClick={setCETrendLine}
                      className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                        showRow.ceTrendLine
                          ? "bg-blue-500 text-gray-100"
                          : "bg-gray-300"
                      }`}
                    >
                      CE TrendLine
                    </button>

                    <button
                      onClick={setPETrendLine}
                      className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                        showRow.peTrendLine
                          ? "bg-blue-500 text-gray-100"
                          : "bg-gray-300"
                      }`}
                    >
                      PE TrendLine
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        equidistantChannel: !p.equidistantChannel,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.equidistantChannel
                        ? "bg-black text-gray-100"
                        : "bg-white "
                    }`}
                  >
                    <div className="flex  items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 28 28"
                        width="28"
                        height="28"
                      >
                        <g fill="currentColor" fill-rule="nonzero">
                          <path d="M8.354 18.354l10-10-.707-.707-10 10zM12.354 25.354l5-5-.707-.707-5 5z"></path>
                          <path d="M20.354 17.354l5-5-.707-.707-5 5z"></path>
                          <path d="M19.5 8c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM18.5 20c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                        </g>
                      </svg>
                      <span>Equidistant Channel</span>
                    </div>
                  </button>
                </div>
              </div> */}

            <div className="flex flex-wrap items-center mt-2 mb-1 space-x-3">
              {/* Date Input */}
              <div className="flex flex-col w-full sm:w-auto">
                <Label>Date</Label>
                <Input
                  type="date"
                  placeholder="date"
                  className="w-full sm:w-[140px] border-black border-[1px] rounded-md"
                  onChange={handleChange}
                  name="date"
                  max={today}
                />
              </div>

              {/* Candle Type Select */}
              <div className="flex flex-col w-full sm:w-auto">
                <Label>Candle Type</Label>
                <Select
                  value={values.candleType}
                  name="candleType"
                  onValueChange={(value) => handleSelect("candleType", value)}
                >
                  <SelectTrigger className="w-full sm:w-[120px] mt-1 border-zinc-500">
                    <SelectValue>{values.candleType}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Candle Type</SelectLabel>
                      {["HeikinAshi", "Normal"]?.map((suggestion) => (
                        <SelectItem key={suggestion} value={suggestion}>
                          {suggestion}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Interval Select */}
              <div className="flex flex-col w-full sm:w-auto">
                <Label>Interval</Label>
                <Select
                  value={values.interval}
                  onValueChange={(value) => {
                    handleSelect("interval", value);
                  }}
                  // disabled={
                  //   data?.data?.haveTradeOfCE ||
                  //   data?.data?.haveTradeOfPE ||
                  //   data?.data?.haveTradeOfCEBuy ||
                  //   data?.data?.haveTradeOfPEBuy ||
                  //   data?.data?.haveTradeOfFUTSell ||
                  //   data?.data?.haveTradeOfFUTBuy
                  // }
                >
                  <SelectTrigger className="w-full sm:w-[150px] mt-1 border-zinc-500">
                    <SelectValue>{values?.interval}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Interval</SelectLabel>
                      {[
                        { label: "1 minute", value: "ONE_MINUTE" },
                        { label: "3 minute", value: "THREE_MINUTE" },
                        { label: "5 minute", value: "FIVE_MINUTE" },
                        { label: "15 minute", value: "FIFTEEN_MINUTE" },
                        { label: "30 minute", value: "THIRTY_MINUTE" },
                        { label: "1 hour", value: "ONE_HOUR" },
                        { label: "1 day", value: "ONE_DAY" },
                      ]?.map((suggestion) => (
                        <SelectItem
                          key={suggestion.value}
                          value={suggestion.value}
                        >
                          {suggestion.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>


              {/* WMA Input */}
              {/* <div className="flex flex-col w-full sm:w-auto">
                <Label>WMA</Label>
                <Input
                  name="WMA"
                  onChange={handleChange}
                  value={values.WMA}
                  className="mt-1"
                  type="number"
                  min={0}
                />
              </div> */}

              {/* Trendline Status */}
              {/* <div className="flex flex-col w-full sm:w-auto">
                <Label>Trendline Status</Label>
                <Select
                  value={values.trendLineActive}
                  name="trendLineActive"
                  onValueChange={(value) =>
                    handleSelect("trendLineActive", value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[130px] mt-1 border-zinc-500">
                    <SelectValue>
                      {values.trendLineActive ? "Active" : "Deactive"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>TrendLine Status</SelectLabel>
                      {[
                        { label: "Active", value: true },
                        { label: "Deactive", value: false },
                      ]?.map((suggestion) => (
                        <SelectItem
                          key={suggestion.value}
                          value={suggestion.value}
                        >
                          {suggestion.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Buttons Section */}
        
              <div className="flex items-center flex-wrap space-x-2 mt-2">
                {/* Submit Button */}
                <Button onClick={handleSubmit} size="sm">
                  Submit
                </Button>

                <Button
                  onClick={() => onOpen("child-modal", { symbol: "CE" })}
                  className="px-5 py-2 rounded-md border-2"
                  size="sm"
                >
                  Add Trade CE
                </Button>
                <Button
                  onClick={() => onOpen("child-modal", { symbol: "PE" })}
                  className="px-5 py-2 rounded-md border-2"
                  size="sm"
                >
                  Add Trade PE
                </Button>

                {/* Fibonacci Button */}
                <>
                  {/* <button
                    onClick={() =>
                      setShowRow((prev) => ({
                        ...prev,
                        fibonacci: !prev.fibonacci,
                      }))
                    }
                    className={`px-2 py-1 text-xs font-semibold rounded-md duration-300 ${
                      showRow.fibonacci ? "bg-black text-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        width="28"
                        height="28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="currentColor" fillRule="nonzero">
                          <path d="M3 5h22v-1h-22z"></path>
                          <path d="M3 17h22v-1h-22z"></path>
                          <path d="M3 11h19.5v-1h-19.5z"></path>
                          <path d="M5.5 23h19.5v-1h-19.5z"></path>
                          <path d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z"></path>
                        </g>
                      </svg>
                      <span>Fibonacci Retracement</span>
                    </div>
                  </button>

               
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        equidistantChannel: !p.equidistantChannel,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.equidistantChannel
                        ? "bg-black text-gray-100"
                        : "bg-white "
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 28 28"
                        width="28"
                        height="28"
                      >
                        <g fill="currentColor" fillRule="nonzero">
                          <path d="M8.354 18.354l10-10-.707-.707-10 10zM12.354 25.354l5-5-.707-.707-5 5z"></path>
                          <path d="M20.354 17.354l5-5-.707-.707-5 5z"></path>
                          <path d="M19.5 8c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                        </g>
                      </svg>
                      <span>Equidistant Channel</span>
                    </div>
                  </button> */}
                  {data?.data?.tradeIndex == 4 && (
                    <button
                      onClick={() =>
                        setShowRow((p) => ({
                          ...p,
                          trendLine: true,
                          alertLine: false, // Ensure alertLine is false when trendLine is true
                          entryLine: false,
                        }))
                      }
                      className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                        showRow.trendLine
                          ? "bg-black text-gray-100"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className="icon-KTgbfaP5"
                          role="img"
                          aria-hidden="true"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 28 28"
                            width="28"
                            height="28"
                          >
                            <g fill="currentColor" fillRule="nonzero">
                              <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
                              <path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                            </g>
                          </svg>
                        </span>
                        <span>Trendline</span>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setShowRow((prev) => ({
                        ...prev,
                        fibonacci: !prev.fibonacci,
                      }))
                    }
                    className={` px-2 py-1 text-xs font-semibold rounded-md duration-300 ${
                      showRow.fibonacci ? "bg-black text-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        width="28"
                        height="28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="currentColor" fillRule="nonzero">
                          <path d="M3 5h22v-1h-22z"></path>
                          <path d="M3 17h22v-1h-22z"></path>
                          <path d="M3 11h19.5v-1h-19.5z"></path>
                          <path d="M5.5 23h19.5v-1h-19.5z"></path>
                          <path d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z"></path>
                        </g>
                      </svg>
                      <span>Fibonacci Retracement</span>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        trendLine: false, // Ensure trendLine is false when alertLine is true
                        alertLine: !p.alertLine,
                        // entryLine : false,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.alertLine ? "bg-black text-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className="icon-KTgbfaP5"
                        role="img"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 28 28"
                          width="28"
                          height="28"
                        >
                          <g fill="currentColor" fillRule="nonzero">
                            <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
                            <path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                          </g>
                        </svg>
                      </span>
                      <span>Entry Line 2</span>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        trendLine: false, // Ensure trendLine is false when alertLine is true
                        bearishLine: false,
                        entryLine: !p.entryLine,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.entryLine ? "bg-black text-gray-100" : "bg-white"
                    }`}
                    // disabled={checkButtonBear}
                  >
                    <div className="flex items-center">
                      <span
                        className="icon-KTgbfaP5"
                        role="img"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 28 28"
                          width="28"
                          height="28"
                        >
                          <g fill="currentColor" fillRule="nonzero">
                            <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
                            <path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                          </g>
                        </svg>
                      </span>
                      <span>Entry Line 1</span>
                    </div>
                  </button>
                  <div className="flex flex-col w-full sm:w-auto">
                <Label>TrendLine Date</Label>
                <Input
                  type="date"
                  className="border-[1px] border-black rounded-sm"
                  min={today} // Set today's date as the minimum
                  onChange={(e) => setBuyTrendLineDate((e.target.value))}
                  value={
                    buyTrendLineDate ? buyTrendLineDate?.split("T")?.[0] : ""
                  }
                />
              </div>
              <div>
                <Button onClick={handleSubmit2} size="sm">Submit</Button>
              </div>

                  {/* <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        entryLine : false, // Ensure trendLine is false when alertLine is true
                        // alertLine: false,
                        bearishLine: !p.bearishLine,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.bearishLine ? "bg-black text-gray-100" : "bg-white"
                    }`}
                    // disabled={checkButtonBull}
                  >
                    <div className="flex items-center">

                      <span
                        className="icon-KTgbfaP5"
                        role="img"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 28 28"
                          width="28"
                          height="28"
                        >
                          <g fill="currentColor" fillRule="nonzero">
                            <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
                            <path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                          </g>
                        </svg>
                      </span>
                      <span>Bearish Line</span>
                    </div>
                  </button> */}

                </>
              </div>
            </div>
          </>
        )}



        {apiData?.length > 0 && (
          <div className="w-full h-auto flex justify-center">
            <CandleChart
              data={apiData}
              getChartData={getChartData}
              handleCreateTrendLines={handleCreateTrendLines}
              master={data?.data}
              ratio={1}
              width={width + 30} // Adjust width dynamically with some margin
              showRow={showRow}
              theme={theme}
              intractiveData={intractiveData}
              height={height ? (height * 8) / 10 : "60vh"} // Responsive height
              chartType={chartType}
              trends3={trends3}
              setTrends3={setTrends3}
              setAlert3={setAlert3}
              alert3={alert3}
              setEntryLine={setEntryLine} 
              entryLine={entryLine}
           
              setBearishLine={setBearishLine}
              bearishLine={bearishLine}
              id={id}
              buyTrendLineDate={buyTrendLineDate}
            />
          </div>
        )}
      </>
      {/* // )} */}
    </div>
  );
};

export const HelpingPageLayout = () => {
  return (
    // <LiveSocketProvider>
    <HelpingChart />
    // </LiveSocketProvider>
  );
};

/*
Application No : GROWW60832142  
Pan : EEYPB2498H
DPID: 12088701
BOID: 12088701443036591

*/
