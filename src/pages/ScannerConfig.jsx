import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

const ScannerConfig = () => {

  const [values , setValues] = useState({
    aboveDayRsi :"" ,
    aboveHourRsi:"" ,
    aboveFifteenthMinRsi:"" ,
    belowDayRsi:"" ,
    belowHourRsi:"" ,
    belowFifteenthMinRsi:"" ,
    aboveAtrOnHourCandle:"" ,
    belowAtrOnHourCandle:"" ,
    aboveR2OneHourCandle:"" ,
    aboveR1OneHourCandle:"" ,
    aboveR2FifteenthMinCandle:"" ,
    aboveR1FifteenthMinCandle:"" ,
    aboveR2DayCandle:"" ,
    aboveR1DayCandle:"" ,
    abovePrevDayClose:"" ,
    aboveFifteenthMinPrevClose:"" ,
    aboveFifteenthMinRsiBearish:"" ,
    aboveHourRsiBearish:"" ,
    aboveDayRsiBearish:"" ,
    belowFifteenthMinRsiBearish:"" ,
    belowHourRsiBearish:"" ,
    belowDayRsiBearish:"" ,
    belowAtrOnHourCandleBearish:"",
    aboveAtrOnHourCandleBearish:"",
    belowAtrFifteenthMinCandleBearish:"",
    aboveAtrFifteenthMinCandleBearish:"",
    belowS2HourCandleClose:"",
    belowS1HourCandleClose:"",
    belowS1DayCandleClose:"",
    belowS2DayCandleClose:"",
    belowFifteenthMinPrevClose:"",
    belowPrevDayClose:""

  

  });

  useEffect(() => {
    document.title = "Scanner Config";
  }, []);

 
  const handleSubmit =() =>{
  console.log(values)
 }

 const handleChange = (e) => {
  const { name, value } = e.target;
  setValues((prev) => ({
    ...prev,
    [name]: value,
  }));
};

// Separate handler for checkboxes
const handleCheckboxChange = (name, checked) => {
  setValues((prev) => ({
    ...prev,
    [name]: checked,
  }));
};



  return (
    <div className="ml-2" >
        <div>

        <div className="font-bold text-3xl flex justify-center">
        Entry Condition for  <span className="text-green-500 "> &nbsp; Bullish &nbsp;</span> Trade
      </div>

      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label  className="font-bold"> Day RSI</label>
          <label className="font-bold">Hour RSI</label>
          <label className="font-bold">15 Min RSI</label>
        </div>
        <div>
          <label className="font-bold">Above</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Input name="aboveDayRsi" className="w-[200px]" onChange={handleChange}/>
            <Input name="aboveHourRsi" className="w-[200px]" onChange={handleChange}/>
            <Input name="aboveFifteenthMinRsi"  className="w-[200px]" onChange={handleChange}/>
          </div>
        </div>
        <div>
          <label className="font-bold">Below</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Input name="belowDayRsi" className="w-[200px]" onChange={handleChange}/>
            <Input name="belowHourRsi" className="w-[200px]" onChange={handleChange}/>
            <Input name="belowFifteenthMinRsi" className="w-[200px]" onChange={handleChange}/>
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold">ATR On Hour Candle</label>
        </div>
        <div>
          <div className = "grid grid-cols-1 space-y-1">
            <Input name="aboveAtrOnHourCandle" className= "w-[200px]" onChange={handleChange}/>
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Input name="belowAtrOnHourCandle" className= "w-[200px]"  onChange={handleChange}/>
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
            <Checkbox  name="aboveR2OneHourCandle" 
            onCheckedChange={(checked) => handleCheckboxChange("aboveR2OneHourCandle", checked)}
            />
          </div>
        </div>
        <div>
          <label className="font-bold">Above R1</label>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox name="aboveR1OneHourCandle" 
            onCheckedChange={(checked) => handleCheckboxChange("aboveR1OneHourCandle", checked)}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">15 Min Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox name="aboveR2FifteenthMinCandle" 
            onCheckedChange={(checked) => handleCheckboxChange("aboveR2FifteenthMinCandle", checked)}
            />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox name="aboveR1FifteenthMinCandle" 
            onCheckedChange={(checked) => handleCheckboxChange("aboveR1FifteenthMinCandle", checked)}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">Day Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox name="aboveR2DayCandle" 
            onCheckedChange={(checked) => handleCheckboxChange("aboveR2DayCandle", checked)}
            />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Checkbox name="aboveR1DayCandle" 
            onCheckedChange={(checked) => handleCheckboxChange("aboveR1DayCandle", checked)}
            />
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold">15 Min Candle Close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Above Previous day close</label>
            <Checkbox name="abovePrevDayClose" 
            onCheckedChange={(checked) => handleCheckboxChange("abovePrevDayClose", checked)}
            
            />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Above 15min Previous close</label>
            <Checkbox name="aboveFifteenthMinPrevClose" 
             onCheckedChange={(checked) => handleCheckboxChange("aboveFifteenthMinPrevClose", checked)}
            />
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
            <Input className="w-[200px]" name="aboveDayRsiBearish"  onChange={handleChange}/>
            <Input className="w-[200px]"  name="aboveHourRsiBearish" onChange={handleChange}/>
            <Input className="w-[200px]" name="aboveFifteenthMinRsiBearish" onChange={handleChange}/>
          </div>
        </div>
        <div>
          <label className="font-bold">Below</label> 
          <div className=" grid grid-cols-1 space-y-1">
            <Input className="w-[200px]" name="belowDayRsiBearish" onChange={handleChange}/>
            <Input className="w-[200px]" name="belowHourRsiBearish"  onChange={handleChange}/>
            <Input className="w-[200px]" name="belowFifteenthMinRsiBearish" onChange={handleChange}/>
          </div>
        </div>    
      </div>

     

      <div className="grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">ATR On Hour Candle</label>
        </div>
        <div>
        
          <div className=" grid grid-cols-1 space-y-1">
            <Input className="w-[200px]" name="aboveAtrOnHourCandleBearish" onChange={handleChange}/>
          </div>
        </div>
        <div>
         
          <div className=" grid grid-cols-1 space-y-1">
            <Input className="w-[200px]" name="belowAtrOnHourCandleBearish" onChange={handleChange}/>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 mt-5">
        <div className="grid grid-cols-1 ">
          <label className="font-bold"> ATR 15 Min Candle</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Input className="w-[200px]" name="aboveAtrFifteenthMinCandleBearish" onChange={handleChange}/>
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
            <Input className="w-[200px]" name="belowAtrFifteenthMinCandleBearish" onChange={handleChange}/>
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
            <Checkbox  name="belowS2DayCandleClose" 
             onCheckedChange={(checked) => handleCheckboxChange("belowS2DayCandleClose", checked)}
            />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Below S1</label>
            <Checkbox  name="belowS1DayCandleClose" 
             onCheckedChange={(checked) => handleCheckboxChange("belowS1DayCandleClose", checked)}
            />
          </div>
        </div>
      </div>

      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 ">
          <label className="font-bold">Hour Candle Close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
    
            <Checkbox name="belowS1HourCandleClose" 
             onCheckedChange={(checked) => handleCheckboxChange("belowS1HourCandleClose", checked)}
            />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
       
            <Checkbox  name="belowS2HourCandleClose" 
             onCheckedChange={(checked) => handleCheckboxChange("belowS2HourCandleClose", checked)}
            />
          </div>
        </div>
      </div>
      <div className=" grid grid-cols-3 mt-4">
        <div className="grid grid-cols-1 mt-5">
          <label className="font-bold">15 Min Candle Close</label>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Below Previous day close</label>
            <Checkbox name="belowPrevDayClose" 
             onCheckedChange={(checked) => handleCheckboxChange("belowPrevDayClose", checked)}
            />
          </div>
        </div>
        <div>
          <div className=" grid grid-cols-1 space-y-1">
          <label className="font-bold">Below 15min Previous close</label>
            <Checkbox name="belowFifteenthMinPrevClose" 
             onCheckedChange={(checked) => handleCheckboxChange("belowFifteenthMinPrevClose", checked)}
            />
          </div>
        </div>
      </div>

        </div>
   
        <div className="flex justify-center">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>       
    
    </div>
  );
};

export default ScannerConfig;
