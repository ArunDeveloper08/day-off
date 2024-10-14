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
export const BackTestingPage = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, []);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const { socket, isConnected } = useLiveSocket();
  const [apiData, setApiData] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [data, setData] = useState({
    loading: false,
    data: {},
    error: "",
  });
  const [dateTime, setDateTime] = useState({
    timestamp1: new Date().toISOString().split("T")[0] + "T09:15",
    timestamp2: new Date().toISOString().split("T")[0] + "T15:30",
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
      console.log(data.data);
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

  const handleRESET = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (data?.data?.identifier) {
      document.title = `BackTest ${data?.data?.identifier}`;
    }
  }, [data?.data?.identifier]);
  // console.log({ isConnected },socket?.id);
  console.log(apiData);
  return (
    <div>
      {data.loading ? (
        "Loading"
      ) : data.error ? (
        "Some Error Occcured"
      ) : (
        <>
          <p className="font-semibold text-center font-mono text-[20px] text-green-600">
            Angel-One(Back Testing Chart)
          </p>
          <div className="flex flex-wrap gap-x-10 font-semibold py-2">
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

            <p className="text-[14px]">
              Candle Size : {data?.data?.candleSize}
            </p>
            <p className="text-[14px]">
              D_Exit : {latestValues?.dynamicExitValue?.toFixed(2)}
            </p>
            <p className="text-[14px]">
              D_Entry : {latestValues?.D_Entry?.toFixed(2)}
            </p>
            <p className="text-[14px]">
              Initial_Exit : {latestValues?.BaseExitValue?.toFixed(2)}
            </p>
            <p className="text-[14px]">
              Range Bound1: {data?.data?.rangeBoundPercent} %
            </p>
            <p className="text-[14px]">
              Range Bound2: {data?.data?.rangeBoundPercent2} %
            </p>
            <p className="text-[14px]">SMA1 : {data?.data?.SMA1}</p>
            <p className="text-[14px]">SMA2 : {data?.data?.SMA2}</p>
            <p className="text-[14px]">MV Source1 : {data?.data?.mvSource1}</p>
            <p className="text-[14px]">MV Source2 : {data?.data?.mvSource2}</p>
            <p className="text-[14px]">RSI Max : {data?.data?.rsiMax}</p>
            <p className="text-[14px]">RSI Live : {latestValues?.RSI_Value}</p>
            <p className="text-[14px]">RSI Min : {data?.data?.rsiMin}</p>
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
          
        

            &nbsp; &nbsp;
          </div>

          <div className="flex pt-2 justify-around items-center mt-2">
            <div className="flex ">
              <input
                value={dateTime.timestamp1}
                name="timestamp1"
                type="datetime-local"
                className="border-black border-2 w-full max-w-[200px] rounded-md"
                onChange={handleChange}
              />
              <p className="text-xl w-20">--To--</p>
              <input
                value={dateTime.timestamp2}
                name="timestamp2"
                type="datetime-local"
                className="border-black border-2 w-full max-w-[200px] rounded-md"
                onChange={handleChange}
              />
            </div>
            <Button onClick={handleStart}>Start</Button>
            <Button onClick={handleRESET}>Reset</Button>
          </div>
          {apiData?.length > 1 && (
            <CandleChart
              data={apiData}
              getMoreData={() => {}}
              ratio={1}
              width={width}
              showRow={showRow}
              height={(height * 7) / 10}
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
