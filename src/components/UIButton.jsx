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
  const tradeOptions = [
    { label: "Bullish", value: 0 },
    { label: "Bearish", value: 1 },
    { label: "Both", value: 2 },
    { label: "None", value: 3 },
  ];

  const a =
  tradeOptions?.find(
    (option) => option.value === data.data.tradeIdentification
  )?.label || ""; 

  return (
    <div>
      <div className="flex flex-wrap gap-4 font-semibold py-2"> 
        &nbsp;
        <p className="text-green-600 text-[13px] md:text-[16px] w-full sm:w-auto">
          Candle:{" "}
          {data?.data?.interval === "minute"
            ? "1 minute"
            : data?.data?.interval}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Identifier: {data?.data?.identifier}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Trade Index: {data?.data?.tradeIndex}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Trade Type: {a}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          WMA: {data?.data?.WMA}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Target Level: {data?.data?.targetPrice?.toFixed(2)}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Stop Loss: {data?.data?.stopLoss?.toFixed(2)}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Entry Line: {data?.data?.entryPivotValue?.toFixed(2)}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Entry Candle: {data?.data?.entryCandle}
        </p>
        {/* <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          D_Exit: {data?.data?.dynamicExitValue?.toFixed(2)}
        </p> */}
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Last High: {data?.data?.lastHighestLTP}
        </p>
        {/* <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          RSI Max: {data?.data?.rsiMax}
        </p> */}
        {/* <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          VDEM: {data?.data?.R_min?.toFixed(2)}
        </p> */}
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          VDTM: {data?.data?.R_max?.toFixed(2)}
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Candle Ratio: {(Number(data?.data?.CEBuyRegion))?.toFixed(2)}  
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
           {(data?.data?.buyRegion)}  
        </p>
        {/* <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Gain Five Min: {(data?.data?.gainFiveMinute)}  
        </p> */}
       
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Gain Multiplier: {(data?.data?.gainThreeMinute)}  
        </p>
        <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
         Base  Gain : {(data?.data?.gainOneMinute)}  
        </p>
       
        {/* <p className="text-[13px] md:text-[16px] w-full sm:w-auto">
          Lowest Gain One Min: {(data?.data?.lowestGainOneMinute)}  
        </p> */}
        {liveTrendValue && (
          <div className="flex flex-wrap gap-2 w-full mt-2">
            {liveTrendValue?.map((item, index) => (
              <div className="text-sm font-semibold text-gray-800" key={index}>
                {item.name}: {item.value?.toFixed(1)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className=" mb-1 flex justify-between flex-wrap gap-1 md:gap-y-1">
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

        {/* <button
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
        </button> */}

        {/* <button
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
        </button> */}

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
          Last High LTP
        </button>

        {/* <button
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
        </button> */}

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
                  targetLine: !p.targetLine,
                }))
              }
              className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                showRow.targetLine
                  ? "bg-blue-500 text-gray-100"
                  : "bg-gray-300 "
              }`}
            >
             Target Line
            </button>
            &nbsp; &nbsp;
            <button
              onClick={() =>
                setShowRow((p) => ({
                  ...p,
                  stopLoss: !p.stopLoss,
                }))
              }
              className={`px-3 py-1 duration-300 text-xs font-semibold rounded-md ${
                showRow.stopLoss
                  ? "bg-blue-500 text-gray-100"
                  : "bg-gray-300 "
              }`}
            >
               Stop Loss
            </button>
            <button
              onClick={() =>
                setShowRow((p) => ({
                  ...p,
                  entryPivotValue: !p.entryPivotValue,
                }))
              }
              className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                showRow.entryPivotValue
                  ? "bg-blue-500 text-gray-100"
                  : "bg-gray-300 "
              }`}
            >
              Entry Line
            </button>
            &nbsp;
            <button
              onClick={() =>
                setShowRow((p) => ({
                  ...p,
                  dExitLine: !p.dExitLine,
                }))
              }
              className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
                showRow.dExitLine ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
              }`}
            >
              D_Exit Line
            </button>

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
        <button
          onClick={() =>
            setShowRow((p) => ({
              ...p,
              rsi: !p.rsi,
            }))
          }
          className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
            showRow.rsi ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
          }`}
        >
          RSI
        </button>
        <button
          onClick={() =>
            setShowRow((p) => ({
              ...p,
              atr: !p.atr,
            }))
          }
          className={`px-3 w-[100px] py-1 duration-300 text-xs font-semibold rounded-md ${
            showRow.atr ? "bg-blue-500 text-gray-100" : "bg-gray-300 "
          }`}
        >
          ATR
        </button>

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
                showRow.monthlyHigh
                  ? "bg-blue-500 text-gray-100"
                  : "bg-gray-300 "
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
                showRow.fourHourly
                  ? "bg-blue-500 text-gray-100"
                  : "bg-gray-300 "
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

        <div className="mt-1">
          {data?.data?.isMaster == true ? (
            <>
              <Button size="xs" className="p-1" onClick={getHighLowLines}>
                High/Low line
              </Button>
              &nbsp; &nbsp;
              <Button size="xs" className="p-1" onClick={handleSubmit}>
                {trendLineActive
                  ? "Activate TrendLine"
                  : "Deactivate TrendLine"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() =>
                  handleOpenNewTab(`/future/helping?id=${masterId}`)
                }
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
      </div>
    </div>
  );
};
export default UIButton;
