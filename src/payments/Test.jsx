import React, { useState } from "react";
import { Chart, ChartCanvas, ZoomButtons } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CandlestickSeries,
  MACDSeries,
  RSISeries,
} from "react-stockcharts/lib/series";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
import { last } from "react-stockcharts/lib/utils";
import { rsi } from "react-stockcharts/lib/indicator";
import { RSITooltip } from "react-stockcharts/lib/tooltip";

const CandleChart = ({
  chartType,
  data: initialData,
  width,
  height,
  showRow,
  ratio,
  type = chartType,
}) => {
  try {
    const margin = { left: 80, right: 80, top: 30, bottom: 50 };
    const calculatedData = initialData;

    const rsiCalculator = rsi()
      .options({ windowSize: 14 }) // 14-period RSI
      .merge((d, c) => {
        d.rsi = c;
      })
      .accessor((d) => d.rsi);

    const dataWithIndicators = rsiCalculator(calculatedData);

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => new Date(d.date || d.timestamp)
    );

    const { data, xScale, xAccessor, displayXAccessor } =
      xScaleProvider(dataWithIndicators);

    const start = xAccessor(data[Math.max(0, data.length - 100)]);
    const end = xAccessor(last(data));
    const padding = (end - start) * 0.1;
    const xExtents = [start, end + padding];

    const [suffix, setSuffix] = useState(1);

    const handleReset = () => {
      setSuffix(suffix + 1);
    };

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
                yExtents={[(d) => [d.high, d.low]]}
                padding={{ top: 20, bottom: 50 }}
              >
                <XAxis axisAt="bottom" orient="bottom" ticks={10} />
                <YAxis axisAt="right" orient="right" />

                {showRow.candle && (
                  <CandlestickSeries
                    opacity={1}
                    fill={(d) => (d.close > d.open ? "green" : "red")}
                  />
                )}
              </Chart>

              {/* RSI Chart */}
              <Chart
                id={2}
                yExtents={[0, 100]}
                height={150}
                origin={(w, h) => [0, h - 150]}
                padding={{ top: 10, bottom: 10 }}
              >
                <XAxis axisAt="bottom" orient="bottom" showTicks={false} />
                <YAxis
                  axisAt="right"
                  orient="right"
                  tickValues={[30, 50, 70]}
                />

                <RSISeries yAccessor={(d) => d.rsi} />

                <RSITooltip
                  origin={[-40, 15]}
                  yAccessor={(d) => d.rsi}
                  options={rsiCalculator.options()}
                />
              </Chart>

              <ZoomButtons onReset={handleReset} />
            </ChartCanvas>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error", error);
  }
};

export default CandleChart;
