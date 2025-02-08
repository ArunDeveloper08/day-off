import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Scanner = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State for RSI Filters
  const [rsi1DayFilter, setRsi1DayFilter] = useState("");
  const [rsi1HourFilter, setRsi1HourFilter] = useState("");
  const [rsi15MinFilter, setRsi15MinFilter] = useState("");
  const [rsi5MinFilter, setRsi5MinFilter] = useState("");

  // State for ATR Filters
  const [atr1HourFilter, setAtr1HourFilter] = useState("");
  const [atr15MinFilter, setAtr15MinFilter] = useState("");
  const [atr5MinFilter, setAtr5MinFilter] = useState("");

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      const response = await axios.get(`${BASE_URL_OVERALL}/scanner`);
      setData(response?.data?.data);
      setFilteredData(response?.data?.data); // Initially, show all data
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

  // Function to apply all filters
  const handleFilterChange = () => {
    let filtered = [...data]; // Always start with the full dataset
  
    // Generic filter function
    const applyFilter = (filter, key) => {
      if (filter) {
        const [condition, value] = filter.split("-");
        const filterValue = parseFloat(value);
        filtered = filtered.filter((item) => {
          if (condition === "less") return item[key] < filterValue;
          if (condition === "more") return item[key] > filterValue;
          return true;
        });
      }
    };
  
    // Apply filters for RSI and ATR
    applyFilter(rsi1DayFilter, "OneDay_RSI");
    applyFilter(rsi1HourFilter, "OneHour_RSI");
    applyFilter(rsi15MinFilter, "FifteenMin_RSI");
    applyFilter(rsi5MinFilter, "FiveMin_RSI");
    applyFilter(atr1HourFilter, "OneHour_ATR");
    applyFilter(atr15MinFilter, "FifteenMin_ATR");
    applyFilter(atr5MinFilter, "FiveMin_ATR");
  
    console.log("✅ Before setFilteredData:", filtered);
    setFilteredData([...filtered]); // ✅ Ensures new state reference
  };
  
  useEffect(() => {
    console.log("✅ Updated Filtered Data in State:", filteredData);
  }, [filteredData]);

  // Run filter function whenever filters change
  useEffect(() => {
    handleFilterChange();
  }, [rsi1DayFilter, rsi1HourFilter, rsi15MinFilter, rsi5MinFilter, atr1HourFilter, atr15MinFilter, atr5MinFilter]);

  return (
    <div className="relative w-full h-screen">
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <h2 className="text-3xl font-bold font-serif text-center mt-4 underline">SCANNER</h2>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {/* RSI Filters */}
          <select className="p-2 border rounded-md" value={rsi1DayFilter} onChange={(e) => setRsi1DayFilter(e.target.value)}>
            <option value="">Filter 1D RSI</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>

          <select className="p-2 border rounded-md" value={rsi1HourFilter} onChange={(e) => setRsi1HourFilter(e.target.value)}>
            <option value="">Filter 1H RSI</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>

          <select className="p-2 border rounded-md" value={rsi15MinFilter} onChange={(e) => setRsi15MinFilter(e.target.value)}>
            <option value="">Filter 15M RSI</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>

          <select className="p-2 border rounded-md" value={rsi5MinFilter} onChange={(e) => setRsi5MinFilter(e.target.value)}>
            <option value="">Filter 5M RSI</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>

          {/* ATR Filters */}
          <select className="p-2 border rounded-md" value={atr1HourFilter} onChange={(e) => setAtr1HourFilter(e.target.value)}>
            <option value="">Filter 1H ATR</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>

          <select className="p-2 border rounded-md" value={atr15MinFilter} onChange={(e) => setAtr15MinFilter(e.target.value)}>
            <option value="">Filter 15M ATR</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>

          <select className="p-2 border rounded-md" value={atr5MinFilter} onChange={(e) => setAtr5MinFilter(e.target.value)}>
            <option value="">Filter 5M ATR</option>
            <option value="less-30">Less than 30</option>
            <option value="more-50">More than 50</option>
            <option value="less-50">Less than 50</option>
            <option value="more-70">More than 70</option>
          </select>
        </div>

        {/* Stock data table */}
        <div className="relative w-full overflow-x-auto mt-6">
          <table className="dashboard-table2 w-[1400px] mx-auto">
            <thead className="sticky top-0 bg-black z-10">
              <tr className="font-mono">
                <th>Sr. No.</th>
                <th>Identifier</th>
                <th>1D RSI</th>
                <th>1H RSI</th>
                <th>15M RSI</th>
                <th>5M RSI</th>
                <th>1H ATR</th>
                <th>15M ATR</th>
                <th>5M ATR</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.masterIdentifier}</td>
                  <td>{item.OneDay_RSI}</td>
                  <td>{item.OneHour_RSI}</td>
                  <td>{item.FifteenMin_RSI}</td>
                  <td>{item.FiveMin_RSI}</td>
                  <td>{item.OneHour_ATR}</td>
                  <td>{item.FifteenMin_ATR}</td>
                  <td>{item.FiveMin_ATR}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
