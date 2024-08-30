import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { formatDate } from "@/lib/utils";
import { BASE_URL_OVERALL } from "@/lib/constants";

const BackTestingTablePage = ({
  handleOFF,
  updateTrigger,
  setUpdateTrigger,
  id,
}) => {
  const [data, setData] = useState([]);
  const [sum, setSum] = useState(0);
  const { theme } = useTheme();

  const handleDelete = () => {
    axios
      .delete(`${BASE_URL_OVERALL}/test/delLogs?id=${id}`)
      .then((res) => {
        alert(res.data.message);
        setUpdateTrigger(!updateTrigger);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getData = () => {
    axios
      .get(`${BASE_URL_OVERALL}/test/getLogs?id=${id}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 5 * 1000);
    return () => clearInterval(interval);
  }, [updateTrigger, handleOFF]);

  useEffect(() => {
    if (data?.data) {
      const total = data.data.reduce((acc, item) => {
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

  return (
    <div className="p-2 overflow-x-auto">
      {data?.data?.length > 0 && (
        <>
          <table className="w-fit mx-auto mb-20">
            <thead>
              <tr className="bg-[#3a2d7d] text-white">
                <th className="p-1border border-gray-300">Sr No.</th>
                <th className="p-1border border-gray-300">Entry Time</th>
                <th className="p-1border border-gray-300">RSI value</th>
                <th className="p-1border border-gray-300">D Entry Value</th>
                <th className="p-1border border-gray-300">Entry Type</th>
                <th className="p-1border border-gray-300">Entry Price</th>
                <th className="p-1border border-gray-300">Exit Time</th>
                <th className="p-1border border-gray-300">D EXit Value</th>
                <th className="p-1border border-gray-300">Exit Type</th>
                <th className="p-1border border-gray-300">Exit Price</th>
                <th className="p-1border border-gray-300">Difference</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((item, index) => {
                let priceDiff = null;
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
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    }`}>
                    <td className="p-1 border border-gray-300 text-center">
                      {index + 1}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {formatDate(item.entryTime)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.RSI_Value?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item?.dynamicEntryValue?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.OrderType}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.entryPrice?.toFixed(2)}
                    </td>

                    <td className="p-1 border border-gray-300 text-center">
                      {formatDate(item.exitTime)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.dynamicExitValue?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.transactionType}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.exitPrice?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {priceDiff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* <table className="w-fit mx-auto mb-20">
            <thead>
              <tr className="bg-[#3a2d7d] text-white">
                <th className="p-1border border-gray-300">Sr No.</th>
                <th className="p-1border border-gray-300">Symbol</th>
                <th className="p-1border border-gray-300">
                  Dynamic Exit Value
                </th>
                <th className="p-1border border-gray-300">Identifier</th>
                <th className="p-1border border-gray-300">Entry Type</th>
                <th className="p-1border border-gray-300">Entry Price</th>
                <th className="p-1border border-gray-300">Exit Price</th>
                <th className="p-1border border-gray-300">Entry Time</th>
                <th className="p-1border border-gray-300">Exit Time</th>
                <th className="p-1border border-gray-300">Price Diff</th>
                <th className="p-1border border-gray-300">Transaction Type</th>
                <th className="p-1border border-gray-300">Order Type</th>
                <th className="p-1border border-gray-300">Option</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((item, index) => {
                let priceDiff = null;

                if (item.entryPrice !== null && item.exitPrice !== null) {
                  priceDiff =
                    item.OrderType === "Sell"
                      ? (item.entryPrice - item.exitPrice).toFixed(2)
                      : (item.exitPrice - item.entryPrice).toFixed(2);
                }
                return (
                  <tr key={index}
                  className={`${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  >
                    <td className="p-1 border border-gray-300 text-center">
                      {index + 1}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.symbol}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.dynamicExitValue?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.identifier}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      Buy
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.entryPrice?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.exitPrice?.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {formatDate(item.entryTime)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {formatDate(item.exitTime)}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {priceDiff}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.transactionType}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.OrderType}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      <button
                        className="bg-red-500 text-white rounded-sm hover:bg-red-700 px-2 py-1"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table> */}
          <div className="mt-2">
            <p className="font-semibold">
              Total Point Difference: {sum?.toFixed(2)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BackTestingTablePage;
