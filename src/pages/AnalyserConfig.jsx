import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AnalyserConfig = () => {
  const [values, setValues] = useState({
  
    greenCandleBelow: "60",
    greenCandleAbove: "60",
    sampleCandle: "14",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


 const getAllTrades = async () => {
    try {
      
      const { data } = await axios.get(`${BASE_URL_OVERALL}/config/get`);
      setValues(() => ({
         greenCandleBelow: data.data?.[0]?.greenCandleBelow ,
         greenCandleAbove: data.data?.[0]?.greenCandleAbove ,
         sampleCandle: data.data?.[0]?.sampleCandle ,
        }));
 
   
    } catch (error) {
      // setTrades((p) => ({ ...p, error: error.message }));
    } finally {
      setValues((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    getAllTrades();
  }, []);

  useEffect(() => {
    document.title = "Analyser Config";
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL_OVERALL}/config/analyser`, {
        ...values,
      });

      alert(response.data.message);
    } catch (err) {
      console.log(err);
    }
  };  

  return (
    <>
      <p className="text-3xl font-serif font-bold p-2 text-center">
        {" "}
        Analyser Config
      </p>
      <div className="grid grid-cols-4 gap-3 items-center justify-center py-5">
    
        <div className="px-1">
          <Label>Sample candle</Label>
          <Input
            name="sampleCandle"
            onChange={handleChange}
            value={values.sampleCandle}
            className="mt-1"
            type="number"
            min={0}
          />
        </div>
        <div className="px-1">
          <Label>Red Candle Above </Label>
          <Input
            name="greenCandleBelow"
            onChange={handleChange}
            value={values.greenCandleBelow}
            className="mt-1"
            type="number"
            min={0}
          />
        </div>

        <div className="px-1">
          <Label>Green Candle Above </Label>
          <Input
            name="greenCandleAbove"
            onChange={handleChange}
            value={values.greenCandleAbove}
            className="mt-1"
            type="number"
            min={0}
          />
        </div>
      </div>
      <div className="px-1">
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </>
  );
};

export default AnalyserConfig;
