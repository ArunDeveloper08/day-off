import { useConfig } from "@/hooks/use-config";
import { formatDate } from "@/lib/utils";
import { useLiveSocket } from "@/providers/live-socket-provider";
import axios from "axios";
import { useEffect, useState } from "react";

const LiveTable = () => {
  const { config, tradeConfig } = useConfig();
  const [data, setData] = useState([]);
  const [lastTwoDiffs, setLastTwoDiffs] = useState({
    diff1: null,
    diff2: null,
  });
  const [socketData, setSocketData] = useState([]);
  const { isConnected, socket } = useLiveSocket();

  const liveTradeData = () => {
    axios
      .get(`${tradeConfig.url}/chart/realTime`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    liveTradeData(); // Initial call

    const interval = setInterval(liveTradeData, 5 * 1000); // Set interval for 5 minutes

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    socket.on("getLiveData", (message) => {
      if (!message) return;
      setSocketData(message);
    });
  }, [socket, isConnected]);

  useEffect(() => {
    if (data?.length >= 0 && socketData?.last_price) {
      const lastTwo = data?.slice(0, 2);
      const diff1 = calculateDiff(lastTwo?.[0]);
      const diff2 = calculateDiff(lastTwo?.[1]);
      setLastTwoDiffs({ diff1, diff2 });
    }
  }, [data, socketData]);

  const calculateDiff = (item) => {
    if (
      !item ||
      !socketData?.last_price ||
      !item?.entryPivot ||
      item?.exitPivot
    )
      return null;
    let diff = null;
    if (item.CallType === "CE") {
      diff = (socketData.last_price - item.entryPivot).toFixed(2);
    } else if (item.CallType === "PE") {
      diff = (socketData.last_price - item.entryPivot).toFixed(2);
    }
    return { CallType: item.CallType, identifier: item.identifier, diff };
  };

  console.log(trands);

  return (
    <div>
      <div className="ml-3 mt-2 flex justify-around">
        {lastTwoDiffs.diff1?.diff && (
          <p className="font-semibold font-serif">
            {lastTwoDiffs.diff1?.identifier} ({lastTwoDiffs.diff1?.CallType}):{" "}
            {lastTwoDiffs.diff1?.diff}
          </p>
        )}
        {lastTwoDiffs.diff2?.diff && (
          <p className="font-semibold font-serif">
            {lastTwoDiffs.diff2?.identifier} ({lastTwoDiffs.diff2?.CallType}):{" "}
            {lastTwoDiffs.diff2?.diff}
          </p>
        )}
      </div>
      <table className="w-fit mx-auto mb-20">
        <thead>
          <tr>
            <th className="p-1 border border-gray-300">Sr No.</th>
            <th className="p-1 border border-gray-300">Symbol</th>
            <th className="p-1 border border-gray-300">Entry Time</th>
            <th className="p-1 border border-gray-300">Exit Time</th>
            <th className="p-1 border border-gray-300">API Entry Time</th>
            <th className="p-1 border border-gray-300">API Exit Time</th>
            <th className="p-1 border border-gray-300">Identifier</th>
            <th className="p-1 border border-gray-300">Entry Type</th>
            <th className="p-1 border border-gray-300">Call Type</th>
            <th className="p-1 border border-gray-300">Entry Pivot</th>
            <th className="p-1 border border-gray-300">Exit Pivot</th>
            <th className="p-1 border border-gray-300">Price Diff</th>
            <th className="p-1 border border-gray-300">Transaction Type</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data?.map((item, index) => {
              let priceDiff = null;

              if (item.entryPrice !== null && item.exitPrice !== null) {
                priceDiff =
                  item.CallType === "PE"
                    ? (item.entryPrice - item.exitPrice).toFixed(2)
                    : (item.exitPrice - item.entryPrice).toFixed(2);
              }
              return (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-300 text-center text-[13px]">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.symbol}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.realEntryTime)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.realExitTime)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.entryTime)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.exitTime)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.identifier}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.EntryType}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.CallType}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.entryPivot?.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item?.exitPivot?.toFixed(2)}
                  </td>
                  <td className="p-1 border border-gray-300 text-center text-[13px]">
                    {priceDiff}
                  </td>
                  <td className="p-1 border border-gray-300 text-center text-[13px]">
                    <button className="rounded-sm text-[13px] p-1">
                      {item.transactionType}
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default LiveTable;
