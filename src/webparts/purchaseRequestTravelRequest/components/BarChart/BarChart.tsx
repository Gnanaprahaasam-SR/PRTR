import React, { useState, useEffect } from 'react';
import { GroupedVerticalBarChart, getColorFromToken, DataVizPalette } from '@fluentui/react-charting';
import { IBarChartProps } from './IBarChartProps';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import Style from "../PurchaseRequestTravelRequest.module.scss";

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface IChartData {
    name: string;
    series: {
        key: string;
        data: number;
        xAxisCalloutData: string;
        color: string;
        legend: string;
    }[];
}

const BarChartData: React.FC<IBarChartProps> = (props) => {
    const [chartData, setChartData] = useState<IChartData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    // Generate year options dynamically (last 5 years + current year)
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const fetchPRTRData = async (year: number) => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPurchaseRequestDetails(props.userId, "All", null);
            const PRDetails = data.PRDetails;

            const TRData = await service.getTravelRequestDetails(props.userId, "All", null);
            const TRDetails = TRData.TRDetails;

            // Initialize dataset with zero values for each month
            const tempData: { [key: string]: { PR: number; TR: number } } = {};
            months.forEach((month) => {
                tempData[month] = { PR: 0, TR: 0 };
            });

            // Process PR data
            PRDetails.forEach((item: any) => {
                const date = new Date(item.RequestedDate);
                const month = months[date.getMonth()];
                const dataYear = date.getFullYear();

                if (dataYear === year) {
                    tempData[month].PR += 1;
                }
            });

            // Process TR data
            TRDetails.forEach((item: any) => {
                const date = new Date(item.RequestedDate);
                const month = months[date.getMonth()];
                const dataYear = date.getFullYear();

                if (dataYear === year) {
                    tempData[month].TR += 1;
                }
            });

            // Prepare final dataset ensuring all months are included
            const finalChartData = months.map((month) => ({
                name: month,
                series: [
                    {
                        key: 'PR',
                        data: tempData[month].PR,
                        xAxisCalloutData: `${month} PR`,
                        color: getColorFromToken(DataVizPalette.color10),
                        legend: 'Purchase Request',
                    },
                    {
                        key: 'TR',
                        data: tempData[month].TR,
                        xAxisCalloutData: `${month} TR`,
                        color: getColorFromToken(DataVizPalette.color11),
                        legend: 'Travel Request',
                    },
                ],
            }));

            setChartData(finalChartData);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchPRTRData(selectedYear);
    }, [props.userId, selectedYear]);

    return (
        <div className='bg-white rounded-5 p-2'>
            <h5 className='text-center text-wrap'>PR - TR for ({selectedYear})</h5>

            {/* Bootstrap Select Dropdown for Year Selection */}
            <div className='col-12 col-sm-4 col-md-3 float-end'>
                <div className='form-group px-4'>
                    <label className="form-label fw-bold">Select Year</label>
                    <select
                        className={Style.inputStyle}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ width: '100%', height: '100%' }}>
                {error ? (
                    <p>{error}</p>
                ) : chartData.length > 0 ? (
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
