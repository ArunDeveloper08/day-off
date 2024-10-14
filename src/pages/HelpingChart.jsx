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
  let width = useMemo(() => window.screen.width, []);
  let height = useMemo(() => window.screen.height, []);
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

        if (!hasInitializedTrends.current) {
          console.log("Setting trends for the first time");
          setTrends3(res.data.trendLines); // Set trends3 for the first time
          hasInitializedTrends.current = true; // Mark as initialized
        }
      })

      .catch((err) => {
        console.log(err);
        alert(err?.response?.data?.message);
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
    const interval = setInterval(getChartData, 12 * 1000);
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
      }
    });

    return () => {
      socket?.off("getLiveData"); // Clean up the event listener when the component unmounts
    };
  }, [socket, data, isConnected]);

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
    retracements3,
    channels1
  ) => {
    // if (trendline?.some(line => line?.endTime === undefined && line?.startTime)) {
    // return alert(
    //   "Please ensure the TrendLine remains inside the chart. The TrendLine's endpoint should not go outside the chart"
    // );
    // }

    const textLabel = JSON.stringify(textList1);
    for (let i = 0; i <= 9; i++) {
      if (trendline[i]?.endTime === undefined && trendline[i]?.startTime) {
        return alert(
          "Please ensure the TrendLine remains inside the chart. The TrendLine's endpoint should not go outside the chart"
        );
      }
    }

    try {
      await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id,
        trendLines: trendline,
        textLabel: textLabel,
        retracements: retracements3,
        channels: channels1,
      });
      await getChartData();
      await getTrendLinesValue();
      alert("successfully Updated TrendLines");
    } catch (err) {
      console.error(err);
    }
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

  const getTestMode =()=>{
    axios
      .get(`${BASE_URL_OVERALL}/config/getMasterTestMode?id=${id}`)
      .then((res) => {
   
        setTestingMode(res?.data?.data?.[0]?.testMode);
      })
      .catch((err) => {
        console.log(err);
      });
  }
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

//  console.log("CEZone",trendLineValue.zone.CEZone.low)
  

  return (
    <div>
      {data.error ? (
        "Some Error Occcured"
      ) : (
        <>
          <h2 className=" text-center font-semibold text-[18px] font-mono text-red-600">
            Angel-One (Helping Chart) &nbsp;{" "}
            <button className="text-md text-center font-semibold text-red-700">
              LTP : {socketData?.last_traded_price} &nbsp;
              {/* Call Target Level :
              {ceTargetValue
                ? ceTargetValue?.toFixed(1)
                : (
                    (data?.data?.callTargetLevel *
                      socketData?.last_traded_price) /
                    100
                  )?.toFixed(1)}{" "}
              &nbsp; Put Target Level :
              {peTargetValue
                ? peTargetValue?.toFixed(1)
                : (
                    (data?.data?.putTargetLevel *
                      socketData?.last_traded_price) /
                    100
                  )?.toFixed(1)} */}
            </button>
            &nbsp; &nbsp;
            <Button size="sm" onClick={() => setHideConfig((prev) => !prev)}>
              {hideConfig ? "Hide Config Data" : "Show Config Data"}
            </Button>
          </h2>

          {hideConfig && (
            <>
              <div>
                <div className="flex flex-wrap gap-x-5 font-semibold py-2">
                  <p>Trade Terminal : {data?.data?.terminal}</p>
                  <p className="text-red-600">
                    Candle :
                    {values?.interval === "minute"
                      ? "1 minute"
                      : values?.interval}
                  </p>
                  <p>
                    Identifier:
                    {data?.data?.identifier}
                  </p>
                  <p>Trade Index: {data?.data?.tradeIndex}</p>
                  {/* 
                  <p>D_Exit : {data?.data?.dynamicExitValue?.toFixed(2)}</p>
                  <p>D_Entry : {data?.data?.tradeEntryPercent?.toFixed(2)}</p>
                  <p className="text-[14px]">
                    Range Bound: {data?.data?.rangeBoundPercent} %
                  </p> */}
                  {/* <p className="text-[14px]">
                  Range Bound2: {data?.data?.rangeBoundPercent2} %
                </p> */}
                  {data?.data?.tradeIndex != 4 && (
                    <>
                      <p>SMA1 : {data?.data?.SMA1}</p>
                      <p>SMA2 : {data?.data?.SMA2}</p>
                    </>
                  )}
                  <p className="text-red-500">
                    {ceStopLoss && `CE Stop Loss : ${ceStopLoss?.toFixed(1)}`}
                  </p>
                  <p className="text-red-500">
                    {peStopLoss && `PE Stop Loss : ${peStopLoss?.toFixed(1)}`}
                  </p>
                  <p
                    className={`${
                      data.data.haveTradeOfCE
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    Call Trade Status :
                    {data.data.haveTradeOfCE ? "True" : "False"}
                  </p>
                  &nbsp;
                  <p
                    className={`${
                      data.data.haveTradeOfPE
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    Put Trade Status:
                    {data.data.haveTradeOfPE ? "True" : "False"}
                  </p>
                  <Button size="xs" className="p-1" onClick={getHighLowLines}>
                    High/Low line
                  </Button>
                  <button
                    onClick={toggleTestingMode}
                    className={`${
                      testingMode === 1
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white"
                    } px-1 border-muted-foreground rounded-sm`}
                  >
                    {testingMode === 1 ? "Test Mode ON" : "Test Mode OFF"}
                  </button>
                </div>
                {(trendLineValue  ) && (
                  <div>
                    <p className="font-semibold">
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
                      {trendLineValue?.zone?.CEZone?.low}-{trendLineValue?.zone?.CEZone?.high}
                      &nbsp; &nbsp; PE Zone :
                      {trendLineValue?.zone?.PEZone?.low}-{trendLineValue?.zone?.PEZone?.high}


                      &nbsp; &nbsp; Call Target Level :
                      {trendLineValue?.callTargetLevelPrice?.toFixed(1)}
                      &nbsp; &nbsp; PE Target Level :
                      {trendLineValue?.putTargetLevelPrice?.toFixed(1)}
                      &nbsp; &nbsp; Time :{formatDate(trendLineValue.timestamp)}
                    </p>
                  </div>
                )}

                <div>
                  {/* <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        showAvg: !p.showAvg,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.showAvg
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Avg Line
                  </button> */}
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        pivot: !p.pivot,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.pivot
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Pivot Line
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        candle: !p.candle,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.candle
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Candle
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        dynamicExitValue: !p.dynamicExitValue,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.dynamicExitValue
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    D_Exit Value
                  </button>
                  &nbsp; &nbsp;
                  {/* <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        RangeBoundTargetProfit: !p.RangeBoundTargetProfit,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.RangeBoundTargetProfit
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Target Profit
                  </button> */}
                  {/* &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        dynamicEntryValue: !p.dynamicEntryValue,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.dynamicEntryValue
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    D_Entry Value
                  </button> */}
                  {/* &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        initialLow: !p.initialLow,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.initialLow
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Initial Low
                  </button> */}
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        Last_Highest_LTP: !p.Last_Highest_LTP,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.Last_Highest_LTP
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Last High LTP
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        rangeBoundLine: !p.rangeBoundLine,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.rangeBoundLine
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Range Bound
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        movingAvg: !p.movingAvg,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.movingAvg
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Moving Avg
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        volume: !p.volume,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.volume
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    volume
                  </button>
                  &nbsp; &nbsp;
                  {/* <button
              onClick={() =>
                setShowRow((p) => ({
                  ...p,
                  suppRes: !p.suppRes,
                }))
              }
              className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                showRow.suppRes ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
              }`}
            >
              Supp&Res
            </button> */}
                  {/* &nbsp; &nbsp; */}
                  {/* <ModeToggle /> */}
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        monthlyHigh: !p.monthlyHigh,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.monthlyHigh
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Monthly
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        weekly: !p.weekly,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.weekly
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Weakly
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        daily: !p.daily,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.daily
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Daily
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        fourHourly: !p.fourHourly,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.fourHourly
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Four Hourly
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        hourly: !p.hourly,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.hourly
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Hourly
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={() =>
                      setShowRow((p) => ({
                        ...p,
                        toolTip: !p.toolTip,
                      }))
                    }
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.toolTip
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    Tool Tip
                  </button>
                  {/* &nbsp; &nbsp;
                  <button
                    onClick={setAllTrendLine}
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.allTrendLine
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300 "
                    }`}
                  >
                    All TrendLine
                  </button> */}
                  &nbsp; &nbsp;
                  <button
                    onClick={setCETrendLine}
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.ceTrendLine
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300"
                    }`}
                  >
                    CE TrendLine
                  </button>
                  &nbsp; &nbsp;
                  <button
                    onClick={setPETrendLine}
                    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                      showRow.peTrendLine
                        ? "bg-blue-500 text-gray-100"
                        : "bg-gray-300"
                    }`}
                  >
                    PE TrendLine
                  </button>
                  &nbsp; &nbsp;
                </div>
              </div>
              <div className="flex flex-wrap items-center mt-2 mb-1 space-x-3">
                {/* Date Input */}

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

                {/* Candle Type Select */}
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

                {/* Interval Select */}
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

                {/* WMA Input */}
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

                {/* Range Bound Input */}
                {/* <div className="flex flex-col">
                  <Label>Range Bound</Label>
                  <Input
                    name="rangeBoundPercent"
                    onChange={handleChange}
                    value={values.rangeBoundPercent}
                    className="mt-1"
                    type="number" // Corrected the input type from `rangeBoundPercent` to `number`
                  />
                </div> */}
                {/* Trendline Active / Deactive */}
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
                {/* Buttons Section */}
                <div className="flex items-center space-x-2 mt-2">
                  {/* Submit Button */}
                  <Button onClick={handleSubmit} size="sm">
                    Submit
                  </Button>

                  {/* Fibonacci Button */}
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

                  {/* Equidistant Channel Button */}
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

                  {/* Trendline Button */}
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
              </div>
            </>
          )}

          {apiData?.length > 0 && (
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
