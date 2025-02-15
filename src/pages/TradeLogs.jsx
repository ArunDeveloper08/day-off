import { Button } from "@/components/ui/button";
import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

const TradeLogs = () => {
  const [data, setData] = useState([]);
  const [filterIdentifier, setFilterIdentifier] = useState(""); // State for identifier filter
  const [dateTime, setDateTime] = useState({
    timestamp1: new Date().toISOString().split("T")[0] + "T09:15",
    timestamp2: new Date().toISOString().split("T")[0] + "T23:30",
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDateTime({ ...dateTime, [name]: value });
  };

  const getData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/chart/getAiLogs?fromDate=${formatDate(
          dateTime.timestamp1
        )}&toDate=${formatDate(dateTime.timestamp2)}`
      );
      setData(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredData = data.filter((item) =>
    item.identifier?.toLowerCase().includes(filterIdentifier.toLowerCase())
  );

  const price = useCallback(() => {
    const TotalPrice =
    filteredData?.reduce(
        (acc, item) => acc + (item.exitPivot - item.entryPivot),
        0
      ) ?? 0;
    return TotalPrice;
  }, [filteredData]);

  console.log(price());

  // Filtered data based on identifier input


  return (
    <div>
      <h1 className="flex justify-center p-2 text-2xl font-bold">Trade Logs</h1>
      <div className="flex justify-center p-4 space-x-2">
        <input
          value={dateTime.timestamp1}
          name="timestamp1"
          type="datetime-local"
          className="border-black border-2 w-[200px] rounded-md"
          onChange={handleChange}
        />

        <p className="text-xl font-serif"> -- To -- </p>

        <input
          value={dateTime.timestamp2}
          name="timestamp2"
          type="datetime-local"
          className="border-black border-2 w-[200px] rounded-md"
          onChange={handleChange}
        />
        <Button onClick={getData}>Submit</Button>
      </div>

      {/* Identifier Filter Input */}
      <div className="flex justify-center p-4">
        <input
          type="text"
          placeholder="Filter by Identifier"
          value={filterIdentifier}
          onChange={(e) => setFilterIdentifier(e.target.value)}
          className="border border-gray-300 px-2 py-1 rounded-md w-[250px]"
        />
      </div>

      <table className="w-fit mx-auto mb-20">
        <thead>
          <tr>
            <th className="p-1 border border-gray-300">Sr No.</th>
            <th className="p-1 border border-gray-300">Identifier</th>
            <th className="p-1 border border-gray-300">Entry Time</th>
            <th className="p-1 border border-gray-300">Entry Order Type</th>
            <th className="p-1 border border-gray-300">Entry Price</th>
            <th className="p-1 border border-gray-300">Call Type</th>
            <th className="p-1 border border-gray-300">Exit Time</th>
            <th className="p-1 border border-gray-300">Exit Price</th>
            <th className="p-1 border border-gray-300">Exit Order Type</th>
            <th className="p-1 border border-gray-300">Exit Reason</th>
            <th className="p-1 border border-gray-300">Price Diff</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => {
            const priceDiff =
              item.entryPivot !== null && item.exitPivot !== null
                ? (item.exitPivot - item.entryPivot)?.toFixed(2)
                : null;
            return (
              <tr key={index}>
                <td className="border border-gray-300 text-center text-[13px]">
                  {index + 1}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.identifier}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {(item.realEntryTime)}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.entryOrderType}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.entryPivot?.toFixed(2)}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.CallType}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {(item.realExitTime)}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item?.exitPivot?.toFixed(2)}
                </td>
                <td className="p-1 border border-gray-300 text-center text-[13px]">
                  <button className="rounded-sm text-[13px] p-1">
                    {item.exitOrderType}
                  </button>
                </td>
                <td className="p-1 border border-gray-300 text-center text-[13px]">
                  {item.exitReason}
                </td>
                <td
                  className={`${
                    priceDiff < 0 ? "text-red-700" : "text-green-700"
                  }
                    p-1 border border-gray-300 text-center text-[13px] font-semibold
                  `}
                >
                  {priceDiff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h1 className="flex justify-center text-2xl font-bold">
        Total Price : {price()?.toFixed(2)}
      </h1>
    </div>
  );
};

export default TradeLogs;
