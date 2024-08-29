import axios from "axios";
import React, { useEffect, useState } from "react";
import { useConfig } from "@/hooks/use-config";
import { formatDate } from "@/lib/utils";

const BackTestingTable = ({ handleOFF, updateTrigger, setUpdateTrigger }) => {
  const [data, setData] = useState([]);
  const [sum, setSum] = useState(0);
  const { config, tradeConfig } = useConfig();

  const handleDelete = () => {
    axios
      .delete(`${tradeConfig.url}/setting/testing/delete`)
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
      .get(`${tradeConfig.url}/setting/getData`)
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
            item.CallType === "secondary"
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
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-[#3a2d7d] text-white">
                <th className="p-2 border border-gray-300">Sr No.</th>
                {/* <th className="p-2 border border-gray-300">Symbol</th> */}
                <th className="p-2 border border-gray-300">D_Exit Value</th>
                <th className="p-2 border border-gray-300">RSI Value</th>
                <th className="p-2 border border-gray-300">Identifier</th>
                <th className="p-2 border border-gray-300">Entry Type</th>
                <th className="p-2 border border-gray-300">Entry Price</th>
                <th className="p-2 border border-gray-300">Exit Price</th>
                <th className="p-2 border border-gray-300">Entry Time</th>
                <th className="p-2 border border-gray-300">Exit Time</th>
                <th className="p-2 border border-gray-300">Price Diff</th>
                <th className="p-2 border border-gray-300">Trans. Type</th>
                <th className="p-2 border border-gray-300">Option</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((item, index) => {
                let priceDiff = null;

                if (item.entryPrice !== null && item.exitPrice !== null) {
                  priceDiff =
                    item.CallType === "secondary"
                      ? (item.entryPrice - item.exitPrice).toFixed(2)
                      : (item.exitPrice - item.entryPrice).toFixed(2);
                }
                return (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="p-1 border border-gray-300 text-center">
                      {index + 1}
                    </td>
                    {/* <td className="p-1 border border-gray-300 text-center">
                      {item.symbol}
                    </td> */}
                        <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.dynamicExitValue?.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 text-center text-[13px] p-1">
                    {item.RSI_Value?.toFixed(2)}
                  </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.identifier}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      {item.CallType}
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
          </table>
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

export default BackTestingTable;
          