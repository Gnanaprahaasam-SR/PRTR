import React, { forwardRef } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import styles from "./Report.module.scss";

import { WebPartContext } from '@microsoft/sp-webpart-base';

const columnsData: { label: string, field: string }[] = [
    { label: 'S.No', field: 'serialNumber' },
    { label: 'TR Number', field: 'TRNumber' },
    { label: 'Status', field: 'Status' },
    { label: 'Requestor Name', field: 'Requester' },
    { label: 'Department', field: 'Department' },
    { label: 'Requested Date', field: 'RequestedDate' },
    { label: 'Travel From', field: 'Where' },
    { label: 'Start Date', field: 'When' },
    { label: 'Total Estimate Cost', field: 'TotalCostEstimate' },
    { label: 'Stratigic Project Related', field: 'StratigicProjectRelated' },
    { label: 'Emergency Related', field: 'EmergencyRelated' },
];

export interface ITRTableDataProps {
    TRNumber: string; // Changed from number to string
    Status: string;
    Requester: string;
    RequesterId: number;
    Department: string;
    DepartmentId: number;
    RequestedDate: string;
    TravelTo: string;
    StartDate: string;
    TotalCostEstimate: number;
    BusinessJustification: string;
    StratigicProjectRelated: string;
    EmergencyRelated: string;
}

interface ITableDataProps {
    context: WebPartContext;
    tableData: ITRTableDataProps[];
}

const TRReportPDF = forwardRef<HTMLDivElement, ITableDataProps>(({ tableData }, ref) => {

    const formatDate = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ""; // Handle invalid dates
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    return (
        <div className='bg-white rounded-5'>
            <div className='p-3'>
                <div className={`${styles.tableResponsive}`} ref={ref}>
                    <table className={`${styles.customTable}`}>
                        <thead>
                            <tr>
                                {columnsData.map((column, index) => (
                                    <th key={index} className={`p-2`} style={{ minWidth: "80px", whiteSpace: "nowrap", fontSize:"10px" }}>
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData && tableData.length > 0 ? (
                                tableData.map((data, index) => (
                                    <tr key={index}>
                                        <td style={{fontSize:"10px"}}>{index + 1}</td>
                                        <td style={{fontSize:"10px"}} className="ps-5">{data.TRNumber}</td>
                                        <td style={{fontSize:"10px"}}>
                                            <span className={
                                                data.Status === "Approved" ? Style.approved :
                                                    data.Status === "Rejected" ? Style.rejected :
                                                        data.Status === "Draft" ? Style.draft :
                                                            data.Status === "In Progress" ? Style.pending :
                                                                ""
                                            }>
                                                {data.Status}
                                            </span>
                                        </td>
                                        <td style={{fontSize:"10px"}}>{data.Requester}</td>
                                        <td style={{fontSize:"10px"}}>{data.Department}</td>
                                        <td style={{fontSize:"10px"}}>{formatDate(data.RequestedDate)}</td>
                                        <td style={{fontSize:"10px"}}>{data.TravelTo}</td>
                                        <td style={{fontSize:"10px"}}>{formatDate(data.StartDate)}</td>
                                        <td style={{fontSize:"10px"}}>${data.TotalCostEstimate ? Number(data.TotalCostEstimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</td>
                                        <td style={{fontSize:"10px"}}>{data.StratigicProjectRelated}</td>
                                        <td style={{fontSize:"10px"}}>{data.EmergencyRelated}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columnsData.length} className="text-center">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default TRReportPDF;
