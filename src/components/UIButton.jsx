import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { useModal } from "@/hooks/use-modal";
import axios from "axios";
import { BASE_URL_OVERALL } from "@/lib/constants";

const UIButton = ({
  showRow,
  setShowRow,
  data,
  getHighLowLines,
  masterId,
  setTrendLineActive,
  trendLineActive,
  id,
  liveTrendValue,
}) => {
  const { onOpen } = useModal();
  const handleOpenNewTab = (url) => {
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (data?.data?.identifier) {
      document.title = `${data?.data?.identifier}`;
    }
  }, [data?.data?.identifier]);

  const handleSubmit = async () => {
    setTrendLineActive(!trendLineActive);
    try {
      await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id,
        trendLineActive: trendLineActive,
      });

      alert("successfully Updated");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-x-10 font-semibold py-1">
        <p className="text-[14px]">
          Trade Terminal :{" "}
          {data?.data?.terminal === "manualIn"
            ? "Manual In"
            : data?.data?.terminal}
        </p>
        <p className="text-green-600 text-[14px]">
          Candle :
          {data?.data?.interval === "minute"
            ? "1 minute"
            : data?.data?.interval}
        </p>
        <p className="text-[14px]">
          Identifier:
          {data?.data?.identifier}
        </p>
        <p className="text-[14px]">Trade Index: {data?.data?.tradeIndex}</p>
        <p className="text-[14px]">WMA : {data?.data?.WMA}</p>
        <p className="text-[14px]">Candle Size : {data?.data?.candleSize}</p>
        <p className="text-[14px]">
          D_Exit : {data?.data?.dynamicExitValue?.toFixed(2)}
        </p>
        <p className="text-[14px]">
          D_Entry : {data?.data?.dynamicEntryValue?.toFixed(2)}
        </p>
        <p className="text-[14px]">
          Min Profit :{" "}
          {((data?.data?.LastPivot * data?.data?.minProfit) / 100)?.toFixed(2)}
        </p>
        <p className="text-[14px]">
          Initial_Exit : {data?.data?.BaseExitValue?.toFixed(2)}
        </p>
        <p className="text-[14px]">
          Range Bound: {data?.data?.rangeBoundPercent}%
        </p>
        
        {/* <p className="text-[14px]">
          Range Bound2: {data?.data?.rangeBoundPercent2}%
        </p>*/}

        <p className="text-[14px]">SMA1 : {data?.data?.SMA1}</p>
        <p className="text-[14px]">SMA2 : {data?.data?.SMA2}</p>
        <p className="text-[14px]">MV Source1 : {data?.data?.mvSource1}</p>
        <p className="text-[14px]">MV Source2 : {data?.data?.mvSource2}</p>
        <p className="text-[14px]">RSI Max : {data?.data?.rsiMax}</p>
        {/* <p className="text-[14px]">RSI Live : {data?.data?.RSI_Value}</p> */}
        <p className="text-[14px]">RSI Min : {data?.data?.rsiMin}</p>
        <p className="text-[14px]">Order Type : {data?.data?.orderType}</p>
        <p className="text-[14px]">Master Trend : {data?.data?.masterTrend}</p>
        {/* <p className="text-[14px]">Target Level : {data?.data?.targetLevel}</p> */}

        {liveTrendValue && (
          <div className="flex">
            {liveTrendValue?.map((item, index) => {
              return (
                <div className="flex " key={index}>
                  <div className="text-sm font-semibold text-gray-800">
                    {item.name}: {item.value?.toFixed(1)}
                  </div>
                  &nbsp; &nbsp;
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            showAvg: !p.showAvg,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.showAvg ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Avg Line
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            pivot: !p.pivot,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.pivot ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Pivot Line
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            candle: !p.candle,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.candle ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Candle
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            dynamicExitValue: !p.dynamicExitValue,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.dynamicExitValue
            ? "bg-blue-500 text-gray-100"
            : "bg-gray-300 "
        }`}
      >
        D_Exit Value
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            RangeBoundTargetProfit: !p.RangeBoundTargetProfit,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.RangeBoundTargetProfit
            ? "bg-blue-500 text-gray-100"
            : "bg-gray-300 "
        }`}
      >
        Target Profit
      </button>
      {/* 
      &nbsp; &nbsp;
         <button
           onClick={() =>
             setShowRow((p) => ({
               ...p,           v 
               arrow: !p.arrow,
             }))
           }
           className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
             showRow.arrow ? "bg-blue-500 text-gray-100" : "bg-gray-300"
           }`}
         >
           <span className="flex">Buy Sell (Arrow)</span>
         </button> */}
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            dynamicEntryValue: !p.dynamicEntryValue,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.dynamicEntryValue
            ? "bg-blue-500 text-gray-100"
            : "bg-gray-300 "
        }`}
      >
        D_Entry Value
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            initialLow: !p.initialLow,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.initialLow ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        {data?.data?.orderType == "Sell" ? "Initial High" : "Initial Low"}
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            Last_Highest_LTP: !p.Last_Highest_LTP,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.Last_Highest_LTP
            ? "bg-blue-500 text-gray-100"
            : "bg-gray-300 "
        }`}
      >
        {data?.data?.orderType == "Sell" ? "Last Low LTP" : " Last High LTP"}
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            rangeBoundLine: !p.rangeBoundLine,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.rangeBoundLine ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Range Bound
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            movingAvg: !p.movingAvg,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.movingAvg ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Moving Avg
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            volume: !p.volume,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.volume ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Volume
      </button>
      &nbsp; &nbsp;
      <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            toolTip: !p.toolTip,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.toolTip ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Tool Tip
      </button>
      {/* <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            suppRes: !p.suppRes,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.suppRes ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
        Supp&Res
        
      </button> */}
      {/* &nbsp; &nbsp;
            <button
        onClick={() =>
          setShowRow((p) => ({
            ...p,
            suppRes: !p.suppRes,
          }))
        }
        className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
          showRow.suppRes ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
        }`}
      >
       Supp&Res
      </button> */}
      &nbsp; &nbsp;
      {data?.data?.isMaster == true && (
        <>
          <button
            onClick={() =>
              setShowRow((p) => ({
                ...p,
                monthlyHigh: !p.monthlyHigh,
              }))
            }
            className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
              showRow.monthlyHigh ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
            }`}
          >
            Monthly
          </button>
          &nbsp; &nbsp;
          <button
            onClick={() =>
              setShowRow((p) => ({
                ...p,
                weekly: !p.weekly,
              }))
            }
            className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
              showRow.weekly ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
            }`}
          >
            Weakly
          </button>
          &nbsp; &nbsp;
          <button
            onClick={() =>
              setShowRow((p) => ({
                ...p,
                daily: !p.daily,
              }))
            }
            className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
              showRow.daily ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
            }`}
          >
            Daily
          </button>
          &nbsp; &nbsp;
          <button
            onClick={() =>
              setShowRow((p) => ({
                ...p,
                fourHourly: !p.fourHourly,
              }))
            }
            className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
              showRow.fourHourly ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
            }`}
          >
            Four Hourly
          </button>
          &nbsp; &nbsp;
          <button
            onClick={() =>
              setShowRow((p) => ({
                ...p,
                hourly: !p.hourly,
              }))
            }
            className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
              showRow.hourly ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
            }`}
          >
            Hourly
          </button>
          &nbsp; &nbsp;
        </>
      )}
      &nbsp; &nbsp;
      <div className="mt-1">
        &nbsp; &nbsp;
        {data?.data?.isMaster == true ? (
          <>
            <Button size="xs" className="p-1" onClick={getHighLowLines}>
              High/Low line
            </Button>
            &nbsp; &nbsp;
            <Button size="xs" className="p-1" onClick={handleSubmit}>
              {trendLineActive ? "Activate TrendLine" : "Deactivate TrendLine"}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => handleOpenNewTab(`/future/helping?id=${masterId}`)}
              size="xs"
              className="p-1"
            >
              Helping Chart
            </Button>
            &nbsp; &nbsp;
            <Button
              onClick={() => onOpen("condition-modal")}
              size="xs"
              className="p-1"
            >
              Entry/Exit Condition
            </Button>
          </>
        )}
        &nbsp; &nbsp;
      </div>
      &nbsp; &nbsp;
    </div>
  );
};
export default UIButton;
