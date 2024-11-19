const CandleChart = ({
  chartType,
  // getChartData,
  data: initialData,

  width,
  height,
  showRow,
  ratio,
  type = chartType,

 // entryLine,
 // setEntryLine,

  // type = "canvas",
  // type = "svg",
}) => {
  try {
    const margin = { left: 80, right: 80, top: 30, bottom: 50 };
    const calculatedData = initialData;
    // Trendline state

    const entryLineNodeRef = useRef(null);

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
              </Chart>
            </ChartCanvas>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // window.location.reload();
    console.log("Error", error);
  }
};
 

  
const EnhancedCandleChart = fitWidth(CandleChart);
export default memo((props) => (
  <ErrorBoundary>
    <EnhancedCandleChart {...props} />
  </ErrorBoundary>
));
