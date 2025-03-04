import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
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
  RSISeries,
  BollingerSeries,
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
import { ema, macd, sma, bollingerBand } from "react-stockcharts/lib/indicator";
import ErrorBoundary from "@/hooks/error-boundary.jsx";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { useInteractiveNodes } from "./interactiveutils";
import { getMorePropsForChart } from "react-stockcharts/lib/interactive/utils";
// import { saveInteractiveNodes, getInteractiveNodes } from "./interactiveutils";
// import { Modal, Button, FormGroup, FormControl } from "react-bootstrap";
//import Dialog from "@/modals/dialog-modal";
import { useModal } from "@/hooks/use-modal";
import { rsi, atr } from "react-stockcharts/lib/indicator";
import {
  RSITooltip,
  SingleValueTooltip,
  BollingerBandTooltip,
} from "react-stockcharts/lib/tooltip";

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
          label: "Candle Index", // Display index instead of length
          value: currentItem.index,
          stroke: "black",
        },
        {
          label: "Open", // Display index instead of length
          value: currentItem.open,
          stroke: "black",
        },
        {
          label: "Close", // Display index instead of length
          value: currentItem.close,
          stroke: "black",
        },
        {
          label: "High", // Display index instead of length
          value: currentItem.high,
          stroke: "black",
        },
        {
          label: "Low", // Display index instead of length
          value: currentItem.low,
          stroke: "black",
        },

        // {
        //   label: "Last highest LTP",
        //   value: currentItem?.Last_Highest_LTP?.toFixed(2),
        //   stroke: "black",
        // },

        // {
        //   label: "Candle close",
        //   value: currentItem?.close && formatPrice(currentItem?.close),
        //   stroke: "black",
        // },
        {
          label: "Candle Size",
          value: (currentItem?.close - currentItem?.open)?.toFixed(2),
          stroke: currentItem?.close - currentItem?.open < 0 ? "red" : "green",
        },
        // {
        //   label: "Wick",
        //   value: (currentItem?.high - currentItem?.close)?.toFixed(2),
        // },
        {
          label: "Candle Ratio",
          value: (((currentItem?.close - currentItem?.open)/(currentItem?.high - currentItem?.low))*100)?.toFixed(2),
        },

        // {
        //   label: "D_Exit_Value",
        //   value: currentItem?.dynamicExitValue?.toFixed(2),
        //   stroke: "black",
        // },

        {
          label: "Last Lowest LTP",
          value: currentItem?.InitialLow?.toFixed(2),
          stroke: "black",
        },

        // {
        //   label: "volume",
        //   value: currentItem?.volume?.toFixed(2),
        //   stroke: "black",
        // },
        {
          label: "RSI",
          value: currentItem?.rsi?.toFixed(2),
          stroke: "black",
        },
        {
          label: "ATR",
          value: currentItem?.atr?.toFixed(2),
          stroke: "black",
        },
      ].filter((line) => line?.value),
    };
  };
}

const bbStroke = {
  top: "#964B00",
  middle: "#000000",
  bottom: "#964B00",
};
const bbFill = "#4682B4";

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

// const macdAppearance = {
//   stroke: {
//     macd: "#FF0000",
//     signal: "#00F300",
//   },
//   fill: {
//     divergence: "#4682B4",
//   },
// };

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

const entryLineArray = [
  { color: "green", name: "Resistance" },
  { color: "violet", name: "Call Target Line" },
  { color: "red", name: "Support" },
  { color: "orange", name: "Put Target Line" },
];
const AlertLineArray = [
  { color: "green", name: "AlertLine1", strokeWidth: 3 },
  { color: "violet", name: "AlertTarget1", strokeWidth: 3 },
  { color: "red", name: "AlertLine2", strokeWidth: 3 },
  { color: "orange", name: "AlertTarget2", strokeWidth: 3 },
];

const CandleChart = ({
  //  handleCreateTrendLines,
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
  setEntryLine,
  noActionLine,
  setNoActionLine,
  setHorizontalLine,
  horizontalLine,
  id,
  getChartData,
  buyTrendLineDate,
  tradeStatus,
}) => {
  try {
    const { onOpen } = useModal();
    const { getInteractiveNodes, saveInteractiveNodes } = useInteractiveNodes();
    const [enableAlertLine, setEnableAlertLine] = useState(false);
    const [enableEntryLine, setEnableEntryLine] = useState(false);
    const [enableNoActionLine, setEnableNoActionLine] = useState(false);
    const [enableHorizontalLine, setEnableHorizontalLine] = useState(false);
    const [enableInteractiveObject, setEnableInteractiveObject] =
      useState(false);

    const [textList1, setTextList1] = useState();
    // JSON.parse(intractiveData?.textLabel)

    const [textList3, setTextList3] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [chartId, setChartId] = useState(null);

    // const canvasNode = useRef(null);

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
    const [activeLineType, setActiveLineType] = useState(null); // 'entryLine' | 'alertLine' | null

    const logTrendLines = (trends) => {
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
      setAlert3(state.alert_3 || alert3);
      setNoActionLine(state.noActionLine || noActionLine);
      //setHorizontalLine(state.horizontalLine || horizontalLine )
    };

    const onDrawCompleteChart3 = (newTrends) => {
      // setEnableTrendLine(false);
      

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

    // const DEGREE_TO_RADIAN = Math.PI / 180;
    // const DEFAULT_ANGLE = 80; // Default angle in degrees
    // const MINUTES_PER_CANDLE = 5; // Assuming 5-minute candles

    // const onDrawCompleteChart3 = (newTrends) => {
    //   let coloredNewTrends = newTrends?.map((item, ind) => {
    //     // Calculate slope from the angle
    //     const slope = Math.tan(DEFAULT_ANGLE * DEGREE_TO_RADIAN);

    //     // Start point
    //     let startIndex = Math.min(Math.floor(item.start[0]), data?.length - 1);
    //     let startPrice = item.start[1];
    //     let startTime = data[startIndex]?.timestamp;

    //     // Calculate end point (150 candles ahead by default)
    //     let endIndex = startIndex + 50;
    //     let endPrice = startPrice + slope * (endIndex - startIndex); // y = mx + b

    //     // Ensure endIndex stays within data bounds
    //     if (endIndex >= data.length) {
    //       endIndex = data.length - 1;
    //       endPrice = startPrice + slope * (endIndex - startIndex);
    //     }
    //     let endTime = data[endIndex]?.timestamp;

    //     // Return the new trendline object
    //     return {
    //       ...item,
    //       end: [endIndex, endPrice],
    //       appearance: {
    //         ...item.appearance,
    //         stroke: trendLineArray[ind]?.color || "blue",
    //         strokeWidth: trendLineArray[ind]?.width || 2,
    //       },
    //       startTime,
    //       endTime,
    //       name: trendLineArray[ind]?.name || "Trend",
    //     };
    //   });

    //   // Set the new trends and log them
    //   setTrends3(coloredNewTrends);
    //   logTrendLines(coloredNewTrends);
    // };

    const hasIncompleteLine = (lines, trendLineNames) => {
      return lines?.some(
        (line) =>
          trendLineNames.includes(line?.name) &&
          (line?.endTime === null || line?.endTime === undefined)
      );
    };

    const sendDataToAPI = async (data) => {
      const trendLineNames = [
        "Support",
        "Resistance",
        "Call Target Line",
        "Put Target Line",
        "AlertLine1",
        "AlertLine2",
      ];
      //console.log(data)

      if (
        hasIncompleteLine(data?.buyTrendLines, trendLineNames) ||
        hasIncompleteLine(data?.analysisLine, trendLineNames)
      ) {
        alert("Please Draw Line Inside The Chart");
        //   await getChartData();
        return;
      }

      try {
        await axios.put(`${BASE_URL_OVERALL}/config/edit`, { id, ...data });
        //   await getChartData();
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    const onDrawCompleteAlert3 = (newAlerts) => {
     
      setEnableAlertLine(false);

      let coloredAlerts = newAlerts?.map((item, ind) => {
        let startIndex = Math.min(Math.floor(item.start[0]), data?.length - 1);
        let startTime = data[startIndex]?.timestamp;

        let endIndex = Math.floor(item?.end[0]);
        let endTime =
          endIndex >= 0 && endIndex < data?.length
            ? data[endIndex]?.timestamp
            : undefined;

        // Check if the index is within the AlertLineArray bounds
        let color =
          ind < AlertLineArray.length ? AlertLineArray[ind]?.color : "black";
        let name =
          ind < AlertLineArray.length ? AlertLineArray[ind]?.name : "Alert";
        let width =
          ind < AlertLineArray.length ? AlertLineArray[ind]?.strokeWidth : 2;

        return {
          ...item,
          appearance: {
            ...item.appearance,
            stroke: color,
            strokeWidth: width,
          },
          startTime,
          endTime,
          name,
        };
      });

      setAlert3(coloredAlerts);
      logTrendLines(coloredAlerts);
      setActiveLineType(null);
      sendDataToAPI(
        { analysisLine: coloredAlerts, buyTrendLineDate: buyTrendLineDate },
        "/config/edit",
        "Alert lines saved."
      );
    };

    const onDrawCompleteNoAction = (newAlerts) => {
      setEnableNoActionLine(false);
      let coloredAlerts = newAlerts?.map((item, ind) => {
        let startIndex = Math.min(Math.floor(item.start[0]), data?.length - 1);
        let startTime = data[startIndex]?.timestamp;

        let endIndex = Math.floor(item?.end[0]);
        let endTime =
          endIndex >= 0 && endIndex < data?.length
            ? data[endIndex]?.timestamp
            : undefined;

        // Check if the index is within the AlertLineArray bounds

        return {
          ...item,
          appearance: {
            ...item.appearance,
            stroke: "blue",
            strokeWidth: 1,
          },
          startTime,
          endTime,
        };
      });

      setNoActionLine(coloredAlerts);
      logTrendLines(coloredAlerts);
      setActiveLineType(null);
      sendDataToAPI(
        { trendLines: coloredAlerts },
        "/config/edit",
        "Extra lines saved."
      );
    };

    const onDrawCompleteHorizontal = (newAlerts) => {
      setEnableHorizontalLine(false);

      // Ensure the line spans from the first candle to the last candle
      let coloredAlerts = newAlerts?.map((item) => {
        let startIndex = 0; // First candle
        let endIndex = data?.length - 1; // Last candle

        // Get the timestamp for the first and last candles
        let startTime = data[startIndex]?.timestamp;
        let endTime = data[endIndex]?.timestamp;

        return {
          ...item,
          start: [startIndex, item.start[1]], // Keep the y-coordinate same, adjust x to start at the first candle
          end: [endIndex, item.start[1]], // Keep the y-coordinate same, adjust x to end at the last candle
          appearance: {
            ...item.appearance,
            stroke: "black",
            strokeWidth: 1,
          },
          startTime,
          endTime,
        };
      });

      // Update state and send data
      setHorizontalLine(coloredAlerts);
      logTrendLines(coloredAlerts);
      setActiveLineType(null);
      sendDataToAPI(
        { horizontalLine: coloredAlerts },
        "/config/edit",
        "Horizontal lines saved."
      );
    };

    const onDrawCompleteEntryLine3 = (newAlerts) => {
   
      setEnableEntryLine(false);
      let coloredAlerts = newAlerts?.map((item, ind) => {
        let startIndex = Math.min(Math.floor(item.start[0]), data?.length - 1);
        let startTime = data[startIndex]?.timestamp;

        let endIndex = Math.floor(item?.end[0]);
        let endTime =
          endIndex >= 0 && endIndex < data?.length
            ? data[endIndex]?.timestamp
            : undefined;

        // Determine the stroke color
        let strokeColor;

        if (item.name === "CESellLine") {
          strokeColor = "green"; // Fixed color for CESellLine
        } else if (item.name === "PESellLine") {
          strokeColor = "red"; // Fixed color for PESellLine
        } else if (item.name === "PEBuyLine") {
          strokeColor = "green"; // Fixed color for PESellLine
        } else if (item.name === "CEBuyLine") {
          strokeColor = "red"; // Fixed color for CEBuyLine
        } else if (item.name === "FUTSellLine") {
          strokeColor = "green"; // Fixed color for CEBuyLine
        } else if (item.name === "FUTBuyLine") {
          strokeColor = "red"; // Fixed color for CEBuyLine
        } else if (ind < 4) {
          // Use colors and names from entryLineArray for the first four lines
          strokeColor = entryLineArray[ind]?.color || "blue";
        } else {
          // Default to blue for any additional lines beyond the first four
          strokeColor = "blue";
        }

        // Assign name based on index or fallback to "Unnamed-Line"
        const lineName =
          item.name || entryLineArray[ind]?.name || `Unnamed-Line ${ind + 1}`;

        return {
          ...item,
          appearance: {
            ...item.appearance,
            stroke: strokeColor,
            strokeWidth: item.appearance.strokeWidth || 2,
          },
          startTime,
          endTime,
          name: lineName, // Assigning the final name here
        };
      });

      setEntryLine(coloredAlerts);
      logTrendLines(coloredAlerts); // Log trend lines with names and colors for debugging
      setActiveLineType(null);
      sendDataToAPI(
        { buyTrendLines: coloredAlerts, buyTrendLineDate: buyTrendLineDate },
        "/config/edit",
        "Entry lines saved."
      );
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
      //console.log(keyCode);
      switch (keyCode) {
        case 46: // DEL
          setTrends1(trends1.filter((each) => !each.selected));
          setTrends3(trends3.filter((each) => !each.selected));
          setAlert3(alert3.filter((each) => !each.selected));
          // setEntryLine(entryLine.filter((each) => !each.selected));

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
          // setEnableAlertLine(true);
          // setEnableTrendLine(true);
          handleActivateEntryLine();
          setEnableEntryLine(true);
          break;

        case 65: // A - Draw Trendline
          setEnableAlertLine(true);
          // setEnableTrendLine(false);
          // setEnableEntryLine(false);
          handleActivateAlertLine();
          break;
        case 69: // E - Enable Fibonacci
          setEnableFib(true);
          break;
        case 82: // R- Enable Horizontal
          setEnableHorizontalLine(true);
          handleActivateAlertLine();
          break;
        case 70: // F - Enable Equidistant Channel
          //setEnableEquidistantChannel(true);
          setEnableNoActionLine(true);
          handleActivateActionLine();
          break;
        default:
          break;
      }
    };

    useKeyPress(onKeyPress);

    const rsiCalculator = rsi()
      .options({ windowSize: master?.rsiCandle ?? 14 }) // 14-period RSI
      .merge((d, c) => {
        // console.log(d.rsi, c)
        d.rsi = c;
      })
      .accessor((d) => d.rsi);

    const atrCalculator = atr()
      .options({ windowSize: master?.rsiCandle ?? 14 }) // 14-period ATR
      .merge((d, c) => {
        d.atr = c;
      })
      .accessor((d) => d.atr);

    const bb = bollingerBand()
      .merge((d, c) => {
        d.bb = c;
      })
      .accessor((d) => d.bb);

    const dataWithIndicators = atrCalculator(rsiCalculator(bb(initialData)));
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => new Date(d.date || d.timestamp)
    );

    const { data, xScale, xAccessor, displayXAccessor } =
      xScaleProvider(dataWithIndicators);
    // xScaleProvider(calculatedData);

    const start = xAccessor(data[Math.max(0, data.length - 120)]);
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

    const handleResetAlertLine = () => {
      const updatedAlert3 = []; // Define the updated value
      setAlert3(updatedAlert3); // Update the state
      sendDataToAPI(
        {
          analysisLine: updatedAlert3,
          buyTrendLineDate: null,
          callLine: 0,
          putLine: 0,
          callLine2: 0,
          putLine2: 0,
          CELine: 0,
          PELine: 0,
        },
        "/config/edit",
        "Alert lines saved."
      );
    };

    const handleResetEntryLines = () => {
      const updatedAlert3 = [];
      setEntryLine(updatedAlert3);
      sendDataToAPI(
        {
          buyTrendLines: updatedAlert3,
          buyTrendLineDate: null,
          callLine: 0,
          putLine: 0,
          callLine2: 0,
          putLine2: 0,
          CELine: 0,
          PELine: 0,
        },
        "/config/edit",
        "Alert lines saved."
      );
    };
    const handleResetActionLines = () => {
      const updatedAlert3 = [];
      setNoActionLine(updatedAlert3);
      sendDataToAPI(
        { trendLines: updatedAlert3 },
        "/config/edit",
        "Extra lines saved."
      );
    };
    const handleResetHorizontalLines = () => {
      const updatedAlert3 = [];
      setHorizontalLine(updatedAlert3);
      sendDataToAPI(
        { horizontalLine: updatedAlert3 },
        "/config/edit",
        "Horizontal lines saved."
      );
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

    const handleActivateEntryLine = () => {
      setActiveLineType("entryLine");
      setEnableEntryLine(true);
      setEnableAlertLine(false);
      setEnableNoActionLine(false);
      setEnableHorizontalLine(false);
    };

    const handleActivateAlertLine = () => {
      
      setActiveLineType("alertLine");
      setEnableAlertLine(true);
      setEnableEntryLine(false);
      setEnableNoActionLine(false);
      setEnableHorizontalLine(false);
    };

    const handleActivateActionLine = () => {
      setActiveLineType("noActionLine");
      setEnableAlertLine(false);
      setEnableEntryLine(false);
      setEnableNoActionLine(true);
      setEnableHorizontalLine(false);
    };
    const handleActivateHorizontalLine = () => {
      setActiveLineType("horizontalLine");
      setEnableAlertLine(false);
      setEnableEntryLine(false);
      setEnableNoActionLine(false);
      setEnableHorizontalLine(true);
    };

    // console.log("Hii")
    return (
      <div className="flex flex-col">
        {window.location.pathname == "/future/back" ? (
          <></>
        ) : (
          <>
            <hr />
            <div className="flex flex-col gap-4 md:flex-row justify-evenly mt-1">
           
                <div className="flex flex-col gap-2 md:flex-row md:justify-around">
               
                    <button
                      disabled={
                        tradeStatus?.haveTradeOfCE ||
                        tradeStatus?.haveTradeOfPE ||
                        tradeStatus?.haveTradeOfCEBuy ||
                        tradeStatus?.haveTradeOfPEBuy ||
                        tradeStatus?.haveTradeOfFUTSell ||
                        tradeStatus?.haveTradeOfFUTBuy
                      }
                      className="bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={handleResetAlertLine}
                    >
                      Remove EntryLine2
                    </button>
                

    
                  <button
                    disabled={
                      tradeStatus?.haveTradeOfCE ||
                      tradeStatus?.haveTradeOfPE ||
                      tradeStatus?.haveTradeOfCEBuy ||
                      tradeStatus?.haveTradeOfPEBuy ||
                      tradeStatus?.haveTradeOfFUTSell ||
                      tradeStatus?.haveTradeOfFUTBuy
                    }
                    className="bg-red-600 hover:bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                    onClick={handleResetEntryLines}
                  >
                    Remove EntryLine1
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                    onClick={handleResetActionLines}
                  >
                    Remove ExtraLine
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-600 px-2 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                    onClick={handleResetHorizontalLines}
                  >
                    Remove HorizontalLines
                  </button>

                  <div className="flex flex-col gap-2 md:flex-row md:justify-around">
                    <button
                      className={`px-2 py-1 rounded-sm w-full md:w-fit mx-auto ${
                        activeLineType === "alertLine"
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                      onClick={handleActivateAlertLine}
                    >
                      Activate Entry Line2
                    </button>
                    <button
                      className={`px-2 py-1 rounded-sm w-full md:w-fit mx-auto ${
                        activeLineType === "entryLine"
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                      onClick={handleActivateEntryLine}
                    >
                      Activate Entry Line1
                    </button>
                    <button
                      className={`px-2 py-1 rounded-sm w-full md:w-fit mx-auto ${
                        activeLineType === "noActionLine"
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                      onClick={handleActivateActionLine}
                    >
                      Extra Line
                    </button>
                    <button
                      className={`px-2 py-1 rounded-sm w-full md:w-fit mx-auto ${
                        activeLineType === "horizontalLine"
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                      onClick={handleActivateHorizontalLine}
                    >
                      Horizontal Line
                    </button>
                  </div>
                </div>
           
            </div>
          </>
        )}

        <div>
          {data?.length && (
            <>
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

                  // yExtents={[
                  //   (d) => [d.high, d.low, d.pivot - d.dynamicExitValue],
                  // ]}
                  yExtents={[(d) => [d.high, d.low]]}
                  // padding={{ top: 0, bottom: 0 }}
                  // yExtents={(d) => [d.high, d.low]} // Ensure proper y-axis scaling based on high/low
                  padding={{ top: 100, bottom: 150 }} // Add some padding to prevent squeezing
                >
                  <XAxis axisAt="bottom" orient="bottom" ticks={10} />
                  <YAxis axisAt="right" orient="right" />

                  {showRow.candle && (
                    // <CandlestickSeries
                    //   opacity={1}
                    //   // fill={(d) =>
                    //   //   d.close > d.open
                    //   //     ? d.low >= d.open
                    //   //       ? "green"
                    //   //       : "#70e078"
                    //   //     : d.high <= d.open
                    //   //     ? "red"
                    //   //     : "#edbdb8"
                    //   // }
                    //   fill={(d) => (d.close > d.open ? "green" : "red")}
                    // />

                    <CandlestickSeries
                      opacity={1}
                      fill={(d) => (d.close > d.open ? "#089981" : "#f23645")}
                      widthRatio={0.6} // Adjust this value to control candle width and spacing
                    />
                  )}

                  {showRow?.bollingerBand && (
                    <>
                      <BollingerSeries
                        yAccessor={(d) => d.bb}
                        stroke={bbStroke}
                        fill={bbFill}
                      />
                      <BollingerBandTooltip
                        origin={[-38, 60]}
                        yAccessor={(d) => d.bb}
                        options={bb.options()}
                      />
                    </>
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
                  {showRow.dEntryLine && (
                    <>
                      <LineSeries
                        strokeDasharray="Dash"
                        strokeWidth={1}
                        stroke="blue"
                        yAccessor={(d) => Number(d.dEntry1)}
                      />
                      <LineSeries
                        strokeDasharray="Dash"
                        strokeWidth={1}
                        stroke="blue"
                        yAccessor={(d) => Number(d.dEntry2)}
                      />
                    </>
                  )}

                  {showRow.ceEntryLine && (
                    <>
                      {master.callLine && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={1}
                          stroke="blue"
                          yAccessor={(d) => Number(d.DEntryCE1)}
                        />
                      )}

                      {master.callLine2 && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={2}
                          stroke="blue"
                          yAccessor={(d) => Number(d.DEntryCE1)}
                        />
                      )}

                      {master.callLine && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={1}
                          stroke="blue"
                          yAccessor={(d) => Number(d.DEntryCE2)}
                        />
                      )}

                      {master.callLine2 && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={2}
                          stroke="blue"
                          yAccessor={(d) => Number(d.DEntryCE2)}
                        />
                      )}
                    </>
                  )}

                  {showRow.peEntryLine && (
                    <>
                      {master.putLine && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={1}
                          stroke="brown"
                          yAccessor={(d) => Number(d.DEntryPE2)}
                        />
                      )}
                      {master.putLine2 && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={2}
                          stroke="brown"
                          yAccessor={(d) => Number(d.DEntryPE2)}
                        />
                      )}
                      {master.putLine && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={1}
                          stroke="brown"
                          yAccessor={(d) => Number(d.DEntryPE1)}
                        />
                      )}
                      {master.putLine2 && (
                        <LineSeries
                          strokeDasharray="Dash"
                          strokeWidth={2}
                          stroke="brown"
                          yAccessor={(d) => Number(d.DEntryPE1)}
                        />
                      )}
                    </>
                  )}

                  {showRow?.stopLoss && (
                    <>
                      <LineSeries
                        strokeDasharray="Dash"
                        strokeWidth={4}
                        stroke="red"
                        yAccessor={(d) =>
                          d.stopLoss != null ? Number(d.stopLoss) : undefined
                        }
                      />
                    </>
                  )} 

                  {showRow?.stopLoss && (
                  
                    <>
                      <LineSeries
                        strokeDasharray="Dash"
                        strokeWidth={2}
                        stroke="red"
                        yAccessor={(d) =>
                          d.stopLoss2 != null ? Number(d.stopLoss2) : undefined
                        }
                      />
                    </>                 
                  )}

                  {master?.tradeIndex == 2 && showRow?.targetLine && (
                    <LineSeries
                      strokeWidth={4}
                      stroke="violet"
                      yAccessor={(d) =>
                        d.targetPrice != null
                          ? Number(d.targetPrice)
                          : undefined
                      }
                    />
                  )}
                  {master?.tradeIndex == 2 && showRow?.targetLine && (
                    <LineSeries
                      strokeWidth={2}
                      stroke="violet"
                      yAccessor={(d) =>
                        d.targetPrice2 != null
                          ? Number(d.targetPrice2)
                          : undefined     
                      }
                    />
                  )}

                  {master?.tradeIndex == 12 && (
                    <LineSeries
                      strokeWidth={2}
                      stroke="orange"
                      yAccessor={(d) =>
                        d.targetPrice != null
                          ? Number(d.targetPrice)
                          : undefined
                      }
                    />
                  )}

                  {
                    showRow.entryPivotValue && (
                      <LineSeries
                      strokeWidth={2}
                      stroke="green"
                      yAccessor={(d) =>
                        d.entryPivotValue != null
                          ? Number(d.entryPivotValue)
                          : undefined
                      }
                    />
                    )
                  }
                

                  {showRow?.dExitLine && (
                    <>
                      <LineSeries
                        strokeWidth={2}
                        stroke="red"
                        yAccessor={(d) =>
                          d.dynamicExitValue != null
                            ? Number(d.dynamicExitValue)
                            : undefined
                        }
                      />
                    </>
                  )}

                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={2}
                    stroke="orange"
                    yAccessor={(d) => Number(d.PEStopLoss)}
                  />

                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={3}
                    stroke="green"
                    yAccessor={(d) => Number(d.CEStopLossForIndex7)}
                  />

                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={3}
                    stroke="red"
                    yAccessor={(d) => Number(d.PEStopLossForIndex7)}
                  />
                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={4}
                    stroke="red"
                    yAccessor={(d) => Number(d.CEStopLossForIndex17)}
                  />

                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={4}
                    stroke="green"
                    yAccessor={(d) => Number(d.PEStopLossForIndex17)}
                  />
                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={2}
                    stroke="green"
                    yAccessor={(d) => Number(d.FUTStopLossForIndex7)}
                  />
                  <LineSeries
                    strokeDasharray="Dash"
                    strokeWidth={2}
                    stroke="red"
                    yAccessor={(d) => Number(d.FUTStopLossForIndex17)}
                  />

                  {showRow.Last_Highest_LTP && (
                    <LineSeries
                      strokeDasharray="Dash"
                      strokeWidth={4}
                      stroke="blue"
                      yAccessor={(d) =>
                        d?.Last_Highest_LTP
                          ? Number(d.Last_Highest_LTP)
                          : undefined
                      }
                    />
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

                  {showRow.pivot && (
                    <LineSeries
                      strokeWidth={2}
                      stroke="black"
                      yAccessor={(d) => d.pivot}
                    />
                  )}

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
                      <Annotate
                        with={LabelAnnotation}
                        when={(d) => d.idx.index === 6}
                        usingProps={{
                          text: "MonthlyClose",
                          fill: "black",
                          fontFamily: "Arial",
                          y: ({ yScale, datum }) => yScale(datum.monthlyClose), // Calculate y position based on yScale
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
                          text: "Monthly Open",
                          fill: "black",
                          fontFamily: "Arial",
                          y: ({ yScale, datum }) => yScale(datum.monthlyOpen), // Calculate y position based on yScale
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
                      <LineSeries
                        strokeWidth={6}
                        stroke="red"
                        yAccessor={(d) => d.monthlyClose}
                      />
                      <LineSeries
                        strokeWidth={6}
                        stroke="green"
                        yAccessor={(d) => d.monthlyOpen}
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
                      <LineSeries
                        strokeWidth={5}
                        stroke="red"
                        yAccessor={(d) => d.weeklyOpen}
                      />
                      <LineSeries
                        strokeWidth={5}
                        stroke="green"
                        yAccessor={(d) => d.weeklyClose}
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
                          y: ({ yScale, datum }) =>
                            yScale(datum.fourHourlyHigh), // Calculate y position based on yScale
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
                      <LineSeries
                        strokeWidth={1}
                        stroke="red"
                        yAccessor={(d) => d.hourlyOpen}
                      />
                      <LineSeries
                        strokeWidth={1}
                        stroke="green"
                        yAccessor={(d) => d.hourlyClose}
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
                        strokeWidth={3}
                        stroke="red"
                        yAccessor={(d) => d.dailyHigh}
                      />
                      <LineSeries
                        strokeWidth={3}
                        stroke="green"
                        yAccessor={(d) => d.dailyLow}
                      />
                      <LineSeries
                        strokeWidth={1}
                        stroke="red"
                        yAccessor={(d) => d.dailyOpen}
                      />
                      <LineSeries
                        strokeWidth={1}
                        stroke="green"
                        yAccessor={(d) => d.dailyClose}
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
                          Trendline: {
                            1: node1Ref.current,
                            3: node3Ref.current,
                          },
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
                          AlertLine: {
                            1: alertLineNodeRef.current,
                            3: alertLineNodeRef.current,
                          },
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
                          EntryLine: {
                            1: entryLineNodeRef.current,
                            3: entryLineNodeRef.current,
                          },
                        })}
                        drawingObjectMap={{
                          EntryLine: "EntryLine",
                        }}
                        onSelect={handleSelection}
                      />
                    </>
                  )}
                  {showRow.noActionLine && (
                    <>
                      <TrendLine
                        ref={(node) => {
                          entryLineNodeRef.current = node;
                        }}
                        enabled={enableNoActionLine}
                        type="LINE"
                        snap={false}
                        value={noActionLine}
                        snapTo={(d) => [d?.high, d?.low]}
                        onStart={() => console.log("Entry Line Line Start")}
                        onComplete={onDrawCompleteNoAction}
                        trends={noActionLine}
                      />
                      <DrawingObjectSelector
                        enabled={!enableNoActionLine}
                        getInteractiveNodes={() => ({
                          // EntryLine: {
                          //   1: entryLineNodeRef.current,
                          //   3: entryLineNodeRef.current,
                          // },
                        })}
                        drawingObjectMap={{
                          EntryLine: "NoActionLine",
                        }}
                        onSelect={handleSelection}
                      />
                    </>
                  )}
                  {showRow.horizontalLine && (
                    <>
                      <TrendLine
                        ref={(node) => {
                          entryLineNodeRef.current = node;
                        }}
                        enabled={enableHorizontalLine}
                        type="LINE"
                        snap={false}
                        value={horizontalLine}
                        snapTo={(d) => [d?.high, d?.low]}
                        onStart={() => console.log("Entry Line Line Start")}
                        onComplete={onDrawCompleteHorizontal}
                        trends={horizontalLine}
                      />
                      <DrawingObjectSelector
                        enabled={!enableHorizontalLine}
                        getInteractiveNodes={() => ({
                          // EntryLine: {
                          //   1: entryLineNodeRef.current,
                          //   3: entryLineNodeRef.current,
                          // },
                        })}
                        drawingObjectMap={{
                          EntryLine: "horizontalLine",
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

                  {/* <MACDSeries yAccessor={(d) => d.macd} {...macdAppearance} /> */}

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

                <Chart
                  id={3}
                  yExtents={[0, 100]} // RSI range
                  height={150} // Height for RSI chart
                  origin={(w, h) => [0, h - 150]} // Properly stack this chart above the ATR chart
                  padding={{ top: 10, bottom: 10 }}
                >
                  {showRow?.rsi && (
                    <>
                      <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        showTicks={false}
                      />
                      <YAxis
                        axisAt="right"
                        orient="right"
                        tickValues={[30, 50, 70]} // Typical RSI levels
                      />
                      <RSISeries yAccessor={(d) => d.rsi} />
                      <RSITooltip
                        origin={[-40, 15]}
                        yAccessor={(d) => d.rsi}
                        options={rsiCalculator.options()}
                      />
                    </>
                  )}
                </Chart>

                <Chart
                  id={4}
                  yExtents={atrCalculator.accessor()} // ATR range
                  height={125} // Height for ATR chart
                  origin={(w, h) => [0, h - 120]} // Place this chart at the bottom
                  padding={{ top: 10, bottom: 10 }}
                >
                  {showRow?.atr && (
                    <>
                      <LineSeries
                        yAccessor={atrCalculator.accessor()}
                        stroke="#ff7300" // Line color for ATR
                      />
                      <SingleValueTooltip
                        yAccessor={atrCalculator.accessor()}
                        yLabel={`ATR (${atrCalculator.options().windowSize})`}
                        yDisplayFormat={format(".2f")}
                        origin={[-40, 15]}
                      />
                    </>
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
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.log("Error", error);
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
