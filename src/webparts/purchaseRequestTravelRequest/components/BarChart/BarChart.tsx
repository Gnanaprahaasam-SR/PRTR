// import React, { useState, useEffect, useMemo } from 'react';
// import { GroupedVerticalBarChart, IGroupedVerticalBarChartProps } from '@fluentui/react-charting';
// import { IBarChartProps } from './IBarChartProps';
// // import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';    
// // import { ITableDataProps } from '../PurchaseOrderTable/PurchaseOrder';

// interface ICustomChartData {
//     month: string;
//     approved: number;
//     rejected: number;
//     pending: number;
// }

// interface IDeliveryStatusData {
//     status: string;
//     count: number;
// }

// const BarChartData: React.FC<IBarChartProps> = (props) => {
//     const [dataList, setDataList] = useState<ITableDataProps[]>([]);
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
//         const service = new POandAssetManagementService(props.context);
//         try {
//             const data = await service.getPOIMPurchaseOrder(status, userId);
//             const formattedData = data.map((item) => ({
//                 POId: item.ID,
//                 PONumber: item.PONumber,
//                 Status: item.Status,
//                 VendorName: item.VendorName?.Name || '',
//                 VendorCode: item.VendorName?.Code || '',
//                 RequesterName: item.RequesterName?.Title || '',
//                 Division: item.Division?.Name || '',
//                 Department: item.Department?.Name || '',
//                 ManagerName: item.ManagerName?.Title || '',
//                 RequestedDate: item.RequestedDate,
//                 Mode: item.Mode || '',
//                 QuoteNumber: item.QuoteNumber || '',
//                 DeliveryStatus: item.DeliveryStatus || '',
//                 CurrencyType: item.CurrencyType || '',
//             }));
//             setDataList(formattedData);

//             // console.log(formattedData);
//         } catch (error) {
//             setError('Error fetching PO data');
//             console.error('Error fetching PO data:', error);
//         }
//     };

//     useEffect(() => {
//         fetchPOData('All', props.userId);
//     }, [props.userId]);

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
