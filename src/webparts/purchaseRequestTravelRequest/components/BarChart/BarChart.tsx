import React from 'react';
import { GroupedVerticalBarChart, } from '@fluentui/react-charting';
import { IBarChartProps } from './IBarChartProps';



const BarChartData: React.FC<IBarChartProps> = ({chartData}) => {
    // const [chartData, setChartData] = useState<IChartData[]>([]);

    return (
        <div className=''>
            {/* <h5 className='text-center text-wrap'>PR - TR for ({selectedYear})</h5> */}
           
           <div style={{ width: '100%', height: '100%' }}>
               {chartData.length > 0 ? (
                    <div>
                        <GroupedVerticalBarChart
                            data={chartData}
                            showXAxisLablesTooltip
                            yAxisTickCount={5}
                            barwidth={43}
                            enableReflow={true}
                        />
                    </div>
                ) : (
                    <p>Loading data...</p>
                )}
            </div>
        </div>
    );
};

export default BarChartData;
