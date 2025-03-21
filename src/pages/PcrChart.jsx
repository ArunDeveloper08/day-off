import { ResponsiveLine } from "@nivo/line";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL_OVERALL } from "@/lib/constants";
import { useSearchParams } from "react-router-dom";

const PcrAndCoiPcrChart = () => {
  const [pcrData, setPcrData] = useState([]);
  const [coiPcrData, setCoiPcrData] = useState([]);
  const [diffOIData, setDiffOIData] = useState([]);
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get("identifier");

  // Function to fetch and transform the data for both PCR and COI PCR charts

  const getChartData = async () => {
    try {
      const response = await axios.get(`${BASE_URL_OVERALL}/log?identifier=${identifier}`);
      const transformedPcrData = transformToChartData(response.data.data, "pcrRatio");
      const transformedCoiPcrData = transformToChartData(response.data.data, "coiPCRatio");
      const transformedOiDiffData = transformToChartData(response.data.data, "diffOI");
      setPcrData(transformedPcrData);
      setCoiPcrData(transformedCoiPcrData);
      setDiffOIData(transformedOiDiffData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }; 
        

  // Function to transform the data based on the given field
  const transformToChartData = (data, field) => { 
    if (!Array.isArray(data)) {
      console.error("Expected an array, but received:", data);
      return [];
    }
 
    return [
      {
        id: `${field} Data`,
        data: data?.map((point) => ({
          x: new Date(point.createdAt),
          y: point[field], 
        })),
      },
    ];
  };

  useEffect(() => {
    getChartData();
    document.title = "PCR Chart";

    const interval = setInterval(getChartData, 120 * 1000);
    return () => clearInterval(interval);
  }, []);


  const formatTick = (tick) => {
    return tick instanceof Date ? tick.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : tick;
  };

  const getTickValues = (data) => {
    if (data.length > 0) {
      return data?.[0]?.data?.filter((_, i) => i % 15 === 0)?.map((d) => d.x);
    }
    return [];
  };

 const customTooltip = ({ point }) => {
  const dateTime = new Date(point.data.x); // Ensure `x` is a Date object
  const formattedDateTime = dateTime.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedValue = point.data.y.toFixed(2);

  return (
    <div style={{ padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', borderRadius: '4px' }}>
      <div>Date & Time: {formattedDateTime}</div>
      <div>Value: {formattedValue}</div>
    </div>
  );
};


  return (
    <div>
    
    <div style={{ height: 400 }}>
    <p className="text-center font-bold text-[22px]"><span className="text-blue-500">{identifier}</span> OI PCR CHART</p>
  {pcrData?.length > 0 ? (
    <ResponsiveLine
      data={pcrData}
      margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "time" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        legend: "Time",
        legendOffset: 36,
        legendPosition: "middle",
        tickValues: getTickValues(pcrData),
        format: formatTick,
      }}
      axisLeft={{
        orient: "left",
        legend: "PCR Ratio",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointSize={5}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      tooltip={customTooltip}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      colors={(line) => {
        // Check the last value in the data array
        const lastValue = line.data[line.data.length - 1]?.y;
      
        // If the last value is >= 1, return green; otherwise, return red
        return lastValue >= 1 ? "#28a745" : "#dc3545";
      }}
      
      
    />
  ) : (
    <p>Loading PCR chart...</p>
  )}
</div>


      <div style={{ height: 400, marginTop: 55 }}>
      
        <p className="text-center font-bold text-[22px]"> <span className="text-blue-500"><span className="text-blue-500"><span className="text-blue-500">{identifier}</span></span></span> COI  PCR   CHART</p>
        {coiPcrData?.length > 0 ? (
          <ResponsiveLine
            data={coiPcrData}
            margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "time" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              legend: "Time",
              legendOffset: 36,
              legendPosition: "middle",
              tickValues: getTickValues(coiPcrData),
              format: formatTick,
            }}
            axisLeft={{
              orient: "left",
              legend: "COI PCR Ratio",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            pointSize={5}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            tooltip={customTooltip}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            colors={(line) => {
              // Check the last value in the data array
              const lastValue = line.data[line.data.length - 1]?.y;
            
              // If the last value is >= 1, return green; otherwise, return red
              return lastValue >= 1 ? "#28a745" : "#dc3545";
            }}
            
            
          />
        ) : (
          <p>Loading COI PCR chart...</p>
        )}
      </div>
      <div style={{ height: 400, marginTop:55 }}>
      
        <p className="text-center font-bold text-[22px]"><span className="text-blue-500"><span className="text-blue-500">{identifier}</span></span> Diff OI CHART</p>
        {diffOIData?.length > 0 ? (
          <ResponsiveLine
            data={diffOIData}
            margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "time" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              legend: "Time",
              legendOffset: 36,
              legendPosition: "middle",
              tickValues: getTickValues(diffOIData),
              format: formatTick,
            }}
            axisLeft={{
              orient: "left",
              legend: "DIFF OI",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            pointSize={5}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            tooltip={customTooltip}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            colors={(line) => {
              // Check the last value in the data array
              const lastValue = line.data[line.data.length - 1]?.y;
            
              // If the last value is >= 1, return green; otherwise, return red
              return lastValue >= 1 ? "#28a745" : "#dc3545";
            }}
            
            
          />
        ) : (
          <p>Loading Diff OI chart...</p>
        )}
      </div>


    </div>
  );
};

export default PcrAndCoiPcrChart;
