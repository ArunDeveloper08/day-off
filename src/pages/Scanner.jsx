import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Vortex } from "../components/ui/vortex"; // Import your Vortex component

const Scanner = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rsiFilter, setRsiFilter] = useState("");
  const [atrFilter, setAtrFilter] = useState("");

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      const response = await axios.get(`${BASE_URL_OVERALL}/scanner`);
      setData(response?.data?.data);
      setFilteredData(response?.data?.data); // Initially, all data is shown
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  useEffect(() => {
    document.title = "Scanner";
    fetchStockData();
    const interval = setInterval(fetchStockData, 60 * 1000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Filter Data
  const handleFilterChange = () => {
    let filtered = data;

    // Apply RSI filter
    if (rsiFilter) {
      const [condition, value] = rsiFilter?.split("-");
      const rsiValue = parseFloat(value);
      filtered = filtered.filter((item) => {
        if (condition === "less") return item.OneDay_RSI < rsiValue;
        if (condition === "more") return item.OneDay_RSI > rsiValue;
        return false;
      });
    }

    // Apply ATR filter
    if (atrFilter) {
      const [condition, value] = atrFilter?.split("-");
      const atrValue = parseFloat(value);
      filtered = filtered.filter((item) => {
        if (condition === "less") return item.OneHour_ATR < atrValue;
        if (condition === "more") return item.OneHour_ATR > atrValue;
        return false;
      });
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [rsiFilter, atrFilter]);

  return (
    <div className="relative w-full h-screen">
      {/* Vortex Background Effect */}
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="absolute inset-0 z-0"
      >
        {/* Scanner Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <h2 className="text-3xl font-bold font-serif text-white text-center mt-4 underline">SCANNER</h2>

          {/* Filter Options */}
          <div className="flex gap-4 mt-4">
            {/* RSI Filter */}
            <select
              className="p-2 border rounded-md"
              value={rsiFilter}
              onChange={(e) => setRsiFilter(e.target.value)}
            >
              <option value="">Filter RSI</option>
              <option value="less-30">RSI less 30</option>
              <option value="more-50">RSI more 50</option>
              <option value="less-50">RSI less 50</option>
              <option value="more-70">RSI more 70</option>
            </select>

            {/* ATR Filter */}
            <select
              className="p-2 border rounded-md"
              value={atrFilter}
              onChange={(e) => setAtrFilter(e.target.value)}
            >
              <option value="">Filter ATR</option>
              <option value="less-30">ATR less 30</option>
              <option value="more-50">ATR more 50</option>
              <option value="less-50">ATR less 50</option>
              <option value="more-70">ATR more 70</option>
            </select>
          </div>

          {/* Stock data table */}
          <div className="relative w-full overflow-x-auto mt-6">
            <table className="dashboard-table2 w-[1400px] mx-auto">
              <thead  className="sticky top-0 bg-black z-10">
                <tr className="font-mono">
                  <th>Sr. No.</th>
                  <th>Identifier</th>
                  <th>Index</th>
                  <th>Lot Size</th>
                  <th>Exchange</th>
                  <th>1 Day RSI</th>
                  <th>1 Hour RSI</th>
                  <th>15 Min RSI</th>
                  <th>5 Min RSI</th>
                  <th>1 Hour ATR</th>
                  <th>15 Min ATR</th>
                  <th>5 Min ATR</th>
                  <th>CE Percent</th>
                  <th>PE Percent</th>
                  <th>COI PCR</th>
                  <th>OI PCR</th>
                  <th>Long Interval</th>
                  <th>Short Interval</th>
                  <th>Long Int From Date</th>
                  <th>Short Int From Date</th>
                  <th>Swing Low</th>
                  <th>Swing High</th>
                  <th>Terminal</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr className="font-mono text-pink-600 font-semibold" key={item.masterIdentifier}>
                    <td>{index + 1}</td>
                    <td>{item.masterIdentifier}</td>
                    <td>{item.tradeIndex}</td>
                    <td>{item.lotSize}</td>
                    <td>{item.exchange}</td>
                    <td>{item.OneDay_RSI}</td>
                    <td>{item.OneHour_RSI}</td>
                    <td>{item.FifteenMin_RSI}</td>
                    <td>{item.FiveMin_RSI}</td>
                    <td>{item.OneHour_ATR}</td>
                    <td>{item.FifteenMin_ATR}</td>
                    <td>{item.FiveMin_ATR}</td>
                    <td>{item.CE_Percent}</td>
                    <td>{item.PE_Percent}</td>
                    <td>{item.COI_PCR}</td>
                    <td>{item.OI_PCR}</td>
                    <td>{item.LongInterval}</td>
                    <td>{item.ShortInterval}</td>
                    <td>{item.LongIntervalFromDate}</td>
                    <td>{item.ShortIntervalFromDate}</td>
                    <td>{item.SwingLow}</td>
                    <td>{item.SwingHigh}</td>
                    <td
                      className={`${
                        item.terminal === "ON" ? "text-red-500" : "text-green-500"
                      } font-bold px-2 py-1 rounded-sm`}
                    >
                      {item.terminal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Vortex>
    </div>
  );
};

export default Scanner;
