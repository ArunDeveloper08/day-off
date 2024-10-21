const CandleChart = ({
  handleCreateTrendLines,
  chartType,
  getChartData,
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

}) => {
  try {
   


 
    
  
                              

                                


 

  

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



    const handleSelection = (interactives) => {
      const state = toObject(interactives, (each) => {
        return [`trends_${each.chartId}`, each.objects];
      });
      setTrends1(state.trends_1 || trends1);
      setTrends3(state.trends_3 || trends3);
      setChannels1(state.channels_1 || channels1);
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





  


    const onKeyPress = (e) => {
      const keyCode = e.which;
      console.log(keyCode);
      switch (keyCode) {
        case 46: // DEL
          setTrends1(trends1.filter((each) => !each.selected));
          setTrends3(trends3.filter((each) => !each.selected));

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

    // useEffect(() => {
    //   document.addEventListener("keydown", onKeyPress);
    //   return () => {
    //     document.removeEventListener("keydown", onKeyPress);
    //   };
    // }, []);

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
                      className="bg-green-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() =>
                        MannualTrade(master.id, "INITIAL", "BUY_CE")
                      }
                    >
                      INITIAL Buy CE
                    </button>
                    <button
                      className="bg-red-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
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
                  className="bg-green-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                  onClick={() =>
                    handleCreateTrendLines(
                      trends3,
                      textList1,
                      retracements3,
                      channels1
                    )
                  }
                >
                  Submit TrendLine
                </button>
                <button
                  className="bg-red-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                  onClick={handleResetTrendLines}
                >
                  Remove All TrendLine
                </button>
              </div>

              {master?.isMaster && (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-around">
                    <button
                      className="bg-red-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
                      onClick={() =>
                        MannualTrade(master.id, "INITIAL", "SELL_CE")
                      }
                    >
                      INITIAL SELL CE
                    </button>
                    <button
                      className="bg-green-600 px-3 py-1 rounded-sm border-blue-50 w-full md:w-fit mx-auto text-white"
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

              yExtents={[(d) => [d.high, d.low, d.pivot - d.dynamicExitValue]]}
              // padding={{ top: 0, bottom: 0 }}
              // yExtents={(d) => [d.high, d.low]} // Ensure proper y-axis scaling based on high/low
              padding={{ top: 20, bottom: 50 }} // Add some padding to prevent squeezing

   
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

            

          
      

              <ZoomButtons onReset={handleReset} />
            </Chart>

        
          </ChartCanvas>
        )}
      </div>
    );
  } catch (error) {
    window.location.reload();
  }
};