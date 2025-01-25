import { Checkbox } from "@/components/ui/checkbox";
import React, { useEffect } from "react";

const ScannerConfig = () => {
  useEffect(() => {
    document.title = "Scanner Config";
  }, []);
  return (
    <div className="ml-2">
        <div>

        <div className="font-bold text-3xl flex justify-center">
        Entry Condition for  <span className="text-green-500 "> &nbsp; Bullish &nbsp;</span> Trade
      </div>

      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold"> Day RSI</label>
          <label className="font-bold">Hour RSI</label>
          <label className="font-bold">15 Min RSI</label>
        </div>
        <div>
          <label className="font-bold">Above</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
            <Checkbox />
            <Checkbox />
          </div>
        </div>
        <div>
          <label className="font-bold">Below</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
            <Checkbox />
            <Checkbox />
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold">ATR On Hour Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold">1 Hour Candle</label>
        </div>
        <div>
          <label className="font-bold">Above R2</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
        <div>
          <label className="font-bold">Above R1</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">15 Min Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">Day Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold">15 Min Candle Close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Above day close</label>
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Above 15min close</label>
            <Checkbox />
          </div>
        </div>
      </div>

        </div>
        <div>

        <div className="font-bold text-3xl flex justify-center mt-5">
        Entry Condition for <span className="text-red-500 "> &nbsp; Bearish &nbsp;</span> Trade
      </div>

      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold"> Day RSI</label>
          <label className="font-bold">Hour RSI</label>
          <label className="font-bold">15 Min RSI</label>
        </div>
        <div>
          <label className="font-bold">Above</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
            <Checkbox />
            <Checkbox />
          </div>
        </div>
        <div>
          <label className="font-bold">Below</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
            <Checkbox />
            <Checkbox />
          </div>
        </div>    
      </div>

     

      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">ATR On Hour Candle</label>
        </div>
        <div>
        
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
        <div>
         
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 mt-5">
        <div className="grid grid-cols-1 ">
          <label className="font-bold"> ATR 15 Min Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3  ">
        <div className="grid grid-cols-1 ">
          <label className="font-bold mt-5">Day Candle close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Below S2</label>
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Below S1</label>
            <Checkbox />
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">Hour Candle Close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
    
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
       
            <Checkbox />
          </div>
        </div>
      </div>
      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">15 Min Candle Close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
    
            <Checkbox />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
       
            <Checkbox />
          </div>
        </div>
      </div>

        </div>
    
    </div>
  );
};

export default ScannerConfig;
