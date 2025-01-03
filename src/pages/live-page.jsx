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
  const [prevDate, setPrevDate] = useState("");
  const { socket, isConnected } = useLiveSocket();
  let width = useMemo(() => window.screen.width, []);
  let height = useMemo(() => window.screen.height, []);
  const [socketData, setSocketData] = useState([]);
  const [socketMastertData, setSocketMasterData] = useState([]);
  // const [instrumentData, setInstrumentData] = useState("");
  const [isUserScroll, setIsUserScroll] = useState(false);
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
        const res = await axios.get(`${BASE_URL_OVERALL}/chart?id=${id}&date=${prevDate}`);
        setIntractiveData(res.data);
        setApiData(res.data.data);
        setMasterId(res.data.masterID);
        setLiveTrendValue(res.data.liveTrendValue);
        setTrends3(res.data.trendLines);
        console.log("API call succeeded");
        return true; // Success
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
    const interval = setInterval(getTradeConfig, 120 * 1000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
   // if (isUserScroll) return;
    getChartData();
    const interval = setInterval(getChartData, 120 * 1000);
    intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [id, prevDate, isUserScroll, trendLineActive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        getChartData();
        getTradeConfig();
        intervalRef.current = setInterval({getChartData , getTradeConfig}, 120 * 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalRef.current);
    };
  }, [id, prevDate]);

  const lastUpdateTimeRef = useRef(Date.now());
  const currentTime = Date.now();

  useEffect(() => {
    if (!isConnected || !data?.data?.instrument_token) return;
    socket?.on("getLiveData", (socketdata) => {
      socketdata.token = Number(socketdata?.token?.replace(/"/g, "")); // Removes all double quotes

      if (socketdata.token === data?.data.instrument_token) {
        setSocketData(socketdata);
      }
      if (socketdata.token == data?.data.masterChart_InstrumentToken) {
        setSocketMasterData(socketdata);
      }

      if (currentTime - lastUpdateTimeRef.current > 10 * 1000) {
        //console.log("hii")
        lastUpdateTimeRef.current = currentTime;

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
      socket.off("getLiveData");
    };
  }, [socket, data, isConnected]);
  // console.log(socketData)

  //console.log(socketData)
  // useEffect(() => {
  //   if (!isConnected || !data?.data?.instrument_token) return;
  //   socket?.on("getLiveData", (socketdata) => {
  //     // Check if token is a string before applying replace
  //     if (typeof socketdata?.token === "string") {
  //       socketdata.token = Number(socketdata?.token?.replace(/"/g, ""));
  //     } else {
  //       // If it's not a string, attempt to convert it to a number directly
  //       socketdata.token = Number(socketdata?.token);
  //     }

  //     // Proceed if the token matches the instrument token
  //     if (socketdata.token === data?.data.instrument_token) {
  //       setSocketData(socketdata);
  //     }
  //   });

  //   return () => {
  //     socket?.off("getLiveData"); // Clean up the event listener when the component unmounts
  //   };
  // }, [socket, data, isConnected]);

  // console.log("data?.data?.instrument_token",data?.data.masterChart_InstrumentToken)

  const handleSubmit = async () => {
    // getChartData();
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

  const handleCreateTrendLines = useCallback(
    async (trendline, textList1, retracements3, channels1, alert) => {
      // if (trendline?.some(line => line?.endTime === undefined && line?.startTime)) {
      //   return alert(
      //     "Please ensure the TrendLine remains inside the chart. The TrendLine's endpoint should not go outside the chart"
      //   );
      // }
      const textLabel = JSON.stringify(textList1);

      // for (let i = 0; i <= 7; i++) {
      //   if (trendline[i]?.endTime === undefined && trendline[i]?.startTime) {
      //     return alert(
      //       "Please ensure the TrendLine remains inside the chart. The TrendLine's endpoint should not go outside the chart"
      //     );
      //   }
      // }
      try {
        await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
          id,
          trendLines: trendline,
          textLabel: textLabel,
          retracements: retracements3,
          channels: channels1,
          alertLine: alert,
        });
        getChartData(); // Ensure this is defined and working correctly
        alert("Successfully updated trend lines");
      } catch (err) {
        console.error(err);
      }
    },
    [] // Add dependencies if necessary
  );

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setValues((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const toggleScroll = () => {
    setIsUserScroll((prevState) => !prevState);
  };

  const getHighLowLines = async () => {
    try {
      await axios.get(`${BASE_URL_OVERALL}/chart/makeHighLow?id=${id}`);
      alert("High Low Reset !");
      getChartData();
    } catch (error) {
      alert("Some error Occured");
    }
  };
  //  console.log("socketdata",socketData)
  return (  
    <div>
      {/* {data.error ? ( */}
      {/* // "Some Error Occcured" */}
      {/* // ) : ( */}

      <>
        <div>
          <p className="font-semibold text-center font-mono text-[20px] text-green-600">
            Angel-One(Main Chart)
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

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 p-2">
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={prevDate}
                placeholder="date"
                className="w-full md:w-[150px] border-black border-[1px] rounded-md"
                onChange={(e) => setPrevDate(e.target.value)}
              />
              <Button onClick={handleSubmit} size="xs" className="p-2">
                Submit
              </Button>
            </div>

            <button className="text-sm md:text-lg text-center font-semibold text-green-600">
              LTP : {socketData?.last_traded_price} &nbsp; &nbsp; Master LTP :
              {socketMastertData?.last_traded_price} &nbsp; &nbsp; RSI Live :{" "}
              {data.data.rsiValue} &nbsp; &nbsp;
            </button>

   
          </div>
        </div>

        <div className="flex">

          <div className="w-full h-auto flex justify-center">
            {apiData?.length > 0 && (
              <CandleChart
                getChartData={getChartData}
                handleCreateTrendLines={handleCreateTrendLines}
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
