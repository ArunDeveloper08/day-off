

const CandleChart = ({
  chartType,
  // getChartData,
  data: initialData,

  width,
  height,
  showRow,
  ratio,

  type = chartType,

  entryLine,
  setEntryLine,

  // type = "canvas",
  // type = "svg",
}) => {
  try {
    const { onOpen } = useModal();
    const [enableEntryLine, setEnableEntryLine] = useState(false);

    const margin = { left: 80, right: 80, top: 30, bottom: 50 };
    const calculatedData = initialData;
    // Trendline state

    // const [trends3, setTrends3] = useState(intractiveData?.trendLines);
    const node1Ref = useRef(null);

    const entryLineNodeRef = useRef(null);

    const node3Ref = useRef(null);
    //   console.log({ trends3 });
    // Fibonacci state

    const fibNode1Ref = useRef(null);

    const fibNode3Ref = useRef(null);

    // Equidistant Channel state

    const channelNode1Ref = useRef(null);
    const channelNode3Ref = useRef(null);

    const logTrendLines = (trends) => {
      trends.forEach((trend) => {
        console.log("TrendLine Start:", trend.start, "End:", trend.end);
      });
    };

    const handleSelection = (interactives) => {
      const state = toObject(interactives, (each) => {
        return [`trends_${each.chartId}`, each.objects];
      });
      // setTrends1(state.trends_1 || trends1);

      setEntryLine(state.entryLine || entryLine);
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
    };

    const onKeyPress = (e) => {
      const keyCode = e.which;
      console.log(keyCode);
      switch (keyCode) {
        case 27: // ESC
          node1Ref.current.terminate();
          node3Ref.current.terminate();
          fibNode1Ref.current.terminate();
          fibNode3Ref.current.terminate();
          channelNode1Ref.current.terminate();
          channelNode3Ref.current.terminate();

          break;
        case 71: // G - Enable Interactive Text
          setEnableInteractiveObject(true);
          break;

        case 68: // D - Draw Alert Trendline
          setEnableEntryLine(true);
          break;

        case 65: // A - Draw Trendline
          setEnableEntryLine(false);
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
              </Chart>
            </ChartCanvas>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // window.location.reload();
    console.log("Error" , error)
  }
};
const EnhancedCandleChart = fitWidth(CandleChart);
export default memo((props) => (
  <ErrorBoundary>
    <EnhancedCandleChart {...props} />
  </ErrorBoundary>
));
