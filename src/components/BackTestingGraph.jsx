import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { useConfig } from "@/hooks/use-config";
import { useBackTestSocket } from "@/providers/back-socket-provider";
import CandleChart from "./LiveGraph";
import BackTestingTable from "./BackTestingTable";

const BackTestingGraph = () => {
  const { config, tradeConfig } = useConfig();
  const [apiData, setApiData] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [dateTime, setDateTime] = useState({
    timestamp1: "",
    timestamp2: "",
  });
  const [showRow, setShowRow] = useState({
    showAvg: true,
  });
  const { socket, isConnected } = useBackTestSocket();
  console.log(isConnected)
  const handleStart = () => {
    axios
      .post(`${tradeConfig.url}/setting/startTesting`, {
        ...config,
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

  const [cumulativeState, setCumulativeState] = useState({
    cumulativeDiff: 0,
    cumulativeDiffPut: 0,
  });

  useEffect(() => {
    if (isConnected) {
      socket?.on("sendingTradeData", (message) => {
        const { data } = message;
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
          return {
            cumulativeDiff: newCumulativeDiff,
            cumulativeDiffPut: newCumulativeDiffPut,
          };
        });
      });
    }
  }, [socket, isConnected]);

  let width = useMemo(() => window.screen.width, []);
  let height = useMemo(() => window.screen.height, []);

  const handleRESET = () => {
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "timestamp1") {
      const datePart = value.split("T")[0];
      const fixedTime = "09:15";
      setDateTime({ ...dateTime, [name]: `${datePart}T${fixedTime}` });
    } else {
      const datePart = value.split("T")[0];
      const fixedTime = "15:30";
      setDateTime({ ...dateTime, [name]: `${datePart}T${fixedTime}` });
    }
  };

  // console.log("apiData", apiData); 
  return (
    <>
      <div className="flex justify-around mt-2">
        <div className="flex">
        <input
          value={dateTime.timestamp1}
          name="timestamp1"
          type="datetime-local"
          className="border-black border-2 w-full max-w-[200px] rounded-md"
          onChange={handleChange}
        />
        <p className="text-xl">-- To --</p>
        <input
          value={dateTime.timestamp2}
          name="timestamp2"
          type="datetime-local"
          className="border-black border-2 w-full max-w-[200px] rounded-md"
          onChange={handleChange}
        />
        </div>
        <Button onClick={handleStart}>Start</Button>
        <Button onClick={handleRESET}>RESET</Button>      
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
      <BackTestingTable      
        updateTrigger={updateTrigger}
        setUpdateTrigger={setUpdateTrigger}
      />
    </>
  );
};

export default BackTestingGraph;
