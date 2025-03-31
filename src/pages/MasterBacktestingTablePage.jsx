import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { BASE_URL_OVERALL } from "@/lib/constants";

const MasterBacktestingTablePage = ({ handleOFF, updateTrigger, setUpdateTrigger, id, data: symbol }) => {
  const [ceData, setCeData] = useState([]);
  const [peData, setPeData] = useState([]);
  const [ceSum, setCeSum] = useState(0);
  const [peSum, setPeSum] = useState(0);
  const { theme } = useTheme();

  const handleDelete = () => {
    axios.delete(`${BASE_URL_OVERALL}/test/delLogs?id=${id}`)
      .then((res) => {
        alert(res.data.message);
        setUpdateTrigger(!updateTrigger);
      })
      .catch((err) => console.log(err));
  };

  const getData = () => {
    axios.get(`${BASE_URL_OVERALL}/test/getSymbolData?symbol=${symbol}`)
      .then((res) => {
        setCeData(res.data.CE || []);
        setPeData(res.data.PE || []);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTotal = (data) => {
      return data.reduce((acc, item) => {
        if (item.entryPivot !== null && item.exitPivot !== null) {
          return acc + (item.exitPivot - item.entryPivot);
        }
        return acc;
      }, 0);
    };
    setCeSum(calculateTotal(ceData));
    setPeSum(calculateTotal(peData));      
  }, [ceData, peData]);

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const renderTable = (title, data, sum) => (
    <div className="p-2 overflow-x-auto">
      
      {data.length > 0 && (
        <>
        <h2 className="text-xl font-bold text-center mb-2">{symbol}&nbsp;{title}</h2>
          <table className="w-fit mx-auto mb-10">
            <thead>
              <tr>
                <th className="p-1 border border-gray-300">Sr No.</th>
                <th className="p-1 border border-gray-300">Identifier</th>
                <th className="p-1 border border-gray-300">Entry Time</th>
                <th className="p-1 border border-gray-300">Entry Case</th>
                <th className="p-1 border border-gray-300">Entry Order Type</th>
                <th className="p-1 border border-gray-300">Entry Price</th>
                <th className="p-1 border border-gray-300">Call Type</th>
                <th className="p-1 border border-gray-300">Exit Time</th>
                <th className="p-1 border border-gray-300">Exit Case</th>
                <th className="p-1 border border-gray-300">Exit Price</th>
                <th className="p-1 border border-gray-300">Exit Order Type</th>
                <th className="p-1 border border-gray-300">Exit Reason</th>
                <th className="p-1 border border-gray-300">Price Diff</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const priceDiff =
                  item.entryPivot !== null && item.exitPivot !== null
                    ? (item.exitPivot - item.entryPivot)?.toFixed(2)
                    : null;
                return (
                  <tr key={index} className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                    <td className="border border-gray-300 text-center text-[13px]">{index + 1}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.identifier}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{formatDate(item.realEntryTime)}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.EntryCase}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.entryOrderType}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.entryPivot?.toFixed(2)}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.CallType}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{formatDate(item.realExitTime)}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.ExitCase}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item?.exitPivot?.toFixed(2)}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.exitOrderType}</td>
                    <td className="border border-gray-300 text-center text-[13px] p-1">{item.exitReason}</td>
                    <td className={`p-1 border border-gray-300 text-center text-[13px] font-semibold ${priceDiff < 0 ? "text-red-700" : "text-green-700"}`}>{priceDiff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div>
            <p className="font-bold text-center text-xl">
              Total Point Difference: <span className={`${sum < 0 ? "text-red-700" : "text-green-700"} font-bold text-xl`}>{sum?.toFixed(2)}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      {renderTable("CE DATA", ceData, ceSum)}
      {renderTable("PE DATA", peData, peSum)}
    </div>
  );
};

export default MasterBacktestingTablePage;
