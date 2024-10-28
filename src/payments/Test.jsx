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

const useKeyPress = (callback) => {
  useEffect(() => {
    document.addEventListener("keyup", callback);
    return () => {
      document.removeEventListener("keyup", callback);
    };
  }, [callback]);
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
  setEntryLine,
  // type = "canvas",
  // type = "svg",
}) => {
  try {
    const { onOpen } = useModal();

    const [enableInteractiveObject, setEnableInteractiveObject] =
      useState(false);

    const [textList1, setTextList1] =
      useState();
      //JSON.parse(intractiveData?.textLabel)

    const [textList3, setTextList3] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [chartId, setChartId] = useState(null);
    const canvasNode = useRef(null);

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

    const node3Ref = useRef(null);
    //   console.log({ trends3 });
    // Fibonacci state
    const [enableFib, setEnableFib] = useState(true);

    // Equidistant Channel state
    const [enableEquidistantChannel, setEnableEquidistantChannel] =
      useState(true);
    const [channels1, setChannels1] = useState([]);

    const logTrendLines = (trends) => {
      // console.log("logTrendLines");
      trends.forEach((trend) => {
        // console.log("TrendLine Start:", trend.start, "End:", trend.end);
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
      setEntryLine(state.entryLine || entryLine);
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

    const onKeyPress = (e) => {
      const keyCode = e.which;
      console.log(keyCode);
      switch (keyCode) {
        case 46: // DEL
          setTrends1(trends1.filter((each) => !each.selected));
          setTrends3(trends3.filter((each) => !each.selected));

          break;
        case 27: // ESC
          node1Ref.current.terminate();
          node3Ref.current.terminate();

          setEnableTrendLine(false);
          setEnableFib(false);
          setEnableEquidistantChannel(false);
          break;

        case 68: // D - Draw Alert Trendline
          setEnableTrendLine(true);

          break;

        case 65: // A - Draw Trendline
          setEnableTrendLine(false);

          break;
        default:
          break;
      }
    };

    useKeyPress(onKeyPress);
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => new Date(d.date || d.timestamp)
    );

    const { data, xScale, xAccessor, displayXAccessor } =
      xScaleProvider(calculatedData);
    const start = xAccessor(data[Math.max(0, data.length - 75)]);
    const end = xAccessor(last(data));
    const padding = (end - start) * 0.1;
    const xExtents = [start, end + padding];

    const [suffix, setSuffix] = useState(1);

    return (
      <div className="flex flex-col">
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
                padding={{ top: 20, bottom: 50 }} // Add some padding to prevent squeezing
              >
                <XAxis axisAt="bottom" orient="bottom" ticks={10} />
                <YAxis axisAt="right" orient="right" />

                {showRow.candle && (
                  <CandlestickSeries
                    opacity={1}
                    fill={(d) => (d.close > d.open ? "green" : "red")}
                  />
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
              </Chart>
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
