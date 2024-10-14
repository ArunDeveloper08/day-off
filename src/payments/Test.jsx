import React, { memo, useState, useRef, useCallback, useEffect } from "react";
import { ChartCanvas, Chart } from "react-stockcharts";
import { InteractiveText, DrawingObjectSelector } from "react-stockcharts/lib/interactive";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { getMorePropsForChart } from "react-stockcharts/lib/interactive/utils";
import { last } from "react-stockcharts/lib/utils";
import Dialog from "../components/Dialog"; // Assuming you have the Dialog component imported
import { fitWidth } from "react-stockcharts/lib/helper";
import { useInteractiveNodes } from "@/components/interactiveutils";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";


const useKeyPress = (callback) => {
  useEffect(() => {
    document.addEventListener("keyup", callback);
    return () => {
      document.removeEventListener("keyup", callback);
    };
  }, [callback]);
};
const CandleChart = ({data: initialData,
  intractiveData,
  width,
  height,
  showRow,
  ratio,
  master,
  type = "svg", }) => {
  const [enableInteractiveObject, setEnableInteractiveObject] = useState(true);
  const [textList1, setTextList1] = useState([]); // State for chart 1 text
  const [showModal, setShowModal] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [chartId, setChartId] = useState(null);

  const calculatedData = initialData;

  const { getInteractiveNodes, saveInteractiveNodes } = useInteractiveNodes();

  const handleSelections = (interactives, moreProps) => {
    if (enableInteractiveObject) {
      const independentCharts = moreProps.currentCharts.filter((d) => d !== 2);
      if (independentCharts.length > 0) {
        const first = independentCharts[0];
        const morePropsForChart = getMorePropsForChart(moreProps, first);
        const { mouseXY: [, mouseY], chartConfig: { yScale }, xAccessor, currentItem } = morePropsForChart;

        const position = [xAccessor(currentItem), yScale.invert(mouseY)];
        const newText = {
          ...InteractiveText.defaultProps.defaultText,
          position,
          text: "New Text" // Default text when created
        };
        handleChoosePosition(newText, morePropsForChart);
      }
    } else {
      const state = toObject(interactives, (each) => [`textList_${each.chartId}`, each.objects]);
      setTextList1(state.textList_1 || []);
    }
  };

  const handleChoosePosition = (text, moreProps) => {
    const { id: chartId } = moreProps.chartConfig;
    setTextList1([...textList1, text]);
    setShowModal(true);
    setCurrentText(text.text);
    setChartId(chartId);
  };

  const handleTextChange = (text, chartId) => {
    const textList = chartId === 1 ? textList1 : [];
    const allButLast = textList.slice(0, textList.length - 1);

    const lastText = {
      ...last(textList),
      text, // Update the text with the one edited in the modal
    };

    setTextList1([...allButLast, lastText]);
    setShowModal(false);
    setEnableInteractiveObject(false);
  };

  const handleDialogClose = () => {
    setShowModal(false);
  };
  const onKeyPress = (e) => {
    const keyCode = e.which;
    
  };

  useKeyPress(onKeyPress);
  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
    (d) => new Date(d.date || d.timestamp)
  );
  const { data, xScale, xAccessor, displayXAccessor } =
  xScaleProvider(calculatedData);
const start = xAccessor(data[Math.max(0, data.length - 90)]);
const end = xAccessor(last(data));
const padding = (end - start) * 0.1;
const xExtents = [start, end + padding];
const [suffix, setSuffix] = useState(1);

  return (
    <div className="chart-container">
      <ChartCanvas
        width={width}
        height={height}
        ratio={ratio}
        margin={{ left: 80, right: 80, top: 30, bottom: 50 }}
        type={type}
        data={data}
        seriesName="SampleChart"
        xAccessor={(d) => d.date}
        xScaleProvider={() => ({ data, xAccessor: (d) => d.date, displayXAccessor: (d) => d.date })}
        xExtents={[(d) => d.date]}
      >
        <Chart id={1} yExtents={[(d) => [d.high, d.low]]}>
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" />
          <CandlestickSeries />
          
          {/* Render Interactive Text */}
          <InteractiveText
            enabled={enableInteractiveObject}
            textList={textList1} // Text data
            onDragComplete={(textList) => setTextList1(textList)}
          />

          {/* Drawing Object Selector for clicking on chart */}
          <DrawingObjectSelector
            enabled
            getInteractiveNodes={getInteractiveNodes}
            drawingObjectMap={{ InteractiveText: "textList" }}
            onSelect={handleSelections}
          />

          {/* Text Editing Modal */}
          <Dialog
            showModal={showModal}
            text={currentText}
            chartId={chartId}
            onClose={handleDialogClose}
            onSave={handleTextChange}
          />
        </Chart>
      </ChartCanvas>
    </div>
  );
};

const EnhancedCandleChart = fitWidth(CandleChart);
export default memo(EnhancedCandleChart);
