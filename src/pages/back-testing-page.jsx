import { Button } from "@/components/ui/button";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { ModeToggle } from "@/components/mode-toggle";
// import {
//   BackTestSocketProvider,
//   useBackTestSocket,
// } from "@/providers/back-socket-provider";

import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import CandleChart from "../components/LiveGraph";
import BackTestingTablePage from "./back-test-table";
import { useLiveSocket } from "@/providers/live-socket-provider";
import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BackTestingPage = () => {
  const { theme, setTheme } = useTheme();

  // useEffect(() => {
  //   setTheme("light");
  // }, []);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const { socket, isConnected } = useLiveSocket();
  const [apiData, setApiData] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  // const [chartType, setChartType] = useState("canvas");
  const [trends3, setTrends3] = useState([]);
  const [alert3, setAlert3] = useState([]);
  const [intractiveData, setIntractiveData] = useState([]);
  const [entryLine, setEntryLine] = useState([]);
  const [chartType, setChartType] = useState("svg");

  const [data, setData] = useState({
    loading: false,
    data: {},
    error: "",
  });
  const [dateTime, setDateTime] = useState({
    timestamp1: new Date().toISOString().split("T")[0] + "T09:15",
    timestamp2: new Date().toISOString().split("T")[0] + "T23:30",
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [values, setValues] = useState({
    interval: "ONE_MINUTE",
  });

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
    suppRes: false,
    entryLine: true,
    toolTip: true,
    bollingerBand: false,
  });

  const [latestValues, setLatestValues] = useState({
    dynamicExitValue: 0,
    D_Entry: 0,
    RSI_Value: 0,
    BaseExitValue: 0,
  });

  const getTradeConfig = async () => {
    setData((p) => ({ ...p, loading: true }));
    try {
      const { data } = await axios.get(
        `${BASE_URL_OVERALL}/config/get?id=${id}`
      );
      setData((p) => ({ ...p, data: data.data }));
      setValues((p)=>({...p , interval :data.data.interval}))
    } catch (error) {
      setData((p) => ({
        ...p,
        error: error.response.data.message || error.mesage,
      }));
    } finally {
      setData((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    getTradeConfig();
  }, []);

  const [cumulativeState, setCumulativeState] = useState({
    cumulativeDiff: 0,
    cumulativeDiffPut: 0,
  });

  let width = useMemo(() => window.screen.width, []);
  let height = useMemo(() => window.screen.height, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDateTime({ ...dateTime, [name]: value });
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "timestamp1") {
  //     const datePart = value.split("T")[0];
  //     const fixedTime = "09:15";
  //     setDateTime({ ...dateTime, [name]: `${datePart}T${fixedTime}` });
  //   } else {
  //     const datePart = value.split("T")[0];
  //     const fixedTime = "15:30";
  //     setDateTime({ ...dateTime, [name]: `${datePart}T${fixedTime}` });
  //   }
  // };

  const handleStart = () => {
    axios
      .post(`${BASE_URL_OVERALL}/test/startTesting`, {
        ...data.data,
        ...dateTime,
        socketID: socket?.id,
        interval: values.interval,
      })
      .then((res) => {
        console.log("response", res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isConnected && socket) {
      socket?.on("sendingTradeData", (message) => {
        const { data } = message;
        // console.log(data);
        const diff = data.close - data.open;

        setCumulativeState((prevCumulativeState) => {
          const newCumulativeDiff =
            diff >= 0 ? prevCumulativeState.cumulativeDiff + diff : 0;
          const newCumulativeDiffPut =
            diff < 0 ? prevCumulativeState.cumulativeDiffPut + diff : 0;

          const updatedData = {
            ...data,
            cumulative: newCumulativeDiff,
            cumulativeDiffPut: newCumulativeDiffPut,
          };
          setApiData((prevApiData) => [...prevApiData, updatedData]);
          setLatestValues({
            dynamicExitValue: data.dynamicExitValue,
            D_Entry: data.D_Entry,
            RSI_Value: data.RSI_Value,
            BaseExitValue: data.BaseExitValue,
          });
          return {
            cumulativeDiff: newCumulativeDiff,
            cumulativeDiffPut: newCumulativeDiffPut,
          };
        });
      });
    }
  }, [socket, isConnected]);

  const handleSubmit = async (data) => {
    try {
      await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id,
        ...data,
      });
      alert("Successfully saved.");
      await getTrendLinesValue();
      await getChartData();
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handleRESET = async () => {
    await setEntryLine([]);
    socket.emit("playInterval");
    await handleSubmit({ testingBuyTrendLines: null });
    window.location.reload();
  };

  useEffect(() => {
    if (data?.data?.identifier) {
      document.title = `BackTest ${data?.data?.identifier}`;
    }
  }, [data?.data?.identifier]);

  const handleCreateTrendLines = async (
    trendline,
    textList1,
    retracements3,
    channels1,
    alert3
  ) => {
    // Check if any trend line is incomplete (endTime is undefined)
    const incompleteLineExists = trendline?.some(
      (line) => line?.endTime === undefined && line?.startTime
    );

    // Check if the user has fewer than 10 trend lines
    if (trendline.length < 10) {
      alert(
        `You have only ${trendline.length} trend lines. Please add ${
          10 - trendline.length
        } more trend lines.`
      );
      // If there's an incomplete line, show the alert but still attempt to save `alertLine`
      if (incompleteLineExists) {
        alert(
          "Please ensure all trend lines remain inside the chart. The endpoint of a trend line cannot be outside the chart."
        );
      }
      // Save only `alertLine` as other validations failed
      try {
        await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
          id,
          alertLine: alert3, // Only saving alertLine in this case
        });
        alert("Alert Line saved successfully.");
      } catch (err) {
        console.error("Error saving alertLine:", err);
      }
      return; // Exit early since trendLine saving isn't allowed
    }

    // If all validations pass, save all values
    try {
      const textLabel = JSON.stringify(textList1);
      await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id,
        trendLines: trendline,
        textLabel: textLabel,
        retracements: retracements3,
        channels: channels1,
        alertLine: alert3,
      });
      await getChartData();
      await getTrendLinesValue();
      alert("Successfully Updated TrendLines and AlertLine.");
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handlePlayPause = () => {
    const command = isPlaying ? "pauseInterval" : "playInterval";
    socket.emit(command);
    setIsPlaying((prev) => !prev);
  };

  const handleSelect = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  //  return  <div> Loading ...</div>;

  return (
    <div>
      {data.loading ? (
        "Loading"
      ) : (
        <>
          <p className="font-serif text-center  text-[20px] text-green-600">
            Angel-One(Back Testing Chart)
          </p>
          <div className="flex flex-wrap gap-x-10 font-serif py-2">
            <p className="text-[14px]">
              Trade Terminal :{" "}
              {data?.data?.terminal === "manualIn"
                ? "Manual In"
                : data?.data?.terminal}
            </p>
            <p className="text-green-600 text-[14px]">
              Candle :
              {data?.data?.interval === "minute"
                ? "1 minute"
                : data?.data?.interval}
            </p>
            <p className="text-[14px]">
              Identifier:
              {data?.data?.identifier}
            </p>
            <p className="text-[14px]">Trade Index: {data?.data?.tradeIndex}</p>
            <p className="text-[14px]">WMA : {data?.data?.WMA}</p>

            <p className="text-[14px]">Order Type : {data?.data?.orderType}</p>
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
                showRow.showAvg ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
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
                showRow.candle ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
              }`}
            >
              Candle
            </button>
            &nbsp; &nbsp; &nbsp;
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
            {/* 
              &nbsp; &nbsp;
         <button
           onClick={() =>
             setShowRow((p) => ({
               ...p,           v 
               arrow: !p.arrow,
             }))
           }
           className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
             showRow.arrow ? "bg-blue-500 text-gray-100" : "bg-gray-300"
           }`}
         >
           <span className="flex">Buy Sell (Arrow)</span>
         </button> */}
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
                showRow.movingAvg ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
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
                showRow.volume ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
              }`}
            >
              Volume
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
                showRow.toolTip ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
              }`}
            >
              Tool Tip
            </button>
            &nbsp; &nbsp; &nbsp; &nbsp;
          </div>

          <div className="flex pt-2 justify-around items-center mt-2">
            <div className="flex ">
              <input
                value={dateTime.timestamp1}
                name="timestamp1"
                type="datetime-local"
                className="border-black border-2  w-[200px] rounded-md"
                onChange={handleChange}
              />

              <p className="text-xl font-serif"> -- To -- </p>
              <input
                value={dateTime.timestamp2}
                name="timestamp2"
                type="datetime-local"
                className="border-black border-2  w-[200px] rounded-md"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto">
              <Label>Interval</Label>
              <Select
                value={values.interval}
                onValueChange={(value) => {
                  handleSelect("interval", value);
                }}
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
            <button
              className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                showRow.entryLine ? "bg-black text-gray-100" : "bg-white"
              }`}
            >
              <div className="flex items-center">
                <span className="icon-KTgbfaP5" role="img" aria-hidden="true">
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
            <Button
              onClick={() => handleSubmit({ testingBuyTrendLines: entryLine })}
            >
              Trendline Submit
            </Button>
            <Button onClick={handleStart}>Start</Button>
            <Button onClick={handlePlayPause}>
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={handleRESET}>Reset</Button>
          </div>
          {apiData?.length > 1 && (
            <CandleChart
              data={apiData}
              getMoreData={() => {}}
              handleCreateTrendLines={handleCreateTrendLines}
              ratio={1}
              master={data?.data}
              width={width + 30}
              showRow={showRow}
              height={height ? (height * 8) / 10 : "60vh"}
              chartType={chartType}
              trends3={trends3}
              setTrends3={setTrends3}
              setAlert3={setAlert3}
              alert3={alert3}
              intractiveData={intractiveData}
              setEntryLine={setEntryLine}
              entryLine={entryLine}
              // id={id}
            />
          )}

          <BackTestingTablePage
            updateTrigger={updateTrigger}
            setUpdateTrigger={setUpdateTrigger}
            id={id}
          />
        </>
      )}
    </div>
  );
};

export const BackTestingPageLayout = () => {
  return (
    // <BackTestSocketProvider>
    <BackTestingPage />
    // </BackTestSocketProvider>
  );
};
