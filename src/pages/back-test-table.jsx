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
  const [visibleRows, setVisibleRows] = useState([]);
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
        setVisibleRows(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 5 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const total = visibleRows?.reduce((acc, item) => {
      if (item.entryPivot !== null && item.exitPivot !== null) {
        const diff = item.exitPivot - item?.entryPivot;

        return acc + diff;
      }
      return acc;
    }, 0);
    setSum(total);
  }, [visibleRows]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(); // Adjust format as needed
  };

  const handleRemove = (indexToRemove) => {
    setVisibleRows((prevRows) =>
      prevRows.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="p-2 overflow-x-auto">
      {visibleRows?.length > 0 && (
        <>
          <table className="w-fit mx-auto mb-20">
            <thead>
              <tr>
                <th className="p-1 border border-gray-300">Sr No.</th>           
                <th className="p-1 border border-gray-300">Identifier</th>           
                <th className="p-1 border border-gray-300">Entry Time</th>
                <th className="p-1 border border-gray-300">Entry Case</th>
                <th className="p-1 border border-gray-300">Entry Order Type</th>
                <th className="p-1 border border-gray-300">Entry Price</th>
                <th className="p-1 border border-gray-300">Call Type</th>
                &nbsp; &nbsp; &nbsp;
                <th className="p-1 border border-gray-300">Exit Time</th>
                <th className="p-1 border border-gray-300">Exit Case</th>
                <th className="p-1 border border-gray-300">Exit Price</th>
                <th className="p-1 border border-gray-300">Exit Order Type</th>
                <th className="p-1 border border-gray-300">Exit Reason</th>
                <th className="p-1 border border-gray-300">Price Diff</th>
                <th className="p-1 border border-gray-300">Option</th>
                <th className="p-1 border border-gray-300">Remove</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows
                ?.sort((a, b) => {
                  // Parse realEntryTime into a comparable format (e.g., timestamp)
                  const timeA = new Date(a.realEntryTime).getTime();
                  const timeB = new Date(b.realEntryTime).getTime();

                  // Sort in ascending order (oldest to newest)
                  return timeA - timeB;

                })

                ?.map((item, index) => {
                  const priceDiff =
                    item.entryPivot !== null && item.exitPivot !== null
                      ? (item.exitPivot - item.entryPivot)?.toFixed(2)
                      : null;
                  return (
                    <tr
                      key={index}
                      className={`${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <td className="border border-gray-300 text-center text-[13px]">
                        {index + 1}
                      </td>

                      <td className="border border-gray-300 text-center text-[13px] p-1">
                        {item.identifier}
                    </td>
                      <td className="border border-gray-300 text-center text-[13px] p-1">
                        {formatDate(item.realEntryTime)}
                      </td>
                      <td className="border border-gray-300 text-center text-[13px] p-1">
                        {item.EntryCase}
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
                      &nbsp; &nbsp; &nbsp;
                      <td className="border border-gray-300 text-center text-[13px] p-1">
                        {formatDate(item.realExitTime)}
                      </td>
                      <td className="border border-gray-300 text-center text-[13px] p-1">
                        {item.ExitCase}
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
                      <td className="p-1 border border-gray-300 text-center text-[13px]">
                        <button
                          className="bg-red-500 hover:bg-red-700 px-1  border-black border-[1px] rounded-sm text-white font-semibold"
                          onClick={handleDelete}
                        >
                          Delete 
                        </button>
                      </td>
                      <td className="p-1 border border-gray-300 text-center text-[13px]">
                        <button
                          className="bg-red-500 hover:bg-red-700 px-1  border-black border-[1px] rounded-sm text-white font-semibold"
                          onClick={() => handleRemove(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div>
            <p className="font-bold text-center text-xl">
              Total Point Difference:{" "}
              <span
                className={`${sum < 0 ? "text-red-700" : "text-green-700"}
          font-bold text-center text-xl
          `}
              >
                {sum?.toFixed(2)}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BackTestingTablePage;
