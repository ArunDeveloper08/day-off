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
import { useLocation } from "react-router-dom";
import CandleChart from "../components/LiveGraph";

import "react-toastify/dist/ReactToastify.css";
import { groupBy } from "./dashboard";

import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

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

const HelpingChart = () => {
  const { theme, setTheme } = useTheme();
  const intervalRef = useRef(null);
  const debounceRef = useRef(null); // Add ref for debouncing
  const [intractiveData, setIntractiveData] = useState([]);
  const [master, setMaster] = useState("");
  const [ceTargetValue, setCeTargetValue] = useState(null);
  const [peTargetValue, setPeTargetValue] = useState(null);
  const [ceStopLoss, setCeStopLoss] = useState(null);
  const [peStopLoss, setPeStopLoss] = useState(null);
  const [chartType, setChartType] = useState("canvas");
  const [trends3, setTrends3] = useState([]);
  const [alert3, setAlert3] = useState([]);
  const [entryLine, setEntryLine] = useState([]);
  useEffect(() => {
    setTheme("light");
  }, []);
  const location = useLocation();
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
    WMA: null,
    interval: null,
    candleType: null,
    trendLineActive: null,
    rangeBoundPercent: null,
  });

  useEffect(() => {
    if (data?.data?.identifier) {
      document.title = ` Helping:${data?.data?.identifier}`;
    }
  }, [data?.data?.identifier]);

  useEffect(() => {
    if (data.data) {
      setValues({
        date: data.data.masterChartPrevDate,
        WMA: data.data.WMA,
        interval: data.data.interval,
        candleType: data.data.candleType,
        rangeBoundPercent: data.data.rangeBoundPercent,
        trendLineActive: data.data.trendLineActive,
      });
    }
  }, [data]);

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
    trendLine: true,
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
    alertLine: false,
    entryLine: false,
  });
  const [hideConfig, setHideConfig] = useState(true);
  const [supportTrendLine, setSupportTrendLine] = useState([]);
  const [resistanceTrendLine, setResistanceTrendLine] = useState([]);
  // const [testingMode, setTestingMode] = useState(() => {
  //   const storedMode = localStorage.getItem(`testingMode_${id}`);
  //   return storedMode === "true";
  // });

  const [testingMode, setTestingMode] = useState("");
  const hasInitializedTrends = useRef(false);

  if (!id) return null;

  const getTradeConfig = async () => {
    setData((p) => ({ ...p, loading: true }));
    try {
      const { data } = await axios.get(
        `${BASE_URL_OVERALL}/config/get?id=${id}`
      );
      setData((p) => ({ ...p, data: data.data }));
    } catch (error) {
      setData((p) => ({
        ...p,
        error: error?.response?.data.message || error?.message,
      }));
    } finally {
      setData((p) => ({ ...p, loading: false }));
    }
  };

  const getChartData = () => {
    // if (debounceRef.current) {
    //   clearTimeout(debounceRef.current);
    // }
    // debounceRef.current = setTimeout(() => {
    axios
      .post(`${BASE_URL_OVERALL}/chart/helper?id=${id}`)
      .then((res) => {
        setApiData(res.data.data);
        setCeTargetValue(res.data.data?.[0]?.CETargetLevelValue);
        setPeTargetValue(res.data.data?.[0]?.PETargetLevelValue);
        setCeStopLoss(res.data.data?.[0]?.CEStopLoss);
        setPeStopLoss(res.data.data?.[0]?.PEStopLoss);
        setIntractiveData(res.data);
        setAlert3(res.data?.alertLine);
        setEntryLine(res.data?.buyTrendLines);

        if (!hasInitializedTrends.current) {
          console.log("Setting trends for the first time");
          setTrends3(res.data.trendLines); // Set trends3 for the first time
          hasInitializedTrends.current = true; // Mark as initialized
        }
      })

      .catch((err) => {
        console.log(err);
        // alert(err?.response?.data?.message);
      });
    // }, 1000);
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

  useEffect(() => {
    getChartData();
    // if (!values) return;
    const interval = setInterval(getChartData, 1 * 100 * 1000);
    //  intervalRef.current = interval;

    return () => clearInterval(interval);
  }, []);

  const memoizedTrendLines = useMemo(() => {
    let supports = [];
    let resistances = [];

    intractiveData?.trendLines?.forEach((trendLine) => {
      const stroke = trendLine.appearance.stroke;

      if (stroke === "green" || stroke === "violet") {
        resistances.push(trendLine);
      } else if (stroke === "red" || stroke === "orange") {
        supports.push(trendLine);
      }
    });

    return { supports, resistances };
  }, [intractiveData.trendLines]);

  useEffect(() => {
    setSupportTrendLine(memoizedTrendLines.supports);
    setResistanceTrendLine(memoizedTrendLines.resistances);
  }, [memoizedTrendLines]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        getChartData();
        intervalRef.current = setInterval(getChartData, 10 * 1000);
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

    socket?.on("getLiveData", (socketdata) => {
      // console.log(socketdata)
      // Check if token is a string before applying replace
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

  const handleSelect = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const today = new Date().toISOString().split("T")[0];
  const getHighLowLines = async () => {
    try {
      await axios.get(`${BASE_URL_OVERALL}/chart/makeHighLow?id=${id}`);
      alert("High Low Reset !");
      getChartData();
    } catch (error) {
      alert("Some error Occured");
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
    const sendDataToAPI = async (data) => {
      try {
        await axios.put(`${BASE_URL_OVERALL}/config/edit`, { id, ...data });
        alert("Successfully saved.");
        await getChartData();
        await getTrendLinesValue();
      } catch (err) {
        console.error("Error saving data:", err);
      }
    };

    // Check if any trend line is incomplete
    const incompleteLineExists = trendline?.some(
      (line) => line?.endTime === undefined && line?.startTime
    );

    // Handle validations for trendline
    if (showRow.trendLine) {
      if (trendline?.length < 10) {
        alert(
          `You have only ${trendline.length} trend lines. Please add ${
            10 - trendline.length
          } more trend lines.`
        );

        if (incompleteLineExists) {
          alert(
            "Please ensure all trend lines remain inside the chart. The endpoint cannot be outside the chart."
          );
        }
        return; // Exit early if validations fail
      }

      // Send only trendLine data
      return sendDataToAPI({
        trendLines: trendline,
        textLabel: JSON.stringify(textList1),
      });
    }

    // Handle alertLine saving
    if (showRow.alertLine) {
      return sendDataToAPI({ alertLine: alert3 });
    }

    // Handle entryLine saving
    if (showRow.entryLine) {
      return sendDataToAPI({ buyTrendLines: entryLine });
    }

    alert("No valid data to save.");
  };

  const handleSubmit = () => {
    axios
      .put(`${BASE_URL_OVERALL}/config/editMaster?id=${id}`, { ...values })
      .then((res) => {
        // setApiData(res.data.data);
        // setIntractiveData(res.data);
        alert("successfully Updated");
        getChartData();
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message);
      });
  };

  const [trendLineValue, setTrendLineValue] = useState([]);

  useEffect(() => {
    if (!id) return;
    getTrendLinesValue();
    const interval = setInterval(getTrendLinesValue, 12 * 1000);
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

  // console.log("entryLine", entryLine);
  //  console.log("CEZone",trendLineValue.zone.CEZone.low)
  // console.log("socketdata",socketData)

  return (
    <div className="p-2">
      {data.error ? (
        "Some Error Occcured"
      ) : (
        <>
          <h2 className="text-center font-semibold text-[18px] font-mono text-red-600 sm:text-[20px] md:text-[24px]">
            Angel-One &nbsp;{" "}
            <button className="text-md text-center font-semibold text-red-700">
              LTP : {socketData?.last_traded_price} &nbsp; Pivot :{" "}
              {socketData?.pivotValue?.[0]?.pivotValue?.toFixed(2)} &nbsp;
            </button>
            &nbsp; &nbsp;
            <Button
              size="sm"
              onClick={() => setHideConfig((prev) => !prev)}
              className="text-sm md:text-md"
            >
              {hideConfig ? "Hide Config Data" : "Show Config Data"}
            </Button>
          </h2>

          {hideConfig && (
            <>
              <div>
                <div className="flex flex-wrap gap-x-5 font-semibold py-2">
                  <p className=" text-[13px] md:text-[16px]">
                    Trade Terminal : {data?.data?.terminal}
                  </p>
                  <p className="text-red-600  text-[13px] md:text-[16px]">
                    Candle :
                    {values?.interval === "minute"
                      ? "1 minute"
                      : values?.interval}
                  </p>
                  <p className=" text-[13px] md:text-[16px]">
                    Identifier:
                    {data?.data?.identifier}
                  </p>
                  <p className=" text-[13px] md:text-[16px]">
                    Trade Index: {data?.data?.tradeIndex}
                  </p>
                  {data?.data?.tradeIndex != 4 && (
                    <>
                      <p className=" text-[13px] md:text-[16px]">
                        SMA1 : {data?.data?.SMA1}
                      </p>
                      <p className=" text-[13px] md:text-[16px]">
                        SMA2 : {data?.data?.SMA2}
                      </p>
                    </>
                  )}
                  <p className="text-red-500 text-[13px] md:text-[16px]">
                    {ceStopLoss && `CE Stop Loss : ${ceStopLoss?.toFixed(1)}`}
                  </p>
                  <p className="text-red-500 text-[13px] md:text-[16px]">
                    {peStopLoss && `PE Stop Loss : ${peStopLoss?.toFixed(1)}`}
                  </p>
                  <p
                    className={`${
                      data.data.haveTradeOfCE
                        ? "text-red-600 text-[13px] md:text-[16px]"
                        : "text-green-600 text-[13px] md:text-[16px]"
                    }`}
                  >
                    Call Trade Status :
                    {data.data.haveTradeOfCE ? "True" : "False"}
                  </p>
                  &nbsp;
                  <p
                    className={`${
                      data.data.haveTradeOfPE
                        ? "text-red-600 text-[13px] md:text-[16px]"
                        : "text-green-600 text-[13px] md:text-[16px]"
                    }`}
                  >
                    Put Trade Status:
                    {data.data.haveTradeOfPE ? "True" : "False"}
                  </p>
                  <Button
                    size="xs"
                    className="p-1 text-[13px] md:text-[16px]"
                    onClick={getHighLowLines}
                  >
                    High/Low line
                  </Button>
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
                </div>

                {data.data.tradeIndex == 4 && (
                  <div>
                    {trendLineValue && (
                      <p
                        className="font-semibold text-[13px] md:text-[16px]
                    
                  
                    "
                      >
                        R1 :{trendLineValue.Resistance1CurrPrice?.toFixed(1)}
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
                        &nbsp; &nbsp; CE Zone :
                        {trendLineValue?.zone?.CEZone?.low}-
                        {trendLineValue?.zone?.CEZone?.high}
                        &nbsp; &nbsp; PE Zone :
                        {trendLineValue?.zone?.PEZone?.low}-
                        {trendLineValue?.zone?.PEZone?.high}
                        &nbsp; &nbsp;
                        <span className="text-green-600">
                          Call Target Level :
                          {trendLineValue?.callTargetLevelPrice?.toFixed(1)}
                        </span>
                        &nbsp; &nbsp;
                        <span className="text-red-600">
                          PE Target Level :
                          {trendLineValue?.putTargetLevelPrice?.toFixed(1)}
                        </span>
                        &nbsp; &nbsp; Time :
                        {formatDate(trendLineValue.timestamp)}
                      </p>
                    )}
                  </div>
                )}

                {data.data?.tradeIndex == 7 && (
                  <div>
                    <p></p>
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
                      showRow.pivot
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
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
                      showRow.daily
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Daily
                  </button>

                  <button
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
                  </button>

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
                </div>
              </div>

              {/* <div className="flex flex-wrap items-center mt-2 mb-1 space-x-3">
            

                <div className="flex flex-col">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    placeholder="date"
                    className="w-[150px] border-black border-[1px] rounded-md"
                    onChange={handleChange}
                    name="date"
                    max={today}
                  />
                </div>

                
                <div className="flex flex-col">
                  <Label>Candle Type</Label>
                  <Select
                    value={values.candleType}
                    name="candleType"
                    onValueChange={(value) => handleSelect("candleType", value)}
                  >
                    <SelectTrigger className="w-[120px] mt-1 border-zinc-500">
                      <SelectValue>{values.candleType}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Candle Type</SelectLabel>
                        {["HeikinAshi", "Normal"].map((suggestion) => (
                          <SelectItem key={suggestion} value={suggestion}>
                            {suggestion}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

           
                <div className="flex flex-col">
                  <Label>Interval</Label>
                  <Select
                    value={values.interval}
                    name="terminal"
                    onValueChange={(value) => handleSelect("interval", value)}
                  >
                    <SelectTrigger className="w-[150px] mt-1 border-zinc-500">
                      <SelectValue>{values.interval}</SelectValue>
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
                        ].map((suggestion) => (
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

             
                <div className="flex flex-col w-[120px]">
                  <Label>WMA</Label>
                  <Input
                    name="WMA"
                    onChange={handleChange}
                    value={values.WMA}
                    className="mt-1"
                    type="number"
                    min={0}
                  />
                </div>

             
                <div className="flex flex-col">
                  <Label>Trendline Status</Label>
                  <Select
                    value={values.trendLineActive}
                    name="trendLineActive"
                    onValueChange={(value) => {
                      handleSelect("trendLineActive", value);
                    }}
                  >
                    <SelectTrigger className="w-[130px] mt-1 border-zinc-500">
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
                        ].map((suggestion) => (
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
              
                <div className="flex items-center space-x-2 mt-2">
                
                  <Button onClick={handleSubmit} size="sm">
                    Submit
                  </Button>

             
                  <button
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

           
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        trendLine: !p.trendLine,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.trendLine ? "bg-black text-gray-100" : "bg-white "
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
                          <g fill="currentColor" fill-rule="nonzero">
                            <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
                            <path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
                          </g>
                        </svg>
                      </span>
                      <span>Trendline</span>
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
                        {["HeikinAshi", "Normal"].map((suggestion) => (
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
                    name="terminal"
                    onValueChange={(value) => handleSelect("interval", value)}
                  >
                    <SelectTrigger className="w-full sm:w-[150px] mt-1 border-zinc-500">
                      <SelectValue>{values.interval}</SelectValue>
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
                        ].map((suggestion) => (
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
                <div className="flex flex-col w-full sm:w-auto">
                  <Label>WMA</Label>
                  <Input
                    name="WMA"
                    onChange={handleChange}
                    value={values.WMA}
                    className="mt-1"
                    type="number"
                    min={0}
                  />
                </div>

                {/* Trendline Status */}
                <div className="flex flex-col w-full sm:w-auto">
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
                        ].map((suggestion) => (
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

                {/* Buttons Section */}
                <div className="flex items-center flex-wrap space-x-2 mt-2">
                  {/* Submit Button */}
                  <Button onClick={handleSubmit} size="sm">
                    Submit
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
                    {/* 
                    <button
                      onClick={() =>
                        setShowRow((p) => ({
                          ...p,
                          trendLine: false, // Ensure trendLine is false when alertLine is true
                          alertLine: true,
                          entryLine : false,
                        }))
                      }
                      className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                        showRow.alertLine
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
                        <span>Alert Line</span>
                      </div>
                    </button> */}
                    <button
                      onClick={() =>
                        setShowRow((p) => ({
                          ...p,
                          trendLine: false, // Ensure trendLine is false when alertLine is true
                          alertLine: false,
                          entryLine: true,
                        }))
                      }
                      className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                        showRow.entryLine
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
                        <span>Entry Line</span>
                      </div>
                    </button>
                  </>
                </div>
              </div>
            </>
          )}

          {/* {apiData?.length > 0 && (
            <CandleChart
              data={apiData}
              handleCreateTrendLines={handleCreateTrendLines}
              // getMoreData={() => {}}
              master={data?.data}
              ratio={1}
              width={width + 150}
              showRow={showRow}
              theme={theme}
              // xExtents={xExtents}
              intractiveData={intractiveData}
              height={(height * 8) / 10}
              chartType={chartType}
              trends3={trends3}
              setTrends3={setTrends3}
            />
          )} */}
          {apiData?.length > 0 && (
            <div className="w-full h-auto flex justify-center">
              <CandleChart
                data={apiData}
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
              />
            </div>
          )}
        </>
      )}
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
