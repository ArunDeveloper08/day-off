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
// import CandleChart from "../payments/Test"
import LiveDataTable from "./live-table";
import "react-toastify/dist/ReactToastify.css";
// import { groupBy } from "./dashboard";

// import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import UIButton from "../components/UIButton";
import { IoPlay, IoPause } from "react-icons/io5";
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

export const LivePage = () => {
  const { theme, setTheme } = useTheme();
  const [trendLineActive, setTrendLineActive] = useState(false);
  const [liveTrendValue, setLiveTrendValue] = useState([]);
  const [intractiveData, setIntractiveData] = useState([]);
  const [chartType, setChartType] = useState("svg");
  const [alert3, setAlert3] = useState([]);
  const intervalRef = useRef(null);
  useEffect(() => {
    setTheme("light");
  }, []);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [prevDate, setPrevDate] = useState(new Date());
  const { socket, isConnected } = useLiveSocket();
  let width = useMemo(() => window.screen.width, []);
  let height = useMemo(() => window.screen.height, []);
  const [socketData, setSocketData] = useState([]);
  const [socketMastertData, setSocketMasterData] = useState([]);
  // const [instrumentData, setInstrumentData] = useState("");
  //const [isUserScroll, setIsUserScroll] = useState(false);
  const [masterId, setMasterId] = useState("");
  const [trends3, setTrends3] = useState([]);
  const [noActionLine, setNoActionLine] = useState([]);
  const [horizontalLine, setHorizontalLine] = useState([]);

  const [values, setValues] = useState({
    s1: null,
    s2: null,
    s3: null,
    r1: null,
    r2: null,
    r3: null,
    interval: "ONE_MINUTE",
  });

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
    alertLine: false,
    rsi: false,
    atr: false,
    dEntryLine: true,
    dExitLine: true,
    stopLoss: true,
    targetLine: true,
  });

  const [apiData, setApiData] = useState([]);
  const [data, setData] = useState({
    loading: false,
    data: {},
    error: "",
  });
  const [hideConfig, setHideConfig] = useState(true);
  if (!id) return null;

  // console.log("width",width)
  const getTradeConfig = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL_OVERALL}/config/get?id=${id}`
      );
      setData((p) => ({ ...p, data: data.data }));

      setValues(data?.data);
      setPrevDate(data?.data?.masterChartPrevDate);
    } catch (error) {
      setData((p) => ({
        ...p,
        error: error?.response?.data.message || error?.message,
      }));
    }
  };

  const getChartData = async () => {
    const maxRetries = 5; // Maximum number of retries
    const delay = 3000; // Delay in milliseconds between retries
    let attempts = 0;
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL_OVERALL}/chart?id=${id}&date=${prevDate}`
        );
        setIntractiveData(res.data);
        setApiData(res.data.data);
        setMasterId(res.data.masterID);
        setLiveTrendValue(res.data.liveTrendValue);
        setTrends3(res.data.trendLines);
        //console.log("API call succeeded");
        return true; //Success
      } catch (err) {
        attempts += 1;
        console.log(`API failed on attempt ${attempts}. Retrying...`);
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
          return await fetchData(); // Retry the API call
        } else {
          console.error("Maximum retry attempts reached. API failed.");
          return false; // Failure after retries
        }
      }
    };
    return await fetchData();
  };

  useEffect(() => {
    getTradeConfig();
    const interval = setInterval(getTradeConfig, 60 * 1000);
    //intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getChartData();
    const interval = setInterval(getChartData, 60 * 1000);
    //  intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [prevDate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        getChartData();
        getTradeConfig();
        intervalRef.current = setInterval(
          { getChartData, getTradeConfig },
          120 * 1000
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalRef.current);
    };
  }, [id, prevDate]);

  // const lastUpdateTimeRef = useRef(Date.now());
  // const currentTime = Date.now();

  useEffect(() => {
    if (!isConnected || !data?.data?.instrument_token) return;
    socket?.on("getLiveData", (socketdata) => {
      socketdata.token = Number(socketdata?.token?.replace(/"/g, "")); // Removes all double quotes

      if (socketdata.token === data?.data.instrument_token) {
        setSocketData(socketdata);

        setApiData((prevApiData) => {
          if (!prevApiData || prevApiData.length === 0) return prevApiData;

          // Clone the previous data to avoid direct mutation
          const updatedData = [...prevApiData];

          // Replace the `close` value in the last candle with `last_traded_price`
          updatedData[updatedData.length - 1] = {
            ...updatedData[updatedData.length - 1],
            close: socketdata.last_traded_price,
          };

          return updatedData;
        });
      }

      if (socketdata.token == data?.data.masterChart_InstrumentToken) {
        setSocketMasterData(socketdata);

        // if (currentTime - lastUpdateTimeRef.current > 10 * 1000) {
        //lastUpdateTimeRef.current = currentTime;
        // }
      }
    });

    return () => {
      socket.off("getLiveData");
    };
  }, [socket, data, isConnected]);

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        `${BASE_URL_OVERALL}/config/edit?date=${prevDate}`,
        {
          ...values,
          id: id,
        }
      );
      setValues(res?.data?.data);
      setPrevDate(res?.data?.data?.masterChartPrevDate);
      alert(res.data.message);
      getChartData();
    } catch (err) {
      console.log(err);
    }
  };

  // const handleCreateTrendLines = useCallback(
  //   async (trendline, textList1, retracements3, channels1, alert) => {
  //     // if (trendline?.some(line => line?.endTime === undefined && line?.startTime)) {
  //     //   return alert(
  //     //     "Please ensure the TrendLine remains inside the chart. The TrendLine's endpoint should not go outside the chart"
  //     //   );
  //     // }
  //     const textLabel = JSON.stringify(textList1);

  //     // for (let i = 0; i <= 7; i++) {
  //     //   if (trendline[i]?.endTime === undefined && trendline[i]?.startTime) {
  //     //     return alert(
  //     //       "Please ensure the TrendLine remains inside the chart. The TrendLine's endpoint should not go outside the chart"
  //     //     );
  //     //   }
  //     // }
  //     try {
  //       await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
  //         id,
  //         trendLines: trendline,
  //         textLabel: textLabel,
  //         retracements: retracements3,
  //         channels: channels1,
  //         alertLine: alert,
  //       });
  //       getChartData(); // Ensure this is defined and working correctly
  //       alert("Successfully updated trend lines");
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   },
  //   [] // Add dependencies if necessary
  // );

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setValues((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // const toggleScroll = () => {
  //   setIsUserScroll((prevState) => !prevState);
  // };

  const getHighLowLines = async () => {
    try {
      await axios.get(`${BASE_URL_OVERALL}/chart/makeHighLow?id=${id}`);
      alert("High Low Reset !");
      getChartData();
    } catch (error) {
      alert("Some error Occured");
    }
  };

  //console.log("socketdata",socketData)

  const handleSelect = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>

      {/* {data.error ? ( */}
      {/* // "Some Error Occcured" */}
      {/* // ) : ( */}
   
      <>
        <div>
          <p className="font-semibold text-center font-mono text-[20px] text-green-600">
            <span
              className={`text-[13px] md:text-[16px] w-full sm:w-auto ${
                data?.data?.terminal == "ON" ? "text-red-600" : "text-green-600"
              }`}
            >
              Trade Terminal: {data?.data?.terminal}
            </span>
            &nbsp; Angel-One &nbsp; {" "}  
            <span
              className={`text-[13px] md:text-[16px] w-full sm:w-auto ${
                data?.data?.haveTrade == 1 ? "text-red-600" : "text-green-600"
              }`}
            >
              In Trade : {data?.data?.haveTrade == 1 ? "True" : "False"}
            </span>
            &nbsp;
            <Button size="sm" onClick={() => setHideConfig((prev) => !prev)}>
              {hideConfig ? "Hide Config Data" : "Show Config Data"}
            </Button>
          </p>
          {hideConfig && (
            <div>
              <UIButton
                getHighLowLines={getHighLowLines}
                showRow={showRow}
                setShowRow={setShowRow}
                data={data}
                socketData={socketData}
                masterId={masterId}
                setTrendLineActive={setTrendLineActive}
                trendLineActive={trendLineActive}
                id={id}
                liveTrendValue={liveTrendValue}
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-center  gap-4  md:gap-6 p-2">
            {data?.data?.tradeIndex == 7 || data?.data?.tradeIndex == 17 ? (
              <></>
            ) : (
              <div className="flex items-center  gap-4">
                <Input
                  type="date"
                  value={prevDate}
                  placeholder="date"
                  className="w-full md:w-[150px] border-black border-[1px] rounded-md"
                  onChange={(e) => setPrevDate(e.target.value)}
                />
                <div className="px-1">
                  {/* <Label>Interval</Label> */}
                  <Select
                    value={values.interval}
                    name="terminal"
                    onValueChange={(value) => handleSelect("interval", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
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
                <Button onClick={handleSubmit} size="xs" className="p-2">
                  Submit
                </Button>
              </div>
            )}

            <button className="text-sm md:text-[16px] text-center font-semibold text-green-600">
              LTP : {socketData?.last_traded_price} &nbsp; Master LTP :
              {socketMastertData?.last_traded_price} &nbsp; RSI :{" "}
              {data.data.rsiValue} &nbsp; ATR Value : {data.data.atrValue}{" "}
              &nbsp; V_WMA: {data?.data?.wmaLtp} &nbsp; A :
              {data?.data.callTargetLevelPrice?.toFixed(2)} &nbsp; B :
              {data?.data.putTargetLevelPrice?.toFixed(2)} &nbsp; C :
              {data?.data.entryLine?.toFixed(2)} &nbsp; a :
              {data?.data.callLowerDeadZone?.toFixed(2)} &nbsp; b :
              {data?.data.putUpperDeadZone?.toFixed(2)} &nbsp; c :
              {data?.data.targetPrice?.toFixed(2)}
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="w-full h-auto flex justify-center">
            {apiData?.length > 0 && (
              <CandleChart
                //  getChartData={getChartData}
                // handleCreateTrendLines={handleCreateTrendLines}
                data={apiData}
                intractiveData={intractiveData}
                ratio={1}
                width={width + 30}
                showRow={showRow}
                theme={theme}
                height={height ? (height * 8) / 10 : "60vh"}
                chartType={chartType}
                trends3={trends3}
                setTrends3={setTrends3}
                alert3={alert3}
                setAlert3={setAlert3}
                horizontalLine={horizontalLine}
                noActionLine={noActionLine}
                setHorizontalLine={setHorizontalLine}
                setNoActionLine={setNoActionLine}
                master={data?.data}
              />
            )}
          </div>
        </div>

        {id && (
          <LiveDataTable
            id={id}
            socketData={socketData}
            socketMastertData={socketMastertData}
            values={values}
          />
        )}
      </>
      {/* // )} */}
    </div>
  );
};

export const LivePageLayout = () => {
  return (
    // <LiveSocketProvider>
    <LivePage />
    // </LiveSocketProvider>
  );
};
