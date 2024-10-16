import * as React from "react";
import { TextField, Autocomplete, Grid, Typography } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/hooks/use-modal";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";

export const EditTrade = () => {
  const { isOpen, onClose, type, data } = useModal();
  React.useEffect(() => {
    setValues(data.data);
  }, [data.data]);
  const [values, setValues] = React.useState(data.data);
  const isModalOpen = isOpen && type === "edit-trade";
  const [trades, setTrades] = React.useState({
    loading: false,
    data: [],
    error: "",
  });
  // Ensure the component returns null if the modal is not open
  const handleChangeSymbol = (value) => {
    if (value === null) {
      setValues((prev) => ({
        ...prev,
        tradingsymbol: null,
        instrument_token: "",
        instrument_type: "",
        expiry: "",
        symbol: "",
        exchange: "",
      }));
      return;
    }
    setValues((prev) => ({
      ...prev,
      tradingsymbol: value.tradingsymbol,
      instrument_token: value.instrument_token,
      instrument_type: value.instrument_type,
      expiry: value.expiry,
      symbol: value.name,
      exchange: value.exchange,
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSelect = (key, value) => {
    // console.log(value)
    setValues((prev) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = async () => {
    if (values.isMaster && values.lotSize === "") {
      return alert("Please enter Lot Size .");
    }
    if (parseFloat(values.minExitPercent) > parseFloat(values.maxExitPercent)) {
      return alert("Max Exit Percent Should be greater than Min Exit Percent");
    }
    if (values?.microProfitPercent > 50) {
      return alert("Micro Profit Percent Should be less than 50%");
    }
    if (values?.entryHystresisPercent > 25) {
      0;
      return alert("Entry Hystresis Percent Should be less than 25%");
    }
    // if (values?.rangeBoundPercent > values?.rangeBoundPercent2) {
    //   return alert(
    //     "Range Bound Percent 2 Should be greater than Range Bound Percent "
    //   );
    // }
    try {
      await axios.put(`${BASE_URL_OVERALL}/config/edit`, {
        id: values.id,
        terminal: values.terminal,
        symbol: values.symbol,
        expiryDate: values.expiry,
        interval: values.interval,
        WMA: values.wma,
        wmaLtp: values.wmaLtp,
        tradeIndex: values.indexValue,
        tradeInTime: values.tradeInTime,
        tradeOutTime: values.tradeOutTime,
        identifier: values.tradingsymbol,
        instrument_token: values.instrument_token,
        tradeEntryPercent: values.entryPrice,
        // tradeExitPercent: values.exitPrice,
        minExitPercent: values.minExitPercent,
        maxExitPercent: values.maxExitPercent,
        priceIncPercent: values.priceIncPercent,
        priceDecPercent: values.priceDecPercent,
        earningPercentLimit: values.earningPercentLimit,
        dynamicEntryPercentage: values.dynamicEntryPercentage,
        orderType: values.orderType,
        isMaster: values.isMaster,
        lossLimit: values.lossLimit,
        // maxLoss: values.maxLoss,
        minProfit: values.minProfit,
        candleSize: values.candleSize,
        exchange: values.exchange,
        rangeBoundPercent: values.rangeBoundPercent,
        // rangeBoundPercent2: values.rangeBoundPercent2,
        microProfitPercent: values.microProfitPercent,
        entryHystresisPercent: values.entryHystresisPercent,
        movingAvgOFFSET: values.movingAvgOFFSET,
        movingAvgWMA: values.movingAvgWMA,
        rangeBound: values.rangeBound,
        SMA1: values.SMA1,
        SMA2: values.SMA2,
        movingAvgType: values.movingAvgType,
        movingAvgOFFSET2: values.movingAvgOFFSET2,
        movingAvgOFFSET1: values.movingAvgOFFSET1,
        mvSource1: values.mvSource1,
        mvSource2: values.mvSource2,
        // mvSource3: values.mvSource3,
        trendLine2: values.trendLine2,
        trendLine1: values.trendLine1,
        candleType: values.candleType,
        minReEntryatMinProfitPercent: values.minReEntryatMinProfitPercent,
        master: values.master,
        rangeBoundEntryPercent: values.rangeBoundEntryPercent,
        rangeBoundExitPercent: values.rangeBoundExitPercent,
        rangeBoundProfitPercent: values.rangeBoundProfitPercent,
        rsiMax: values.rsiMax,
        rsiMin: values.rsiMin,
        rsiCandle: values.rsiCandle,
        // Min_Order_Qty: values.Min_Order_Qty,
        lotSize: values.lotSize,
        customerGrading: values.customerGrading,
        narration: values.narration,
        strikeDiff: values.strikeDiff,
        targetLevel: values.targetLevel,
        category: values.category,
        targetBelow: values.targetBelow,
        targetAbove: values.targetAbove,
        callTargetLevel: values.callTargetLevel,
        putTargetLevel: values.putTargetLevel,
        maxZoneTime: values.maxZoneTime,
        noTradeZone: values.noTradeZone,

        // targetProfit: values.targetProfit,
      });
      alert("Update Successfully");
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      data.getAllTrades();
    }
  };
  const masterName = () => {
    const filteredData = data?.trades?.data?.filter((item) => item.isMaster);
    setTrades(filteredData);
  };

  React.useEffect(() => {
    masterName();
  }, [data.trades]);
  // console.log(values);

  if (!isModalOpen) return null;
  return (
    <Dialog width={1200} onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-4xl px-2">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Trade
          </DialogTitle>
        </DialogHeader>
        <div className="h-[500px]  overflow-y-auto">
          {values?.tradingsymbol && (
            <>
              <section className="grid grid-cols-3 gap-3 items-center justify-center py-5">
                {values.tradingsymbol && (
                  <CustomAutocomplete
                    value={values.tradingsymbol}
                    onChangeFunction={handleChangeSymbol}
                  />
                )}
                <div className="px-1">
                  <Label>Index Value</Label>
                  <Select
                    
                    value={values.indexValue}
                    name="terminal"
                    onValueChange={(value) => handleSelect("indexValue", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.indexValue}</SelectValue>
                    </SelectTrigger>  
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Trade Index</SelectLabel>
                        {[
                          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                          17, 18, 19, 20, 
                        ]?.map((suggestion) => (
                          <SelectItem key={suggestion} value={suggestion}>
                            {suggestion}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-1">
                  <Label>Instrument Token</Label>
                  <Input
                    readOnly
                    value={values.instrument_token}
                    className="mt-1"
                    type="text"
                  />
                </div>
                <div className="px-1">
                  <Label>Instrument Type</Label>
                  <Input
                    readOnly
                    value={values.instrument_type}
                    className="mt-1"
                    type="text"
                  />
                </div>
                <div className="px-1">
                  <Label>Exchange</Label>
                  <Input
                    readOnly
                    value={values.exchange}
                    className="mt-1"
                    type="text"
                  />
                </div>
                <div className="px-1">
                  <Label>Symbol</Label>
                  <Input
                    readOnly
                    value={values.symbol}
                    className="mt-1"
                    type="text"
                  />
                </div>
                <div className="px-1">
                  <Label>Expiry</Label>
                  <Input
                    readOnly
                    value={values.expiry}
                    className="mt-1"
                    type="text"
                  />
                </div>

                <div className="px-1">
                  <Label>WMA</Label>
                  <Input
                    name="wma"
                    onChange={handleChange}
                    value={values.wma}
                    className="mt-1"
                    type="number"
                  />
                </div>

                {values?.isMaster == true && (
                  <>
                    <div className="px-1">
                      <Label>Alert Above</Label>
                      <Input
                        name="targetAbove"
                        onChange={handleChange}
                        value={values.targetAbove}
                        className="mt-1"
                        type="text"
                      />
                    </div>
                    <div className="px-1">
                      <Label>Alert Below</Label>
                      <Input
                        name="targetBelow"
                        onChange={handleChange}
                        value={values.targetBelow}
                        className="mt-1"
                        type="text"
                      />
                    </div>
                  </>
                )}

                {values?.isMaster && (
                  <div className="px-1">
                    <Label>Lot Size</Label>
                    <Input
                      name="lotSize"
                      onChange={handleChange}
                      value={values.lotSize}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                )}
                <div className="px-1">
                  <Label>Is Master</Label>
                  <Select
                    value={String(values.isMaster)} // Convert boolean to string for the select value
                    name="isMaster"
                    onValueChange={(value) => handleSelect("isMaster", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{String(values?.isMaster)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Is Master</SelectLabel>
                        {[{ isMaster: true }, { isMaster: false }]?.map(
                          (suggestion) => (
                            <SelectItem
                              key={String(suggestion.isMaster)}
                              value={suggestion.isMaster}
                            >
                              {String(suggestion.isMaster)}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {values?.isMaster == true && (
                  <>
                    <div className="px-1">
                      <Label>Strike Difference</Label>
                      <Input
                        name="strikeDiff"
                        onChange={handleChange}
                        value={values.strikeDiff}
                        className="mt-1"
                        type="text"
                      />
                    </div>
                  </>
                )}

                {values?.isMaster == false && (
                  <div className="px-1">
                    <Label>Master Name</Label>
                    <Select
                      value={values?.master}
                      name="master"
                      onValueChange={(value) => handleSelect("master", value)}
                    >
                      <SelectTrigger className="w-full mt-1 border-zinc-500">
                        <SelectValue>
                          {values?.master?.masterName || "Select Master"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Master Name</SelectLabel>
                          {/* <SelectItem value={{ masterName: "self" }}>
                            Self
                          </SelectItem> */}
                          {trades?.map((item, index) => (
                            <SelectItem key={index} value={item}>
                              {item.masterName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="px-1">
                  <Label>Category</Label>
                  <Select
                    value={values?.category}
                    name="category"
                    onValueChange={(value) => handleSelect("category", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values?.category}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>category</SelectLabel>
                        <SelectItem value="Breakout">My Today Stock</SelectItem>
                        <SelectItem value="52weakLow">My Hot WatchList</SelectItem>
                        <SelectItem value="52weakHigh">52 Weak High</SelectItem>
                        <SelectItem value="Index">Index</SelectItem>
                        <SelectItem value="Banking">Banking</SelectItem>
                        <SelectItem value="Pharma">Pharma</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="RangeBound">RangeBound</SelectItem>
                        <SelectItem value="Chemical">Chemical</SelectItem>
                        <SelectItem value="Defence">Defence</SelectItem>
                        <SelectItem value="RealEstate">Real Estate</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {values?.indexValue != 6 && (
                  <>
                    {values?.indexValue != 4 && (
                      <>
                        <div className="px-1">
                          <Label>Range Bound (%)</Label>
                          <Input
                            name="rangeBoundPercent"
                            onChange={handleChange}
                            value={values.rangeBoundPercent}
                            className="mt-1"
                            type="rangeBoundPercent"
                          />
                        </div>
                        {/* <div className="px-1">                       
                          <Label>Range Bound 2(%)</Label>
                          <Input
                            name="rangeBoundPercent2"
                            onChange={handleChange}
                            value={values.rangeBoundPercent2}
                            className="mt-1"
                            type="rangeBoundPercent2"
                          />
                        </div> */}
                      </>
                    )}
                    {values.rangeBound != "Disable" && (
                      <>
                        <div className="px-1">
                          <Label>Range Bound Exit (%)</Label>
                          <Input
                            name="rangeBoundExitPercent"
                            onChange={handleChange}
                            value={values.rangeBoundExitPercent}
                            className="mt-1"
                            type="rangeBoundExitPercent"
                          />
                        </div>
                        <div className="px-1">
                          <Label>Range Bound Entry (%)</Label>
                          <Input
                            name="rangeBoundEntryPercent"
                            onChange={handleChange}
                            value={values.rangeBoundEntryPercent}
                            className="mt-1"
                            type="rangeBoundEntryPercent"
                          />
                        </div>
                        <div className="px-1">
                          <Label>Range Bound Profit (%)</Label>
                          <Input
                            name="rangeBoundProfitPercent"
                            onChange={handleChange}
                            value={values.rangeBoundProfitPercent}
                            className="mt-1"
                            type="rangeBoundProfitPercent"
                          />
                        </div>
                      </>
                    )}
                    {values?.indexValue != 4 && (
                      <>
                        <div className="px-1">
                          <Label>SMA 1</Label>
                          <Input
                            name="SMA1"
                            onChange={handleChange}
                            value={values.SMA1}
                            className="mt-1"
                            type="number"
                            min={0}
                          />
                        </div>
                        <div className="px-1">
                          <Label>SMA 2</Label>
                          <Input
                            name="SMA2"
                            onChange={handleChange}
                            value={values.SMA2}
                            className="mt-1"
                            type="number"
                            min={0}
                          />
                        </div>
                        <div className="px-1">
                          <Label>RSI Min</Label>
                          <Input
                            name="rsiMin"
                            onChange={handleChange}
                            value={values.rsiMin}
                            className="mt-1"
                            type="rsiMin"
                          />
                        </div>
                        <div className="px-1">
                          <Label>RSI Max</Label>
                          <Input
                            name="rsiMax"
                            onChange={handleChange}
                            value={values.rsiMax}
                            className="mt-1"
                            type="rsiMax"
                          />
                        </div>
                        <div className="px-1">
                          <Label>RSI Candle</Label>
                          <Input
                            name="rsiCandle"
                            onChange={handleChange}
                            value={values.rsiCandle}
                            className="mt-1"
                            type="rsiCandle"
                          />
                        </div>
                        <div className="px-1">
                          <Label>MV Source 1</Label>
                          <Select
                            // disabled={loading}
                            value={values.mvSource1}
                            name="mvSource1"
                            onValueChange={(value) =>
                              handleSelect("mvSource1", value)
                            }
                          >
                            <SelectTrigger className="w-full mt-1 border-zinc-500">
                              <SelectValue>{values.mvSource1}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>MV Source 1</SelectLabel>
                                {["open", "close", "high"]?.map(
                                  (suggestion) => (
                                    <SelectItem
                                      key={suggestion}
                                      value={suggestion}
                                    >
                                      {suggestion}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="px-1">
                          <Label>MV Source 2</Label>
                          <Select
                            // disabled={loading}
                            value={values.mvSource2}
                            name="mvSource2"
                            onValueChange={(value) =>
                              handleSelect("mvSource2", value)
                            }
                          >
                            <SelectTrigger className="w-full mt-1 border-zinc-500">
                              <SelectValue>{values.mvSource2}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>MV Source 2</SelectLabel>
                                {["open", "close", "high"]?.map(
                                  (suggestion) => (
                                    <SelectItem
                                      key={suggestion}
                                      value={suggestion}
                                    >
                                      {suggestion}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    <div className="px-1">
                      <Label>Candle Type</Label>
                      <Select
                        // disabled={loading}
                        value={values.candleType}
                        name="candleType"
                        onValueChange={(value) =>
                          handleSelect("candleType", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1 border-zinc-500">
                          <SelectValue>{values.candleType}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Candle Type</SelectLabel>
                            {["HeikinAshi", "Normal"]?.map((suggestion) => (
                              <SelectItem key={suggestion} value={suggestion}>
                                {suggestion}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* {values?.isMaster == false && (
                      <div className="px-1">
                        <Label>Range Bound</Label>
                        <Select
                          // disabled={loading}
                          value={values.orderType}
                          name="rangeBound"
                          onValueChange={(value) =>
                            handleSelect("rangeBound", value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1 border-zinc-500">
                            <SelectValue>{values.rangeBound}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Range Bound</SelectLabel>
                              {["Enable", "Disable"]?.map((suggestion) => (
                                <SelectItem key={suggestion} value={suggestion}>
                                  {suggestion}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )} */}
                  </>
                )}

                <div className="px-1">
                  <Label>Min Exit %</Label>
                  <Input
                    name="minExitPercent"
                    onChange={handleChange}
                    value={values.minExitPercent}
                    className="mt-1"
                    type="text"
                  />
                </div>

                {values.indexValue != 6 && values.indexValue != 4 && (
                  <>
                    {values?.isMaster == false && (
                      <div className="px-1">
                        <Label>Max Exit %</Label>
                        <Input
                          name="maxExitPercent"
                          onChange={handleChange}
                          value={values.maxExitPercent}
                          className="mt-1"
                          type="text"
                        />
                      </div>
                    )}
                  </>
                )}

                {values?.indexValue == 7 && (
                  <>
                    <div className="px-1">
                      <Label>Moving Avg WMA</Label>
                      <Input
                        name="movingAvgWMA"
                        onChange={handleChange}
                        value={values.movingAvgWMA}
                        className="mt-1"
                        type="number"
                      />
                    </div>
                    {/* <div className="px-1">
                    <Label>Moving Avg OffSet</Label>
                    <Input
                      name="movingAvgOFFSET"
                      onChange={handleChange}
                      value={values.movingAvgOFFSET}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                 
                  <div className="px-1">
                    <Label>Moving Avg OFFSET 1</Label>
                    <Input
                      name="movingAvgOFFSET1"
                      onChange={handleChange}
                      value={values.movingAvgOFFSET1}
                      className="mt-1"
                      type="number"
                      min={0}
                    />
                  </div>
            
                  <div className="px-1">
                    <Label>Moving Avg OFFSET 2</Label>
                    <Input
                      name="movingAvgOFFSET2"
                      onChange={handleChange}
                      value={values.movingAvgOFFSET2}
                      className="mt-1"
                      type="number"
                      min={0}
                    />
                  </div>

                  <div className="px-1">
                    <Label>TrendLine 1</Label>
                    <Input
                      name="trendLine1"
                      onChange={handleChange}
                      value={values.trendLine1}
                      className="mt-1"
                      type="number"
                      // min={0}
                    />
                  </div>
                  <div className="px-1">
                    <Label>TrendLine 2</Label>
                    <Input
                      name="trendLine2"
                      onChange={handleChange}
                      value={values.trendLine2}
                      className="mt-1"
                      type="number"
                      // min={0}
                    />
                  </div> */}
                    <div className="px-1">
                      <Label>Moving Avg Type</Label>
                      <Select
                        // disabled={loading}
                        value={values.orderType}
                        name="movingAvgType"
                        onValueChange={(value) =>
                          handleSelect("movingAvgType", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1 border-zinc-500">
                          <SelectValue>{values.movingAvgType}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Moving Avg</SelectLabel>
                            {["SMA", "WMA"]?.map((suggestion) => (
                              <SelectItem key={suggestion} value={suggestion}>
                                {suggestion}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {values?.isMaster == false && values?.indexValue != 4 && (
                  <>
                    <div className="px-1">
                      <Label>Initial Entry (%)</Label>

                      <Input
                        name="entryPrice"
                        onChange={handleChange}
                        value={values.entryPrice}
                        className="mt-1"
                        type="number"
                      />
                    </div>

                    <div className="px-1">
                      <Label>Exit Inc %</Label>
                      <Input
                        name="priceIncPercent"
                        onChange={handleChange}
                        value={values.priceIncPercent}
                        className="mt-1"
                        type="text"
                      />
                    </div>
                  </>
                )}

                {(values?.indexValue == 5 || values?.indexValue == 7) && (
                  <div className="px-1">
                    <Label>Candle Size</Label>
                    <Input
                      name="candleSize"
                      onChange={handleChange}
                      value={values.candleSize}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                )}

                {values?.isMaster == false && (
                  <>
                    {values.indexValue != 6 && values.indexValue != 4 && (
                      <>
                        {/* {values.indexValue != 4 && (
                          <div className="px-1">
                            <Label>Loss Count</Label>
                            <Input
                              name="lossLimit"
                              onChange={handleChange}
                              value={values.lossLimit}
                              className="mt-1"
                              type="number"
                            />
                          </div>
                        )} */}

                        <div className="px-1">
                          <Label>Order Type</Label>
                          <Select
                            // disabled={loading}
                            value={values.orderType}
                            name="orderType"
                            onValueChange={(value) =>
                              handleSelect("orderType", value)
                            }
                          >
                            <SelectTrigger className="w-full mt-1 border-zinc-500">
                              <SelectValue>{values.orderType}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Order Type</SelectLabel>
                                {["Buy", "Sell"]?.map((suggestion) => (
                                  <SelectItem
                                    key={suggestion}
                                    value={suggestion}
                                  >
                                    {suggestion}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </>
                )}
                {values.indexValue != 4 && values?.isMaster == false && (
                  <div className="px-1">
                    <Label>Minimum Profit (%)</Label>
                    <Input
                      name="minProfit"
                      onChange={handleChange}
                      value={values.minProfit}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                )}

                {values.isMaster && (
                  <>
                    <div className="px-1">
                      <Label>Put Target Level</Label>
                      <Input
                        name="putTargetLevel"
                        onChange={handleChange}
                        value={values.putTargetLevel}
                        className="mt-1"
                        type="number"
                        min={0}
                      />
                    </div>
                    <div className="px-1">
                      <Label>Call Target Level</Label>
                      <Input
                        name="callTargetLevel"
                        onChange={handleChange}
                        value={values.callTargetLevel}
                        className="mt-1"
                        type="number"
                        min={0}
                      />
                    </div>
                  </>
                )}
                {
                (values.isMaster && values.indexValue == 4 ) && (
                  <>
                    <div className="px-1">
                      <Label>Max Zone Time</Label>
                      <Input
                        name="maxZoneTime"
                        onChange={handleChange}
                        value={values.maxZoneTime}
                        className="mt-1"
                        type="number"
                        min={0}
                      />
                    </div>
                    <div className="px-1">
                  <Label>No Trade Zone</Label>
                  <Input
                    name="noTradeZone"
                    onChange={handleChange}
                    value={values.noTradeZone}
                    className="mt-1"
                    type="number"
                    min={0}
                  />
                </div>
                  </>
                )}
                {/* <div className="px-1">
                <Label>Micro Profit (%)</Label>
                <Input
                  name="microProfitPercent"
                  onChange={handleChange}
                  value={values.microProfitPercent}
                  className="mt-1"
                  type="number"
                />
              </div> */}

                <div className="px-1">
                  <Label>Trade In Time</Label>
                  <Input
                    name="tradeInTime"
                    onChange={handleChange}
                    value={values.tradeInTime}
                    className="mt-1"
                    type="time"
                  />
                </div>
                <div className="px-1">
                  <Label>Trade Out Time</Label>
                  <Input
                    name="tradeOutTime"
                    onChange={handleChange}
                    value={values.tradeOutTime}
                    className="mt-1"
                    type="time"
                  />
                </div>

                <div className="px-1">
                  <Label>Terminal</Label>
                  <Select
                    // disabled={loading}
                    value={values.terminal}
                    name="terminal"
                    onValueChange={(value) => handleSelect("terminal", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.terminal}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Terminal</SelectLabel>
                        {["ON", "OFF"]?.map((suggestion) => (
                          <SelectItem key={suggestion} value={suggestion}>
                            {suggestion}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-1">
                  <Label>Interval</Label>
                  <Select
                    // disabled={loading}
                    value={values.interval}
                    name="terminal"
                    onValueChange={(value) => handleSelect("interval", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.interval}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Interval</SelectLabel>
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
                          <SelectItem
                            key={suggestion.value}
                            value={suggestion.value}
                          >
                            {suggestion.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-1">
                  <Label>Customer Grading</Label>
                  <Select
                    // disabled={loading}
                    value={values.customerGrading}
                    name="customerGrading"
                    onValueChange={(value) =>
                      handleSelect("customerGrading", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.customerGrading}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Grade</SelectLabel>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]?.map((suggestion) => (
                          <SelectItem key={suggestion} value={suggestion}>
                            {suggestion}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </section>
              <div className="px-1">
                <Label>Narration</Label>
                <Textarea
                  name="narration"
                  onChange={handleChange}
                  value={values.narration}
                  className="mt-1 w-full border-[1px] border-black "
                  type="text"
                />
              </div>
              <div className="mt-5">
                <Button onClick={handleSubmit} className="px-10">
                  Submit
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-10"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Function to fetch data from your custom API
async function fetchMyAPI(input) {
  try {
    // await axios.get(`${BASE_URL_OVERALL}/instrument/get`, {
    const response = await fetch(
      `${BASE_URL_OVERALL}/instrument/get?tradingsymbol=${input?.toUpperCase()}&pageNumber=1&pageSize=50`
    );
    const data = await response.json();
    return data.data; // Adjust this to match the format of your API response
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function CustomAutocomplete({ value: defaultValue, onChangeFunction }) {
  // if (!defaultValue) return;
  const [value, setValue] = React.useState(defaultValue);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const fetch = React.useMemo(
    () =>
      debounce((request, callback) => {
        fetchMyAPI(request.input).then(callback);
      }, 400),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });
    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);
  return (
    <Autocomplete
      className="col-span-3 w-[100%]"
      id="custom-autocomplete"
      disabled
      // sx={{ width: 280 }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.tradingsymbol
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      disableClearable // This disables the clear button
      noOptionsText="No Trade Options"
      onChange={(event, newValue) => {
        console.log(newValue);
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
        onChangeFunction(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        // console.log(newInputValue);
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Select New Trade Index" fullWidth />
      )}
      renderOption={(props, option) => {
        return (
          <li
            onClick={(e) => console.log(e)}
            {...props}
            key={option.instrument_token}
          >
            <Grid item sx={{ width: "calc(100%)", wordWrap: "break-word" }}>
              <Typography variant="body1">{option.tradingsymbol}</Typography>
            </Grid>
          </li>
        );
      }}
    />
  );
}
