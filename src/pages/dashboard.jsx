import React, { useEffect, useRef, useState } from "react";
import { useModal } from "@/hooks/use-modal";
import ModalProvider from "@/providers/modal-provider";
import axios from "axios";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FilePenLine, SquareArrowOutUpRight, Trash } from "lucide-react";
import { useLiveSocket } from "@/providers/live-socket-provider";
import GainerLosser from "@/pages/angel-one/gainer-looser";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import secureLocalStorage from "react-secure-storage";

export const groupBy = function (xs, key) {
  return xs?.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setTheme("light");
  }, []);

  const navigate = useNavigate();
  const { onOpen } = useModal();
  const { isConnected, socket } = useLiveSocket();
  const [socketData, setSocketData] = useState({});
  const [showGainer, setShowGainer] = useState(false);
  const [trades, setTrades] = useState({
    loading: false,
    data: [],
    error: "",
  });
  const [editMode, setEditMode] = useState(null); // State to manage edit mode
  const [editValues, setEditValues] = useState({}); // State to manage the current values being edited
  const lastExecutionTimeRef = useRef(0);
  const [showOffTerminals, setShowOffTerminals] = useState(true);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handleLiveData = (message) => {
      message.token = Number(message?.token?.replace(/"/g, "")); // Removes all double quotes
      // console.log(message);
      const now = Date.now();
      if (now - lastExecutionTimeRef.current >= 1000) {
        lastExecutionTimeRef.current = now;
        setSocketData((prev) => {
          return {
            ...prev,
            [message.token]: message,
          };
        });
        // let data = groupBy(message, "instrument_token");
        // setSocketData((prev) => {
        //   if (!prev) return data;
        //   return { ...prev, ...data };
        // });
      }
    };

    socket.on("getLiveData", handleLiveData);
    return () => {
      socket.off("getLiveData", handleLiveData);
    };
  }, [socket, isConnected]);

  const getAllTrades = async () => {
    try {
      setTrades((p) => ({ ...p, loading: true }));
      const { data } = await axios.get(`${BASE_URL_OVERALL}/config/get`);
      setTrades((p) => ({ ...p, data: data.data }));
    } catch (error) {
      setTrades((p) => ({ ...p, error: error.message }));
    } finally {
      setTrades((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    getAllTrades();
    // const interval = setInterval(getAllTrades, 60 * 1000 );
    // return () => clearInterval(interval);
  }, []);

  const handleOpenNewTab = (url) => {
    window.open(url, "_blank");
  };

  const handleDelete = async (id) => {
    const isConfirm = confirm("Are you sure you want to delete trade ?");
    if (isConfirm) {
      try {
        await axios.delete(`${BASE_URL_OVERALL}/config/delete?id=${id}`);
      } catch (error) {
        alert("Error: " + error.response.data.message || error.message);
      } finally {
        getAllTrades();
      }
    }
  };

  const handleEdit = (item) => {
    setEditMode(item.id);
    setEditValues({
      id: item.id,
      terminal: item.terminal,
      tradeEntryPercent: item.tradeEntryPercent,
      minExitPercent: item.minExitPercent,
      maxExitPercent: item.maxExitPercent,
      priceIncPercent: item.priceIncPercent,
      // priceDecPercent: item.priceDecPercent,
      WMA: item.WMA,
      // wmaLtp: item.wmaLtp,
      orderType: item.orderType,
      dynamicEntryPercentage: item.dynamicEntryPercentage,
      minProfit: item.minProfit,
      candleSize: item.candleSize,
      lossLimit: item.lossLimit,
    });
  };

  const handleUpdate = async () => {
    confirm("Are you sure to update configuration");
    try {
      await axios.put(`${BASE_URL_OVERALL}/config/edit`, editValues);
      alert("Update Successfully");
    } catch (error) {
      alert(
        "Something went wrong! " + error.response.data.message || error.message
      );
    } finally {
      getAllTrades();
      setEditMode(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShowOffTerminals = () => {
    setShowOffTerminals((prev) => !prev);
  };
  const toggleShowOffLosserGainer = () => {
    setShowGainer((prev) => !prev);
  };

  const handleResetDataOnServer = async () => {
    const isConfirm = confirm(
      "Are you sure You want to update data on Server ?"
    );
    if (!isConfirm) return;

    try {
      await axios.get(`${BASE_URL_OVERALL}/api/v1/instrument/update`);
      // update the latest data

      alert("Updated Succesfully Data on Server !");
    } catch (error) {
      alert("Error " + error.message);
    }
  };
  const handleLogout = () => {
    secureLocalStorage.clear();
    navigate("/future");
  };

  return (
    <>
      {/* <ModalProvider /> */}
      <div>
        <div className="text-center">
          <Button
            onClick={() => onOpen("add-new-trade", { getAllTrades, trades })}
            className="px-5 py-2 rounded-md border-2"
          >
            Add New Trade
          </Button>
          <Button
            onClick={() => navigate("/future/angel-one")}
            className="px-5 py-2 rounded-md border-2"
          >
            Looser/Gainer
          </Button>

          <Button
            onClick={() => navigate("/future/sop")}
            className="px-5 py-2 rounded-md border-2"
          >
            SOP
          </Button>
          <Button
            onClick={() => navigate("/future/angel-login")}
            className="px-5 py-2 rounded-md border-2"
          >
            Angel-Login
          </Button>
          <Button
            onClick={() => {
              handleResetDataOnServer();
            }}
            className="px-5 py-2 rounded-md border-2"
          >
            Reset Data on server
          </Button>

          <Button
            onClick={toggleShowOffTerminals}
            className="px-5 py-2 rounded-md border-2"
          >
            {showOffTerminals ? "Hide" : "Show"}
          </Button>
          <Button
            onClick={toggleShowOffLosserGainer}
            className="px-5 py-2 rounded-md border-2"
          >
            {showGainer ? "Hide Losser/Gainer" : "Show Losser/Gainer"}
          </Button>
          <Button
            onClick={handleLogout}
            className="px-5 py-2 rounded-md border-2"
          >
            Logout
          </Button>
          <ModeToggle />
        </div>
        <div className="overflow-x-scroll">
          <table className="dashboard-table w-[1700px]  mx-auto">
            <thead>
              <tr>
                <th>Master</th>
                <th>Customer Grade</th>
                <th>Loss Count</th>
                <th>Candle Size</th>
                <th>Initial Entry Value</th>
                <th>Min Profit</th>
                <th>Traling stop loss</th>
                <th>Interval</th>
                <th>Index</th>
                <th>WMA</th>
                {/* <th>Target Profit</th> */}
                <th>Identifier</th>
                <th>LTP</th>
                <th>Terminal</th>
                <th>Order Type</th>
                <th>Market Trend</th>
                {/* <th>Entry Price Value</th> */}
                {/* <th>Entry Inc (%)</th>
                <th>Entry Inc Value</th>
                <th>Min_Exit (%)</th>
                <th>Min Exit Value</th>
                <th>Max_Exit (%)</th>
                <th>Max Exit Value</th>
                <th>Exit Inc (%)</th>
                <th>Exit Dec (%)</th> */}
                <th>Edit</th>
                <th>Update</th>
                <th>Live</th>
                <th>Testing</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trades.loading ? (
                <tr>
                  <td className="h-40" colSpan={1000}>
                    Loading...
                  </td>
                </tr>
              ) : trades.error ? (
                <tr>
                  <td colSpan={1000}> Error Occurred {trades.error}</td>
                </tr>
              ) : (
                trades?.data
                  ?.filter(
                    (item) => showOffTerminals || item.terminal !== "OFF"
                  )
                  ?.map((item, index) => (
                    <tr key={index}>
                      <td
                        className={
                          item.isMaster
                            ? "text-green-700 font-semibold"
                            : "text-red-700 font-semibold"
                        }
                      >
                        {item.isMaster ? "True" : "False"}
                      </td>

                      <td>{item.customerGrading}</td>
                      <td>{item.lossLimit}</td>

                      <td>
                        {editMode === item.id ? (
                          <input
                            type="number"
                            min={1}
                            name="candleSize"
                            value={editValues?.candleSize}
                            onChange={handleInputChange}
                            className="w-full border-[1px] border-black p-2 rounded-md"
                          />
                        ) : (
                          item.candleSize
                        )}
                      </td>
                      <td>
                        {editMode === item.id ? (
                          <input
                            min={0}
                            type="number"
                            name="tradeEntryPercent"
                            value={editValues.tradeEntryPercent}
                            onChange={handleInputChange}
                            className="w-full border-[1px] border-black p-2 rounded-md"
                          />
                        ) : (
                          item.tradeEntryPercent
                        )}
                      </td>
                      <td>
                        {editMode === item.id ? (
                          <input
                            type="number"
                            min={1}
                            name="minProfit"
                            value={editValues.minProfit}
                            onChange={handleInputChange}
                            className="w-full border-[1px] border-black p-2 rounded-md"
                          />
                        ) : (
                          item.minProfit
                        )}
                      </td>
                      {/* <td>
                      {editMode === item.id ? (
                        <input
                          type="number"
                          min={1}
                          name="maxLoss"
                          value={editValues.maxLoss}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black p-2 rounded-md"
                        />
                      ) : (
                        item.maxLoss
                      )}
                    </td> */}

                      <td>{item?.dynamicExitValue?.toFixed(2)}</td>

                      {/* <td>
                      {editMode === item.id ? (
                        <input
                          type="number"
                          min={1}
                          name="targetProfit"
                          value={editValues.targetProfit}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black p-2 rounded-md"
                        />
                      ) : (
                        item.targetProfit
                      )}
                    </td> */}

                      <td>{item.interval}</td>
                      <td>{item.tradeIndex}</td>
                      <td>
                        {editMode === item.id ? (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            name="WMA"
                            value={editValues.WMA}
                            onChange={handleInputChange}
                            className="w-full border-[1px] border-black p-2 rounded-md"
                          />
                        ) : (
                          item.WMA
                        )}
                      </td>
                      <td>{item.identifier}</td>
                      <td className="w-32">
                        {socketData[item.instrument_token]?.last_traded_price}
                      </td>

                      <td>
                        {editMode === item.id ? (
                          <select
                            name="terminal"
                            value={editValues.terminal}
                            onChange={handleInputChange}
                            className="w-full border-[1px] border-black p-2 rounded-md"
                          >
                            <option value="ON">ON</option>
                            <option value="OFF">OFF</option>
                          </select>
                        ) : (
                          <span
                            className={
                              item.terminal === "ON"
                                ? "text-red-700 font-semibold"
                                : "text-green-700 font-semibold"
                            }
                          >
                            {item.terminal}
                          </span>
                        )}
                      </td>
                      <td>
                        {editMode === item.id ? (
                          <select
                            name="orderType"
                            value={editValues.orderType}
                            onChange={handleInputChange}
                            className="w-full border-[1px] border-black p-2 rounded-md"
                          >
                            <option value="Buy">Buy</option>
                            <option value="Sell">Sell</option>
                          </select>
                        ) : (
                          <span
                            className={
                              item.orderType === "Sell"
                                ? "text-red-700 font-semibold"
                                : "text-green-700 font-semibold"
                            }
                          >
                            {item.orderType}
                          </span>
                        )}
                      </td>
                      <td
                        className={
                          item.orderType === "Bearish"
                            ? "text-red-700 font-semibold"
                            : "text-green-700 font-semibold"
                        }
                      >
                        {item.marketTrend}
                        <p className="text-[11px] text-black  ">
                          {item.rangeBound}
                        </p>
                      </td>

                      {/* <td className="text-blue-500 font-bold">
                      {(
                        (item.tradeEntryPercent * item.LastPivot) /
                        100
                      )?.toFixed(2)}
                    </td> */}
                      {/* <td>
                      {editMode === item?.id ? (
                        <input
                          type="number"
                          name="dynamicEntryPercentage"
                          min={0}
                          value={editValues.dynamicEntryPercentage}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black p-2 rounded-md"
                        />
                      ) : (
                        item.dynamicEntryPercentage
                      )}
                    </td>
                    <td className="font-bold text-blue-500">
                      {(
                        (item.LastPivot * item.dynamicEntryPercentage) / 100 +
                        (item.tradeEntryPercent * item.LastPivot) / 100
                      )?.toFixed(2)}
                    </td>
                    <td>
                      {editMode === item?.id ? (
                        <input
                          type="number"
                          name="minExitPercent"
                          min={0}
                          value={editValues.minExitPercent}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black p-2 rounded-md"
                        />
                      ) : (
                        item.minExitPercent
                      )}
                    </td>
                    <td className="font-bold text-blue-500">
                      {item.LastMinExitValue?.toFixed(2)}
                    </td>
                    <td>
                      {editMode === item?.id ? (
                        <input
                          type="number"
                          name="maxExitPercent"
                          min={0}
                          value={editValues.maxExitPercent}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black p-2 rounded-md"
                        />
                      ) : (
                        item.maxExitPercent
                      )}
                    </td>
                    <td className="font-bold text-blue-500">
                      {item.LastMaxExitValue?.toFixed(2)}
                    </td>
                    <td>
                      {editMode === item.id ? (
                        <input
                          type="number"
                          name="priceIncPercent"
                          min={0}
                          value={editValues.priceIncPercent}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black p-2 rounded-md"
                        />
                      ) : (
                        item.priceIncPercent
                      )}
                    </td>
                    <td>
                      {editMode === item.id ? (
                        <input
                          type="number"
                          name="priceDecPercent"
                          min={0}
                          value={editValues.priceDecPercent}
                          onChange={handleInputChange}
                          className="w-full border-[1px] border-black rounded-md"
                        />
                      ) : (
                        item.priceDecPercent
                      )}
                    </td> */}

                      <td>
                        <Button onClick={() => handleEdit(item)}>Edit</Button>
                      </td>
                      <td>
                        {editMode === item.id && (
                          <Button onClick={handleUpdate}>Update</Button>
                        )}
                      </td>
                      <td>
                        <Button
                          size="icon"
                          onClick={() =>
                            handleOpenNewTab(`/future/live?id=${item.id}`)
                          }
                          className="text-xs"
                        >
                          <SquareArrowOutUpRight className="w-4 h-4" />
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="icon"
                          onClick={() =>
                            handleOpenNewTab(`/future/back?id=${item.id}`)
                          }
                          className="text-xs"
                        >
                          <SquareArrowOutUpRight className="w-4 h-4" />
                        </Button>
                      </td>
                      <td className="text-center flex gap-x-2">
                        <Button
                          onClick={() =>
                            onOpen("edit-trade", {
                              data: {
                                id: item.id,
                                symbol: item.symbol,
                                exchange: item.exchange,
                                terminal: item.terminal,
                                instrument_type: item.instrument_type,
                                expiry: item.expiryDate,
                                interval: item.interval,
                                wma: item.WMA,
                                wmaLtp: item.wmaLtp,
                                indexValue: item.tradeIndex,
                                tradeInTime: item.tradeInTime,
                                tradeOutTime: item.tradeOutTime,
                                tradingsymbol: item.identifier,
                                instrument_token: item.instrument_token,
                                entryPrice: item.tradeEntryPercent,
                                minExitPercent: item.minExitPercent,
                                maxExitPercent: item.maxExitPercent,
                                priceIncPercent: item.priceIncPercent,
                                priceDecPercent: item.priceDecPercent,
                                earningPercentLimit: item.earningPercentLimit,
                                orderType: item.orderType,
                                isMaster: item.isMaster,
                                lossLimit: item.lossLimit,
                                dynamicEntryPercentage:
                                  item.dynamicEntryPercentage,
                                // maxLoss: item.maxLoss,
                                minProfit: item.minProfit,
                                candleSize: item.candleSize,
                                rangeBoundPercent: item.rangeBoundPercent,
                                rangeBoundPercent2: item.rangeBoundPercent2,
                                microProfitPercent: item.microProfitPercent,
                                movingAvgOFFSET: item.movingAvgOFFSET,
                                movingAvgWMA: item.movingAvgWMA,
                                SMA1: item.SMA1,
                                SMA2: item.SMA2,
                                SMA3: item.SMA3,
                                rangeBound: item.rangeBound,
                                movingAvgType: item.movingAvgType,
                                movingAvgOFFSET3: item.movingAvgOFFSET3,
                                movingAvgOFFSET2: item.movingAvgOFFSET2,
                                movingAvgOFFSET1: item.movingAvgOFFSET1,
                                mvSource1: item.mvSource1,
                                mvSource2: item.mvSource2,
                                mvSource3: item.mvSource3,
                                trendLine1: item.trendLine1,
                                trendLine2: item.trendLine2,
                                candleType: item.candleType,
                                master: item.master,
                                // rangeBoundEntryExitPercent: item.rangeBoundEntryExitPercent,
                                minReEntryatMinProfitPercent:
                                  item.minReEntryatMinProfitPercent,
                                entryHystresisPercent:
                                  item.entryHystresisPercent,
                                // targetProfit: item.targetProfit,
                                rangeBoundEntryPercent:
                                  item.rangeBoundEntryPercent,
                                rangeBoundExitPercent:
                                  item.rangeBoundExitPercent,
                                rangeBoundProfitPercent:
                                  item.rangeBoundProfitPercent,
                                rsiMax: item.rsiMax,
                                rsiMin: item.rsiMin,
                                rsiCandle: item.rsiCandle,
                                // Min_Order_Qty: item.Min_Order_Qty,
                                lotSize: item.lotSize,
                                customerGrading: item.customerGrading,
                                narration: item.narration,
                              },
                              getAllTrades,
                              trades,
                            })
                          }
                          className="px-2 rounded-md"
                        >
                          <FilePenLine className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 rounded-md"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showGainer && <GainerLosser />}
    </>
  );
};

export const DashboardPage = () => {
  return (
    <>
      <Dashboard />
    </>
  );
};
