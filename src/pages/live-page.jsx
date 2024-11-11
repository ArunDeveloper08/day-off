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
    rangeBoundLine: true,
    MouseCoordinates: true,
    movingAvg: true,
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
    toolTip: true,
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
  const getChartData = useCallback(() => {
    if (isUserScroll) return;

    axios
      .get(`${BASE_URL_OVERALL}/chart?id=${id}&date=${prevDate}`)
      .then((res) => {
        setIntractiveData(res.data);
        setApiData(res.data.data);
        setMasterId(res.data.masterID);
        setLiveTrendValue(res.data.liveTrendValue);
        setTrends3(res.data.trendLines)
      })
      .catch((err) => {
        console.log("API Fail to get Chart Data");
      });
  }, []); // Add dependencies here

  useEffect(() => {
    getTradeConfig();
    const interval = setInterval(getTradeConfig, 20 * 1000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isUserScroll) return;
    getChartData();
    const interval = setInterval(getChartData, 25 * 1000);
    intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [id, prevDate, isUserScroll, trendLineActive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        getChartData();
        intervalRef.current = setInterval(getChartData, 15 * 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalRef.current);
    };
  }, [id, prevDate]);

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
    });

    return () => {
      socket.off("getLiveData");
    };
  }, [socket, data, isConnected]);

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
    async (trendline, textList1, retracements3, channels1 , alert) => {
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
          alertLine : alert
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
    {socketData?.RSI_value} &nbsp; &nbsp;
  </button>
  {/* <button onClick={toggleScroll} className="text-lg">
    {isUserScroll ? (
      <IoPlay className="size-6" />
    ) : (
      <IoPause className="size-6" />
    )}
  </button> */}
  <div className="flex flex-wrap gap-2 md:gap-4">
    <button
      onClick={() =>
        setShowRow((p) => ({
          ...p,
          fibonacci: !p.fibonacci,
        }))
      }
      className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
        showRow.fibonacci ? "bg-black text-gray-100" : "bg-white"
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
            <path d="M3 5h22v-1h-22z"></path>
            <path d="M3 17h22v-1h-22z"></path>
            <path d="M3 11h19.5v-1h-19.5z"></path>
            <path d="M5.5 23h19.5v-1h-19.5z"></path>
            <path d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
          </g>
        </svg>
        <span className="ml-1">Fibonacci Retracement</span>
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
        showRow.equidistantChannel ? "bg-black text-gray-100" : "bg-white"
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
            <path d="M19.5 8c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM18.5 20c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
          </g>
        </svg>
        <span className="ml-1">Equidistant Channel</span>
      </div>
    </button>


    <button
    onClick={() =>
        setShowRow((p) => ({
            ...p,
            trendLine: true,
            alertLine: false, // Ensure alertLine is false when trendLine is true
        }))
    }
    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
        showRow.trendLine ? "bg-black text-gray-100" : "bg-white"
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
        <span>Trendline</span>
    </div>
</button>

<button
    onClick={() =>
        setShowRow((p) => ({
            ...p,
            trendLine: false, // Ensure trendLine is false when alertLine is true
            alertLine: true,
        }))
    }
    className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
        showRow.alertLine ? "bg-black text-gray-100" : "bg-white"
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
        <span>Alert Line</span>
    </div>
</button>


  </div>
</div>

          </div>

          <div className="flex">
            {/* <div className="w-[10%]">
              <div className=" px-1 items-center space-y-3">

                &nbsp; &nbsp;
                <div className="px-1 text-center flex items-center ">
                  <Label>S1 </Label> &nbsp;
                  <Input
                    name="s1"
                    onChange={handleChange}
                    value={values.s1}
                    className="mt-1 w-[100px]"
                    type="number"
                    min={0}
                  />
                </div>
                <div className="px-1 text-center flex items-center">
                  <Label>S2</Label> &nbsp;
                  <Input
                    name="s2"
                    onChange={handleChange}
                    value={values.s2}
                    className="mt-1  w-[100px]"
                    type="number"
                    min={0}
                  />
                </div>
                <div className="px-1 text-center flex items-center">
                  <Label>S3</Label> &nbsp;
                  <Input
                    name="s3"
                    onChange={handleChange}
                    value={values.s3}
                    className="mt-1  w-[100px]"
                    type="number"
                    min={0}
                  />
                </div>
                <div className="px-1 text-center flex items-center">
                  <Label>R1</Label> &nbsp;
                  <Input
                    name="r1"
                    onChange={handleChange}
                    value={values.r1}
                    className="mt-1  w-[100px]"
                    type="number"
                    min={0}
                  />
                </div>
                <div className="px-1 text-center flex items-center">
                  <Label>R2</Label> &nbsp;
                  <Input
                    name="r2"
                    onChange={handleChange}
                    value={values.r2}
                    className="mt-1  w-[100px]"
                    type="number"
                    min={0}
                  />
                </div>
                <div className="px-1 text-center flex items-center">
                  <Label>R3</Label> &nbsp;
                  <Input
                    name="r3"
                    onChange={handleChange}
                    value={values.r3}
                    className="mt-1  w-[100px]"
                    type="number"
                    min={0}
                  />
                </div>
                &nbsp;
                <div className=" ml-5">

                </div>
              </div>
            </div> */}
            <div className="w-[100%]">
              {apiData?.length > 0 && (
                <CandleChart
                  //   id={id}
                  getChartData={getChartData}
                  handleCreateTrendLines={handleCreateTrendLines}
                  data={apiData}
                  intractiveData={intractiveData}
                  // getMoreData={() => {}}
                  ratio={1}
                  width={width}
                  showRow={showRow}
                  theme={theme}
                  // xExtents={xExtents}
                  height={(height * 7) / 10}
                  chartType={chartType}
                  trends3={trends3}
                  setTrends3={setTrends3}
                  alert3={alert3}
                  setAlert3={setAlert3}
                />
              )}
            </div>
          </div>

          {id && <LiveDataTable id={id} socketData={socketData} />}
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
