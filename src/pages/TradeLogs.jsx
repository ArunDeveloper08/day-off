import { Button } from "@/components/ui/button";
import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useState, useMemo } from "react";

const TradeLogs = () => {
  const [data, setData] = useState([]);
  const [filterIdentifier, setFilterIdentifier] = useState("");
  const [dateTime, setDateTime] = useState({
    timestamp1: new Date().toISOString().split("T")[0] + "T09:15",
    timestamp2: new Date().toISOString().split("T")[0] + "T23:30",
  });

  // Convert DateTime to YYYY-MM-DD
  const formatDate = (dateTimeString) => {
    return dateTimeString.split("T")[0]; // Extract YYYY-MM-DD
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDateTime((prev) => ({ ...prev, [name]: value }));
  };

  const getData = async () => {
    try {
      const fromDate = formatDate(dateTime.timestamp1);
      const toDate = formatDate(dateTime.timestamp2);

      // API should work for single-day selection
      const finalFromDate = fromDate;
      const finalToDate = toDate;

      const response = await axios.get(
        `${BASE_URL_OVERALL}/chart/getAiLogs?fromDate=${finalFromDate}&toDate=${finalToDate}`
      );

      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Filtered Data based on Identifier Input
  const filteredData = data.filter((item) =>
    item.identifier?.toLowerCase().includes(filterIdentifier.toLowerCase())
  );

  // Memoized Total Price Calculation
  const totalPrice = useMemo(() => {
    return (
      filteredData
        ?.filter(item => item.ExitPivot !== 0) // ✅ Exclude ExitPivot === 0
        .reduce((acc, item) => acc + ((item.ExitPivot - item.EntryPivot) || 0), 0) ?? 0
    );
  }, [filteredData]);
  

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
          {filteredData?.map((item, index) => {
            const priceDiff =
              item.EntryPivot !== null && item.ExitPivot !== null && item.ExitPivot != 0
                ? (item.ExitPivot - item.EntryPivot)?.toFixed(2)
                : "";

            return (
              <tr key={index}>
                <td className="border border-gray-300 text-center text-[13px]">
                  {index + 1}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.identifier}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.EntryTime}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.entryOrderType}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.EntryPivot?.toFixed(2)}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.CallType}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item.ExitTime}
                </td>
                <td className="border border-gray-300 text-center text-[13px] p-1">
                  {item?.ExitPivot?.toFixed(2)}
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
        Total Price: {totalPrice.toFixed(2)}
      </h1>
    </div>
  );
};

export default TradeLogs;
