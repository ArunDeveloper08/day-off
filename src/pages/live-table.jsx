import { useTheme } from "@/components/theme-provider";
import { useConfig } from "@/hooks/use-config";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useLiveSocket } from "@/providers/live-socket-provider";
import axios from "axios";
import { useEffect, useState } from "react";

const LiveDataTable = ({ id, socketData }) => {
  const { theme } = useTheme();

  const [data, setData] = useState([]);
  const [sum, setSum] = useState(0);
  const [lastTwoDiffs, setLastTwoDiffs] = useState({
    diff1: null,
  });
  // const [socketData, setSocketData] = useState([]);
  const { isConnected, socket } = useLiveSocket();

  const liveTradeData = () => {
    axios
      .get(`${BASE_URL_OVERALL}/chart/getLogs?id=${id}`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    liveTradeData(); // Initial call
    const interval = setInterval(liveTradeData, 10 * 1000);
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  useEffect(() => {
    if (data) {
      const total = data?.reduce((acc, item) => {
        if (item.entryPrice !== null && item.exitPrice !== null) {
          const diff =
            item.OrderType === "Sell"
              ? item.entryPrice - item.exitPrice
              : item.exitPrice - item.entryPrice;
          return acc + diff;
        }
        return acc;
      }, 0);
      setSum(total);
    }
  }, [data]);

  useEffect(() => {
    // console.log("socketData",socketData);
    // console.log("data",data);
    if (data?.length >= 0 && socketData?.last_traded_price) {
      const lastTwo = data?.slice(0, 2);
      // console.log("lastTwo",lastTwo)

      const diff1 = calculateDiff(lastTwo?.[0]);
      // console.log("diff1",diff1)
      // const diff2 = calculateDiff(lastTwo?.[1]);
      setLastTwoDiffs({ diff1 });
    }
  }, [data, socketData]);
  let priceDiff = null;

  const calculateDiff = (item) => {
    if (
      !item ||
      !socketData?.last_traded_price ||
      !item?.entryPivot ||
      item?.exitPivot
      // priceDiff
    )
      return null;
    let diff = null;
    if (item.OrderType === "Buy") {
      diff = (socketData.last_traded_price - item.entryPivot)?.toFixed(2);
     
    } else if (item.OrderType === "Sell") {
      diff = (item.entryPivot - socketData.last_traded_price)?.toFixed(2);
    }
    return { identifier: item.identifier, diff };
  };
  // console.log("lastTwoDiffs",lastTwoDiffs)
  // console.log("diff",lastTwoDiffs.diff1)
  return (
    <div>
      <div className="ml-3 mt-2 flex justify-around">
        {lastTwoDiffs.diff1?.diff && (
          <p className="font-semibold font-serif">
            {lastTwoDiffs.diff1?.identifier} : {lastTwoDiffs.diff1?.diff}
          </p>
        )}
      </div>
      <table className="w-fit mx-auto mb-20">
        <thead>
          <tr>
            <th className="p-1 border border-gray-300">Sr No.</th>
            <th className="p-1 border border-gray-300">Identifier</th>
            <th className="p-1 border border-gray-300">D_Exit Value</th>
            <th className="p-1 border border-gray-300">RSI Value</th>
            <th className="p-1 border border-gray-300">Entry Time</th>
            <th className="p-1 border border-gray-300">Exit Time</th>
            <th className="p-1 border border-gray-300">Entry Type</th>
            <th className="p-1 border border-gray-300">Entry Price</th>
            <th className="p-1 border border-gray-300">Exit Price</th>
            <th className="p-1 border border-gray-300">Price Diff</th>
            <th className="p-1 border border-gray-300">Transaction Type</th>
            <th className="p-1 border border-gray-300">Order Type</th>
            <th className="p-1 border border-gray-300">Entry Reason</th>
            <th className="p-1 border border-gray-300">Exit Reason</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data?.map((item, index) => {
            
              if (item.entryPrice !== null && item.exitPrice !== null) {
                priceDiff =
                  item.OrderType === "Sell"
                    ? (item.entryPrice - item.exitPrice).toFixed(2)
                    : (item.exitPrice - item.entryPrice).toFixed(2);
              }
              return (
                <tr
                  key={index}
                  className={`${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <td className="border border-gray-300 text-center text-[13px]">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.identifier}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.dynamicExitValue?.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.RSI_Value?.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.realEntryTime)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.realExitTime)}
                  </td>
                  {/* <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.entryTime)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {formatDate(item.exitTime)}
                  </td> */}
                  {/* <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.identifier}
                </td> */}
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.EntryType}
                  </td>
                  {/* <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.CallType}
                </td> */}
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
                  <td className="p-1 border border-gray-300 text-center text-[13px]">
                   
                      {item.OrderType}
               
                  </td>
                  <td className="p-1 border border-gray-300 text-center text-[13px]">
                    {item.buyReason}
                  </td>
                  <td className="p-1 border border-gray-300 text-center text-[13px]">
                    {item.exitReason}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className="mt-2">
        <p className="font-bold text-center text-xl ">
          Total Point Difference: {sum?.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default LiveDataTable;
