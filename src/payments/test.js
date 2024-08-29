const CandleChart = ({
  getMoreData,
  data: initialData,
  width,
  height,
  showRow,
  ratio,
  type = "svg",
}) => {
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
  const [trends3, setTrends3] = useState([]);
  const node1Ref = useRef(null);
  const node3Ref = useRef(null);

  // Fibonacci state
  const [enableFib, setEnableFib] = useState(true);
  const [retracements1, setRetracements1] = useState([]);
  const [retracements3, setRetracements3] = useState([]);
  const fibNode1Ref = useRef(null);
  const fibNode3Ref = useRef(null);

  // Equidistant Channel state
  const [enableEquidistantChannel, setEnableEquidistantChannel] =
    useState(true);
  const [channels1, setChannels1] = useState([]);
  const channelNode1Ref = useRef(null);
  const channelNode3Ref = useRef(null);

  const logTrendLines = (trends) => {
    trends.forEach((trend) => {
      console.log("TrendLine Start:", trend.start, "End:", trend.end);
    });
  };

  const logFibonacciRetracements = (retracements) => {
    retracements.forEach((retracement) => {
      console.log("FibonacciRetracement Points:", retracement);
    });
  };

  const logEquidistantChannels = (channels) => {
    channels.forEach((channel) => {
      console.log("EquidistantChannel StartXY:", channel);
    });
  };

  const handleSelection = (interactives) => {
    const state = toObject(interactives, (each) => {
      return [`trends_${each.chartId}`, each.objects];
    });
    setTrends1(state.trends_1 || trends1);
    setTrends3(state.trends_3 || trends3);
    setChannels1(state.channels_1 || channels1);
  };

  // const onDrawCompleteChart1 = (newTrends) => {
  //   setEnableTrendLine(false);
  //   setTrends1(newTrends);
  //   logTrendLines(newTrends);
  // };

  const onDrawCompleteChart3 = (newTrends) => {
    setEnableTrendLine(false);
    setTrends3(newTrends);
    logTrendLines(newTrends);
  };

  const onFibComplete1 = (newRetracements) => {
    setEnableFib(false);
    setRetracements1(newRetracements);
    logFibonacciRetracements(newRetracements);
  };

  const onFibComplete3 = (newRetracements) => {
    setEnableFib(false);
    setRetracements3(newRetracements);
    logFibonacciRetracements(newRetracements);
  };

  const onChannelComplete1 = (newChannels) => {
    setEnableEquidistantChannel(false);
    setChannels1(newChannels);
    logEquidistantChannels(newChannels);
  };

  const onChannelComplete3 = (newChannels) => {
    setEnableEquidistantChannel(false);
    setChannels1(newChannels);
    logEquidistantChannels(newChannels);
  };

  const onKeyPress = (e) => {
    const keyCode = e.which;
    switch (keyCode) {
      case 46: // DEL
        setTrends1(trends1.filter((each) => !each.selected));
        setTrends3(trends3.filter((each) => !each.selected));
        setRetracements1(retracements1.filter((each) => !each.selected));
        setRetracements3(retracements3.filter((each) => !each.selected));
        setChannels1(channels1.filter((each) => !each.selected));
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
      case 68: // D - Draw Trendline
        setEnableTrendLine(true);
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
  const start = xAccessor(data[Math.max(0, data.length - 90)]);
  const end = xAccessor(last(data));
  const padding = (end - start) * 0.1;
  const xExtents = [start, end + padding];

  const [suffix, setSuffix] = useState(1);

  // const nodeRef = useRef(null);
  // const resetYDomain = () => {
  //   if (nodeRef.current) {
  //     nodeRef.current.resetYDomain();
  //   }
  // };

  const handleReset = () => {
    setSuffix(suffix + 1);
  };

  return (
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
        yExtents={[(d) => [d.high, d.low, d.pivot - d.dynamicExitValue]]}
        padding={{ top: 10, bottom: 20 }}
      >
        <XAxis axisAt="bottom" orient="bottom" ticks={15} />
        <YAxis axisAt="right" orient="right" />
        {showRow.candle && (
          <CandlestickSeries
            opacity={1}
            fill={(d) =>
              d.close > d.open
                ? d.low >= d.open
                  ? "green"
                  : "#70e078"
                : d.high <= d.open
                ? "red"
                : "#edbdb8"
            }
          />
        )}

        {showRow.trendLine && (
          <>
            {/* <TrendLine
                ref={(node) => {
                  node1Ref.current = node;
                }}
                enabled={enableTrendLine}
                type="RAY"
                snap={false}
                snapTo={(d) => [d?.high, d?.low]}
                onStart={() => console.log("START")}
                onComplete={onDrawCompleteChart1}
                trends={trends1}
              /> */}
            <TrendLine
              ref={(node) => {
                node3Ref.current = node;
              }}
              enabled={enableTrendLine}
              type="RAY"
              snap={false}
              snapTo={(d) => [d?.high, d?.low]}
              onStart={() => console.log("START")}
              onComplete={onDrawCompleteChart3}
              trends={trends3}
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
      </Chart>

      {showRow.MouseCoordinates && <CrossHairCursor stroke="blue" />}
    </ChartCanvas>
  );
};

CandleChart.defaultProps = {
  type: "svg",
};

export default memo(fitWidth(CandleChart));
