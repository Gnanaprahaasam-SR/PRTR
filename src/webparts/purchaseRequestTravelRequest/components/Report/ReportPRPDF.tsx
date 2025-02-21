import React, { forwardRef } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import styles from "./Report.module.scss";

import { WebPartContext } from '@microsoft/sp-webpart-base';

const columnsData: { label: string, field: string }[] = [
    { label: 'S.No', field: 'serialNumber' },
    { label: 'PR Number', field: 'PRNumber' },
    { label: 'Status', field: 'Status' },
    { label: 'Requestor Name', field: 'Requester' },
    { label: "Department", field: 'Department' },
    { label: 'Requested Date', field: 'RequestedDate' },
    { label: 'Purchase Details', field: 'PurchaseDetails' },
    { label: 'Category', field: 'Category' },
    { label: 'Total Cost', field: 'TotalCost' },
    { label: 'Recurring Cost', field: 'RecurringCost' },
    { label: 'Purchase Type', field: 'PurchaseType' },
];

export interface IPRTableDataProps {
    PRNumber: string;
    Status: string;
    Requester: string;
    RequesterId: number;
    Department: string;
    DepartmentId: number;
    RequestedDate: string;
    PurchaseDetails: string;
    ItemServiceDescription: string;
    Category: string;
    TotalCost: number;
    RecurringCost: number;
    PurchaseType: string;
    UseCase: string;
    ARRequired: string;
    BusinessJustification: string;
}

interface ITableDataProps {
    context: WebPartContext;
    tableData: IPRTableDataProps[];
}

const PRReportPDF = forwardRef<HTMLDivElement, ITableDataProps>(({ tableData }, ref) => {

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
                                    <th key={index} className={`p-2`} style={{ minWidth: "80px", whiteSpace: "nowrap" }}>
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData && tableData.length > 0 ? (
                                tableData.map((data, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="ps-5">{data.PRNumber}</td>
                                        <td>
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
                                        <td>{data.Requester}</td>
                                        <td>{data.Department}</td>
                                        <td>{formatDate(data.RequestedDate)}</td>
                                        <td>{data.PurchaseDetails}</td>
                                        <td>{data.Category}</td>
                                        <td>${data.TotalCost ? Number(data.TotalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</td>
                                        <td>${data.RecurringCost ? Number(data.RecurringCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</td>
                                        <td>{data.PurchaseType}</td>
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

export default PRReportPDF;
