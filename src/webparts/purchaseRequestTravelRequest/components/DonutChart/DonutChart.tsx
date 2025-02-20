import React, { useEffect, useState } from 'react';
import { DonutChart, IChartProps, IChartDataPoint } from '@fluentui/react-charting';
import { IDonutChartProps } from './IDonutChartProps';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';

const statusColors = {
    Total: '#6FB2E7', // Blue
    InProgress: '#FF8008', // Yellow
    Approved: '#1D8843', // Green
    Rejected: '#ff3149' // Red
};

// Interface for storing status counts
interface ITravelRequestFormProps {
    Total: number;
    InProgress: number;
    Approved: number;
    Rejected: number;
}

const DonutChartComponent: React.FC<IDonutChartProps> = (props) => {
    const [dataList, setDataList] = useState<ITravelRequestFormProps>({
        Total: 0,
        InProgress: 0,
        Approved: 0,
        Rejected: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const fetchPRDataCount = async (): Promise<void> => {
        setLoading(true);
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const statusCount = await service.getPRTRPurchaseRequest();

            // Validate response structure before setting state
            if (statusCount) {
                setDataList({
                    Total: statusCount.total ?? 0,
                    Approved: statusCount.approved ?? 0,
                    InProgress: statusCount.inProgress ?? 0,
                    Rejected: statusCount.rejected ?? 0
                });
            } else {
                throw new Error("Invalid data structure received.");
            }
        } catch (error) {
            console.error('Error fetching Purchase Request data:', error);
            setError('Error fetching Purchase Request data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPRDataCount();
    }, []);

    const points: IChartDataPoint[] = [
        {
            legend: 'In Progress',
            data: dataList.InProgress,
            color: statusColors.InProgress,
            xAxisCalloutData: 'In Progress',
        },
        {
            legend: 'Approved',
            data: dataList.Approved,
            color: statusColors.Approved,
            xAxisCalloutData: 'Approved',
        },
        {
            legend: 'Rejected',
            data: dataList.Rejected,
            color: statusColors.Rejected,
            xAxisCalloutData: 'Rejected',
        },
    ];

    const data: IChartProps = {
        chartTitle: 'Purchase Request By Status',
        chartData: points,
    };

    return (
        <div className='bg-white rounded-5 p-2' style={{ width: '100%', height: '100%', minHeight: '450px' }}>
            <div className='row d-flex flex-row h-100'>
                <div className='align-self-center px-3'>
                    {loading ? (
                        <p>Loading data...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : dataList.Total > 0 ? (
                        <DonutChart
                            data={data}
                            innerRadius={55}
                            legendsOverflowText={'More'}
                            hideLegend={false}
                            valueInsideDonut={dataList.Total.toString()} // Ensure it's a string
                            roundCorners={true}
                            legendProps={{
                                canSelectMultipleLegends: true,
                                allowFocusOnLegends: true,
                            }}
                            showLabelsInPercent={true}
                            height={380}
                            width={380}
                        />
                    ) : (
                        <p>No data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonutChartComponent;
