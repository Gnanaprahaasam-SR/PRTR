// import React, { useState, useEffect, useMemo } from 'react';
// import { GroupedVerticalBarChart, IGroupedVerticalBarChartProps } from '@fluentui/react-charting';
// import { IBarChartProps } from './IBarChartProps';
// import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';

// interface ICustomChartData {
//     month: string;
//     approved: number;
//     rejected: number;
//     pending: number;
// }

// export interface ITRTableDataProps {
//     TRNumber: string; // Changed from number to string
//     Status: string;
//     Requester: string;
//     RequesterId: number;
//     Department: string;
//     DepartmentId: number;
//     RequestedDate: string;
//     Where: string;
//     When: string;
//     TotalCostEstimate: number;
//     BusinessJustification: string;
// }

// export interface IPRTableDataProps {
//     PRNumber: string;
//     Status: string;
//     Requester: string;
//     RequesterId: number;
//     Department: string;
//     DepartmentId: number;
//     RequestedDate: string;
//     PurchaseDetails: string;
//     ItemServiceDescription: string;
//     Category: string;
//     TotalCost: number;
//     RecurringCost: number;
//     PurchaseType: string;
//     UseCase: string;
// }

// interface IDeliveryStatusData {
//     status: string;
//     count: number;
// }

// const BarChartData: React.FC<IBarChartProps> = (props) => {
//     const [dataList, setDataList] = useState<ITRTableDataProps[]>([]);
//     const [purchaseRequestData, setPurchaseRequestData] = useState<IPRTableDataProps[]>([]);
//     const [travelRequestData, setTravelRequestData] = useState<ITRTableDataProps[]>([]);
//     const [chartData, setChartData] = useState<ICustomChartData[]>([]);
//     const [deliveryStatusData, setDeliveryStatusData] = useState<IDeliveryStatusData[]>([]);
//     const [error, setError] = useState<string | null>(null);

//     const formatDate = (dateString: string): string => {
//         const date = new Date(dateString);
//         const monthNames = [
//             'January', 'February', 'March', 'April', 'May', 'June',
//             'July', 'August', 'September', 'October', 'November', 'December'
//         ];
//         return monthNames[date.getMonth()];
//     };

//     const fetchPOData = async (status: string, userId: number): Promise<void> => {
//         const service = new PurchaseRequestTravelRequestService(props.context);
//         try {
//             const data = await service.getPurchaseRequestDetails(props.userId, "All", null);
//             const PRDetail = data.PRDetails
//             const PRData: IPRTableDataProps[] = PRDetail.map((item) => ({
//                 PRNumber: item.Id,
//                 Status: item.Status,
//                 Requester: item.Requester?.Title,
//                 RequesterId: item.Requester?.Id,
//                 Department: item.Department?.Department,
//                 DepartmentId: item.Department?.Id,
//                 RequestedDate: formatDate(item.RequestedDate),
//                 PurchaseDetails: item.PurchaseDetails,
//                 ItemServiceDescription: item.ItemServiceDescription,
//                 Category: item.Category,
//                 TotalCost: item.TotalCost,
//                 RecurringCost: item.RecurringCost,
//                 PurchaseType: item.PurchaseType,
//                 UseCase: item.UseCase,
//             }));
//             setPurchaseRequestData(PRData);

//             // console.log(formattedData);
//         } catch (error) {
//             setError('Error fetching PO data');
//             console.error('Error fetching PO data:', error);
//         }
//     };

//     useEffect(() => {
//         fetchPOData('All', props.userId);
//     }, [props.userId]);


//     const data = [
//         {
//             name: 'January',
//             series: [
//                 {
//                     key: 'PR',
//                     data: 66,
//                     xAxisCalloutData: 'Jan PR',
//                     color: ,
//                     legend: 'MetaData1',
//                 },
//                 {
//                     key: 'series2',
//                     data: 13,
//                     xAxisCalloutData: 'Q2 2000',
//                     color: getColorFromToken(DataVizPalette.color6),
//                     legend: 'MetaData2',
//                 },
//             ],
//         },
//         {
//             name: '2010',
//             series: [
//                 {
//                     key: 'series1',
//                     data: 14,
//                     xAxisCalloutData: 'Q1 2010',
//                     color: getColorFromToken(DataVizPalette.color5),
//                     legend: 'MetaData1',
//                 },
//                 {
//                     key: 'series2',
//                     data: 90,
//                     xAxisCalloutData: 'Q2 2010',
//                     color: getColorFromToken(DataVizPalette.color6),
//                     legend: 'MetaData2',
//                 },
//                 {
//                     key: 'series3',
//                     data: 33,
//                     xAxisCalloutData: 'Q3 2010',
//                     color: getColorFromToken(DataVizPalette.color7),
//                     legend: 'MetaData3',
//                 },
//             ],
//         },
//         {
//             name: '2020',
//             series: [
//                 {
//                     key: 'series1',
//                     data: 54,
//                     xAxisCalloutData: 'Q1 2020',
//                     color: getColorFromToken(DataVizPalette.color5),
//                     legend: 'MetaData1',
//                 },
//                 {
//                     key: 'series2',
//                     data: 72,
//                     xAxisCalloutData: 'Q2 2020',
//                     color: getColorFromToken(DataVizPalette.color6),
//                     legend: 'MetaData2',
//                 },
//                 {
//                     key: 'series3',
//                     data: 18,
//                     xAxisCalloutData: 'Q3 2020',
//                     color: getColorFromToken(DataVizPalette.color7),
//                     legend: 'MetaData3',
//                 },
//             ],
//         },
//     ];


//     useEffect(() => {
//         if (dataList.length === 0) return;

//         const monthlyData: { [month: string]: { approved: number; rejected: number; inReview: number } } = {};
//         const deliveryStatusCount: { [status: string]: number } = {};

//         dataList.forEach((item) => {
//             const month = formatDate(item.RequestedDate);

//             if (!monthlyData[month]) {
//                 monthlyData[month] = { approved: 0, rejected: 0, inReview: 0 };
//             }

//             // Count Approved, Rejected, In Review
//             if (item.Status.trim() === 'Approved') monthlyData[month].approved++;
//             else if (item.Status.trim() === 'Rejected') monthlyData[month].rejected++;
//             else if (item.Status.trim() === 'In Review') monthlyData[month].inReview++;

//             // Normalize and count DeliveryStatus for pie chart (trim to avoid extra spaces)
//             const deliveryStatus = item.DeliveryStatus?.trim();
//             if (deliveryStatus) {
//                 deliveryStatusCount[deliveryStatus] = (deliveryStatusCount[deliveryStatus] || 0) + 1;
//             }
//         });

//         console.log('Processed Monthly Data:', monthlyData);
//         console.log('Processed Delivery Status Count:', deliveryStatusCount);

//         const chartDataArray: ICustomChartData[] = Object.keys(monthlyData).map((month) => ({
//             month,
//             approved: monthlyData[month].approved,
//             rejected: monthlyData[month].rejected,
//             pending: monthlyData[month].inReview,
//         }));
//         setChartData(chartDataArray);

//         const deliveryStatusArray: IDeliveryStatusData[] = Object.keys(deliveryStatusCount).map((status) => ({
//             status,
//             count: deliveryStatusCount[status],
//         }));
//         setDeliveryStatusData(deliveryStatusArray);
//         console.log("deliveryStatusArray :", deliveryStatusArray);
//     }, [dataList]);

//     //   const getColorForStatus = (status: string): string => {
//     //     switch (status.trim()) { // trim to handle extra spaces
//     //       case 'Fully Delivered':
//     //         return '#107C10'; // Green
//     //       case 'Not Applicable':
//     //         return '#D83B01'; // Orange
//     //       case 'Waiting for delivery':
//     //         return '#FFB900'; // Yellow
//     //       default:
//     //         return '#7A7A7A'; // Gray for any other status
//     //     }
//     //   };


//     const barChartProps: IGroupedVerticalBarChartProps = useMemo(
//         () => ({
//             data: chartData?.map((item) => ({
//                 name: item.month,
//                 series: [
//                     { key: 'Approved', data: item.approved, color: '#0078D4', legend: 'Approved' },
//                     { key: 'Rejected', data: item.rejected, color: '#E81123', legend: 'Rejected' },
//                     { key: 'In Review', data: item.pending, color: '#FFB900', legend: 'In Review' },
//                 ],
//             })),
//             height: 300,
//             showYAxisGridLines: true,
//             showXAxisPath: true,
//             showYAxisPath: true,
//             yAxisTickCount: 6,
//             xAxisTickCount: 12,
//             showLegend: true,
//             legendPosition: 'bottom',
//             yAxisTickFormat: (value: number) => Math.round(value).toString(),
//         }),
//         [chartData]
//     );

//     // Helper function to determine color based on the status
//     //    const getColorForStatus = (status: string): string => {
//     //     switch (status) {
//     //       case 'Fully Delivered':
//     //         return '#107C10'; // Green
//     //       case 'Not Applicable':
//     //         return '#D83B01'; // Orange
//     //       case 'Waiting for delivery':
//     //         return '#FFB900'; // Yellow
//     //       default:
//     //         return '#7A7A7A'; // Gray for any other status
//     //     }
//     //   };

//     // const pieChartProps: IDonutChartProps = useMemo(
//     //     () => ({
//     //       chartData: deliveryStatusData.map((statusData) => ({
//     //         legend: statusData.status,
//     //         data: statusData.count,
//     //         color: getColorForStatus(statusData.status),
//     //       })),
//     //       height: 300,
//     //       width: 300,
//     //       legendPosition: 'bottom',
//     //     }),
//     //     [deliveryStatusData]
//     //   );





//     return (
//         <div className='bg-white rounded-5 p-2'>
//             <h5 className='text-center'>PO By Approval Status</h5>

//             <div style={{ width: '100%', height: '100%' }} >
//                 {error ? (
//                     <p>{error}</p>
//                 ) : ((chartData.length > 0) && (deliveryStatusData.length > 0)) ? (
//                     <>

//                         <GroupedVerticalBarChart {...barChartProps} />
//                         {/* <DonutChart {...pieChartProps} /> */}

//                     </>
//                 ) : (
//                     <p>Loading data...</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default BarChartData;
