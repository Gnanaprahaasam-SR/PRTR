import * as React from 'react';
import { useEffect, useState } from 'react';
import { HorizontalBarChart, IChartProps } from '@fluentui/react-charting';
import { IHorizontalBarChartDataProps } from './IHorizontalBarChartProps';
import { ThemeContext } from '@fluentui/react';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';

// Define custom colors for statuses
const statusColors = {
    Total: '#6FB2E7', // Blue
    InProgress: '#FF8008',   // yellow
    Approved: '#1D8843', // Green
    Rejected: '#ff3149'  // red
};

// Interface for storing status counts
interface ITravelRequestFormProps {
    Total: number;
    InProgress: number;
    Approved: number;
    Rejected: number;
}

const HorizontalBarChartView: React.FC<IHorizontalBarChartDataProps> = (props) => {
    const [dataList, setDataList] = useState<ITravelRequestFormProps>({
        Total: 0,
        InProgress: 0,
        Approved: 0,
        Rejected: 0
    });

    const theme = React.useContext(ThemeContext);
    const [error, setError] = useState<string | null>(null);

    const fetchTravelRequestData = async () => {
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {
            const result = await service.getPRTRTravelRequest();
            console.log("Fetched Data:", result);

            const data = result;

            setDataList({
                Total: data.total || 0,
                InProgress: data.inProgress || 0,
                Approved: data.approved || 0,
                Rejected: data.rejected || 0
            });

        } catch (error) {
            console.error('Error fetching travel request data:', error);
            setError('Error fetching travel request data.');
        }
    };


    useEffect(() => {
        fetchTravelRequestData();
    }, [props.context]);

    // Calculate percentage
    const percentage = (count: number, total: number): string => {
        return total > 0 ? ((count / total) * 100).toFixed(2) + "%" : "0%";
    };

    // Dynamically generate chart data
    const getData = (isDarkMode: boolean): IChartProps[] => {
        const statuses = [
            { key: "Approved", title: "Approved TR", color: statusColors.Approved },
            { key: "Rejected", title: "Rejected TR", color: statusColors.Rejected },
            { key: "InProgress", title: "In Progress TR", color: statusColors.InProgress },
            { key: "Total", title: "Total TR", color: statusColors.Total }
        ];

        return statuses.map((status) => ({
            chartTitle: status.title,
            chartTitleAccessibilityData: { ariaLabel: `Bar chart depicting ${status.title}` },
            chartDataAccessibilityData: { ariaLabel: `Data ${dataList[status.key as keyof ITravelRequestFormProps]} of ${dataList.Total}` },
            chartData: [
                {
                    legend: status.title,
                    horizontalBarChartdata: { x: dataList[status.key as keyof ITravelRequestFormProps], y: dataList.Total },
                    color: status.color,
                    xAxisCalloutData: status.title,
                    yAxisCalloutData: percentage(dataList[status.key as keyof ITravelRequestFormProps], dataList.Total),
                    callOutAccessibilityData: {
                        ariaLabel: `Bar series for ${status.title} is ${percentage(dataList[status.key as keyof ITravelRequestFormProps], dataList.Total)}`
                    },
                },
            ],
        }));
    };

    return (
        <div className='bg-white rounded-5 p-2 ' style={{ width: '100%', height: '100%', minHeight: "450px" }}>
            <div className='row d-flex flex-row h-100 '>
                {/* <div className=' align-self-start'>
                    <h5 className='text-center'>Travel Request By Status </h5>   
                </div> */}
                <div className=' align-self-center px-3 '>
                    <HorizontalBarChart data={getData(theme?.isInverted ?? false)} roundCorners={true} />
                </div>
                {error && <p>{error}</p>}
                {dataList.Total === 0 && !error && <p>Loading data...</p>}
            </div>
        </div>
    );
};

export default HorizontalBarChartView;
