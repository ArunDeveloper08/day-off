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

const initialState = {
  symbol: "",
  instrument_token: "",
  exchange: "",
  instrument_type: "",
  tradingsymbol: null,
  expiry: "",
  entryPrice: "3",
  // exitPrice: "5",
  terminal: "ON",
  tradeInTime: "09:15",
  tradeOutTime: "23:30",
  wma: "1",
  interval: "FIVE_MINUTE",
  indexValue: "7",
  minExitPercent: "5",
  maxExitPercent: "30",
  priceIncPercent: "20",
  priceDecPercent: "1.5",
  earningPercentLimit: "1",
  orderType: "Buy",
  isMaster: false,
  dynamicEntryPercentage: "0.3",
  lossLimit: "10",
  candleSize: "3",
  // maxLoss: "1",
  minProfit: "25",
  microProfitPercent: "40",
  rangeBoundPercent: "10",
  // rangeBoundPercent2: "10",
  wmaLtp: "1",
  entryHystresisPercent: "10",
  movingAvgOFFSET: "1",
  movingAvgWMA: "1",
  SMA1: "3",
  SMA2: "6",
  // SMA3: "26",
  rangeBound: "Disable",
  movingAvgType: "WMA",
  // movingAvgOFFSET3: "1",
  movingAvgOFFSET2: "1",
  movingAvgOFFSET1: "1",
  // mvSource3: "open",
  mvSource2: "close",
  mvSource1: "close",
  trendLine2: "15",
  trendLine1: "5",
  candleType: "HeikinAshi",
  minReEntryatMinProfitPercent: "4",
  master: {},
  lotSize: "",
  rangeBoundProfitPercent: "2",
  rangeBoundExitPercent: "1",
  rangeBoundEntryPercent: "1",
  rsiMin: "3",
  rsiMax: "60",
  rsiCandle: "10",
  customerGrading: "1",
  narration: "",
  strikeDiff: "",
  targetLevel: "5",
  category: "",
  targetBelow: "",
  targetAbove: "",
  callTargetLevel: "",
  putTargetLevel: "",
  maxZoneTime: "",
  noTradeZone: "",
  trendCandleCount: "",
  dynamicExitPercent: "10",
  candleRatioBuy: "0.1",
  candleRatioSell: "",
  CESellDeviation: "",
  PESellDeviation: "",
  secondarySellTarget: "",
  isHedging: "0",
  hedgingIdentifier: "",
  FUTDeviation: "",
  hedgeValue: "",
  hedgeDeviation: "1",
  tradingOptions: "",
  exitSelection: "low",
  entryCandle: "both",
  atrMf: "3",
  tradeIdentification: "2",
  RSDeviation: "",
  maxLoss: "5",
  targetTime: "1",
  entryLineTime: "1",
  dExitMf: "1",
  targetMf: "2",
  atrMax: "60",
  shortTimeInterval: "THIRTY_MINUTE",
  longTimeInterval: "ONE_DAY",
  lastDayCloseMode: "1",
  strikeDeviation: "",
  rsiDifference: "",
  targetConstant: "",
  stepUpPrice: "",
  strikeBasePrice: "",
  targetMean: "",
  dExitMean: "",
  upBand: "",
  downBand: "",
  masterRsiReference: "5",
  masterIntervalReference: "ONE_HOUR",
  intervalReference: "FIFTEEN_MINUTE",
  rsiReference: "5",
  s1: "10",
  candleRatio: "50",
  incCandleRatio: "75",
  decCandleRatio: "65",
  case: "",
  case1RsiMax: "",
  case2RsiMax: "",
  case3RsiMax: "",
  case1TargetMf: "",
  case2TargetMf: "",
  case3TargetMf: "",
  case1DExitMf: "",
  case2DExitMf: "",
  case3DExitMf: "",
  case1CandleRatio: "",
  case2CandleRatio: "",
  case3CandleRatio: "",
  case1MasterRsiReference: "",
  case2MasterRsiReference: "",
  case3MasterRsiReference: "",
  stopLossMf: "10",
  gainPercent: "10",
  vdtmConstant: "25",
  dExitMax: "100",
  
  sampleCandle: 50,
  exitRsi: 40,
  
  rbExtiRsi: 20,
  greenCandleRatioRangeBound:50,
  greenCandleRatioUpTrend: 60,
  greenCandleRatioDownTrend: 30,
  isGroup : false,
  
  groupName : "",

  // Min_Order_Qty:"1"
};

// tradeIndex =1
const alternateInitialState = {
  symbol: "",
  instrument_token: "",
  exchange: "",
  instrument_type: "",
  tradingsymbol: null,
  expiry: "",
  // exitPrice: "5",
  terminal: "ON",
  tradeInTime: "09:15",
  tradeOutTime: "23:30",
  wma: "1",
  interval: "FIVE_MINUTE",
  indexValue: "2",
  priceIncPercent: "20",
  priceDecPercent: "1.5",
  earningPercentLimit: "1",
  orderType: "Buy",
  isMaster: false,
  dynamicEntryPercentage: "0.3",
  lossLimit: "10",
  candleSize: "3",
  // maxLoss: "1",
  minProfit: "25",
  microProfitPercent: "40",
  wmaLtp: "1",
  entryHystresisPercent: "10",
  movingAvgOFFSET: "1",
  movingAvgWMA: "1",
  // SMA3: "26",
  rangeBound: "Disable",
  movingAvgType: "WMA",
  // movingAvgOFFSET3: "1",
  movingAvgOFFSET2: "1",
  movingAvgOFFSET1: "1",
  // mvSource3: "open",
  mvSource2: "close",
  mvSource1: "close",
  trendLine2: "15",
  trendLine1: "5",
  candleType: "HeikinAshi",
  minReEntryatMinProfitPercent: "4",
  master: {},
  lotSize: "",
  rangeBoundProfitPercent: "4",
  rangeBoundExitPercent: "4",
  rangeBoundEntryPercent: "1",
  rsiCandle: "10",
  // Min_Order_Qty:"1"
  SMA1: "3",
  SMA2: "5",
  minExitPercent: "25",
  maxExitPercent: "30",
  rsiMin: "30",
  rsiMax: "60",
  rangeBoundPercent: "12",
  // rangeBoundPercent2: "12",
  entryPrice: "2",
  customerGrading: "1",
  narration: "",
  strikeDiff: "",
  targetLevel: "5",
  category: "",
  targetBelow: "",
  targetAbove: "",
  callTargetLevel: "",
  putTargetLevel: "",
  maxZoneTime: "",
  noTradeZone: "",
  trendCandleCount: "",
  dynamicExitPercent: "10",
  candleRatioBuy: "0.1",
  candleRatioSell: "",
  CESellDeviation: "",
  PESellDeviation: "",
  secondarySellTarget: "",
  isHedging: "0",
  hedgingIdentifier: "",
  FUTDeviation: "",
  hedgeValue: "",
  hedgeDeviation: "1",
  tradingOptions: "",
  exitSelection: "low",
  entryCandle: "both",
  atrMf: "3",
  tradeIdentification: "2",
  RSDeviation: "",
  maxLoss: "5",
  targetTime: "1",
  entryLineTime: "1",
  dExitMf: "1",
  targetMf: "2",
  atrMax: "60",
  shortTimeInterval: "THIRTY_MINUTE",
  longTimeInterval: "ONE_DAY",
  lastDayCloseMode: "1",
  strikeDeviation: "",
  rsiDifference: "",
  targetConstant: "",
  stepUpPrice: "",
  strikeBasePrice: "",
  targetMean: "",
  dExitMean: "",
  upBand: "",
  downBand: "",
  masterRsiReference: "5",
  masterIntervalReference: "ONE_HOUR",
  intervalReference: "FIFTEEN_MINUTE",
  rsiReference: "5",
  s1: "10",
  candleRatio: "50",
  incCandleRatio: "75",
  decCandleRatio: "50",
  case: "",
  case1RsiMax: "",
  case2RsiMax: "",
  case3RsiMax: "",
  case1TargetMf: "",
  case2TargetMf: "",
  case3TargetMf: "",
  case1DExitMf: "",
  case2DExitMf: "",
  case3DExitMf: "",
  case1CandleRatio: "",
  case2CandleRatio: "",
  case3CandleRatio: "",
  case1MasterRsiReference: "",
  case2MasterRsiReference: "",
  case3MasterRsiReference: "",
  stopLossMf: "10",
  gainPercent: "10",
  vdtmConstant: "25",
  dExitMax: "100",
 
  sampleCandle: 50,
  exitRsi: 40,
  
  rbExtiRsi: 20,
  greenCandleRatioRangeBound:50,
  greenCandleRatioUpTrend: 60,
  greenCandleRatioDownTrend: 30,
  isGroup : false,
  
  groupName : "",
};
// tradeIndex =2
const gammaBlastInitialState = {
  symbol: "",
  instrument_token: "",
  exchange: "",
  instrument_type: "",
  tradingsymbol: null,
  expiry: "",
  // exitPrice: "5",
  terminal: "ON",
  tradeInTime: "09:15",
  tradeOutTime: "23:30",
  wma: "1",
  interval: "THREE_MINUTE",
  indexValue: "6",
  priceIncPercent: "20",
  priceDecPercent: "1.5",
  earningPercentLimit: "1",
  orderType: "Buy",
  isMaster: false,
  dynamicEntryPercentage: "0.3",
  lossLimit: "10",
  candleSize: "3",
  // maxLoss: "1",
  minProfit: "25",
  microProfitPercent: "40",
  wmaLtp: "1",
  entryHystresisPercent: "10",
  movingAvgOFFSET: "1",
  movingAvgWMA: "1",
  // SMA3: "26",
  rangeBound: "Disable",
  movingAvgType: "WMA",
  // movingAvgOFFSET3: "1",
  movingAvgOFFSET2: "1",
  movingAvgOFFSET1: "1",
  // mvSource3: "open",
  mvSource2: "close",
  mvSource1: "close",
  trendLine2: "15",
  trendLine1: "5",
  candleType: "HeikinAshi",
  minReEntryatMinProfitPercent: "4",
  master: {},
  lotSize: "",
  rangeBoundProfitPercent: "4",
  rangeBoundExitPercent: "4",
  rangeBoundEntryPercent: "1",
  rsiCandle: "10",
  // Min_Order_Qty:"1"
  SMA1: "3",
  SMA2: "5",
  minExitPercent: "5",
  maxExitPercent: "30",
  rsiMin: "30",
  rsiMax: "60",
  rangeBoundPercent: "12",
  // rangeBoundPercent2: "12",
  entryPrice: "5",
  customerGrading: "1",
  narration: "",
  strikeDiff: "",
  targetLevel: "5",
  category: "",
  targetBelow: "",
  targetAbove: "",
  callTargetLevel: "",
  putTargetLevel: "",
  maxZoneTime: "",
  noTradeZone: "",
  trendCandleCount: "",
  dynamicExitPercent: "1",
  candleRatioBuy: "0.1",
  candleRatioSell: "",
  CESellDeviation: "",
  PESellDeviation: "",
  secondarySellTarget: "",
  isHedging: "0",
  hedgingIdentifier: "",
  FUTDeviation: "",
  hedgeValue: "",
  hedgeDeviation: "1",
  tradingOptions: "",
  exitSelection: "low",
  entryCandle: "both",
  atrMf: "3",
  tradeIdentification: "2",
  RSDeviation: "",
  maxLoss: "5",
  targetTime: "1",
  entryLineTime: "1",
  dExitMf: "1",
  targetMf: "2",
  atrMax: "60",
  shortTimeInterval: "THIRTY_MINUTE",
  longTimeInterval: "ONE_DAY",
  lastDayCloseMode: "1",
  strikeDeviation: "",
  rsiDifference: "",
  targetConstant: "",
  stepUpPrice: "",
  strikeBasePrice: "",
  targetMean: "",
  dExitMean: "",
  upBand: "",
  downBand: "",
  masterRsiReference: "5",
  masterIntervalReference: "ONE_HOUR",
  intervalReference: "FIFTEEN_MINUTE",
  rsiReference: "5",
  s1: "10",
  candleRatio: "50",
  incCandleRatio: "75",
  decCandleRatio: "65",
  case: "",
  case1RsiMax: "",
  case2RsiMax: "",
  case3RsiMax: "",
  case1TargetMf: "",
  case2TargetMf: "",
  case3TargetMf: "",
  case1DExitMf: "",
  case2DExitMf: "",
  case3DExitMf: "",
  case1CandleRatio: "",
  case2CandleRatio: "",
  case3CandleRatio: "",
  case1MasterRsiReference: "",
  case2MasterRsiReference: "",
  case3MasterRsiReference: "",
  stopLossMf: "10",
  gainPercent: "10",
  vdtmConstant: "25",
  dExitMax: "100",

  sampleCandle: 50,
  exitRsi: 40,
 
  rbExtiRsi: 20,
  greenCandleRatioRangeBound:50,
  greenCandleRatioUpTrend: 60,
  greenCandleRatioDownTrend: 30,
  isGroup : false,
  
  groupName : "",
};
// tradeIndex =6

const tradeOptions = [
  { label: "Bullish", value: 0 },
  { label: "Bearish", value: 1 },
  { label: "Both", value: 2 },
  { label: "None", value: 3 },
];

export const AddNewtrade = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [values, setValues] = React.useState(initialState);
  const [expiryDates, setExpiryDates] = React.useState([]);
  const [group , setGroup] = React.useState([])

  const [trades, setTrades] = React.useState({
    loading: false,
    data: [],
    error: "",
  });

  const width = React.useMemo(() => window.screen.width, []);
  const isModalOpen = isOpen && type === "add-new-trade";

  // React.useEffect(() => {
  //   if (values.indexValue == 2) {
  //     setValues(alternateInitialState);
  //   } else if (values.indexValue == 6) {
  //     setValues(gammaBlastInitialState);
  //   } else {
  //     setValues({ ...initialState, indexValue: values.indexValue });
  //   }
  // }, [values.indexValue]);

  React.useEffect(() => {
    let newState;
    // Check if isMaster is true and set indexValue to 4
    if (values.isMaster) {
      newState = { ...values };
    } else if (values.indexValue === 2) {
      newState = alternateInitialState;
    } else if (values.indexValue === 6) {
      newState = gammaBlastInitialState;
    } else {
      newState = { ...initialState, indexValue: values.indexValue };
    }

    // Merge new initial state with existing filled values
    setValues((prevValues) => ({
      ...newState,
      tradingsymbol: prevValues.tradingsymbol,
      instrument_token: prevValues.instrument_token,
      instrument_type: prevValues.instrument_type,
      exchange: prevValues.exchange,
      expiry: prevValues.expiry,
      symbol: prevValues.symbol,
      // Retain any other fields that need to be preserved
    }));
  }, [values.indexValue, values.isMaster]);

  const masterName = () => {
    const filteredData = data?.trades?.data?.filter((item) => item.isMaster);
    const filteredData2 = data?.trades?.data?.filter((item) => item.isGroup);
    setTrades(filteredData);
    setGroup(filteredData2)
  };

  React.useEffect(() => {
    masterName();
  }, [data.trades]);

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
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const fetchExpiryDates = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/config/getExpiry?symbol=${values.symbol}`
      );

      setExpiryDates(response.data.data);
    } catch (error) {
      console.error("Error fetching expiry dates:", error);
    }
  };

  React.useEffect(() => {
    if (values.isMaster) {
      fetchExpiryDates(); // Fetch expiry dates when isMaster is true
    }
  }, [values.isMaster]);
  if (!isModalOpen) return null; // Ensure the component returns null if the modal is not open

  const handleSubmit = async () => {
    if (
      (!values?.master || !values.master.masterName?.trim()) &&
      values.isMaster == false
    ) {
      return alert("Please enter master name");
    }

    if (values?.isMaster && values.lotSize === "") {
      return alert("Please enter Lot Size .");
    }
    if (parseFloat(values.minExitPercent) > parseFloat(values.maxExitPercent)) {
      return alert("Max Exit Percent Should be greater than Min Exit Percent");
    }
    if (String(values?.isHedging) === "1" && values.hedgingIdentifier == "") {
      return alert("This Trade is Hedge Trade . Enter Main Identifier");
    }

    if (!values.isMaster && values.tradingOptions == "") {
      return alert("Please select Trading Option");
    }
    if (values.isMaster && values.strikeDeviation == "") {
      return alert("Please fill Strike Deviation");
    }

    // if (
    //   (values.indexValue == 2 || values?.indexValue == 12) &&
    //   (!values.dynamicEntryPercentage ||
    //     !values.priceDecPercent ||
    //     !values.atrMf ||
    //     !values.dExitMf ||
    //     !values.targetMf ||
    //     !values.targetLevel ||
    //     !values.entryCandle ||
    //     !values.rsiReference ||
    //     !values.intervalReference ||
    //     !values.dExitMean ||
    //     !values.targetMean ||
    //     !values.masterIntervalReference ||
    //     !values.masterRsiReference ||
    //     !values.s1)
    // ) {
    //   return alert("Please fill in all the required inputs for index 2.");
    // }
    try {
      await axios.post(`${BASE_URL_OVERALL}/config/create`, {
        terminal: values.terminal,
        symbol: values.symbol,
        expiryDate: values.expiry,
        instrument_type: values.instrument_type,
        interval: values.interval,
        WMA: values.wma,
        tradeIndex: values.indexValue,
        tradeInTime: values.tradeInTime,
        tradeOutTime: values.tradeOutTime,
        identifier: values.tradingsymbol,
        instrument_token: values.instrument_token,
        tradeEntryPercent: values.entryPrice,
        dynamicEntryPercentage: values.dynamicEntryPercentage,
        // tradeExitPercent: values.exitPrice,
        minExitPercent: values.minExitPercent,
        maxExitPercent: values.maxExitPercent,
        priceIncPercent: values.priceIncPercent,
        priceDecPercent: values.priceDecPercent,
        earningPercentLimit: values.earningPercentLimit,
        // orderType: values.orderType,
        lossLimit: values.lossLimit,
        isMaster: values.isMaster,
        candleSize: values.candleSize,
        // maxLoss: values.maxLoss,
        minProfit: values.minProfit,
        exchange: values.exchange,
        rangeBoundPercent: values.rangeBoundPercent,
        // rangeBoundPercent2: values.rangeBoundPercent2,
        wmaLtp: values.wmaLtp,
        // targetProfit: values.targetProfit,
        microProfitPercent: values.microProfitPercent,
        entryHystresisPercent: values.entryHystresisPercent,
        movingAvgOFFSET: values.movingAvgOFFSET,
        movingAvgWMA: values.movingAvgWMA,
        rangeBound: values.rangeBound,
        SMA1: values.SMA1,
        SMA2: values.SMA2,
        // SMA3: values.SMA3,
        movingAvgType: values.movingAvgType,
        movingAvgOFFSET2: values.movingAvgOFFSET2,
        movingAvgOFFSET1: values.movingAvgOFFSET1,
        // movingAvgOFFSET3: values.movingAvgOFFSET3,
        mvSource2: values.mvSource2,
        mvSource1: values.mvSource1,
        // mvSource3: values.mvSource3,
        trendLine1: values.trendLine1,
        trendLine2: values.trendLine2,
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
        putTargetLevel: values.putTargetLevel,
        callTargetLevel: values.callTargetLevel,
        maxZoneTime: values.maxZoneTime,
        noTradeZone: values.noTradeZone,
        trendCandleCount: values.trendCandleCount,
        dynamicExitPercent: values.dynamicExitPercent,
        candleRatioBuy: values.candleRatioBuy,
        candleRatioSell: values.candleRatioSell,
        CESellDeviation: values.CESellDeviation,
        PESellDeviation: values.PESellDeviation,
        secondarySellTarget: values.secondarySellTarget,
        isHedging: values.isHedging,
        hedgingIdentifier: values.hedgingIdentifier,
        FUTDeviation: values.FUTDeviation,
        hedgeValue: values.hedgeValue,
        hedgeDeviation: values.hedgeDeviation,
        tradingOptions: values.tradingOptions,
        exitSelection: values.exitSelection,
        entryCandle: values.entryCandle,
        atrMf: values.atrMf,
        tradeIdentification: values.tradeIdentification,
        RSDeviation: values.RSDeviation,
        maxLoss: values.maxLoss,
        targetTime: values.targetTime,
        entryLineTime: values.entryLineTime,
        dExitMf: values.dExitMf,
        targetMf: values.targetMf,
        atrMax: values.atrMax,
        shortTimeInterval: values.shortTimeInterval,
        longTimeInterval: values.longTimeInterval,
        lastDayCloseMode: values.lastDayCloseMode,
        strikeDeviation: values.strikeDeviation,
        targetConstant: values.targetConstant,
        stepUpPrice: values.stepUpPrice,
        strikeBasePrice: values.strikeBasePrice,
        rsiReference: values.rsiReference,
        intervalReference: values.intervalReference,
        targetMean: values.targetMean,
        dExitMean: values.dExitMean,
        masterRsiReference: values.masterRsiReference,
        masterIntervalReference: values.masterIntervalReference,
        s1: values.s1,
        candleRatio: values.candleRatio,
        incCandleRatio: values.incCandleRatio,
        decCandleRatio: values.decCandleRatio,
        stopLossMf: values.stopLossMf,
        gainPercent: values.gainPercent,
        vdtmConstant: values.vdtmConstant,
        dExitMax: values.dExitMax,
        greenCandleRatioDownTrend: values.greenCandleRatioDownTrend,
        sampleCandle: values.sampleCandle,
        exitRsi: values.exitRsi,
        greenCandleRatioUpTrend: values.greenCandleRatioUpTrend,
        rbExtiRsi: values.rbExtiRsi,
        greenCandleRatioRangeBound: values.greenCandleRatioRangeBound,
        isGroup: values.isGroup,
        groupName: values.groupName,
      });
      alert("Add Successfully");
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      data.getAllTrades();
      setValues(initialState);
      onClose();
    }
  };
  // console.log("trades" , trades)
  // console.log("group" , group)

  return (
    <Dialog width={width} onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-7xl px-2 w-full ">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Trade
          </DialogTitle>
        </DialogHeader>
        <div className="h-[600px] overflow-y-auto ">
          <section className="grid grid-cols-3 gap-3 items-center justify-center py-5">
            <CustomAutocomplete
              value={values?.tradingsymbol}
              onChangeFunction={handleChangeSymbol}
            />

            <div className="px-1">
              <Label>Index Value (Please fill this first )</Label>
              <Select
                value={values?.indexValue}
                name="indexValue"
                onValueChange={(value) => handleSelect("indexValue", value)}
              >
                <SelectTrigger className="w-full mt-1 border-zinc-500">
                  <SelectValue>{values?.indexValue}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Trade Index</SelectLabel>
                    {[2, 3, 7, 8, 12, 13, 17, 18]?.map((suggestion) => (
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
                //readOnly
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
              <Label>Is Hedging</Label>
              <Select
                value={String(values?.isHedging) === "0" ? "NO" : "YES"}
                name="isHedging"
                onValueChange={(value) => handleSelect("isHedging", value)}
              >
                <SelectTrigger className="w-full mt-1 border-zinc-500">
                  <SelectValue>
                    {String(values?.isHedging) === "0" ? "NO" : "YES"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Hedging</SelectLabel>
                    <SelectItem value="0">NO</SelectItem>
                    <SelectItem value="1">YES</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                    <SelectItem value="Index">Index</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="Nifty50">Nifty 50</SelectItem>
                    <SelectItem value="SDYadav">S.D. Yadav</SelectItem>
                    <SelectItem value="todayTrade">Today Trade</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="15Min">15 Min</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {values?.indexValue == 18 && (
              <>
                {/* <div className="px-1">
                  <Label>Medium Interval Reference</Label>
                  <Select
                    value={values.intervalReference}
                    name="intervalReference"
                    onValueChange={(value) =>
                      handleSelect("intervalReference", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.intervalReference}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Medium Interval Reference</SelectLabel>
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
                  <Label>Medium RSI Reference</Label>
                  <Input
                    name="rsiReference"
                    onChange={handleChange}
                    value={values.rsiReference}
                    className="mt-1"
                    type="text"
                  />
                </div>
                <div className="px-1">
                  <Label>Higher Interval Reference</Label>
                  <Select
                    value={values.masterIntervalReference}
                    name="masterIntervalReference"
                    onValueChange={(value) =>
                      handleSelect("masterIntervalReference", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>
                        {values.masterIntervalReference}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Higher Interval Reference</SelectLabel>
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
                  <Label>Higher RSI Reference</Label>
                  <Input
                    name="masterRsiReference"
                    onChange={handleChange}
                    value={values.masterRsiReference}
                    className="mt-1"
                    type="text"
                  />
                </div> */}

              

                {/* <div className="px-1">
                  <Label>DEM Max</Label>
                  <Input
                    name="dExitMax"
                    onChange={handleChange}
                    value={values.dExitMax}
                    className="mt-1"
                    min={0}
                    type="number"
                  />
                </div> */}
              </>
            )}

            {values?.isHedging == 1 && (
              <>
                <div className="px-1">
                  <Label>Main Identifier</Label>
                  <Input
                    value={values.hedgingIdentifier}
                    className="mt-1"
                    type="text"
                    name="hedgingIdentifier"
                    onChange={handleChange}
                  />
                </div>
                <div className="px-1">
                  <Label>Hedge Value</Label>
                  <Input
                    value={values.hedgeValue}
                    className="mt-1"
                    type="number"
                    name="hedgeValue"
                    onChange={handleChange}
                  />
                </div>
                {/* <div className="px-1">
                  <Label>Hedge Deviation (%)</Label>
                  <Input
                    value={values.hedgeDeviation}
                    className="mt-1"
                    type="number"
                    name="hedgeDeviation"
                    onChange={handleChange}
                  />
                </div> */}
              </>
            )}

            <div className="px-1">
              <Label>Expiry</Label>
              {values.isMaster ? (
                <Select
                  value={values.expiry}
                  name="expiry"
                  onValueChange={(value) => handleSelect("expiry", value)}
                >
                  <SelectTrigger className="w-full mt-1 border-zinc-500">
                    <SelectValue>{values.expiry}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Expiry Date</SelectLabel>
                      {expiryDates.map((date, index) => (
                        <SelectItem key={index} value={date}>
                          {date}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="mt-1"
                  name="expiry"
                  value={values.expiry}
                  onChange={handleChange}
                  type="text"
                />
              )}
            </div>

            <div className="px-1">
              <Label>Is Master</Label>
              <Select
                value={String(values.isMaster)} // Convert boolean to string for the select value
                name="isMaster"
                onValueChange={(value) => handleSelect("isMaster", value)}
              >
                <SelectTrigger className="w-full mt-1 border-zinc-500">
                  <SelectValue>{String(values.isMaster)}</SelectValue>
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
            <div className="px-1">
              <Label>Is Group</Label>
              <Select
                value={String(values.isGroup)} // Convert boolean to string for the select value
                name="isGroup"
                onValueChange={(value) => handleSelect("isGroup", value)}
              >
                <SelectTrigger className="w-full mt-1 border-zinc-500">
                  <SelectValue>{String(values.isGroup)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Is Group</SelectLabel>
                    {[{ isGroup: true }, { isGroup: false }]?.map(
                      (suggestion) => (
                        <SelectItem
                          key={String(suggestion.isGroup)}
                          value={suggestion.isGroup}
                        >
                          {String(suggestion.isGroup)}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {values?.isMaster == false && (
              <>
                <div className="px-1">
                  <Label>Master Name</Label>
                  <Select
                    value={values?.master}
                    name="master"
                    onValueChange={(value) => handleSelect("master", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values?.master?.masterName}</SelectValue>
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
                {/* <div className="px-1">
                  <Label>Lower Rsi Reference</Label>
                  <Input
                    name="rsiMax"
                    onChange={handleChange}
                    value={values.rsiMax}
                    className="mt-1"
                    type="number"
                  />
                </div> */}
                <div className="px-1">
                  <Label>Trading CE/PE</Label>
                  <Select
                    value={values?.tradingOptions}
                    name="tradingOptions"
                    onValueChange={(value) =>
                      handleSelect("tradingOptions", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values?.tradingOptions}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Trading Option</SelectLabel>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="PE">PE</SelectItem>
                        <SelectItem value="Future">Future</SelectItem>
                        <SelectItem value="EQ">EQ</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {values?.isGroup == false && (
              <>
                <div className="px-1">
                  <Label>Group Name</Label>
                  <Select
                    value={values?.groupName}
                    name="groupName"
                   // onValueChange={(value) => console.log("groupName", value.identifier)}
                    onValueChange={(value) => handleSelect("groupName", value.identifier)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values?.groupName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Group Name</SelectLabel>
                        {/* <SelectItem value={{ masterName: "self" }}>
                        Self
                      </SelectItem> */}
                        {group?.map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item.identifier}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

           
              </>
            )}

            {values?.isMaster == true && (
              <>
                <div className=" mb-1 ">
                  <Label>Trade Identification</Label>
                  <Select
                    className="w-[150px] "
                    value={values.tradeIdentification}
                    onValueChange={(value) =>
                      handleSelect("tradeIdentification", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>
                        {tradeOptions.find(
                          (option) =>
                            option.value === values.tradeIdentification
                        )?.label || ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Trade Identification</SelectLabel>

                        {tradeOptions?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-1">
                  <Label>Loss Limit</Label>
                  <Input
                    name="maxLoss"
                    onChange={handleChange}
                    value={values.maxLoss}
                    className="mt-1"
                    type="text"
                  />
                </div>
                <div className="px-1">
                  <Label>D_Entry 2(%)</Label>
                  <Input
                    name="priceDecPercent"
                    onChange={handleChange}
                    value={values.priceDecPercent}
                    className="mt-1"
                    type="text"
                  />
                </div>

                {/* <div className="px-1">
                  <Label> Target Time Delay</Label>
                  <Select
                    value={values?.targetTime}
                    name="targetTime"
                    onValueChange={(value) => handleSelect("targetTime", value)}
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values?.targetTime}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Target Time Delay</SelectLabel>
                        <SelectItem value="1">1 min</SelectItem>
                        <SelectItem value="3">3 min</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div> */}

                {/* <div className="px-1">
                  <Label>Min Exit %</Label>
                  <Input
                    name="minExitPercent"
                    onChange={handleChange}
                    value={values.minExitPercent}
                    className="mt-1"
                    type="text"
                  />
                </div> */}
              </>
            )}

            {values?.isMaster && (
              <>
                <div className="px-1">
                  <Label>Inc Candle Ratio</Label>
                  <Input
                    name="incCandleRatio"
                    onChange={handleChange}
                    value={values.incCandleRatio}
                    className="mt-1"
                    type="number"
                    min={0}
                  />
                </div>
                <div className="px-1">
                  <Label>Dec Candle Ratio</Label>
                  <Input
                    name="decCandleRatio"
                    onChange={handleChange}
                    value={values.decCandleRatio}
                    className="mt-1"
                    type="number"
                    min={0}
                  />
                </div>
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
                <div className="px-1">
                  <Label>Strike Deviation</Label>
                  <Input
                    name="strikeDeviation"
                    onChange={handleChange}
                    value={values.strikeDeviation}
                    className="mt-1"
                    type="number"
                  />
                </div>
                <div className="px-1">
                  <Label>Strike Base</Label>
                  <Input
                    name="strikeBasePrice"
                    onChange={handleChange}
                    value={values.strikeBasePrice}
                    className="mt-1"
                    type="number"
                  />
                </div>
                <div className="px-1">
                  <Label>Strike Difference Price </Label>
                  <Input
                    name="stepUpPrice"
                    onChange={handleChange}
                    value={values.stepUpPrice}
                    className="mt-1"
                    type="number"
                  />
                </div>
                <div className="px-1">
                  <Label> Long Time Interval</Label>
                  <Select
                    value={values.longTimeInterval}
                    name="longTimeInterval"
                    onValueChange={(value) =>
                      handleSelect("longTimeInterval", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.longTimeInterval}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Long Time Interval</SelectLabel>
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
                  <Label>Short Time Interval</Label>
                  <Select
                    value={values.shortTimeInterval}
                    name="longTimeInterval"
                    onValueChange={(value) =>
                      handleSelect("longTimeInterval", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border-zinc-500">
                      <SelectValue>{values.shortTimeInterval}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Short Time Interval</SelectLabel>
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
              </>
            )}

            {values.indexValue != 6 || values?.indexValue != 7 || (
              <>
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

                {values.indexValue != 4 && (
                  <>
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
                  </>
                )}
              </>
            )}
            {values.indexValue != 6 && (
              <>
                {values?.indexValue != 4 || values.indexValue != 7 || (
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

                    <div className="px-1">
                      <Label>MV Source 1</Label>
                      <Select
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
                            {["open", "close", "high"]?.map((suggestion) => (
                              <SelectItem key={suggestion} value={suggestion}>
                                {suggestion}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="px-1">
                      <Label>MV Source 2</Label>
                      <Select
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
                            {["open", "close", "high"]?.map((suggestion) => (
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

                {(values.indexValue == 2 || values.indexValue == 12) &&
                  values.isMaster == false && (
                    <>
                      <div className="px-1">
                  <Label>RSI / ATR Candle</Label>
                  <Input
                    name="rsiCandle"
                    onChange={handleChange}
                    value={values.rsiCandle}
                    className="mt-1"
                    type="number"
                    min={0}
                  />
                </div>
                {/* <div className="px-1">
                  <Label>DEM Min</Label>
                  <Input
                    name="s1"
                    onChange={handleChange}
                    value={values.s1}
                    className="mt-1"
                    min={0}
                    type="number"
                  />
                </div> */}
                <div className="px-1">
                  <Label>DTM Min</Label>
                  <Input
                    name="vdtmConstant"
                    onChange={handleChange}
                    value={values.vdtmConstant}
                    className="mt-1"
                    min={0}
                    type="number"
                  />
                </div>
                <div className="px-1">
                  <Label>Candle Ratio</Label>
                  <Input
                    name="candleRatio"
                    onChange={handleChange}
                    value={values.candleRatio}
                    className="mt-1"
                    min={0}
                    type="number"
                  />
                </div>

                <div className="px-1">
                  <Label>DTM Max</Label>
                  <Input
                    name="targetMean"
                    onChange={handleChange}
                    value={values.targetMean}
                    className="mt-1"
                    min={0}
                    type="number"
                  />
                </div>
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
                      {/* <div className="px-1">
                        <Label>Last Day Close</Label>
                        <Select
                          // disabled={loading}
                          value={
                            values.lastDayCloseMode == 1
                              ? "Activate"
                              : "Deactivate"
                          }
                          name="lastDayCloseMode"
                          onValueChange={(value) =>
                            handleSelect("lastDayCloseMode", value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1 border-zinc-500">
                            <SelectValue>
                              {values.lastDayCloseMode == 1
                                ? "Activate"
                                : "Deactivate"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Last Day Close</SelectLabel>

                              <SelectItem value={1}>Activate</SelectItem>
                              <SelectItem value={0}>Deactivate</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div> */}

                      {/* <div className="px-1">
                        <Label>Entry Candle</Label>
                        <Select
                          // disabled={loading}
                          value={values.entryCandle}
                          name="entryCandle"
                          onValueChange={(value) =>
                            handleSelect("entryCandle", value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1 border-zinc-500">
                            <SelectValue>{values.entryCandle}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Entry Candle</SelectLabel>
                              {["green", "both"]?.map((suggestion) => (
                                <SelectItem key={suggestion} value={suggestion}>
                                  {suggestion}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div> */}

                      <div className="px-1">
                        <Label>WMA</Label>
                        <Input
                          name="wma"
                          onChange={handleChange}
                          value={values.wma}
                          className="mt-1"
                          type="number"
                          min={0}
                        />
                      </div>

                      <div className="px-1">
                        <Label>Entry2 MF</Label>
                        <Input
                          name="priceDecPercent"
                          onChange={handleChange}
                          value={values.priceDecPercent}
                          className="mt-1"
                          type="text"
                          min={0}
                        />
                      </div>

                      {/* <div className="px-1">
                        <Label>D_Exit MF </Label>
                        <Input
                          name="atrMf"
                          onChange={handleChange}
                          value={values.atrMf}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div> */}
                      <div className="px-1">
                        <Label>Stoploss MF </Label>
                        <Input
                          name="stopLossMf"
                          onChange={handleChange}
                          value={values.stopLossMf}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>
                      <div className="px-1">
                        <Label>Target MF </Label>
                        <Input
                          name="targetLevel"
                          onChange={handleChange}
                          value={values.targetLevel}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>
               
                      {/* <div className="px-1">
                        <Label>D_Exit Constant</Label>
                        <Input
                          name="dExitMf"
                          onChange={handleChange}
                          value={values.dExitMf}
                          className="mt-1"
                          min={0}
                          type="number"
                        />  
                      </div>     */}

                      <div className="px-1">
                        <Label>Target Constant</Label>
                        <Input
                          name="targetMf"
                          onChange={handleChange}
                          value={values.targetMf}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>
                      <div className="px-1">
                        <Label>Max Exit RSI (%)</Label>
                        <Input
                          name="exitRsi"
                          onChange={handleChange}
                          value={values.exitRsi}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>
                      <div className="px-1">
                        <Label>Min Exit RSI (%)</Label>
                        <Input
                          name="rbExtiRsi"
                          onChange={handleChange}
                          value={values.rbExtiRsi}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>
                      <div className="px-1">
                        <Label>Sample Candle</Label>
                        <Input
                          name="sampleCandle"
                          onChange={handleChange}
                          value={values.sampleCandle}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>

                      {/* <div className="px-1">
                        <Label>Green Candle Ratio Min</Label>
                        <Input
                          name="greenCandleRatioDownTrend"
                          onChange={handleChange}
                          value={values.greenCandleRatioDownTrend}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div> */}
                      {/* <div className="px-1">
                        <Label>Green Candle Ratio Up Trend</Label>
                        <Input
                          name="greenCandleRatioUpTrend"
                          onChange={handleChange}
                          value={values.greenCandleRatioUpTrend}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>
                      <div className="px-1">
                        <Label>Green Candle Ratio RangeBound</Label>
                        <Input
                          name="greenCandleRatioRangeBound"
                          onChange={handleChange}
                          value={values.greenCandleRatioRangeBound}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div> */}
                    </>
                  )}
              </>
            )}

            {(values.indexValue == 7 || values.indexValue == 17) &&
              values.isMaster && (
                <>
                  {/* <div className="px-1">
                    <Label>D_Entry (%)</Label>
                    <Input
                      name="dynamicEntryPercentage"
                      onChange={handleChange}
                      value={values.dynamicEntryPercentage}
                      className="mt-1"
                      type="number"
                    />
                  </div> */}
                  {/* <div className="px-1">
                    <Label> Trend Candle Count</Label>
                    <Input
                      name="trendCandleCount"
                      onChange={handleChange}
                      value={values.trendCandleCount}
                      className="mt-1"
                      type="number"
                    />
                  </div> */}

                  <div className="px-1">
                    <Label> TrendLine Deviation(%)</Label>
                    <Input
                      name="candleRatioBuy"
                      onChange={handleChange}
                      value={values.candleRatioBuy}
                      className="mt-1"
                      type="number"
                    />
                  </div>

                  {/* <div className="px-1">
                    <Label>PE Buy Deviation</Label>
                    <Input
                      name="candleRatioSell"
                      onChange={handleChange}
                      value={values.candleRatioSell}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                  <div className="px-1">
                    <Label>CE Sell Deviation</Label>
                    <Input
                      name="CESellDeviation"
                      onChange={handleChange}
                      value={values.CESellDeviation}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                  <div className="px-1">
                    <Label>PE Sell Deviation</Label>
                    <Input
                      name="PESellDeviation"
                      onChange={handleChange}
                      value={values.PESellDeviation}
                      className="mt-1"
                      type="number"
                    />
                  </div>
                  <div className="px-1">
                    <Label>FUT Buy/Sell Deviation</Label>
                    <Input
                      name="FUTDeviation"
                      onChange={handleChange}
                      value={values.FUTDeviation}
                      className="mt-1"
                      type="number"
                    />
                  </div> */}
                  {/* <div className="px-1">
                    <Label>Secondary Sell Target (%)</Label>
                    <Input
                      name="secondarySellTarget"
                      onChange={handleChange}
                      value={values.secondarySellTarget}
                      className="mt-1"
                      type="number"
                    />
                  </div> */}
                </>
              )}
                     <div className="px-1">
                        <Label>Hedge ATR</Label>
                        <Input
                          name="hedgeDeviation"
                          onChange={handleChange}
                          value={values.hedgeDeviation}
                          className="mt-1"
                          min={0}
                          type="number"
                        />
                      </div>

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

            {/* {(values?.indexValue == 5 || values?.indexValue == 7) && (
              <div className="px-1">
                <Label> Candle Size</Label>
                <Input
                  name="candleSize"
                  onChange={handleChange}
                  value={values.candleSize}
                  className="mt-1"
                  type="number"
                />
              </div>
            )} */}

            {/* {values.isMaster && (
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
            )} */}

            {values.isMaster && values.indexValue == 4 && (
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
              <Label>Terminal</Label>
              <Select
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
            </div> */}

            <div className="px-1">
              <Label>Interval</Label>
              <Select
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
            {/* <div className="px-1">
              <Label>Gain Percent (+/-)</Label>
              <Input
                name="gainPercent"
                onChange={handleChange}
                value={values.gainPercent}
                className="mt-1"
                type="number"
                min={0}
              />
            </div> */}
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
        </div>
        <DialogFooter className="px-10"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewtrade;

// Function to fetch data from your custom API
async function fetchMyAPI(input) {
  try {
    const response = await axios.get(
      `${BASE_URL_OVERALL}/api/v1/instrument/getInstrument`,
      {
        params: {
          tradingsymbol: input.toUpperCase(),
          pageNumber: 1,
          pageSize: 800,
        },
      }
    );
    return response.data.data; // Adjust this to match the format of your API response
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function CustomAutocomplete({ value: defaultValue, onChangeFunction }) {
  const [value, setValue] = React.useState(defaultValue);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetch = React.useMemo(
    () =>
      debounce(async (request, callback) => {
        setLoading(true);
        const results = await fetchMyAPI(request.input);
        console.log(results);
        callback(results);
        setLoading(false);
      }, 400),
    []
  );

  React.useEffect(() => {
    let active = true;
    if (inputValue === " ") {
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
      id="custom-autocomplete"
      className="col-span-3 w-[100%]"
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.tradingsymbol
      }
      autoComplete
      includeInputInList
      filterSelectedOptions
      disableClearable
      disablePortal
      value={value}
      noOptionsText={loading ? "Loading..." : "No Trade Options"}
      ListboxProps={{
        style: { maxHeight: 510 }, // Ensures that more options can fit within the dropdown
      }}
      onChange={(event, newValue) => {
        setValue(newValue);
        onChangeFunction(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Select New Trade Index" fullWidth />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.tradingsymbol}>
          <Typography variant="body2" sx={{ paddingY: "2px" }}>
            {option.tradingsymbol}
          </Typography>
        </li>
      )}
    />
  );
}

// function CustomAutocomplete({ value: defaultValue, onChangeFunction }) {
//   const [value, setValue] = React.useState(defaultValue);
//   const [inputValue, setInputValue] = React.useState("");
//   const [options, setOptions] = React.useState([]);
//   const [loading, setLoading] = React.useState(false);

//   const fetch = React.useMemo(
//     () =>
//       debounce(async (request, callback) => {
//         setLoading(true);
//         const results = await fetchMyAPI(request.input);
//         console.log(results)
//         callback(results);
//         setLoading(false);
//       }, 400),
//     []
//   );

//   React.useEffect(() => {
//     let active = true;
//     if (inputValue === " ") {
//       setOptions(value ? [value] : []);
//       return undefined;
//     }

//     fetch({ input: inputValue }, (results) => {
//       if (active) {
//         let newOptions = [];

//         if (value) {
//           newOptions = [value];
//         }

//         if (results) {
//           newOptions = [...newOptions, ...results];
//         }

//         setOptions(newOptions);
//       }
//     });

//     return () => {
//       active = false;
//     };
//   }, [value, inputValue, fetch]);

//   return (
//     <Autocomplete
//       id="custom-autocomplete"
//       className="col-span-3 w-[100%] "
//       options={options}
//       getOptionLabel={(option) =>
//         typeof option === "string" ? option : option.tradingsymbol
//       }
//       autoComplete
//       includeInputInList
//       filterSelectedOptions
//       disableClearable
//       disablePortal // Forces the dropdown to be rendered within the DOM hierarchy, ensuring correct event handling
//       value={value}
//       noOptionsText={loading ? "Loading..." : "No Trade Options"}
//       onChange={(event, newValue) => {
//         setValue(newValue);
//         onChangeFunction(newValue);
//       }}
//       onInputChange={(event, newInputValue) => {
//         setInputValue(newInputValue);
//       }}
//       renderInput={(params) => (
//         <TextField {...params} label="Select New Trade Index" fullWidth />
//       )}
//       renderOption={(props, option) => (
//         <li {...props} key={option.tradingsymbol}>
//           <Typography variant="body2" sx={{ paddingY: "3px" }}>
//             {option.tradingsymbol}
//           </Typography>
//         </li>
//       )}
//     />
//   );
// }
