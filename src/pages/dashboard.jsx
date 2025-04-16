import React, { useEffect, useRef, useState } from "react";
import { useModal } from "@/hooks/use-modal";
import axios from "axios";
import { BASE_URL_OVERALL, BASE_URL_OVERALL2 } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FilePenLine, SquareArrowOutUpRight, Trash } from "lucide-react";
import { useLiveSocket } from "@/providers/live-socket-provider";
import GainerLosser from "@/pages/angel-one/gainer-looser";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import secureLocalStorage from "react-secure-storage";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import moment from "moment";

export const groupBy = function (xs, key) {
  return xs?.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const Dashboard = () => {
  // const { theme, setTheme } = useTheme();
  // useEffect(() => {
  //   setTheme("light");
  // }, []);

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
  const [narration, setNarration] = useState(false);
  const [editMode, setEditMode] = useState(null); // State to manage edit mode
  const [editValues, setEditValues] = useState({}); // State to manage the current values being edited
  const lastExecutionTimeRef = useRef(0);
  const [showOffTerminals, setShowOffTerminals] = useState(true);
  //const [filter, setFilter] = useState("ALL");
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [activeFilters, setActiveFilters] = useState(["ALL"]);
  const [filterIdentifier, setFilterIdentifier] = useState("");
  const [tradeIdentification, setTradeIdentification] = useState(2);
  const debounceRef = useRef(null);
  const intervalRef = useRef(null);
  const [strikeToggle, setStrikeToggle] = useState(true);
  const [gainerLooserQty, setGainerLooserQty] = useState({
    gainerProductQty: 3,
    looserProductQty: 3,
  });

  //const showNotification = (message) => {
  // alert(message); // Basic popup. You can replace this with a custom notification component if needed.
  //  };

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

  //const shownNotificationsRef = useRef(new Set()); // Move this out of useEffect to avoid re-creation on every render

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
            [message.token]: { ...message },
          };

          // Trades loop to check LTP against targetAbove and targetBelow
          // trades?.data?.forEach((trade) => {
          //   const LTP =
          //     updatedSocketData[trade.instrument_token]?.last_traded_price;
          //   if (trade.isMaster && trade.targetAbove && trade.targetBelow) {
          //     if (LTP) {
          //       const notificationKeyAbove = `${trade.identifier}-above`;
          //       const notificationKeyBelow = `${trade.identifier}-below`;

          //       // Ensure targetAbove is a valid number
          //       const targetAboveValid =
          //         trade.targetAbove !== null &&
          //         trade.targetAbove !== "" &&
          //         !isNaN(trade.targetAbove);
          //       // Ensure targetBelow is a valid number
          //       const targetBelowValid =
          //         trade.targetBelow !== null &&
          //         trade.targetBelow !== "" &&
          //         !isNaN(trade.targetBelow);

          //       // Check if targetAbove is a valid number and if LTP crosses the target
          //       if (
          //         targetAboveValid &&
          //         LTP > trade.targetAbove &&
          //         !shownNotificationsRef.current.has(notificationKeyAbove)
          //       ) {
          //         showNotification(
          //           `${trade.identifier} Current Price: ${LTP} Target Price Hit Above: ${trade.targetAbove}`
          //         );
          //         shownNotificationsRef.current.add(notificationKeyAbove); // Mark notification as shown
          //         shownNotificationsRef.current.delete(notificationKeyBelow); // Reset below notification state
          //       }

          //       // Check if targetBelow is a valid number and if LTP drops below the target
          //       if (
          //         targetBelowValid &&
          //         LTP < trade.targetBelow &&
          //         !shownNotificationsRef.current.has(notificationKeyBelow)
          //       ) {
          //         showNotification(
          //           `${trade.identifier} Current Price: ${LTP} Target Price Hit Below: ${trade.targetBelow}`
          //         );
          //         shownNotificationsRef.current.add(notificationKeyBelow); // Mark notification as shown
          //         shownNotificationsRef.current.delete(notificationKeyAbove); // Reset above notification state
          //       }
          //     }
          //   }
          // });

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
      setGainerLooserQty({
        gainerProductQty: data?.data?.[0]?.gainerProductQty,
        looserProductQty: data?.data?.[0]?.looserProductQty,
      });
      setTradeIdentification(data?.data?.[0]?.tradeIdentification);
    } catch (error) {
      // setTrades((p) => ({ ...p, error: error.message }));
    } finally {
      setTrades((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    getAllTrades();
    const interval = setInterval(getAllTrades, 90 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        getAllTrades();
        intervalRef.current = setInterval(getAllTrades, 30 * 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalRef.current);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
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
      category: item.category,
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

  // const clearNotification = async () => {
  //   try {
  //     const response = await axios.put(
  //       `${BASE_URL_OVERALL}/config/resetAllNotification`
  //     );
  //     alert(response.data.message);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (trades?.data && socketData) {
      const newFilteredTrades = trades?.data?.filter((item) => {
        if (activeFilters.includes("ALL")) return true;

        let match = false;

        if (activeFilters.includes("isMaster") && item.isMaster) {
          match = true;
        }
        if (
          activeFilters.includes("tradingStockCE") &&
          item.tradingOptions == "CE"
        ) {
          match = true;
        }
        if (
          activeFilters.includes("tradingStockPE") &&  
          item.tradingOptions == "PE"
        ) {
          match = true;
        }
        if (
          activeFilters.includes("Future") &&
          item.tradingOptions == "Future"
        ) {
          match = true;
        }
        if (
          activeFilters.includes("EQ") &&
          (item.tradingOptions == "EQ" || item.isMaster == 2)
        ) {
          match = true;
        }
        if (
          activeFilters.includes("todayTrade") &&
          item.category == "todayTrade"
        ) {
          match = true;
        }
        if (activeFilters.includes("RangeBound") && item.category === "RangeBound") {
          match = true;
        }
        if (activeFilters.includes("haveTrade") && item.haveTrade) {
          match = true;
        }
        if (
          activeFilters.includes("buyTrendLineDate") &&
          item.buyTrendLineDate
        ) {
          match = true;
        }
        // if (activeFilters.includes("Index") && item.category === "Index") {
        //   match = true;
        // }
        if (activeFilters.includes("Bearish") && item.category === "Bearish") {
          match = true;
        }
        if (activeFilters.includes("Bullish") && item.category === "Bullish") {
          match = true;
        }
        if (activeFilters.includes("Nifty50") && item.category === "Nifty50") {
          match = true;
        }
        if (
          activeFilters.includes("index2") &&
          (item.tradeIndex == 2 || item.tradeIndex == 12)
        ) {
          match = true;
        }
        if (
          activeFilters.includes("index7") &&
          (item.tradeIndex == 7 || item.tradeIndex == 17) &&
          !item.isMaster
        ) {
          match = true;
        }
        if (activeFilters.includes("gainer") && item.looserGainer == "Gainer") {
          match = true;
        }
        if (activeFilters.includes("looser") && item.looserGainer == "Looser") {
          match = true;
        }
        if (
          activeFilters.includes("Index") &&
          item.category === "Index" 
        ) {
          match = true;
        }
        if (activeFilters.includes("daily") && item.category === "daily") {
          match = true;
        }
        if (activeFilters.includes("hourly") && item.category === "hourly") {
          match = true;
        }
        if (activeFilters.includes("15Min") && item.category === "15Min") {
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
  // const toggleFilter = (filterType) => {
  //   //console.log(filterType)
  //   setActiveFilters((prevFilters) => {
  //     if (filterType === "ALL") {
  //       return ["ALL"]; // Reset to "ALL"
  //     }
  //     const updatedFilters = prevFilters.includes("ALL")
  //       ? [filterType]
  //       : prevFilters.includes(filterType)
  //       ? prevFilters.filter((f) => f !== filterType)
  //       : [...prevFilters, filterType];

  //     return updatedFilters.length === 0 ? ["ALL"] : updatedFilters;
  //   });

  //   if (
  //     filterType !== "isMaster" &&
  //     filterType !== "MyBullishMaster" &&
  //     filterType !== "MyBearishMaster"
  //   ) {
  //     setNarration(false); // Reset narration automatically
  //   }
  // };
  // const handleButtonClick = (filterType) => {
  //   toggleFilter(filterType);

  //   // Manage button color state
  //   setActiveButtons((prevState) => {
  //     if (filterType === "ALL") {
  //       return { ALL: true }; // Reset to only highlight "ALL"
  //     }

  //     return {
  //       ...prevState,
  //       ALL: false,
  //       [filterType]: !prevState[filterType],
  //     };
  //   });
  // };

  const toggleFilter = (filterType) => {
    setActiveFilters((prevFilters) => {
      let updatedFilters;

      if (filterType === "ALL") {
        updatedFilters = ["ALL"]; // Reset to only "ALL"
      } else {
        if (prevFilters.includes("ALL")) {
          updatedFilters = [filterType]; // Replace "ALL" with selected filter
        } else if (prevFilters.includes(filterType)) {
          updatedFilters = prevFilters.filter((f) => f !== filterType); // Remove filter if already active
        } else {
          updatedFilters = [...prevFilters, filterType]; // Add new filter
        }

        if (updatedFilters.length === 0) {
          updatedFilters = ["ALL"]; // Default to "ALL" when all filters are removed
        }
      }

      return updatedFilters;
    });

    setActiveButtons((prevState) => {
      let newButtonState = {};

      if (filterType === "ALL") {
        newButtonState = { ALL: true }; // If "ALL" is selected, only highlight "ALL"
      } else {
        newButtonState = { ...prevState, [filterType]: !prevState[filterType] };

        // If no filters remain active, ensure "ALL" stays highlighted
        const remainingFilters = Object.keys(newButtonState).filter(
          (key) => newButtonState[key]
        );
        if (remainingFilters.length === 0) {
          newButtonState = { ALL: true };
        } else {
          newButtonState.ALL = false;
        }
      }

      return newButtonState;
    });

    // Reset narration except for specific master filters
    if (
      filterType !== "isMaster" &&
      filterType !== "MyBullishMaster" &&
      filterType !== "MyBearishMaster"
    ) {
      setNarration(false);
    }
  };

  const handleButtonClick = (filterType) => {
    toggleFilter(filterType);
  };

  const toggleState = async (item, currentState) => {
    const newState = currentState === "ON" ? "OFF" : "ON";

    if (newState == "OFF" && item.haveTrade == 1) {
      return alert("Identifier  is in trade, cannot be turned OFF");
    }
    try {
      const response = await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id: item.id,
        terminal: newState,
      });

      if (response.status === 200) {
        // Update the local state in both trades and filteredTrades
        setTrades((prevTrades) => ({
          ...prevTrades,
          data: prevTrades?.data?.map((trade) =>
            trade.id === item.id ? { ...trade, terminal: newState } : trade
          ),
        }));
        // Update filteredTrades if it's being used separately
        setFilteredTrades((prevFilteredTrades) =>
          prevFilteredTrades?.map((trade) =>
            trade.id === item.id ? { ...trade, terminal: newState } : trade
          )
        );
      }
    } catch (error) {
      console.error("Error updating state:", error);
    }
  };

  const tradeOptions = [
    { label: "Bullish", value: 0 },
    { label: "Bearish", value: 1 },
    { label: "Both", value: 2 },
    { label: "None", value: 3 },
  ];

  // const handleSubmit = async () => {
  //   try {
  //     const response = await axios.put(
  //       `${BASE_URL_OVERALL}/config/updateAllTradeIdentification`,
  //       {
  //         tradeIdentification,
  //       }
  //     );
  //     alert(response.data.message);
  //     await getAllTrades();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // console.log("Trade Identification" , filteredTrades)

  const strikeChange = async () => {
    try {
      setStrikeToggle((prev) => {
        const newToggle = !prev; // Get the updated value

        // Make the API call with the updated value
        axios
          .put(`${BASE_URL_OVERALL}/config/resetAllNotification`, {
            autoStrikeMode: newToggle,
          })
          .then((response) => {
            alert("Succesfully updated");
          })
          .catch((err) => console.log(err));

        return newToggle; // Update state with new value
      });
    } catch (err) {
      console.log(err);
    }
  };

  const deleteChild = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL_OVERALL}/config/deleteAllChild`
      );
      alert(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitLooserGainerQty = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL_OVERALL}/config/gainerLooserProductQty`,
        {
          gainerLooserQty,
        }
      );
      alert("Saved Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <React.Fragment>
        <div className="text-3xl  font-bold font-serif flex justify-center p-2 text-white bg-[#272626] rounded-sm">
          PES CAPITAL
        </div>
        <div className="text-center">
          <Button
            onClick={() => onOpen("add-new-trade", { getAllTrades, trades })}
            className="px-5 py-2 rounded-md border-2"
          >
            Add New Trade
          </Button>
          <Button
            onClick={() => strikeChange()}
            className={`px-5 py-2 rounded-md border-2  ${
              strikeToggle ? "" : "bg-red-600 hover:bg-red-600"
            }`}
          >
            {strikeToggle ? "Auto Child Deleted" : "Auto Child Not Deleted"}
          </Button>
          <Button
            onClick={deleteChild}
            className="px-5 py-2 rounded-md border-2"
          >
            Delete Child Trade
          </Button>
          <Button
            // onClick={() =>
            //   navigate("/future/particular-identifier-losser-gainer")
            // }
            onClick={() => navigate("/future/gainerlooserlog")}
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
            onClick={() => navigate("/future/tardelog")}
            className="px-5 py-2 rounded-md border-2"
          >
            Trade Log
          </Button>
          <Button
            onClick={() => window.open(`/future/analyser`, "_blank")}
            className="px-5 py-2 rounded-md border-2"
          >
            Analyser Config
          </Button>
          <Button
            onClick={() => navigate("/future/angel-login")}
            className="px-5 py-2 rounded-md border-2"
          >
            Angel-Login
          </Button>
          {/* <Button
            onClick={() => window.open("/future/scanner", "_blank")}
            className="px-5 py-2 rounded-md border-2"
          >
            Scanner
          </Button>
          <Button
            onClick={() => window.open("/future/scannerconfig", "_blank")}
            className="px-5 py-2 rounded-md border-2"
          >
            Scanner Config
          </Button> */}
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
            className={`px-5 py-2 rounded-md border-2 ${
              !showOffTerminals ? "bg-red-600 hover:bg-red-600" : ""
            }`}
          >
            {showOffTerminals ? "All" : "ON"}
          </Button>
          {/* <Button
            onClick={clearNotification}
            variant="destructive"
            className="px-5 py-2 rounded-md border-2 "
          >
            Clear Notification
          </Button> */}
          {/* <ModeToggle /> */}
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-5 mt-1">
          <Button
            onClick={() => handleButtonClick("isMaster")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["isMaster"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"    
            }`}
          >
            Master
          </Button>
          {(activeFilters.includes("isMaster") ||
            activeFilters.includes("MyBullishMaster") ||
            activeFilters.includes("MyBearishMaster")) && (
            <>
              <Button
                onClick={() => setNarration(!narration)}
                className={`${narration ? "bg-red-600 hover:bg-red-600" : " "}`}
              >
                Narration
              </Button>
            </>
          )}
          
          <Button
            onClick={() => handleButtonClick("tradingStockCE")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["tradingStockCE"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Trading Stock CE
          </Button>
          <Button
            onClick={() => handleButtonClick("tradingStockPE")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["tradingStockPE"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Trading Stock PE
          </Button>
          <Button
            onClick={() => handleButtonClick("Future")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Future"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Future
          </Button>
          <Button
            onClick={() => handleButtonClick("EQ")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["EQ"] ? "bg-red-500 hover:bg-red-600" : "bg-black"
            }`}
          >
            EQ
          </Button>

          <Button
            onClick={() => handleButtonClick("Bullish")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Bullish"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Bullish
          </Button>
          <Button
            onClick={() => handleButtonClick("Bearish")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Bearish"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Bearish
          </Button>
          <Button
            onClick={() => handleButtonClick("RangeBound")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["RangeBound"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            RangeBound
          </Button>

          <Button
            onClick={() => handleButtonClick("Nifty50")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Nifty50"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Nifty 50
          </Button>
          <Button
            onClick={() => handleButtonClick("Index")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["Index"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Index
          </Button>
          <Button
            onClick={() => handleButtonClick("todayTrade")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["todayTrade"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Today Trade
          </Button>
          <Button
            onClick={() => handleButtonClick("haveTrade")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["haveTrade"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Have Trade
          </Button>
          <Button
            onClick={() => handleButtonClick("buyTrendLineDate")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["buyTrendLineDate"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            TrendLine Date
          </Button>
          <Button
            onClick={() => handleButtonClick("daily")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["daily"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Daily
          </Button>
          <Button
            onClick={() => handleButtonClick("hourly")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["hourly"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Hourly
          </Button>
          <Button
            onClick={() => handleButtonClick("15Min")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["15Min"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            15 Min
          </Button>
          <Button
            onClick={() => handleButtonClick("index2")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["index2"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Index 2 & 12
          </Button>
          <Button
            onClick={() => handleButtonClick("index7")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["index7"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Index 7 & 17
          </Button>
          <Button
            onClick={() => handleButtonClick("gainer")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["gainer"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Gainer
          </Button>
          <Button
            onClick={() => handleButtonClick("looser")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["looser"]
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black"
            }`}
          >
            Looser
          </Button>

          <Button
            onClick={() => handleButtonClick("ALL")}
            className={`w-full md:w-auto px-5 py-2 rounded-md border-2 ${
              activeButtons["ALL"] ? "bg-red-500 hover:bg-red-600" : "bg-black"
            }`}
          >
            All
          </Button>

          <Input
            type="text"
            value={filterIdentifier}
            onChange={(e) => setFilterIdentifier(e.target.value)}
            placeholder="Filter By Identifier"
            className="p-1 mb-1 w-[150px]"
          />

          {/* <div>
            <Label className="flex items-center">Gainer Qty</Label>

            <Input
              type="number"
              onChange={(e) =>
                setGainerLooserQty((prevState) => ({
                  ...prevState,
                  gainerProductQty: e.target.value,
                }))
              }
              placeholder="Add Gainer QTY"
              className="mb-1 w-[150px] h-[30px]"
              value={gainerLooserQty.gainerProductQty}
            />
          </div>

          <div>
            <Label className="flex items-center">Looser Qty</Label>

            <Input
              type="number"
              placeholder="Add Looser QTY"
              onChange={(e) =>
                setGainerLooserQty((prevState) => ({
                  ...prevState,
                  looserProductQty: e.target.value,
                }))
              }
              className=" mb-1 w-[150px] h-[30px]"
              value={gainerLooserQty.looserProductQty}
            />
          </div> */}

         {/* <Button onClick={handleSubmitLooserGainerQty}>Submit</Button> */}
          

 
        </div>

        <div>
          <table
            className="dashboard-table w-[1200px]  mx-auto "
            // className={`${!activeFilters.includes("isMaster") ? 'dashboard-table w-[1200px]  mx-auto' : 'dashboard-table w-[1700px]  mx-auto'}`}
          >
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Identifier</th>
                <th>Exchange</th>
                <th>Main Index</th>

                {narration && <th>Narration</th>}
                {!activeFilters.includes("isMaster") && (
                  <>
                    <th>Master</th>
                    {/* <th>Customer Grade</th> */}
                    {/* <th>Loss Count</th>
                    <th>Candle Size</th>
                    <th>Initial Entry Value</th>
                    <th>Min Profit</th>
                    <th>Traling stop loss</th> */}

                    {/* <th>WMA</th> */}
                  </>
                )}
                {/* <th>Interval</th> */}

                {/* {activeFilters.includes("isMaster") && (
                  <>
                    <th>Call Target Level</th>
                    <th>Put Target Level</th>
                  </>
                )} */}
                {
                  // (activeFilters.includes("isMaster") ||
                  //   activeFilters.includes("MyBullishMaster") ||
                  //   activeFilters.includes("MyBearishMaster")) &&
                  !narration && (
                    <>
                      <th>Looser/Gainer</th>
                      {/* <th>Percent Change</th> */}
                      <th>Looser/Gainer Date</th>
                      {/* <th>Percent Change</th>
                      <th>Curr. Percent Change</th> */}
                    </>
                  )
                }
                {!narration && (
                  <>
                    <th>Trade Type</th>
                    <th>Have Tarde</th>

                    {/* <th>Is Hedge</th> */}
                    {/* <th>  Hedging Trade</th> */}
                    {/* <th> Identifier Under Hedge</th> */}
                    {/* <th>Call Entry Value</th> */}
                    <th>LTP</th>
                    {/* <th>Put Entry Value</th> */}
                    <th>Lot Size</th>
                    {/* <th>RSI Value</th> */}
                    {/* <th>Trade Limit</th> */}
                    {/* <th>Entry Line Below</th> */}
                    {/* <th>Entry Line Above</th> */}
                    <th>Category</th>
                    <th>Green Candle Ratio</th>
                    <th>Analyser Timestamp</th>
                    <th>Loos/Gain</th>
                    <th>ON/OFF</th>
                  </>
                )}

                {/* {!activeFilters.includes("isMaster") && (
                 
                )} */}

                {/* <th>Have Trade</th> */}
                {/* <th>Market Trend</th> */}
                {/* <th>Edit</th>
                <th>Update</th>  */}
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
                    (item) =>
                      (showOffTerminals || item.terminal !== "OFF") &&
                      item.identifier &&
                      item.identifier
                        ?.toLowerCase()
                        ?.includes(filterIdentifier?.toLowerCase())
                  )
                  ?.sort((a, b) => {
                    // Priority 1: Rows with haveTrade: true come first
                    if (a.haveTrade && !b.haveTrade) return -1;
                    if (!a.haveTrade && b.haveTrade) return 1;

                    // Priority 2: Rows with valid dateOfLooserGainer come next
                    if (a.buyTrendLineDate && b.buyTrendLineDate) {
                      return (
                        new Date(b.buyTrendLineDate) -
                        new Date(a.buyTrendLineDate)
                      );
                    }

                    // Priority 3: Rows with valid buyTrendLineDate come next
                    if (a.buyTrendLineDate && !b.buyTrendLineDate) return -1;
                    if (!a.buyTrendLineDate && b.buyTrendLineDate) return 1;
                    ////                                               /////
                    if (a.dateOfLooserGainer && !b.dateOfLooserGainer)
                      return -1;
                    if (!a.dateOfLooserGainer && b.dateOfLooserGainer) return 1;

                    // Default: No specific ordering, maintain the existing order
                    return 0;
                  })
                  ?.map((item, index) => {
                    const a =
                      tradeOptions?.find(
                        (option) => option.value === item.tradeIdentification
                      )?.label || "";
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
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
                        <td>{item.exchange}</td>
                        <td>{item.tradeIndex}</td>

                        {narration && <td>{item.narration}</td>}
                        {!activeFilters?.includes("isMaster") && (
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
                            {/* <td>{item.customerGrading}</td> */}

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
                          </>
                        )}

                        {/* <td>{item.interval}</td> */}

                        {/* {activeFilters.includes("isMaster") && (
                          <>
                            <td>{item.callTargetLevel}</td>
                            <td>{item.putTargetLevel}</td>
                          </>
                        )} */}

                        {
                          // activeFilters.includes("isMaster") ||
                          // activeFilters.includes("MyBullishMaster") ||
                          // activeFilters.includes("MyBearishMaster")) &&
                          !narration && (
                            <>
                              <td
                                className={`${
                                  item.looserGainer == "Looser"
                                    ? "text-red-500 font-semibold"
                                    : "text-green-500 font-semibold"
                                }`}
                              >
                                {item.looserGainer}
                              </td>
                              {/* <td>{(item.percentChange)?.toFixed(2)}</td> */}

                              <td>
                                {item.dateOfLooserGainer
                                  ? new Date(item.dateOfLooserGainer)
                                      .toISOString()
                                      .replace("T", " ")
                                      .slice(0, 19)
                                  : ""}
                              </td>
                              {/* <td>{item.percentChange}</td>
                              <td>{item.currentPercentChange}</td> */}
                            </>
                          )
                        }

                        {!narration && (
                          <>
                            <td
                            // className={`${
                            //   a == 0
                            //     ? "text-green-600 font-semibold"
                            //     : a == 1
                            //     ? "text-red-600 font-semibold"
                            //     : "font-semibold"
                            // }`}
                            >
                              {a}
                            </td>
                            <td
                              className={`${
                                item?.haveTrade
                                  ? "text-red-500 font-bold"
                                  : "text-green-500 font-bold"
                              }`}
                            >
                              {item?.haveTrade ? "true" : "false"}
                            </td>

                            {/* <td
                              className={
                                item.isHedging
                                  ? "text-green-700 font-bold"
                                  : "text-red-700 font-semibold"
                              }
                            >
                              {item.isHedging ? "True" : "False"}
                            </td> */}
                            {/* <td
                              className={
                                item.isHedging
                                  ? "font-bold text-green-600"
                                  : "text-black font-bold"
                              }
                            >
                              {item.hedgingIdentifier}
                            </td> */}
                            {/* <td
                              className={`${
                                item.ResistancePrice &&
                                "text-green-500 font-semibold"
                              }`}
                            >
                              {item.ResistancePrice?.toFixed(1)}
                            </td> */}
                            <td className="w-32">
                              {
                                socketData[item.instrument_token]
                                  ?.last_traded_price
                              }
                            </td>

                            <td>{item.lotSize}</td>

                            {/* <td>{item.maxLoss}</td> */}

                            {/* <td
                              className={`${
                                socketData[item.instrument_token]
                                  ?.last_traded_price < item.targetBelow
                                  ? "text-green-500 w-32 font-bold"
                                  : "w-32"
                              }`}
                            >
                              {item.targetBelow}
                            </td> */}

                            {/* <td
                              className={`${
                                socketData[item.instrument_token]
                                  ?.last_traded_price > item.targetAbove
                                  ? "text-green-500 w-32 font-bold"
                                  : "w-32"
                              }`}
                            >
                              {item.targetAbove}
                            </td> */}

                            <td>
                              {editMode === item.id ? (
                                <select
                                  name="category"
                                  value={editValues.category}
                                  onChange={handleInputChange}
                                  className="w-full border-[1px] border-black p-2 rounded-md"
                                >
                                  <option value="MyBullishMaster">
                                    My Bullish Master
                                  </option>
                                  <option value="MyBearishMaster">
                                    My Bearish Master
                                  </option>
                                  <option value="MyCommonMaster">
                                    My Common Master
                                  </option>
                                  <option value="Index">Index</option>
                                  <option value="PE">PE</option>
                                  <option value="CE">CE</option>
                                  <option value="Nifty50">Nifty 50</option>
                                  <option value="BankNifty">Bank Nifty</option>
                                  <option value="todayTrade">
                                    Today Trade
                                  </option>

                                  <option value="Others">Others</option>
                                </select>
                              ) : (
                                <span>{item.category}</span>
                              )}
                            </td>
                            <td>{item.Ratio?.toFixed(1)}</td>
                            <td>
                              {item.analyserDateTime
                                ? new Date(
                                    item.analyserDateTime
                                  ).toLocaleString()
                                : ""}
                            </td>
                            <td>{item.lossGainOutput}</td>

                            <td>
                              <button
                                onClick={() => toggleState(item, item.terminal)}
                                className={`${
                                  item.terminal == "ON"
                                    ? "bg-red-500  text-white "
                                    : "bg-green-500  text-white"
                                } "cursor-pointer font-bold px-2 py-1 rounded-sm "`}
                              >
                                {item.terminal}
                              </button>
                            </td>
                          </>
                        )}

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

                        {/* <td>
                          <Button onClick={() => handleEdit(item)}>Edit</Button>
                        </td>
                        <td>
                          {editMode === item.id && (
                            <Button onClick={handleUpdate}>Update</Button>
                          )}
                        </td>  */}
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
                        <td className="text-center flex gap-x-2 h-20 items-center">
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
                                  FUTDeviation: item.FUTDeviation,
                                  hedgeValue: item.hedgeValue,
                                  hedgeDeviation: item.hedgeDeviation,
                                  dynamicExitPercent: item.dynamicExitPercent,
                                  tradingOptions: item.tradingOptions,
                                  exitSelection: item.exitSelection,
                                  entryCandle: item.entryCandle,
                                  atrMf: item.atrMf,
                                  tradeIdentification: item.tradeIdentification,
                                  RSDeviation: item.RSDeviation,
                                  maxLoss: item.maxLoss,
                                  targetTime: item.targetTime,
                                  entryLineTime: item.entryLineTime,
                                  dExitMf: item.dExitMf,
                                  targetMf: item.targetMf,
                                  atrMax: item.atrMax,
                                  shortTimeInterval: item.shortTimeInterval,
                                  longTimeInterval: item.longTimeInterval,
                                  lastDayCloseMode: item.lastDayCloseMode,
                                  strikeDeviation: item.strikeDeviation,
                                  rsiDifference: item.rsiDifference,
                                  targetConstant: item.targetConstant,
                                  stepUpPrice: item.stepUpPrice,
                                  strikeBasePrice: item.strikeBasePrice,
                                  rsiReference: item.rsiReference,
                                  intervalReference: item.intervalReference,
                                  targetMean: item.targetMean,
                                  dExitMean: item.dExitMean,
                                  masterRsiReference: item.masterRsiReference,
                                  masterIntervalReference:
                                    item.masterIntervalReference,
                                  s1: item.s1,
                                  candleRatio: item.candleRatio,
                                  incCandleRatio: item.incCandleRatio,
                                  decCandleRatio: item.decCandleRatio,
                                  stopLossMf: item.stopLossMf,
                                  gainPercent: item.gainPercent,
                                  vdtmConstant: item.vdtmConstant,
                                  dExitMax: item.dExitMax,
                                  greenCandleRatioDownTrend:
                                    item.greenCandleRatioDownTrend,
                                  sampleCandle: item.sampleCandle,
                                  exitRsi: item.exitRsi,
                                  greenCandleRatioUpTrend:
                                    item.greenCandleRatioUpTrend,
                                  rbExtiRsi: item.rbExtiRsi,
                                  greenCandleRatioRangeBound:
                                    item.greenCandleRatioRangeBound,
                                    isGroup: item.isGroup,
                                    groupName: item.groupName,
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
      </React.Fragment>
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
