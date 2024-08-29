import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ConfigForm = ({ futureList }) => {
  const { config, updateConfig, tradeConfig } = useConfig();
  const [values, setValues] = useState(config);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await updateConfig(values, tradeConfig?.url);
      alert(data?.message || "Successfully Updated");
    } catch (error) {
      console.log(error);
      alert("Failed to update config");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (field, value) => {
    if (field === "symbol") {
      futureList.map((future) => {
        console.log(future);
        if (future.symbol === value) {
          setValues((prevValues) => ({
            ...prevValues,
            [field]: value,
            instrument_token: future.instrument_token,
            primaryFuture: future.priName,
            secondaryFuture: future.secName,
            symbol: future.symbol,
          }));
        }
      });
      return;
    }
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  useEffect(() => {
    setValues(config);
  }, [config]);

  return (
    <section className="grid grid-cols-3 gap-x-5 gap-y-2 py-5">
      <div className="px-1">
        <Label>Symbol</Label>
        <Select
          disabled={loading}
          value={values.symbol}
          onValueChange={(value) => handleSelectChange("symbol", value)}
        >
          <SelectTrigger className="w-full mt-1 border-zinc-500">
            <SelectValue>{values.symbol}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Futures</SelectLabel>
              {futureList?.map((suggestion) => (
                <SelectItem key={suggestion.symbol} value={suggestion.symbol}>
                  {suggestion.symbol}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="px-1">
        <Label>Primary Future</Label>
        <Input
          value={values.primaryFuture}
          disabled={loading}
          className="mt-1 mx-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Secondary Future</Label>
        <Input
          disabled={loading}
          value={values.secondaryFuture}
          className="mt-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Instrument Token</Label>
        <Input
          disabled={loading}
          value={values.instrument_token}
          className="mt-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Pri Entry Pivot</Label>
        <Input
          disabled={loading}
          value={values.primaryTradeEntry}
          onChange={(e) =>
            handleSelectChange("primaryTradeEntry", e.target.value)
          }
          className="mt-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Sec Entry Pivot</Label>
        <Input
          disabled={loading}
          value={values.secondaryTradeEntry}
          onChange={(e) =>
            handleSelectChange("secondaryTradeEntry", e.target.value)
          }
          className="mt-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Interval</Label>
        <Select
          disabled={loading}
          value={values.interval}
          onValueChange={(value) => handleSelectChange("interval", value)}
        >
          <SelectTrigger className="w-full mt-1 border-zinc-500">
            <SelectValue>{values.interval}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Intervals</SelectLabel>
              {interval.map((int) => (
                <SelectItem key={int} value={int}>
                  {int}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="px-1">
        <Label>Pri Exit Pivot</Label>
        <Input
          disabled={loading}
          value={values.primaryTradeExit}
          onChange={(e) =>
            handleSelectChange("primaryTradeExit", e.target.value)
          }
          className="mt-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Sec Exit Pivot</Label>
        <Input
          disabled={loading}
          value={values.secondaryTradeExit}
          onChange={(e) =>
            handleSelectChange("secondaryTradeExit", e.target.value)
          }
          className="mt-1"
          type="text"
        />
      </div>
      <div className="px-1">
        <Label>Trade InTime</Label>
        <Input
          type="time"
          disabled={loading}
          value={values.tradeInTime}
          onChange={(e) => handleSelectChange("tradeInTime", e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="px-1">
        <Label>Trade OutTime</Label>
        <Input
          type="time"
          disabled={loading}
          value={values.tradeOutTime}
          onChange={(e) => handleSelectChange("tradeOutTime", e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="px-1">
        <Label>WMA</Label>
        <Input
          value={values.WMA}
          disabled={loading}
          onChange={(e) => handleSelectChange("WMA", e.target.value)}
          className="mt-1"
          type="text"
        />
      </div>
      {/* <div className="px-1">
        <Label>Support Slope</Label>
        <Input
          disabled={loading}
          value={values.supportSlope}
          onChange={(e) => handleSelectChange("supportSlope", e.target.value)}
          className="mt-1"
          type="text"
        />
      </div> */}
      <div className="px-1">
        <Label>Index Value</Label>
        <Select
          disabled={loading}
          value={values.tradeIndex || 5}
          onValueChange={(value) => handleSelectChange("tradeIndex", value)}
        >
          <SelectTrigger className="w-full mt-1 border-zinc-500">
            <SelectValue>{values.tradeIndex || 5}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[250px]">
            <SelectGroup>
              <SelectLabel>Trade Index</SelectLabel>
              {Array(15)
                .fill("_")
                .map((int, ind) => (
                  <SelectItem
                    className={`border-b-[2px] border-x-[2px]  ${
                      ind === 0 && "border-t-[2px]"
                    } `}
                    key={int}
                    value={ind + 1}
                  >
                    {ind + 1}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="px-1">
        <Label>Terminal</Label>
        <Select
          disabled={loading}
          value={values.terminal || "OFF"}
          onValueChange={(value) => handleSelectChange("terminal", value)}
        >
          <SelectTrigger className="w-full mt-1 border-zinc-500">
            <SelectValue>{values.terminal}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[250px]">
            <SelectGroup>
              <SelectLabel>Terminal</SelectLabel>
              <SelectItem value="ON">ON</SelectItem> 
              <SelectItem value="OFF">OFF</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* <div className="px-1">
        <Label>Support Strike Price</Label>
        <Input
          disabled={loading}
          value={values.support}
          onChange={(e) => handleSelectChange("support", e.target.value)}
          className="mt-1"
          type="text"
        />
      </div> */}
      {/* <div className="px-1">
        <Label>Resistance Strike Price</Label>
        <Input
          disabled={loading}
          value={values.resistance}
          onChange={(e) => handleSelectChange("resistance", e.target.value)}
          className="mt-1"
          type="text"
        />
      </div> */}
      <Button
        disabled={loading}
        className="col-span-3 w-1/2 mx-auto my-3"
        onClick={handleSubmit}
      >
        Update Configuration
      </Button>
    </section>
  );
};

export default ConfigForm;
const interval = [
  "minute",
  "3minute",
  "5minute",
  "10minute",
  "15minute",
  "30minute",
];
