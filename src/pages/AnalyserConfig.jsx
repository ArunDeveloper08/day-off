import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_URL_OVERALL } from "@/lib/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AnalyserConfig = () => {
  const [values, setValues] = useState({
    greenCandleBelow: "60",
    greenCandleAbove: "60",
    sampleCandle: "14",
    greenCandleRef: "50",
    greenCandleInterval: "FIFTEEN_MINUTE",
    gainPercent: "10",
    lossPercent: "5",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const getAllTrades = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL_OVERALL}/config/get`);
      setValues(() => ({
        greenCandleBelow: data.data?.[0]?.greenCandleBelow,
        greenCandleAbove: data.data?.[0]?.greenCandleAbove,
        sampleCandle: data.data?.[0]?.sampleCandle,
        greenCandleRef: data.data?.[0]?.greenCandleRef,
        greenCandleInterval: data.data?.[0]?.greenCandleInterval,
        gainPercent: data.data?.[0]?.gainPercent,
        lossPercent: data.data?.[0]?.lossPercent,
      }));
    } catch (error) {
      // setTrades((p) => ({ ...p, error: error.message }));
    } finally {
     // setValues((p) => ({ ...p, loading: false }));
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
          <Label>Gain Percent</Label>
          <Input
            name="gainPercent"
            onChange={handleChange}
            value={values.gainPercent}
            className="mt-1"
            type="number"
            min={0}
          />
        </div>
        <div className="px-1">
          <Label>Loss Percent </Label>
          <Input
            name="lossPercent"
            onChange={handleChange}
            value={values.lossPercent}
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
        <div className="px-1">
          <Label>Green Candle Ref </Label>
          <Input
            name="greenCandleRef"
            onChange={handleChange}
            value={values.greenCandleRef}
            className="mt-1"
            type="number"
            min={0}
          />
        </div>

        <div className="px-1">
          <Label>Green Candle Interval</Label>
          <Select
            value={values.greenCandleInterval}
            name="greenCandleInterval"
            onValueChange={(value) =>
              handleSelect("greenCandleInterval", value)
            }
          >
            <SelectTrigger className="w-full mt-1 border-zinc-500">
              <SelectValue>{values.greenCandleInterval}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Green Candle Interval</SelectLabel>
                {[
                  {
                    label: "1 minute",
                    value: "ONE_MINUTE",
                  },
                  {
                    label: "3 minute",
                    value: "THREE_MINUTE",
                  },
                  {
                    label: "5 minute",
                    value: "FIVE_MINUTE",
                  },

                  {
                    label: "15 minute",
                    value: "FIFTEEN_MINUTE",
                  },
                  {
                    label: "30 minute",
                    value: "THIRTY_MINUTE",
                  },
                  {
                    label: "1 hour",
                    value: "ONE_HOUR",
                  },
                  {
                    label: "1 day",
                    value: "ONE_DAY",
                  },
                ]?.map((suggestion) => (
                  <SelectItem key={suggestion.value} value={suggestion.value}>
                    {suggestion.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-1">
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </>
  );
};

export default AnalyserConfig;
