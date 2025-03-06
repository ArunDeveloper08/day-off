import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";

const GainerLooserLog = () => {
  const [data, setData] = useState([]);

  const getData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/log/getLoooserGainer`
      );
      setData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <>
      <div className="overflow-x-auto">
        <p className="text-3xl font-semibold text-center"> Gainer Log</p>
        <table className="min-w-full mx-auto mb-20 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300">Sr No.</th>
              <th className="p-2 border border-gray-300">Trading Symbol</th>
              <th className="p-2 border border-gray-300">Date</th>
              <th className="p-2 border border-gray-300">Symbol Token</th>
              <th className="p-2 border border-gray-300">Percent Change</th>
              <th className="p-2 border border-gray-300">LTP</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.Gainer?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td className="p-2 border border-gray-300">{index + 1}</td>
                    <td className="p-2 border border-gray-300">
                      {item.tradingSymbol}
                    </td>
                    <td className="p-2 border border-gray-300">{item.date}</td>
                    <td className="p-2 border border-gray-300">
                      {item.symbolToken}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {item.percentChange}
                    </td>
                    <td className="p-2 border border-gray-300">{item.ltp}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <p className="text-3xl font-semibold text-center"> Looser Log</p>
        <table className="min-w-full mx-auto mb-20 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300">Sr No.</th>
              <th className="p-2 border border-gray-300">Trading Symbol</th>
              <th className="p-2 border border-gray-300">Date</th>
              <th className="p-2 border border-gray-300">Symbol Token</th>
              <th className="p-2 border border-gray-300">Percent Change</th>
              <th className="p-2 border border-gray-300">LTP</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.Looser?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td className="p-2 border border-gray-300">{index + 1}</td>
                    <td className="p-2 border border-gray-300">
                      {item.tradingSymbol}
                    </td>
                    <td className="p-2 border border-gray-300">{item.date}</td>
                    <td className="p-2 border border-gray-300">
                      {item.symbolToken}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {item.percentChange}
                    </td>
                    <td className="p-2 border border-gray-300">{item.ltp}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GainerLooserLog;
