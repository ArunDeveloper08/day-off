import React, { useEffect, useRef, useState } from "react";
import { useModal } from "@/hooks/use-modal";
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
  const [filter, setFilter] = useState("ALL");
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [activeFilters, setActiveFilters] = useState(["ALL"]);

  const showNotification = (message) => {
    alert(message); // Basic popup. You can replace this with a custom notification component if needed.
  };

  // useEffect(() => {
  //   if (!socket || !isConnected) return;
  //   const handleLiveData = (message) => {
  //     message.token = Number(message?.token?.replace(/"/g, "")); // Removes all double quotes
  //     // console.log(message);
  //     const now = Date.now();
  //     if (now - lastExecutionTimeRef.current >= 1000) {
  //       lastExecutionTimeRef.current = now;
  //       setSocketData((prev) => {
  //         return {
  //           ...prev,
  //           [message.token]: message,
  //         };
  //       });

  //       // trades?.data?.forEach((trade) => {
  //       //   const LTP = socketData[trade.instrument_token]?.last_traded_price;
  //       //   if (LTP > trade.targetAbove) {
  //       //     showNotification(
  //       //       `LTP crossed targetAbove for ${trade.identifier}!`
  //       //     );
  //       //   } else if (LTP < trade.targetBelow) {
  //       //     showNotification(
  //       //       `LTP crossed targetBelow for ${trade.identifier}!`
  //       //     );
  //       //   }
  //       // });
  //     }
  //   };

  //   socket.on("getLiveData", handleLiveData);
  //   return () => {
  //     socket.off("getLiveData", handleLiveData);
  //   };
  // }, [socket, isConnected]);

  const shownNotificationsRef = useRef(new Set()); // Move this out of useEffect to avoid re-creation on every render

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLiveData = (message) => {
      message.token = Number(message?.token?.replace(/"/g, "")); // Removes all double quotes

      const now = Date.now();
      if (now - lastExecutionTimeRef.current >= 1000) {
        lastExecutionTimeRef.current = now;

        setSocketData((prev) => {
          const updatedSocketData = {
            ...prev,
            [message.token]: message,
          };

          // Trades loop to check LTP against targetAbove and targetBelow
          trades?.data?.forEach((trade) => {
            const LTP =
              updatedSocketData[trade.instrument_token]?.last_traded_price;
            if (trade.isMaster && trade.targetAbove && trade.targetBelow) {
              if (LTP) {
                const notificationKeyAbove = `${trade.identifier}-above`;
                const notificationKeyBelow = `${trade.identifier}-below`;

                // Ensure targetAbove is a valid number
                const targetAboveValid =
                  trade.targetAbove !== null &&
                  trade.targetAbove !== "" &&
                  !isNaN(trade.targetAbove);
                // Ensure targetBelow is a valid number
                const targetBelowValid =
                  trade.targetBelow !== null &&
                  trade.targetBelow !== "" &&
                  !isNaN(trade.targetBelow);

                // Check if targetAbove is a valid number and if LTP crosses the target
                if (
                  targetAboveValid &&
                  LTP > trade.targetAbove &&
                  !shownNotificationsRef.current.has(notificationKeyAbove)
                ) {
                  showNotification(
                    `${trade.identifier} Current Price: ${LTP} Target Price Hit Above: ${trade.targetAbove}`
                  );
                  shownNotificationsRef.current.add(notificationKeyAbove); // Mark notification as shown
                  shownNotificationsRef.current.delete(notificationKeyBelow); // Reset below notification state
                }

                // Check if targetBelow is a valid number and if LTP drops below the target
                if (
                  targetBelowValid &&
                  LTP < trade.targetBelow &&
                  !shownNotificationsRef.current.has(notificationKeyBelow)
                ) {
                  showNotification(
                    `${trade.identifier} Current Price: ${LTP} Target Price Hit Below: ${trade.targetBelow}`
                  );
                  shownNotificationsRef.current.add(notificationKeyBelow); // Mark notification as shown
                  shownNotificationsRef.current.delete(notificationKeyAbove); // Reset above notification state
                }
              }
            }
          });

          return updatedSocketData; // Update the socketData state with the new message
        });
      }
    };

    socket.on("getLiveData", handleLiveData);

    return () => {
      socket.off("getLiveData", handleLiveData);
    };
  }, [socket, isConnected, trades]);

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
    const interval = setInterval(getAllTrades, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenNewTab = (url, item) => {
    if (item.isMaster == true) {
      window.open(`/future/helping?id=${item.id}`, "_blank");
      return;
    }
    window.open(url, "_blank");
  };

  const backTesting = (url) => {
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
      tradeIndex: item.tradeIndex,
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
  const clearNotification = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL_OVERALL}/config/resetAllNotification`
      );
      alert(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (trades?.data && socketData) {
      const newFilteredTrades = trades.data.filter((item) => {
        if (activeFilters.includes("ALL")) return true;

        let match = false;

        if (activeFilters.includes("isMaster") && item.isMaster) {
          match = true;
        }
        if (activeFilters.includes("option") && !item.isMaster) {
          match = true;
        }
        if (
          activeFilters.includes("Breakout") &&
          item.category === "Breakout"
        ) {
          match = true;
        }
        if (activeFilters.includes("Index") && item.category === "Index") {
          match = true;
        }
        if (
          activeFilters.includes("52weakLow") &&
          item.category === "52weakLow"
        ) {
          match = true;
        }
        if (
          activeFilters.includes("52weakHigh") &&
          item.category === "52weakHigh"
        ) {
          match = true;
        }
        if (activeFilters.includes("Banking") && item.category === "Banking") {
          match = true;
        }
        if (activeFilters.includes("Pharma") && item.category === "Pharma") {
          match = true;
        }
        if (activeFilters.includes("IT") && item.category === "IT") {
          match = true;
        }
        if (activeFilters.includes("Energy") && item.category === "Energy") {
          match = true;
        }
        if (activeFilters.includes("Auto") && item.category === "Auto") {
          match = true;
        }
        if (activeFilters.includes("Defence") && item.category === "Defence") {
          match = true;
        }
        if (
          activeFilters.includes("Chemical") &&
          item.category === "Chemical"
        ) {
          match = true;
        }
        if (
          activeFilters.includes("RealEstate") &&
          item.category === "RealEstate"
        ) {
          match = true;
        }
        if (
          activeFilters.includes("RangeBound") &&
          item.category === "RangeBound"
        ) {
          match = true;
        }
        if (activeFilters.includes("Others") && item.category === "Others") {
          match = true;
        }
        if (activeFilters.includes("Hedging") && item.isHedging == "1") {
          match = true;
        }
        if (item?.isMaster && item.targetAbove && item.targetBelow) {
          const LTP = socketData[item.instrument_token]?.last_traded_price;

          // Check if the filter is 'targetHit' and LTP crosses either targetAbove or targetBelow
          if (
            activeFilters.includes("targetHit") &&
            ((LTP && item.targetAbove != null && LTP >= item.targetAbove) ||
              (LTP && item.targetBelow != null && LTP <= item.targetBelow))
          ) {
            match = true;
          }
        }
        // New condition for 'Target Hit' filter

        return match;
      });

      setFilteredTrades(newFilteredTrades);
    }
  }, [trades.data, activeFilters, socketData]);

  const [activeButtons, setActiveButtons] = useState({ ALL: true });

  // Function to handle the filter toggle

  const toggleFilter = (filterType) => {
    setActiveFilters((prevFilters) => {
      if (filterType === "ALL") {
        return ["ALL"]; // Reset to "ALL"
      }
      const updatedFilters = prevFilters.includes("ALL")
        ? [filterType]
        : prevFilters.includes(filterType)
        ? prevFilters.filter((f) => f !== filterType)
        : [...prevFilters, filterType];

      return updatedFilters.length === 0 ? ["ALL"] : updatedFilters;
    });
  };
  const handleButtonClick = (filterType) => {
    toggleFilter(filterType);

    // Manage button color state
    setActiveButtons((prevState) => {
      if (filterType === "ALL") {
        return { ALL: true }; // Reset to only highlight "ALL"
      }

      return {
        ...prevState,
        ALL: false,
        [filterType]: !prevState[filterType], // Toggle the clicked filter
      };
    });
  };
  const toggleState = async (itemId, currentState) => {
    const newState = currentState === "ON" ? "OFF" : "ON";
    try {
      const response = await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id: itemId,
        terminal: newState,
      });

      if (response.status === 200) {
        // Update the local state in both trades and filteredTrades
        setTrades((prevTrades) => ({
          ...prevTrades,
          data: prevTrades.data.map((trade) =>
            trade.id === itemId ? { ...trade, terminal: newState } : trade
          ),
        }));
        // Update filteredTrades if it's being used separately
        setFilteredTrades((prevFilteredTrades) =>
          prevFilteredTrades.map((trade) =>
            trade.id === itemId ? { ...trade, terminal: newState } : trade
          )
        );
      }
    } catch (error) {
      console.error("Error updating state:", error);
    }
  };

  // console.log("socketData",socketData)

  return ( 
    <>
      <div>
        <div className="text-center">
          <Button
            onClick={() => onOpen("add-new-trade", { getAllTrades, trades })}
            className="px-5 py-2 rounded-md border-2"
          >
            Add New Trade
          </Button>
          {/* <Button
            onClick={() => navigate("/future/angel-one")}
            className="px-5 py-2 rounded-md border-2"
          >
            Looser/Gainer
          </Button> */}
          <Button
            onClick={() =>
              navigate("/future/particular-identifier-losser-gainer")
            }
            className="px-5 py-2 rounded-md border-2"
          >
            Looser/Gainer Log
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
            onClick={toggleShowOffLosserGainer}
            className="px-5 py-2 rounded-md border-2"
          >
            {showGainer ? "Hide Losser/Gainer" : "Show Losser/Gainer"}
          </Button>
          <Button
            onClick={() =>
              window.open(
                "https://www.pesonline12.in/livetrading/home",
                "_blank"
              )
            }
            className="px-5 py-2 rounded-md border-2"
          >
            NSE
          </Button>
          <Button
            onClick={handleLogout}
            className="px-5 py-2 rounded-md border-2"
          >
            Logout
          </Button>
          <Button
            onClick={toggleShowOffTerminals}
            className="px-5 py-2 rounded-md border-2"
          >
            {showOffTerminals ? "Hide" : "Show"}
          </Button>
          <Button
            onClick={clearNotification}
            variant="destructive"
            className="px-5 py-2 rounded-md border-2 "
          >
            Clear Notification
          </Button>
          {/* <ModeToggle /> */}
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-5 mt-1">
          <Button
            onClick={() => handleButtonClick("isMaster")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["isMaster"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Master
          </Button>
          <Button
            onClick={() => handleButtonClick("option")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["option"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Trading Stock
          </Button>
          <Button
            onClick={() => handleButtonClick("Index")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Index"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Index
          </Button>
          <Button
            onClick={() => handleButtonClick("Breakout")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Breakout"] ? "bg-red-500" : "bg-black"
            }`}
          >
            My Today Stock
          </Button>
          <Button
            onClick={() => handleButtonClick("52weakLow")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["52weakLow"] ? "bg-red-500" : "bg-black"
            }`}
          >
            My Hot WatchList
          </Button>
          <Button
            onClick={() => handleButtonClick("52weakHigh")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["52weakHigh"] ? "bg-red-500" : "bg-black"
            }`}
          >
            52 Weak High
          </Button>
          <Button
            onClick={() => handleButtonClick("Banking")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Banking"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Banking
          </Button>
          <Button
            onClick={() => handleButtonClick("Pharma")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Pharma"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Pharma
          </Button>
          <Button
            onClick={() => handleButtonClick("IT")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["IT"] ? "bg-red-500" : "bg-black"
            }`}
          >
            IT
          </Button>
          <Button
            onClick={() => handleButtonClick("targetHit")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["targetHit"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Target Hit
          </Button>
          <Button
            onClick={() => handleButtonClick("Auto")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Auto"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Auto
          </Button>
          <Button
            onClick={() => handleButtonClick("RangeBound")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["RangeBound"] ? "bg-red-500" : "bg-black"
            }`}
          >
            RangeBound
          </Button>
          <Button
            onClick={() => handleButtonClick("Energy")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Energy"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Energy
          </Button>
          <Button
            onClick={() => handleButtonClick("RealEstate")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["RealEstate"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Real Estate
          </Button>

          <Button
            onClick={() => handleButtonClick("Chemical")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Chemical"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Chemical
          </Button> 

          <Button
            onClick={() => handleButtonClick("Defence")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Defence"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Defence
          </Button>
          <Button
            onClick={() => handleButtonClick("Others")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Others"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Others
          </Button>
             
          <Button
            onClick={() => handleButtonClick("Hedging")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Hedging"] ? "bg-red-500" : "bg-black"
            }`}
          >
            Hedging
          </Button>
          <Button
            onClick={() => handleButtonClick("ALL")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["ALL"] ? "bg-red-500" : "bg-black"
            }`}
          >
            All
          </Button>
        </div>
        <div className="overflow-x-scroll">
          <table
            className="dashboard-table w-[1400px]  mx-auto"
            // className={`${!activeFilters.includes("isMaster") ? 'dashboard-table w-[1200px]  mx-auto' : 'dashboard-table w-[1700px]  mx-auto'}`}
          >
            <thead>
              <tr>
                {!activeFilters.includes("isMaster") && (
                  <>
                    <th>Master</th>
                    <th>Customer Grade</th>
                   {/* <th>Loss Count</th>
                    <th>Candle Size</th>
                    <th>Initial Entry Value</th>
                    <th>Min Profit</th>
                    <th>Traling stop loss</th> */}
                    <th>Have Tarde</th>
                    {/* <th>WMA</th> */}
                    <th>Main Index</th>
                  </>
                )}
                {/* <th>Interval</th> */}
                <th> Identifier</th>
                <th>Is Hedge</th>
                {/* <th>  Hedging Trade</th> */}
                <th>Master Identifier For Hedge</th>

                {activeFilters.includes("isMaster") && (
                  <>
                    <th>Call Target Level</th>
                    <th>Put Target Level</th>
                  </>
                )}
                <th>Alert Below</th>
                <th>LTP</th>
                <th>Alert Above</th>
                {/* <th>Terminal</th> */}
                <th>ON/OFF</th>

                {!activeFilters.includes("isMaster") && (
                  <>
                    {/* <th>Order Type</th> */}
                  </>
                )}

                {/* <th>Have Trade</th> */}
                {/* <th>Market Trend</th> */}
                <th>Edit</th>
                <th>Update</th>
                <th>Live</th>
                <th>Testing</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trades.error ? (
                <tr>
                  <td colSpan={1000}> Error Occurred {trades.error}</td>
                </tr>
              ) : (
                filteredTrades
                  ?.filter(
                    (item) => showOffTerminals || item.terminal !== "OFF"
                  )
                  ?.map((item, index) => {
                    return (
                      <tr key={index}>
                        {!activeFilters.includes("isMaster") && (
                          <>
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
                            {/* <td>{item.lossLimit}</td>

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

                            <td>{item?.dynamicExitValue?.toFixed(2)}</td> */}
                            <td
                              className={`${
                                item?.haveTrade
                                  ? "text-red-500 font-bold"
                                  : "text-green-500 font-bold"
                              }`}
                            >
                              {item?.haveTrade ? "true" : "false"}
                            </td>
                            {/* <td>
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
                            </td> */}
                            <td>{item.tradeIndex}</td>
                          </>
                        )}

                        {/* <td>{item.interval}</td> */}

                        <td
                      className={`w-32  ${
                        //item.isMaster &&
                        //(item.targetAbove || item.targetBelow) &&
                        // (socketData[item.instrument_token]?.last_traded_price < item.targetBelow ||
                        //   socketData[item.instrument_token]?.last_traded_price > item.targetAbove)
                          //?
                           item.isHedging
                            ? "text-pink-600 font-bold"
                            : "text-black"
                          //: "text-black"
                      }`}
                      
                        >
                          {item.identifier}
                        </td>
                        <td
                              className={
                                item.isHedging
                                  ? "text-green-700 font-bold"
                                  : "text-red-700 font-semibold"
                              }
                            >
                              {item.isHedging ? "True" : "False"}
                            </td>
                        <td
                         className={
                          item.isHedging ? "font-bold text-black" : ""
                         } 
                        >
                          {item.hedgingIdentifier}
                        </td>

                        {activeFilters.includes("isMaster") && (
                          <>
                            <td>{item.callTargetLevel}</td>
                            <td>{item.putTargetLevel}</td>
                          </>
                        )}
                        <td
                          className={`${
                            socketData[item.instrument_token]
                              ?.last_traded_price < item.targetBelow
                              ? "text-green-500 w-32 font-bold"
                              : "w-32"
                          }`}
                        >
                          {item.targetBelow}
                        </td>

                        <td className="w-32">
                          {socketData[item.instrument_token]?.last_traded_price}
                        </td>
                        <td
                          className={`${
                            socketData[item.instrument_token]
                              ?.last_traded_price > item.targetAbove
                              ? "text-green-500 w-32 font-bold"
                              : "w-32"
                          }`}
                        >
                          {item.targetAbove}
                        </td>

                        {/* <td>
                          {editMode === item.id ? (
                            <select
                              name="terminal"
                              value={editValues.terminal}
                              onChange={handleInputChange}
                              className="w-full border-[1px] border-black p-2 rounded-md"
                            >
                              <option value="ON">ON</option>
                              <option value="OFF">OFF</option>
                              <option value="manualIn">Manual In</option>
                            </select>
                          ) : (
                            <span
                              className={
                                item.terminal === "ON"
                                  ? "text-red-700 font-semibold"
                                  : "text-green-700 font-semibold"
                              }
                            >
                              {item.terminal === "manualIn"
                                ? "Manual In"
                                : item.terminal}
                            </span>
                          )}
                        </td> */}
                        <td>
                          <button
                            onClick={() => toggleState(item.id, item.terminal)}
                            className={`${
                              item.terminal == "ON"
                                ? "bg-red-500  text-white "
                                : "bg-green-500  text-white"
                            } "cursor-pointer font-bold px-2 py-1 rounded-sm "`}
                          >
                            {" "}
                            {item.terminal}
                          </button>
                        </td>

                        {/* {!activeFilters.includes("isMaster") && (
                          <>
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
                          </>
                        )} */}

                        {/* <td>{item.haveTrade === true ? "True" : "False"}</td> */}
                        {/* <td
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
                              handleOpenNewTab(
                                `/future/live?id=${item.id}`,
                                item
                              )
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
                              backTesting(`/future/back?id=${item.id}`)
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
                                  // rangeBoundPercent2: item.rangeBoundPercent2,
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
                                  strikeDiff: item.strikeDiff,
                                  targetLevel: item.targetLevel,
                                  category: item.category,
                                  targetBelow: item.targetBelow,
                                  targetAbove: item.targetAbove,
                                  callTargetLevel: item.callTargetLevel,
                                  putTargetLevel: item.putTargetLevel,
                                  maxZoneTime: item.maxZoneTime,
                                  noTradeZone: item.noTradeZone,
                                  trendCandleCount: item.trendCandleCount,
                                  candleRatioBuy: item.candleRatioBuy,
                                  candleRatioSell: item.candleRatioSell,
                                  CESellDeviation: item.CESellDeviation,
                                  PESellDeviation: item.PESellDeviation,
                                  secondarySellTarget: item.secondarySellTarget,
                                  isHedging: item.isHedging,
                                  hedgingIdentifier: item.hedgingIdentifier,
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
                    );
                  })
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
