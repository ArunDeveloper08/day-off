import { BASE_URL_OVERALL } from "@/lib/constants";
import { useLiveSocket } from "@/providers/live-socket-provider";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
export const HelpingChart = () => {
  const { theme, setTheme } = useTheme();
  const intervalRef = useRef(null);

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
        WMA: data.data.masterChartWMA,
        interval: data.data.masterChartInterval,
        candleType: data.data.masterChartCandleType,
        rangeBoundPercent: data.data.masterRangeBoundPercent,
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
    trendLine: false,
    initialLow: false,
    Last_Highest_LTP: false,
    rangeBoundLine: true,
    MouseCoordinates: true,
    movingAvg: true,
    fibonacci: false,
    equidistantChannel: false,
    volume: false,
    RangeBoundTargetProfit: false,
    // suppRes: false,
    monthlyHigh: false,
    weekly: false,
    fourHourly: false,
    hourly: false,
    daily: false,
    suppRes: false,
  });
  const [hideConfig, setHideConfig] = useState(true);

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
        error: error.response.data.message || error.message,
      }));
    } finally {
      setData((p) => ({ ...p, loading: false }));
    }
  };

  const getChartData = () => {
    axios
      .post(`${BASE_URL_OVERALL}/chart/helper?id=${id}`, { ...values })
      .then((res) => {
        setApiData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message)
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
  }, []);

  // useEffect(() => {
  //   if (!values) return;
  //   getChartData();
  //   const interval = (getChartData, 10 * 1000);
  //   return () => clearInterval(interval);
  // }, [values]);

  useEffect(() => {
    if (!values) return;
    getChartData();
    const interval = setInterval(getChartData, 20 * 1000);
    intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [id, values]);

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
    };
  }, [id, values]);

  useEffect(() => {
    if (!isConnected || !data?.data?.instrument_token) return;
    socket?.on("getLiveData", (socketdata) => {
      socketdata.token = Number(socketdata.token.replace(/"/g, "")); // Removes all double quotes
      // console.log(socketdata)
      if (socketdata.token === data?.data.instrument_token) {
        setSocketData(socketdata);
      }

      // let filteredData = groupBy(socketdata, "instrument_token");
      // const newMessage = filteredData[data?.data?.instrument_token]?.[0];
      // //  console.log(newMessage)
      // if (!newMessage) return;
      // setSocketData(newMessage);
      // setApiData((p) => {
      //   let newArr = [...p];
      //   if (newArr?.length < 2) return newArr;
      //   let last = {
      //     CESecondVolume: undefined,
      //     CESecondVolumeStrike: undefined,
      //     CESecondhoi: undefined,
      //     CESecondhoiStrike: undefined,
      //     CEVolume: undefined,
      //     CEVolumeStrike: undefined,
      //     CEhoi: undefined,
      //     CEhoiStrike: undefined,
      //     PESecondVolume: undefined,
      //     PESecondVolumeStrike: undefined,
      //     PESecondhoi: undefined,
      //     PESecondhoiStrike: undefined,
      //     PEVolume: undefined,
      //     PEVolumeStrike: undefined,
      //     PEhoi: undefined,
      //     PEhoiStrike: undefined,
      //     close: newMessage?.last_price,
      //     high:
      //       newArr[newArr?.length - 1]?.high > newMessage?.last_price
      //         ? newArr[newArr?.length - 1]?.high
      //         : newMessage?.last_price, // newMessage.ohlc.high,
      //     low:
      //       newArr[newArr?.length - 1]?.low < newMessage?.last_price
      //         ? newArr[newArr?.length - 1]?.low
      //         : newMessage?.last_price,

      //     // newMessage.ohlc.high,
      //     // low: newMessage.ohlc.low,
      //     // open: newMessage.ohlc.open,
      //     open:
      //       (newArr[newArr?.length - 2]?.open +
      //         newArr[newArr?.length - 2]?.close) /
      //       2,
      //     pivot: (newMessage?.ohlc?.high + newMessage?.ohlc?.low) / 2,
      //     timestamp: newMessage?.exchange_timestamp,
      //   };
      //   newArr[newArr?.length - 1] = last;
      //   return newArr;
      // });
    });

    // socket.on(data?.data?.instrument_token, (message) => {
    //   console.log("message", message);
    // });
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

  return (
    <div>
      {data.loading ? (
        "Loading"
      ) : data.error ? (
        "Some Error Occcured"
      ) : (
        <>
          <h1 className=" text-center font-semibold text-[20px] font-mono text-red-600">
            Angel-One (Helping Chart) &nbsp;{" "}
            <button className="text-md text-center font-semibold text-red-700">
              LTP : {socketData?.last_traded_price} &nbsp; &nbsp;
            </button>
            <Button size="sm" onClick={() => setHideConfig((prev) => !prev)}>
              {hideConfig ? "Hide Config Data" : "Show Config Data"}
            </Button>
          </h1>
          {hideConfig && (
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

                <p>D_Exit : {data?.data?.dynamicExitValue?.toFixed(2)}</p>
                <p>D_Entry : {data?.data?.tradeEntryPercent?.toFixed(2)}</p>
                <p className="text-[14px]">
                  Range Bound1: {data?.data?.rangeBoundPercent} %
                </p>
                <p className="text-[14px]">
                  Range Bound2: {data?.data?.rangeBoundPercent2} %
                </p>
                <p>SMA1 : {data?.data?.SMA1}</p>
                <p>SMA2 : {data?.data?.SMA2}</p>
              </div>
              <div>
                <button
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
                </button>
                &nbsp; &nbsp;
                <button
                  onClick={() =>
                    setShowRow((p) => ({
                      ...p,
                      pivot: !p.pivot,
                    }))
                  }
                  className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                    showRow.pivot ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
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
                <button
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
                </button>
                &nbsp; &nbsp;
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
                </button>
                &nbsp; &nbsp;
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
                </button>
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
                    showRow.daily ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
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
                <Button size="xs" className="p-1" onClick={getHighLowLines}>
                  High/Low line
                </Button>
              </div>
            </div>
          )}

          <div className=" flex px-1 items-center mt-2">
            <div className="px-1">
              <Label>Date</Label>
              <Input
                type="date"
                placeholder="date"
                className="w-[200px] border-black border-[1px] rounded-md"
                onChange={handleChange}
                name="date"
                max={today}
              />
            </div>

            <div className="px-1">
              <Label>Candle Type</Label>
              <Select
                // disabled={loading}
                value={values.candleType}
                name="candleType"
                onValueChange={(value) => handleSelect("candleType", value)}
              >
                <SelectTrigger className="w-[150px] mt-1 border-zinc-500">
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
            <div className="px-1">
              <Label>Interval</Label>
              <Select
                // disabled={loading}
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
                      {
                        label: "1 minute",
                        value: "ONE_MINUTE",
                      },
                      {
                        label: "3 minute",
                        value: "THREE_MINUTE",
                      },
                      {
                        label: "5 minute",
                        value: "FIVE_MINUTE",
                      },

                      {
                        label: "15 minute",
                        value: "FIFTEEN_MINUTE",
                      },
                      {
                        label: "30 minute",
                        value: "THIRTY_MINUTE",
                      },
                      {
                        label: "1 hour",
                        value: "ONE_HOUR",
                      },
                      {
                        label: "1 day",
                        value: "ONE_DAY",
                      },
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

            <div className="px-1">
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
            <div className="px-1">
              <Label>Range Bound </Label>
              <Input
                name="rangeBoundPercent"
                onChange={handleChange}
                value={values.rangeBoundPercent}
                className="mt-1"
                type="rangeBoundPercent"
              />
            </div>
            {/* <Button onClick={handleSubmit}>Submit</Button> */}

            <div className="flex justify-around  w-[80%]">
              {/* <p className="font-semibold font-mono">INTRACTIVE UI TOOLS </p> */}
              &nbsp; &nbsp; &nbsp; &nbsp;
              <button
                onClick={() =>
                  setShowRow((p) => ({
                    ...p,
                    fibonacci: !p.fibonacci,
                  }))
                }
                className={`px-1 py-1 duration-300 text-xs font-semibold rounded-md ${
                  showRow.fibonacci ? "bg-black text-gray-100" : "bg-white "
                }`}
              >
                <div className="flex items-center ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 28 28"
                    width="28"
                    height="28"
                  >
                    <g fill="currentColor" fill-rule="nonzero">
                      <path d="M3 5h22v-1h-22z"></path>
                      <path d="M3 17h22v-1h-22z"></path>
                      <path d="M3 11h19.5v-1h-19.5z"></path>
                      <path d="M5.5 23h19.5v-1h-19.5z"></path>
                      <path d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
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
                  <span class="icon-KTgbfaP5" role="img" aria-hidden="true">
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

          {apiData?.length > 0 && (
            <CandleChart
              data={apiData}
              getMoreData={() => {}}
              ratio={1}
              width={width}
              showRow={showRow}
              theme={theme}
              // xExtents={xExtents}
              height={(height * 7) / 10}
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
