import React, { memo, useEffect, useMemo, useRef, useState , useImperativeHandle } from "react";
import { Chart, ChartCanvas, ZoomButtons } from "react-stockcharts";
import {
  Annotate,
  LabelAnnotation,
  SvgPathAnnotation,
  buyPath,
  sellPath,
} from "react-stockcharts/lib/annotation";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  BarSeries,
  CandlestickSeries,
  LineSeries,
  MACDSeries,
} from "react-stockcharts/lib/series";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
  HoverTooltip,
  MovingAverageTooltip,
  MACDTooltip,
} from "react-stockcharts/lib/tooltip";
// import { last } from "react-stockcharts/lib/utils";
import axios from "axios";
import { useConfig } from "@/hooks/use-config";
import { formatDate, formatPrice } from "@/lib/utils";
import { useLiveSocket } from "@/providers/live-socket-provider";
import {
  TrendLine,
  DrawingObjectSelector,
  FibonacciRetracement,
  EquidistantChannel,
  InteractiveText,
} from "react-stockcharts/lib/interactive";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
// import { last, toObject } from "react-stockcharts/lib/utils";
import { head, last, toObject } from "react-stockcharts/lib/utils";
import {
  CrossHairCursor,
  EdgeIndicator,
  MouseCoordinateX,
  MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { fitWidth } from "react-stockcharts/lib/helper";
import { ema, macd, sma } from "react-stockcharts/lib/indicator";
import ErrorBoundary from "@/hooks/error-boundary.jsx";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { useInteractiveNodes } from "./interactiveutils";
import { getMorePropsForChart } from "react-stockcharts/lib/interactive/utils";
// import { saveInteractiveNodes, getInteractiveNodes } from "./interactiveutils";
// import { Modal, Button, FormGroup, FormControl } from "react-bootstrap";
import Dialog from "@/modals/dialog-modal";
import { useModal } from "@/hooks/use-modal";

function tooltipContent(underlyingValue) {
  return ({ currentItem, xAccessor }) => {
    return {
      x: `Time: ${
        currentItem?.timestamp && formatDate(currentItem?.timestamp)
      }`,
      y: [
        {
          label: "Underlying Value",
          value:
            currentItem?.underlyingValue &&
            formatPrice(currentItem?.underlyingValue),
          stroke: "black",
        },

        {
          label: "Last highest LTP",
          value: currentItem?.Last_Highest_LTP?.toFixed(2),
          stroke: "black",
        },

        {
          label: "Micro Profit",
          value: currentItem?.microProfit?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Exit Support",
          value: currentItem?.exitSupport?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Candle close",
          value: currentItem?.close && formatPrice(currentItem?.close),
          stroke: "black",
        },
        {
          label: "Candle Size",
          value: (currentItem?.close - currentItem?.open)?.toFixed(2),
          stroke: currentItem?.close - currentItem?.open < 0 ? "red" : "green",
        },
        {
          label: "Pivot diff",
          value: currentItem?.pivotDifference?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Intitial Time",
          value: currentItem?.initialTime?.slice(11, 19),
          stroke: "black",
        },

        {
          label: "D_Exit_Value",
          value: currentItem?.dynamicExitValue?.toFixed(2),
          stroke: "black",
        },
        {
          label: "D_Entry_Value",
          value: currentItem?.dynamicEntryValue?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Last Lowest LTP",
          value: currentItem?.InitialLow?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Moving Avg WMA",
          value: currentItem?.movingAvgWMA?.toFixed(2),
          stroke: "black",
        },
        {
          label: "volume",
          value: currentItem?.volume?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Target profit",
          value: currentItem?.RangeBoundTargetProfit?.toFixed(2),
          stroke: "black",
        },
        {
          label: "RSI Value",
          value: currentItem?.RSI_Value?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Moving Avg 1",
          value: currentItem?.movingAvgMA1?.toFixed(2),
          stroke: "black",
        },
        {
          label: "Moving Avg 2",
          value: currentItem?.movingAvgMA2?.toFixed(2),
          stroke: "black",
        },
      ].filter((line) => line?.value),
    };
  };
}

// const Dialog = ({ showModal, text, chartId, onClose, onSave }) => {
//   const [localText, setLocalText] = useState(text);

//   useEffect(() => {
//     setLocalText(text);
//   }, [text]);

//   const handleChange = (e) => {
//     setLocalText(e.target.value);
//   };

//   const handleSave = () => {
//     onSave(localText, chartId);
//   };

//   return (
//     <Modal show={showModal} onHide={onClose} >
//       <Modal.Header closeButton>
//         <Modal.Title>Edit text</Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         <form>
//           <FormGroup controlId="text">
//             {/* <ControlLabel>Text</ControlLabel> */}
//             <FormControl
//               type="text"
//               value={localText}
//               onChange={handleChange}
//             />
//           </FormGroup>
//         </form>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button bsstyle="primary" onClick={handleSave}>
//           Save
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// let colorsArray = [
//   "red",
//   "green",
//   "blue",
//   "black",
//   "purple",
//   "brown",
//   "orange",
//   "gray",
//   "black",
//   "black",
// ];

const defaultAnnotationProps = {
  onClick: console.log.bind(console),
};

const longAnnotationProps = {
  ...defaultAnnotationProps,
  y: ({ yScale, datum }) => yScale(datum.low),
  fill: "#006517",
  path: buyPath,
  tooltip: "Entry Time",
};

const longgAnnotationProps = {
  ...defaultAnnotationProps,
  y: ({ yScale, datum }) => yScale(datum.low),
  fill: "#00f",
  path: buyPath,
  tooltip: "Initial Time",
};

const shortAnnotationProps = {
  ...defaultAnnotationProps,
  y: ({ yScale, datum }) => yScale(datum.low),
  fill: "#FF0000",
  path: sellPath,
  tooltip: "Go short",
};


const useKeyPress = (callback) => {
  useEffect(() => {
    document.addEventListener("keyup", callback);
    return () => {
      document.removeEventListener("keyup", callback);
    };
  }, [callback]);
};


const macdAppearance = {
  stroke: {
    macd: "#FF0000",
    signal: "#00F300",
  },
  fill: {
    divergence: "#4682B4",
  },
};
let trendLineArray = [
  {
    width: 2,
    color: "green",
    name: "R4",
  },
  {
    width: 2,  
    color: "green",
    name: "R3",
  },
  {
    width: 2,
    color: "green",
    name: "R2",
  },
  {
    width: 2,
    color: "green",
    name: "R1",
  },
  {
    width: 2,
    color: "red",
    name: "S4",
  },
  {
    width: 2,
    color: "red",
    name: "S3",
  },
  {
    width: 2,
    color: "red",
    name: "S2",
  },
  {
    width: 2,
    color: "red",
    name: "S1",
  },
  {
    width: 2,
    color: "violet",
    name: "callTargetLevel",
  },
  {
    width: 2,
    color: "orange",
    name: "putTargetLevel",
  },
];
const alertLineArray = [
  { color: "green", name: "Alert Call" },
  { color: "red", name: "Alert Put" },
  // { color: "orange", name: "Alert Signal 1" },
  // { color: "purple", name: "Alert Signal 2" },
  // { color: "teal", name: "Alert Signal 3" },
  // { color: "gray", name: "Alert Signal 4" },
  // { color: "red", name: "Alert Warning" },
  // { color: "blue", name: "Alert Trend" },
  // { color: "green", name: "Alert Spike" },
  // { color: "pink", name: "Alert Trigger" },
];
const entryLineArray = [
  { color: "green", name: "Resistance" },
  { color: "red", name: "Support" },
  { color: "violet", name: "Call Target Line" },
  { color: "orange", name: "Put Target Line" },
  // { color: "orange", name: "Alert Signal 1" },
  // { color: "purple", name: "Alert Signal 2" },
  // { color: "teal", name: "Alert Signal 3" },
  // { color: "gray", name: "Alert Signal 4" },
  // { color: "red", name: "Alert Warning" },
  // { color: "blue", name: "Alert Trend" },
  // { color: "green", name: "Alert Spike" },
  // { color: "pink", name: "Alert Trigger" },
];

const CandleChart = ({
  handleCreateTrendLines,
  chartType,
  // getChartData,                                                                                        
  data: initialData,
  intractiveData, 
  width,
  height,
  showRow,
  ratio,
  master,
  type = chartType,
  trends3,
  setTrends3,
  alert3,
  setAlert3,
  entryLine,
  setEntryLine
  // type = "canvas",
  // type = "svg",
}) => {

  try {
    const { onOpen } = useModal();
    const { getInteractiveNodes, saveInteractiveNodes } = useInteractiveNodes();
    const [enableAlertLine, setEnableAlertLine] = useState(false);
    const [enableEntryLine, setEnableEntryLine] = useState(false);
    const [enableInteractiveObject, setEnableInteractiveObject] =
      useState(false);

        const [textList1, setTextList1] = useState(
          //JSON.parse(intractiveData?.textLabel)
        );
      
    const [textList3, setTextList3] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [chartId, setChartId] = useState(null);
    const canvasNode = useRef(null);
    
    const handleSelections = (interactives, moreProps) => {
      if (enableInteractiveObject) {
        const independentCharts = moreProps.currentCharts.filter(
          (d) => d !== 2
        );
        if (independentCharts.length > 0) {
          const first = head(independentCharts);

          // console.log(moreProps, first);
          const morePropsForChart = getMorePropsForChart(moreProps, first);

          if (
            morePropsForChart.chartConfig &&
            morePropsForChart.chartConfig.origin
          ) {
            const { origin } = morePropsForChart.chartConfig;
            // Ensure origin is defined before accessing it
            // console.log("Origin:", origin);
          } else {
            console.error("chartConfig or origin is undefined");
          }
          const {
            mouseXY: [, mouseY],
            chartConfig: { yScale },
            xAccessor,
            currentItem,
          } = morePropsForChart;

          const position = [xAccessor(currentItem), yScale.invert(mouseY)];
          const newText = {
            ...InteractiveText.defaultProps.defaultText,
            position,
          };
          handleChoosePosition(newText, morePropsForChart);
        }
      } else {
        const state = toObject(interactives, (each) => {
          return [`textList_${each.chartId}`, each.objects];
        });
        setTextList1(state.textList_1 || []);
        setTextList3(state.textList_3 || []);
      }
    };

    // const handleTextChange = (text, chartId) => {
    //   console.log("Updated Text:", text, "ChartId:", chartId , "text postion",text.position);
    //   const textList = chartId === 1 ? textList1 : textList3;
    //   const allButLast = textList.slice(0, textList.length - 1);

    //   const lastText = {
    //     ...last(textList),
    //     text: text.text, // Ensure you're spreading the whole object and updating text
    //     position: text.position, // Ensure position is included
    //   };

    //   if (chartId === 1) {
    //     setTextList1([...allButLast, lastText]);
    //   } else {
    //     setTextList3([...allButLast, lastText]);
    //   }

    //   setShowModal(false);
    //   setEnableInteractiveObject(false);
    // };
    // const handleChoosePosition = (text, moreProps) => {
    //   if (!moreProps || !moreProps.chartConfig) {
    //     console.error('moreProps or chartConfig is undefined');
    //     return;
    //   }
    //   const { id: chartId } = moreProps.chartConfig;
    //   console.log("Opening Modal with", { currentText, chartId, text });
    //   setTextList1((prev) => [...prev, text]);
    //   // setShowModal(true);
    //   onOpen("dialog-modal", {
    //     text: text,
    //     chartId: chartId,
    //     onSave: handleTextChange,
    //   });
    //   setCurrentText(text.text);
    //   setEnableInteractiveObject(false);
    //   setChartId(chartId);
    // };

    const handleTextChange = (text, chartId) => {
      // console.log(
      //   "Updated Text:",
      //   text,
      //   "ChartId:",
      //   chartId,
      //   "text position",
      //   text.position
      // );
      const textList = chartId === 1 ? textList1 : textList3;
      const newText = {
        ...text, // Keep all the properties of the text including the updated one
      };

      // Append the new text to the existing list
      if (chartId === 1) {
        setTextList1([...textList, newText]); // Add new text without removing previous ones
      } else {
        setTextList3([...textList, newText]); // Add new text to textList3
      }

      setShowModal(false);
      setEnableInteractiveObject(false);
    };

    const handleDialogClose = () => {
      setShowModal(false);
    };

    const handleChoosePosition = (text, moreProps) => {
      if (!moreProps || !moreProps.chartConfig) {
        console.error("moreProps or chartConfig is undefined");
        return;
      }
      const { id: chartId } = moreProps.chartConfig;

      console.log("Opening Modal with", { currentText, chartId, text });

      // Add new text to the correct list before opening the modal
      if (chartId === 1) {
        setTextList1((prev) => [...prev, text]); // Add to textList1
      } else {
        setTextList3((prev) => [...prev, text]); // Add to textList3
      }

      // Open the modal for editing
      onOpen("dialog-modal", {
        text: text,
        chartId: chartId,
        onSave: handleTextChange,
      });
      setCurrentText(text.text);
      setEnableInteractiveObject(false);
      setChartId(chartId);
    };

    const margin = { left: 80, right: 80, top: 30, bottom: 50 };
    const calculatedData = initialData;
    // Trendline state
    const [enableTrendLine, setEnableTrendLine] = useState(false);

    const [trends1, setTrends1] = useState([
      {
        start: [100, 400],
        end: [150, 500],
        appearance: { stroke: "green" },
        type: "XLINE",
      },
    ]);
    // const [trends3, setTrends3] = useState(intractiveData?.trendLines);
    const node1Ref = useRef(null);
    const trendLineNodeRef = useRef(null); // Separate ref for trend lines
    const alertLineNodeRef = useRef(null);
    const entryLineNodeRef = useRef(null);

    const node3Ref = useRef(null);
    //   console.log({ trends3 });
    // Fibonacci state
    const [enableFib, setEnableFib] = useState(true);
    const [retracements1, setRetracements1] = useState([]);
    const [retracements3, setRetracements3] = useState([]);
    const fibNode1Ref = useRef(null);
    const textRef = useRef(null);
    const fibNode3Ref = useRef(null);

    // Equidistant Channel state
    const [enableEquidistantChannel, setEnableEquidistantChannel] =
      useState(true);
    const [channels1, setChannels1] = useState([]);
    const channelNode1Ref = useRef(null);
    const channelNode3Ref = useRef(null);

    const logTrendLines = (trends) => {
      // console.log("logTrendLines");
      trends.forEach((trend) => {
        console.log("TrendLine Start:", trend.start, "End:", trend.end);
      });
    };

    const logFibonacciRetracements = (retracements) => {
      // console.log("logFibonacciRetracements");
      retracements.forEach((retracement) => {
        console.log("FibonacciRetracement Points:", retracement);
      });
    };

    const logEquidistantChannels = (channels) => {
      // console.log("logEquidistantChannels");
      channels.forEach((channel) => {
        console.log("EquidistantChannel StartXY:", channel);
      });
    };

    const handleSelection = (interactives) => {
      const state = toObject(interactives, (each) => {
        return [`trends_${each.chartId}`, each.objects];
      });
      // setTrends1(state.trends_1 || trends1);
      setTrends3(state.trends_3 || trends3);
      setChannels1(state.channels_1 || channels1);
      setAlert3(state.alert_3 || alert3)
      setEntryLine(state.entryLine || entryLine)
    };

    const onDrawCompleteChart3 = (newTrends) => {
      setEnableTrendLine(false);

      let coloredNewTrends = newTrends?.map((item, ind) => {
        let startIndex = Math?.min(Math.floor(item.start[0]), data?.length - 1);
        let startTime = data[startIndex].timestamp;
        // let endIndex = Math.min(Math.floor(item?.end[0]), data?.length - 1);
        // let endTime = data[endIndex].timestamp;

        // Check if item?.end[0] is within the range of the chart
        let endIndex = Math.floor(item?.end[0]);
        let endTime;
        // Ensure endIndex is within the data bounds
        if (endIndex >= 0 && endIndex < data?.length) {
          // If within bounds, get the timestamp
          endTime = data[endIndex]?.timestamp;
        } else {
          // If out of bounds, set endTime to undefined
          endTime = undefined;
        }

        return {
          ...item,
          appearance: {
            ...item.appearance,
            stroke: trendLineArray[ind]?.color || "blue",
            strokeWidth: trendLineArray[ind]?.width || 2,
          },
          startTime,
          endTime,
          name: trendLineArray[ind]?.name || "Trend",
        };
      });
      // console.log({ coloredNewTrends });
      setTrends3(coloredNewTrends);
      logTrendLines(coloredNewTrends);
    };

    const onDrawCompleteAlert3 = (newAlerts) => {
      setEnableTrendLine(false);

      let coloredAlerts = newAlerts?.map((item, ind) => {
        let startIndex = Math.min(Math.floor(item.start[0]), data?.length - 1);
        let startTime = data[startIndex]?.timestamp;

        let endIndex = Math.floor(item?.end[0]);
        let endTime =
          endIndex >= 0 && endIndex < data?.length
            ? data[endIndex]?.timestamp
            : undefined;

        return {
          ...item,
          appearance: {
            ...item.appearance,
            stroke: alertLineArray[ind]?.color || "blue",
            strokeWidth: alertLineArray[ind]?.width || 2,
          },
          startTime,
          endTime,
          name: alertLineArray[ind]?.name || "Alert",
        };
      });

      setAlert3(coloredAlerts);
      logTrendLines(coloredAlerts);
    };

    const onDrawCompleteEntryLine3 = (newAlerts) => {
      setEnableTrendLine(false);

      let coloredAlerts = newAlerts?.map((item, ind) => {
        let startIndex = Math.min(Math.floor(item.start[0]), data?.length - 1);
        let startTime = data[startIndex]?.timestamp;

        let endIndex = Math.floor(item?.end[0]);
        let endTime =
          endIndex >= 0 && endIndex < data?.length
            ? data[endIndex]?.timestamp
            : undefined;

        return {
          ...item,
          appearance: {
            ...item.appearance,
            stroke: entryLineArray[ind]?.color || "blue",
            strokeWidth: entryLineArray[ind]?.width || 2,
          },
          startTime,
          endTime,
          name: entryLineArray[ind]?.name || "EntyLine",
        };
      });

      setEntryLine(coloredAlerts);
      logTrendLines(coloredAlerts);
    };



    const onFibComplete1 = (newRetracements) => {
      console.log("onFibComplete1");
      setEnableFib(false);
      setRetracements1(newRetracements);
      logFibonacciRetracements(newRetracements);
    };

    const onFibComplete3 = (newRetracements) => {
      console.log("onFibComplete3");
      setEnableFib(false);
      setRetracements3(newRetracements);
      logFibonacciRetracements(newRetracements);
    };

    const onChannelComplete1 = (newChannels) => {
      console.log("onChannelComplete1");
      setEnableEquidistantChannel(false);
      setChannels1(newChannels);
      logEquidistantChannels(newChannels);
    };

    const onChannelComplete3 = (newChannels) => {
      console.log("onChannelComplete3");
      setEnableEquidistantChannel(false);
      setChannels1(newChannels);
      logEquidistantChannels(newChannels);
    };


    const onKeyPress = (e) => {

     
  
      const keyCode = e.which;
      console.log(keyCode);
      switch (keyCode) {
        case 46: // DEL
          setTrends1(trends1.filter((each) => !each.selected));
          setTrends3(trends3.filter((each) => !each.selected));
          setAlert3(alert3.filter((each) => !each.selected));
          setEntryLine(entryLine.filter((each) => !each.selected));

          // Delete selected Fibonacci retracements
          setRetracements1(retracements1.filter((each) => !each.selected));
          setRetracements3(retracements3.filter((each) => !each.selected));

          // Delete selected Equidistant Channels
          setChannels1(channels1.filter((each) => !each.selected));

          // Delete selected Interactive Text
          setTextList1(textList1.filter((each) => !each.selected));
          break;
        case 27: // ESC
          node1Ref.current.terminate();
          node3Ref.current.terminate();
          fibNode1Ref.current.terminate();
          fibNode3Ref.current.terminate();
          channelNode1Ref.current.terminate();
          channelNode3Ref.current.terminate();
          setEnableTrendLine(false);
          setEnableFib(false);
          setEnableEquidistantChannel(false);
          break;
        case 71: // G - Enable Interactive Text
          setEnableInteractiveObject(true);
          break;

        case 68: // D - Draw Alert Trendline
          setEnableAlertLine(true);
          setEnableTrendLine(true);
          setEnableEntryLine(true);
          break;

        case 65: // A - Draw Trendline
        setEnableAlertLine(false);
        setEnableTrendLine(false);
        setEnableEntryLine(false);
          break;
        case 69: // E - Enable Fibonacci
          setEnableFib(true);
          break;
        case 70: // F - Enable Equidistant Channel
          setEnableEquidistantChannel(true);
          break;
        default:
          break;
      }
    };


    


    useKeyPress(onKeyPress);
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => new Date(d.date || d.timestamp)
    );

    const macdCalculator = macd()
      .options({
        fast: 12,
        slow: 26,
        signal: 9,
      })
      .merge((d, c) => {
        d.macd = c;
      })
      .accessor((d) => d.macd);

    const { data, xScale, xAccessor, displayXAccessor } =
      xScaleProvider(calculatedData);
    const start = xAccessor(data[Math.max(0, data.length - 75)]);
    const end = xAccessor(last(data));
    const padding = (end - start) * 0.1;
    const xExtents = [start, end + padding];

    const [suffix, setSuffix] = useState(1);

    const handleReset = () => {
      setSuffix(suffix + 1);
    };

    const handleResetTrendLines = () => {
      setTrends3([]);
      alert("Please press submit button to add change in ");
    };
    // const handleResetAlertLines = () => {
    //   setAlert3([]);
    //   alert("Please press submit button to add change in ");
    // };
    const handleResetEntryLines = () => {
      setEntryLine([]);
      alert("Please press submit button to add change in ");
    };

    const MannualTrade = async (id, EntryType, Signal) => {
      try {
        const response = await axios.post(
          `${BASE_URL_OVERALL}/manual/entryExit?id=${id}`,
          {
            EntryType,
            Signal,
          }
        );

        // console.log(response.data.message)
        alert(response.data.message);
      } catch (err) {
        console.log(err);
      }
    };

    return (
      <div className="flex flex-col">

        {window.location.pathname == "/future/back" ? (
          <> </>
        ) : (
          <>
            <hr />
            <div className="flex flex-col gap-4 md:flex-row justify-evenly mt-1">
              {master?.isMaster && (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-around">
                    <button
                      className="bg-green-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() =>
                        MannualTrade(master.id, "INITIAL", "BUY_CE")
                      }
                    >
                      INITIAL Buy CE
                    </button>
                    <button
                      className="bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() => MannualTrade(master.id, "EXIT", "SELL_CE")}
                    >
                      EXIT Sell CE
                    </button>
                  </div>
                </>
              )}

              {master?.isMaster && (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-around">
                    <button
                      className="bg-green-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() =>
                        MannualTrade(master.id, "INITIAL", "BUY_PE")
                      }
                    >
                      INITIAL BUY PE
                    </button>
                    <button
                      className="bg-red-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() => MannualTrade(master.id, "EXIT", "SELL_PE")}
                    >
                      EXIT SELL PE
                    </button>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2 md:flex-row md:justify-around">
       
                <button
                  className="bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                  onClick={handleResetTrendLines}
                >
                  Remove TrendLine
                </button>
                <button
                  className="bg-green-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                  onClick={() =>
                    handleCreateTrendLines(
                      trends3,
                      textList1,
                     
                      alert3,
                      entryLine
                    )
                  }
                >
                  Submit 
                </button>
                <button
                  className="bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                  onClick={handleResetEntryLines}
                >
                  Remove EntryLine
                </button>
              </div>

              {master?.isMaster && (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-around">
                    <button
                      className="bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() =>
                        MannualTrade(master.id, "INITIAL", "SELL_CE")
                      }
                    >
                      INITIAL SELL CE
                    </button>
                    <button
                      className="bg-green-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() => MannualTrade(master.id, "EXIT", "BUY_CE")}
                    >
                      EXIT BUY CE
                    </button>
                  </div>
                </>
              )}

              {master?.isMaster && (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-around">
                    <button
                      className="bg-red-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() =>
                        MannualTrade(master.id, "INITIAL", "SELL_PE")
                      }
                    >
                      INITIAL SELL PE
                    </button>
                    <button
                      className="bg-green-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() => MannualTrade(master.id, "EXIT", "BUY_PE")}
                    >
                      EXIT BUY PE
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}


        <div>
          {data?.length && (
            <ChartCanvas
              id="chartId"
              width={width}
              height={height}
              ratio={ratio}
              margin={margin}
              type={type}
              data={data}
              xScale={xScale}
              xAccessor={xAccessor}
              displayXAccessor={displayXAccessor}
              xExtents={xExtents}
              seriesName={`MSFT_${suffix}`}
            >
              <Chart
                id={1}
                // margin={{ left: 80, right: 80, top: 30, bottom: 50 }}

                yExtents={[
                  (d) => [d.high, d.low, d.pivot - d.dynamicExitValue],
                ]}
                // padding={{ top: 0, bottom: 0 }}
                // yExtents={(d) => [d.high, d.low]} // Ensure proper y-axis scaling based on high/low
                padding={{ top: 20, bottom: 50 }} // Add some padding to prevent squeezing

                // padding={{ top: 10, bottom: 20 }}
                // origin={(w, h) => [0, h - 300]}
                // origin={(_, h) => {
                //   console.log(h);
                //   return [0, h - 300];
                // }}
              >
                <XAxis axisAt="bottom" orient="bottom" ticks={10} />
                <YAxis axisAt="right" orient="right" />

                {showRow.candle && (
                  <CandlestickSeries
                    opacity={1}
                    // fill={(d) =>
                    //   d.close > d.open
                    //     ? d.low >= d.open
                    //       ? "green"
                    //       : "#70e078"
                    //     : d.high <= d.open
                    //     ? "red"
                    //     : "#edbdb8"
                    // }
                    fill={(d) => (d.close > d.open ? "green" : "red")}
                  />
                )}

                <>
                  <InteractiveText
                    ref={saveInteractiveNodes("InteractiveText", 1)}
                    enabled={enableInteractiveObject}
                    text={currentText}
                    textList={textList1}
                    onDragComplete={(textList) => setTextList1(textList)}
                  />

                  {/* <InteractiveText
                  enabled={enableInteractiveObject}
                  text="Lorem ipsum..."
                  onDragComplete={(textList) => setTextList1(textList)}
                  ref={saveInteractiveNodes("InteractiveText", 1)}
                  textList={textList1}
                  origin={(_, h) => {
                    console.log("Chart height:", h); // Add more logging if needed
                    return [0, h ? h - 300 : 0]; // Default to 0 if h is undefined
                  }}
                /> */}

                  {/* <Dialog
                  showModal={showModal}
                  text={currentText}
                  chartId={chartId}
                  onClose={handleDialogClose}
                  onSave={handleTextChange}
                /> */}
                </>

                <LineSeries
                  strokeDasharray="Dash"
                  strokeWidth={2}
                  stroke="blue"
                  yAccessor={(d) => Number(d.CEStopLoss)}
                />
                <LineSeries
                  strokeDasharray="Dash"
                  strokeWidth={2}
                  stroke="orange"
                  yAccessor={(d) => Number(d.PEStopLoss)}
                />
                {/* <LineSeries
                strokeDasharray="Dash"
                strokeWidth={2}
                stroke="green"
                yAccessor={(d) => Number(d.CETargetLevelValue)}
              />
              <LineSeries
                strokeDasharray="Dash"
                strokeWidth={2}
                stroke="red"
                yAccessor={(d) => Number(d.PETargetLevelValue )}
              /> */}

                {showRow.dynamicEntryValue && (
                  <LineSeries
                    strokeWidth={4}
                    stroke="orange"
                    yAccessor={(d) => d.dynamicEntryValue}
                  />
                )}

                {showRow.underlyingValue && (
                  <LineSeries
                    strokeWidth={2}
                    stroke="black"
                    yAccessor={(d) => Number(d.underlyingValue) + 2}
                  />
                )}

                {showRow.initialLow && (
                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={4}
                    stroke="gray"
                    yAccessor={(d) => Number(d.InitialLow)}
                  />
                )}
                {showRow.RangeBoundTargetProfit && (
                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={4}
                    stroke="pink"
                    yAccessor={(d) => Number(d.RangeBoundTargetProfit)}
                  />
                )}
                {showRow.dynamicExitValue && (
                  <LineSeries
                    strokeWidth={4}
                    stroke="blue"
                    yAccessor={(d) =>
                      d?.exitSupport ? Number(d.exitSupport) : undefined
                    }
                  />
                )}
                {showRow.Last_Highest_LTP && (
                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={4}
                    stroke="red"
                    yAccessor={(d) =>
                      d?.Last_Highest_LTP
                        ? Number(d.Last_Highest_LTP)
                        : undefined
                    }
                  />
                )}
                {showRow.movingAvg && (
                  <>
                    <LineSeries
                      strokeWidth={2}
                      stroke="black"
                      yAccessor={(d) => Number(d.movingAvgMA1)}
                    />
                    <LineSeries
                      strokeWidth={3}
                      stroke="red"
                      yAccessor={(d) => Number(d.movingAvgMA2)}
                    />
                  </>
                )}

                {showRow.showAvg && (
                  <>
                    <LineSeries
                      strokeWidth={2}
                      stroke="green"
                      yAccessor={(d) => d.highAvg}
                    />
                    <LineSeries
                      strokeWidth={2}
                      stroke="red"
                      yAccessor={(d) => d.lowAvg}
                    />
                  </>
                )}

                {showRow.rangeBoundLine && (
                  <>
                    <LineSeries
                      strokeWidth={3}
                      stroke="#191970"
                      yAccessor={(d) => d.R_min}
                    />
                    <LineSeries
                      strokeWidth={3}
                      stroke="#191970"
                      yAccessor={(d) => d.R_max}
                    />

                    <LineSeries
                      strokeWidth={2}
                      stroke="#e75480"
                      yAccessor={(d) => d.R_center}
                    />

                    <LineSeries
                      strokeWidth={2}
                      stroke="green"
                      yAccessor={(d) => d.OuterR_min}
                    />

                    <LineSeries
                      strokeWidth={2}
                      stroke="red"
                      yAccessor={(d) => d.OuterR_max}
                    />
                  </>
                )}

                <LineSeries
                  strokeWidth={"3"}
                  stroke="brown"
                  yAccessor={(d) => d.movingAvgWMA}
                />

                {showRow.pivot && (
                  <LineSeries
                    strokeWidth={2}
                    stroke="black"
                    yAccessor={(d) => d.pivot}
                  />
                )}

                {/* {showRow.suppRes && (
          <>
            <LineSeries
              strokeWidth={2}
              stroke="green"
              yAccessor={(d) => d.s1}
            />
            <LineSeries
              strokeWidth={2}
              stroke="green"
              yAccessor={(d) => d.s2}
            />

            <LineSeries
              strokeWidth={4}
              stroke="green"
              yAccessor={(d) => d.s3}
            />
            <LineSeries strokeWidth={2} stroke="red" yAccessor={(d) => d.r1} />
            <LineSeries strokeWidth={3} stroke="red" yAccessor={(d) => d.r2} />
            <LineSeries strokeWidth={4} stroke="red" yAccessor={(d) => d.r3} />
          </>
        )} */}

                {showRow.monthlyHigh && (
                  <>
                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "MonthlyHigh",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.monthlyHigh), // Calculate y position based on yScale
                        fontSize: 20,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the high point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "MonthlyLow",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.monthlyLow), // Calculate y position based on yScale
                        fontSize: 20,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the high point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />
                    <LineSeries
                      strokeWidth={6}
                      stroke="red"
                      yAccessor={(d) => d.monthlyHigh}
                    />
                    <LineSeries
                      strokeWidth={6}
                      stroke="green"
                      yAccessor={(d) => d.monthlyLow}
                    />
                  </>
                )}

                {showRow.weekly && (
                  <>
                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "weeklyHigh",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.weeklyHigh), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the high point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "weeklyLow",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.weeklyLow), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the Low point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />
                    <LineSeries
                      strokeWidth={5}
                      stroke="red"
                      yAccessor={(d) => d.weeklyHigh}
                    />
                    <LineSeries
                      strokeWidth={5}
                      stroke="green"
                      yAccessor={(d) => d.weeklyLow}
                    />
                  </>
                )}

                {showRow.fourHourly && (
                  <>
                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "fourHourlyHigh",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.fourHourlyHigh), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the high point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "fourHourlyLow",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.fourHourlyLow), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the Low point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <LineSeries
                      strokeWidth={3}
                      stroke="red"
                      yAccessor={(d) => d.fourHourlyHigh}
                    />
                    <LineSeries
                      strokeWidth={3}
                      stroke="green"
                      yAccessor={(d) => d.fourHourlyLow}
                    />
                  </>
                )}

                {showRow.hourly && (
                  <>
                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "hourlyHigh",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.hourlyHigh), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the high point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "hourlyLow",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.hourlyLow), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the Low point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />
                    <LineSeries
                      strokeWidth={2}
                      stroke="red"
                      yAccessor={(d) => d.hourlyHigh}
                    />
                    <LineSeries
                      strokeWidth={2}
                      stroke="green"
                      yAccessor={(d) => d.hourlyLow}
                    />
                  </>
                )}

                {showRow.daily && (
                  <>
                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "dailyHigh",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.dailyHigh), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the high point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <Annotate
                      with={LabelAnnotation}
                      when={(d) => d.idx.index === 6}
                      usingProps={{
                        text: "dailyLow",
                        fill: "black",
                        fontFamily: "Arial",
                        y: ({ yScale, datum }) => yScale(datum.dailyLow), // Calculate y position based on yScale
                        fontSize: 14,
                        textAnchor: "middle",
                        yOffset: -10, // Adjust as needed to position the text above the Low point
                        xOffset: 0, // Adjust horizontal offset if necessary
                      }}
                    />

                    <LineSeries
                      strokeWidth={4}
                      stroke="red"
                      yAccessor={(d) => d.dailyHigh}
                    />
                    <LineSeries
                      strokeWidth={4}
                      stroke="green"
                      yAccessor={(d) => d.dailyLow}
                    />
                  </>
                )}

                {showRow.MouseCoordinates && (
                  <>
                    <MouseCoordinateX
                      at="bottom"
                      orient="bottom"
                      displayFormat={timeFormat("%Y-%m-%d")}
                    />
                    <MouseCoordinateY
                      at="right"
                      orient="right"
                      displayFormat={format(".0f")}
                    />
                  </>
                )}
                {showRow.toolTip && (
                  <HoverTooltip
                    yAccessor={(d) => d.underlyingValue}
                    tooltipContent={tooltipContent()}
                    fontSize={15}
                  />
                )}

                {showRow.arrow && (
                  <>
                    <Annotate
                      with={SvgPathAnnotation}
                      when={(d) => d.entryTime != null}
                      usingProps={longAnnotationProps}
                    />
                    <Annotate
                      with={SvgPathAnnotation}
                      when={(d) => d.exitTime != null}
                      usingProps={shortAnnotationProps}
                    />
                  </>
                )}
                {showRow.trendLine && (
                  <>
                    <TrendLine
                      ref={(node) => {
                        node3Ref.current = node;
                      }}
                      enabled={enableTrendLine}
                      type="LINE"
                      snap={false}
                      value={trends3}
                      snapTo={(d) => [d?.high, d?.low]}
                      onStart={() => console.log("START")}
                      onComplete={onDrawCompleteChart3}
                      trends={trends3}
                      // strokeColor="#ededed"  // Example color
                    />

                    <DrawingObjectSelector
                      enabled={!enableTrendLine}
                      getInteractiveNodes={() => ({
                        Trendline: { 1: node1Ref.current, 3: node3Ref.current },
                      })}
                      drawingObjectMap={{
                        Trendline: "trends",
                      }}
                      onSelect={handleSelection}
                    />
                  </>
         
                )}
                {showRow.alertLine && (
                  <>
                    <TrendLine
                      ref={(node) => {
                        alertLineNodeRef.current = node;
                      }}
                      enabled={enableAlertLine}
                      type="LINE"
                      snap={false}
                      value={alert3}
                      snapTo={(d) => [d?.high, d?.low]}
                      onStart={() => console.log("Alert Line Start")}
                      onComplete={onDrawCompleteAlert3}
                      trends={alert3}
                    />
                          <DrawingObjectSelector
                      enabled={!enableAlertLine}
                      getInteractiveNodes={() => ({
                        AlertLine: { 1:  alertLineNodeRef.current, 3:  alertLineNodeRef.current},
                      })}
                      drawingObjectMap={{
                        AlertLine: "alert",
                      }}
                      onSelect={handleSelection}
                    />
     
                  </>
                )}
                {showRow.entryLine && (
                  <>
                    <TrendLine
                      ref={(node) => {
                        entryLineNodeRef.current = node;
                      }}
                      enabled={enableEntryLine}
                      type="LINE"
                      snap={false}
                      value={entryLine}
                      snapTo={(d) => [d?.high, d?.low]}
                      onStart={() => console.log("Entry Line Line Start")}
                      onComplete={onDrawCompleteEntryLine3}
                      trends={entryLine}
                    />
                          <DrawingObjectSelector
                      enabled={!enableEntryLine}
                      getInteractiveNodes={() => ({
                        EntryLine: { 1:  entryLineNodeRef.current, 3:  entryLineNodeRef.current},
                      })}
                      drawingObjectMap={{
                        EntryLine: "EntryLine",
                      }}
                      onSelect={handleSelection}
                    />
     
                  </>
                )}

                {showRow.fibonacci && (
                  <>
                    <FibonacciRetracement
                      ref={fibNode1Ref}
                      enabled={enableFib}
                      type="BOUND"
                      retracements={retracements1}
                      onComplete={onFibComplete1}
                    />
                    <FibonacciRetracement
                      ref={fibNode3Ref}
                      enabled={enableFib}
                      type="BOUND"
                      retracements={retracements3}
                      onComplete={onFibComplete3}
                    />
                    <DrawingObjectSelector
                      enabled={!enableFib}
                      getInteractiveNodes={() => ({
                        FibonacciRetracement: {
                          1: fibNode1Ref.current,
                          3: fibNode3Ref.current,
                        },
                      })}
                      drawingObjectMap={{
                        FibonacciRetracement: "retracements",
                      }}
                      onSelect={handleSelection}
                    />
                  </>
                )}

                {showRow.equidistantChannel && (
                  <>
                    <EquidistantChannel
                      ref={channelNode1Ref}
                      enabled={enableEquidistantChannel}
                      type="RAY"
                      onComplete={onChannelComplete1}
                      channels={channels1}
                    />
                    <EquidistantChannel
                      ref={channelNode3Ref}
                      enabled={enableEquidistantChannel}
                      type="RAY"
                      onComplete={onChannelComplete3}
                      channels={channels1}
                    />
                    <DrawingObjectSelector
                      enabled={!enableEquidistantChannel}
                      getInteractiveNodes={() => ({
                        EquidistantChannel: {
                          1: channelNode1Ref.current,
                          3: channelNode3Ref.current,
                        },
                      })}
                      drawingObjectMap={{
                        EquidistantChannel: "channels",
                      }}
                      onSelect={handleSelection}
                    />
                  </>
                )}
                <MACDSeries yAccessor={(d) => d.macd} {...macdAppearance} />

                {/* <MACDTooltip
              origin={[-38, 15]}
              yAccessor={(d) => d.macd}
              options={macdCalculator.options()}
              appearance={macdAppearance}
               /> */}

                <ZoomButtons onReset={handleReset} />
              </Chart>

              <Chart
                id={2}
                height={150}
                yExtents={[(d) => d.volume]}
                origin={(w, h) => [0, h - 150]}
              >
                {showRow?.volume && (
                  <BarSeries
                    yAccessor={(d) => d.volume}
                    fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                  />
                )}
              </Chart>
              <DrawingObjectSelector
                enabled={enableInteractiveObject}
                getInteractiveNodes={getInteractiveNodes}
                drawingObjectMap={{ InteractiveText: "textList" }}
                onSelect={handleSelections}
              />
              {showRow.MouseCoordinates && <CrossHairCursor stroke="blue" />}
            </ChartCanvas>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // window.location.reload();
  }
};
const EnhancedCandleChart = fitWidth(CandleChart);
export default memo((props) => (
  <ErrorBoundary>
    <EnhancedCandleChart {...props} />
  </ErrorBoundary>
));

export const LiveGraph = () => {
  const { config, tradeConfig } = useConfig();
  const [date, setDate] = useState("");
  const [apiData, setApiData] = useState([]);
  let width = useMemo(() => window.screen.width, []);
  let height = useMemo(() => window.screen.height, []);
  const [showRow, setShowRow] = useState({
    showAvg: true,
  });
  const { isConnected, socket } = useLiveSocket();
  const [socketData, setSocketData] = useState([]);

  useEffect(() => {
    if (!isConnected) return;
    const throttledSetData = throttle((message) => {
      setSocketData(message);
      setApiData((p) => {
        let newArr = [...p];
        if (newArr.length < 2) return newArr;

        let last = {
          CESecondVolume: undefined,
          CESecondVolumeStrike: undefined,
          CESecondhoi: undefined,
          CESecondhoiStrike: undefined,
          CEVolume: undefined,
          CEVolumeStrike: undefined,
          CEhoi: undefined,
          CEhoiStrike: undefined,
          PESecondVolume: undefined,
          PESecondVolumeStrike: undefined,
          PESecondhoi: undefined,
          PESecondhoiStrike: undefined,
          PEVolume: undefined,
          PEVolumeStrike: undefined,
          PEhoi: undefined,
          PEhoiStrike: undefined,
          close: message.last_price,
          high:
            newArr[newArr.length - 1].high > message.last_price
              ? newArr[newArr.length - 1].high
              : message.last_price,
          low:
            newArr[newArr.length - 1].low < message.last_price
              ? newArr[newArr.length - 1].low
              : message.last_price,
          open:
            (newArr[newArr.length - 2].open + newArr[newArr.length - 2].close) /
            2,
          pivot: (message?.ohlc?.high + message?.ohlc?.low) / 2,
          timestamp: message.exchange_timestamp,
        };

        newArr[newArr.length - 1] = last;
        return newArr;
      });
    }, 1000);

    socket.on("getLiveData", (message) => {
      if (!message) return;
      throttledSetData(message);
    });

    return () => {
      socket.off("getLiveData");
      throttledSetData.cancel();
    };
  }, [socket, isConnected]);

  const getPrevDate = async () => {
    await axios
      .get(
        `https://www.pesonline12.in/sharemarket/history/getPrevDates?symbol=BANKNIFTY`
      )
      .then((res) => {
        // console.log("prevDate",res.data.data)
        setDate(res?.data?.data[0]?.prevDate);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getLiveGraphData = async () => {
    axios
      .get(
        `${tradeConfig.url}/chart?timeStamp1=${config.tradeInTime}&timeStamp2=${date}&interval=${config.interval}&instrumentToken=${config.instrument_token}`
      )
      .then((res) => {
        // console.log("response",res.data)
        let entryTime = null;
        let exitTime = null;
        let pivotAtEntry = null;
        let processedData = [];

        for (let i = 0; i < res?.data?.mergedData.length; i++) {
          let candle = res.data.mergedData[i];
          let pivot = candle.pivot;

          if (candle.entryTime) {
            entryTime = candle.entryTime;
            pivotAtEntry = pivot;
          } else if (candle.exitTime) {
            exitTime = candle.exitTime;
            pivotAtEntry = null; // Reset pivotAtEntry when exitTime is encountered
          }

          let processedCandle = { ...candle };
          if (pivotAtEntry !== null && !candle.exitTime) {
            let pivotDifference = pivot - pivotAtEntry;
            processedCandle.pivotDifference = pivotDifference;
          }
          processedData.push(processedCandle);
        }

        setApiData(processedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getPrevDate();
    if (
      !config.tradeInTime ||
      !config.tradeOutTime ||
      !config.interval ||
      !config.instrument_token ||
      !date
    ) {
      return;
    }

    getLiveGraphData();
    const interval = setInterval(getLiveGraphData, 10 * 1000);
    return () => clearInterval(interval);
  }, [
    config.tradeInTime,
    config.tradeOutTime,
    config.interval,
    config.instrument_token,
    date,
  ]);
  //  console.log("apiData",apiData)
  return (
    <div>
      <div className="p-4 flex justify-center ">
        <p className="text-xl text-red-500 font-semibold">
          LTP: {socketData?.last_price}
        </p>
      </div>
      {apiData?.length > 0 && (
        <CandleChart
          data={apiData}
          getMoreData={() => {}}
          ratio={1}
          width={width}
          showRow={showRow}
          // xExtents={xExtents}
          height={(height * 7) / 10}
        />
      )}
    </div>
  );
};
