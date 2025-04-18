import { useTheme } from "@/components/theme-provider";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { useEffect, useState } from "react";

const LiveDataTable = ({
  id,
  socketData,
  socketMastertData,
  values,
  identifier,
}) => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [sum, setSum] = useState(0);
  const [lastTwoDiffs, setLastTwoDiffs] = useState({ diff1: null , diff2 : null  });

  const liveTradeData = () => {
    axios
      .post(`${BASE_URL_OVERALL}/chart/getLogs?id=${id}`, {
        identifier: identifier,
      })
      .then((res) => setData(res.data.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    liveTradeData();
    const interval = setInterval(liveTradeData, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const total = data?.reduce((acc, item) => {
      if (item.EntryPivot !== null && item.ExitPivot !== null && item.ExitPivot != 0) {
        const diff = item.ExitPivot - item?.EntryPivot;
        return acc + diff;
      }
      return acc;
    }, 0);
    setSum(total);
  }, [data]);

  useEffect(() => {
    if (data?.length >= 0 && socketData?.last_traded_price) {
      const lastTwo = data?.slice(0, 3);
      const diff1 = calculateDiff(lastTwo?.[0]);
      const diff2 = calculateDiff(lastTwo?.[1]);
      const diff3 = calculateDiff(lastTwo?.[2]);
      setLastTwoDiffs({ diff1 , diff2 , diff3 });
    }
  }, [data, socketData]);

  const calculateDiff = (item) => {
    if (
      !item ||
      !socketData?.last_traded_price ||
 
      !item?.EntryPivot ||
      item?.ExitPivot
    )
      return null;

    let diff = null;

    // Check tradeIndex condition
    if (values?.tradeIndex === 7 || values?.tradeIndex === 17) {
      if (item.CallType === "CE") {
        diff = (socketMastertData.last_traded_price - item.EntryPivot)?.toFixed(
          2
        );
      } else if (item.CallType === "PE") {
        diff = (item.EntryPivot - socketMastertData.last_traded_price)?.toFixed(
          2
        );
      }
    } else {
    
      diff = (socketData.last_traded_price - item.EntryPivot)?.toFixed(2);
      //  }
      //  else if (item.entryOrderType === "SELL") {
      //   diff = (item.EntryPivot - socketData.last_traded_price)?.toFixed(2);
      // }
    }

    return { identifier: item.identifier, diff };
  };
   
  return (  
    <div className="p-4">
      <div className="ml-3 mt-2 flex justify-around">

        {
          lastTwoDiffs?.diff2?.diff  ? 
          <p className="font-semibold font-serif">
            {lastTwoDiffs?.diff2?.identifier} : {lastTwoDiffs?.diff2?.diff}
          </p>
             :
          <p className="font-semibold font-serif">
          {lastTwoDiffs?.diff1?.identifier} : {lastTwoDiffs?.diff1?.diff}
        </p>
        }
        {/* {lastTwoDiffs?.diff1?.diff && (
          <p className="font-semibold font-serif">
            {lastTwoDiffs?.diff1?.identifier} : {lastTwoDiffs?.diff1?.diff}
          </p>
        )} */}
      </div>

      {/* Scrollable wrapper for the table */}

      <div className="overflow-x-auto">
        <table className="min-w-full mx-auto mb-20 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300">Sr No.</th>
              <th className="p-2 border border-gray-300">Entry Time</th>
              <th className="p-2 border border-gray-300">Entry Case</th>
              <th className="p-2 border border-gray-300">Entry  Type</th>
              <th className="p-2 border border-gray-300">Entry Price</th>
              <th className="p-2 border border-gray-300">Exit Time</th>
              <th className="p-2 border border-gray-300">Exit Case</th>
              <th className="p-2 border border-gray-300">Exit Price</th>
              <th className="p-2 border border-gray-300">Exit Order Type</th>
              <th className="p-2 border border-gray-300">Exit Reason</th>
              <th className="p-2 border border-gray-300">Price Diff</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, index) => {
              // console.log("item.entryOrderType",item.entryOrderType)
              const priceDiff =
                item.EntryPivot !== null && item.ExitPivot !== null && item.ExitPivot != 0
                  ? (item.ExitPivot - item.EntryPivot)?.toFixed(2)
                  : null;

              return (
                <tr
                  key={index}
                  className={`${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {index + 1}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    { item.EntryTime && item.EntryTime?.split("T")
                      .map((part, index) =>
                        index === 1 ? part.slice(0, 8) : part
                      )
                      .join(" ")}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.EntryCase}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    Buy
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.EntryPivot?.toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.ExitTime && item.ExitTime?.split("T")
                      .map((part, index) =>
                        index === 1 ? part.slice(0, 8) : part
                      )
                      .join(" ")}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.ExitCase}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.ExitPivot?.toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.TransactionType}
                  </td>
                  <td className="p-2 border border-gray-300 text-center text-sm">
                    {item.exitReason}
                  </td>
                  <td
                    className={`p-2 border border-gray-300 text-center text-sm font-semibold ${
                      priceDiff < 0 ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {priceDiff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <p className="font-bold text-center text-xl">
          Total Point Difference:{" "}
          <span
            className={`${
              sum < 0 ? "text-red-700" : "text-green-700"
            } font-bold`}
          >
            {sum?.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LiveDataTable;
