import React, { useEffect, useState } from 'react';
import { IDataPoint, PieChart, IPieChartProps, DataVizPalette } from '@fluentui/react-charting';
import { Stack } from '@fluentui/react';
import { IPieChartDataProps } from './IPieChartProps';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { IPurchaseRequestDataProps } from '../PurchaseRequest/PurchaseRequestForm';


interface IDeliveryStatusData {
    x: string;
    y: number;
}


const PieChartData: React.FC<IPieChartProps & IPieChartDataProps> = (props) => {
    const [dataList, setDataList] = useState<IPurchaseRequestDataProps[]>([]);
    const dateFormate = (date: string): string => {
        // console.log(date)
        const existingDate = new Date(date).toISOString().split('T')[0];
        return existingDate;
    };
    const [deliveryStatusData, setDeliveryStatusData] = useState<IDeliveryStatusData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPurchaseRequestDetails = async (purchaseRequestId: number | null): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {
            const existingPR = await service.getPurchaseRequestDetails(props.userId, "All", purchaseRequestId);
            console.log("Fetched Purchase Request Details:", existingPR);

            // Ensure PRDetails is an array before using map
            const PRDetailsArray = existingPR?.PRDetails;
            if (!Array.isArray(PRDetailsArray)) {
                console.warn("PRDetails is not an array or is undefined.");
                return;
            }
            // console.log(PRDetailsArray)
            const data: IPurchaseRequestDataProps[] = PRDetailsArray.map((PR: any) => ({
                id: PR.Id,
                requester: PR.Requester?.Title ?? "",
                requesterId: PR.Requester?.Id ?? undefined,
                department: PR.Department?.Department ?? "",
                departmentId: PR.Department?.Id ?? undefined,
                requestedDate: PR.RequestedDate ? dateFormate(PR.RequestedDate) : "",
                itemServiceDescription: PR.ItemServiceDescription ?? "",
                category: PR.Category ?? "",
                totalCost: PR.TotalCost ?? undefined,
                recurringCost: PR.RecurringCost ?? undefined,
                businessJustification: PR.BusinessJustification ?? "",
                purchaseDetails: PR.PurchaseDetails ?? "",
                purchaseType: PR.PurchaseType ?? "",
                ARRequired: PR.ARRequired ?? false,
                status: PR.Status ?? "",
                useCase: PR.UseCase ?? "",
            }));

            setDataList(data);

        } catch (error) {
            setError('Error fetching PR data');
            console.error("Error fetching Travel Request:", error);
        }
    };

    useEffect(() => {
        fetchPurchaseRequestDetails(null);
    }, [props.userId]);

    useEffect(() => {
        if (dataList.length === 0) return;

        // Initialize an accumulator object for counting statuses
        const statusCounts = dataList.reduce((acc, data) => {
            const status: string = data?.status;

            if (!acc[status]) {
                acc[status] = 1;
            } else {
                acc[status]++;
            }

            return acc;
        }, {} as Record<string, number>);

        // Convert the accumulated counts to the desired format
        const countsArray = Object.keys(statusCounts).map(status => ({
            x: status,
            y: statusCounts[status],
        }));

        setDeliveryStatusData(countsArray);

    }, [dataList]);

    const initialColors = [
        [DataVizPalette.color1, DataVizPalette.color2, DataVizPalette.color3, DataVizPalette.color4, DataVizPalette.color5],
        [DataVizPalette.color6, DataVizPalette.color7, DataVizPalette.color8, DataVizPalette.color9],
        [DataVizPalette.color10, DataVizPalette.color11, DataVizPalette.color12, DataVizPalette.color13],
        [DataVizPalette.color30],
    ];

    const dynamicData: IDataPoint[] = deliveryStatusData.map((statusData) => ({
        x: statusData.x,
        y: statusData.y,
    }));


    const [colors] = useState<string[]>(initialColors[0]);

    return (

        <div className='bg-white rounded-5 p-2' style={{ width: '100%', height: '100%', minHeight: "450px" }}>
            <div className='row d-flex flex-row h-100 '>
                <div className=' align-self-center'>
                    <h5 className='text-center'>Purchase Request By Status</h5>
                </div>
                {error ? (
                    <p>{error}</p>
                ) : ((deliveryStatusData.length > 0) && (deliveryStatusData.length > 0)) ? (
                    <div className='align-self-center '>
                        <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
                            <PieChart
                                height={380}
                                width={380}
                                data={dynamicData}
                                colors={colors}
                            />
                        </Stack>
                    </div>
                ) : (
                    <p>Loading data...</p>
                )}
            </div>
        </div>


    );
};

export default PieChartData;
