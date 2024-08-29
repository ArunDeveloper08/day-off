import { BASE_URL_OVERALL } from "@/lib/constants";
import { useLiveSocket } from "@/providers/live-socket-provider";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CandleChart from "../components/LiveGraph";
import LiveDataTable from "./live-table";
import "react-toastify/dist/ReactToastify.css";
import { groupBy } from "./dashboard";

import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import UIButton from "../components/UIButton";
import { IoPlay, IoPause } from "react-icons/io5";

export const LivePage = () => {
  const { theme, setTheme } = useTheme();
  const [intractiveData, setIntractiveData] = useState([]);
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
  // const [instrumentData, setInstrumentData] = useState("");
  const [isUserScroll, setIsUserScroll] = useState(false);
  const [masterId, setMasterId] = useState("");

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
    monthlyHigh: false,
    weekly: false,
    fourHourly: false,
    hourly: false,
    daily: false,
    suppRes: false,
  });
  const [apiData, setApiData] = useState([]);
  const [data, setData] = useState({
    loading: false,
    data: {},
    error: "",
  });
  const [hideConfig , setHideConfig] = useState(true)
  if (!id) return null;
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

  const getChartData = () => {
    if (isUserScroll) return;
    axios
      .get(`${BASE_URL_OVERALL}/chart?id=${id}&date=${prevDate}`)
      .then((res) => {
        setIntractiveData(res.data);
        setApiData(res.data.data);
        setMasterId(res.data.masterID);
      })
      .catch((err) => {
        console.log("API Fail to get Chart Data");
      });
  };

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
  }, [id, prevDate, isUserScroll]);

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
      // console.log(socketdata)
      if (socketdata.token === data?.data.instrument_token) {
        setSocketData(socketdata);
      }
    });
    return () => {
      socket.off("getLiveData");
    };
  }, [socket, data, isConnected]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  return (
    <div>
      {data.error ? (
        "Some Error Occcured"
      ) : (
        <>
          <div>
            <p className="font-semibold text-center font-mono text-[20px] text-green-600">
              Angel-One(Main Chart)
              <Button size="sm" onClick={()=>setHideConfig(prev=>!prev)}>
                {hideConfig ? "Hide Config Data" : "Show Config Data"}
              </Button>
            </p>
            {
              hideConfig && 
              <div>
              <UIButton
                getHighLowLines={getHighLowLines}
                showRow={showRow}
                setShowRow={setShowRow}
                data={data}
                socketData={socketData}
                masterId={masterId}
              />
            </div>  
            }
          
            <div className="flex justify-center ">
              <div className="px-1 flex items-center ">
                {/* <Label>Date :</Label> */}
                <Input
                  type="date"
                  value={prevDate}
                  placeholder="date"
                  className="w-[150px] border-black border-[1px] rounded-md"
                  onChange={(e) => setPrevDate(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <Button onClick={handleSubmit} size="xs" className="p-1">
                  Submit
                </Button>
              </div>
              <button className="text-lg text-center font-semibold text-green-600 ml-5">
                LTP : {socketData?.last_traded_price} &nbsp; &nbsp; RSI Live :{" "}
                {socketData?.RSI_value} &nbsp; &nbsp;
              </button>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <button onClick={toggleScroll}>
                {isUserScroll ? (
                  <IoPlay className="size-6" />
                ) : (
                  <IoPause className="size-6" />
                )}
              </button>
              <div className="flex">
                &nbsp; &nbsp; &nbsp;
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
                  <div className=" flex items-center ">
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
                {/* <ModeToggle /> */}
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
                  data={apiData}
                  intractiveData={intractiveData}
                  getMoreData={() => {}}
                  ratio={1}
                  width={width}
                  showRow={showRow}
                  theme={theme}
                  // xExtents={xExtents}

                  height={(height * 7) / 10}
                />
              )}
            </div>
          </div>

          {id && <LiveDataTable id={id} socketData={socketData} />}
        </>
      )}
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
