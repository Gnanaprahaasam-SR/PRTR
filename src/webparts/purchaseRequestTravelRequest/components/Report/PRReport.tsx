import React, { FC, useEffect, useRef, useState } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from "./Report.module.scss";
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import PRReportPDF from './ReportPRPDF';
import { BsFileEarmarkSpreadsheetFill } from 'react-icons/bs';
import { FaRegFilePdf } from 'react-icons/fa';

const columnsData: { label: string, field: string }[] = [
    { label: 'S.No', field: 'serialNumber' },
    { label: 'Action', field: 'Action' },
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
    { label: 'Use case', field: 'UseCase' },
    { label: 'AR Required', field: 'ARRequired' },
    { label: 'Business Justification', field: 'BusinessJustification' },
];

export interface IPRTableDataProps {
    PRNumber: string; // Changed from number to string
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
    ARDetails: string;
    BusinessJustification: string;
}

interface IPurchaseRequestFormProps {
    context: WebPartContext;
}

const PRReport: FC<IPurchaseRequestFormProps> = (props) => {
    const [dataList, setDataList] = useState<IPRTableDataProps[]>([]);
    const [filters, setFilters] = useState<Partial<IPRTableDataProps>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof IPRTableDataProps; direction: 'ascending' | 'descending'; dataType: string } | null>(null);
    const [isFilterApplied, setIsFilterApplied] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedColumn, setSelectedColumn] = useState('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleGlobalFilterChange = (value: string) => {
        setGlobalFilter(value);
    };

    const handleFilterChange = (field: keyof IPRTableDataProps, value: string) => {
        setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
    };

    const handleSort = (field: keyof IPRTableDataProps) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === field && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const fieldDataType = typeof dataList[0][field];
        setSortConfig({ key: field, direction, dataType: fieldDataType });
    };

    const sortedData = React.useMemo(() => {
        if (sortConfig !== null) {
            return [...dataList].sort((a, b) => {
                const fieldValueA: string | number = a[sortConfig.key];
                const fieldValueB = b[sortConfig.key];

                if (sortConfig.dataType === 'number') {
                    const numericFieldValueA = Number(fieldValueA);
                    const numericFieldValueB = Number(fieldValueB);
                    return sortConfig.direction === 'ascending' ? numericFieldValueA - numericFieldValueB : numericFieldValueB - numericFieldValueA;
                } else if (sortConfig.dataType === 'string') {
                    const stringFieldValueA = String(fieldValueA);
                    const stringFieldValueB = String(fieldValueB);
                    return sortConfig.direction === 'ascending' ? stringFieldValueA.localeCompare(stringFieldValueB) : stringFieldValueB.localeCompare(stringFieldValueA);
                } else {
                    return 0;
                }
            });
        }
        return dataList;
    }, [dataList, sortConfig]);

    const filteredData = sortedData.filter((data) => {
        if (!globalFilter) return true;

        if (selectedColumn) {
            return data[selectedColumn as keyof IPRTableDataProps]
                ?.toString()
                .toLowerCase()
                .includes(globalFilter.toLowerCase());
        } else {
            return Object.keys(data).some((key) =>
                data[key as keyof IPRTableDataProps]
                    ?.toString()
                    .toLowerCase()
                    .includes(globalFilter.toLowerCase())
            );
        }
    });

    const filterableFields: Array<keyof IPRTableDataProps> = [
        "PRNumber", "Status", "Requester", "Department", "RequestedDate"
    ];

    const handlePageChange = (newPage: number): void => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
    };

    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [currentPage, pageSize, filteredData]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const handleExport = (): void => {
        const dataToExport = filteredData.map(data => ({
            "PR Number": data.PRNumber ?? "",
            "Status": data.Status ?? "",
            "Requestor Name": data.Requester ?? "",
            "Department": data.Department ?? "",
            "Requested Date": data.RequestedDate ?? "",
            "Purchase Details": data.PurchaseDetails ?? "",
            "Category": data.Category ?? "",
            "Total Cost": `${data.TotalCost ? Number(data.TotalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`,
            "Recurring Cost": `${data.RecurringCost ? Number(data.RecurringCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`,
            "Purchase Type": data.PurchaseType ?? "",
            "Use Case": data.UseCase ?? "",
            "AR Required": data.ARRequired ?? "",
            "Business Justification": data.BusinessJustification ?? ""
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductRequestDetails');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
        saveAs(data, `PRTR_PurchaseRequestReport_${new Date().getTime()}${EXCEL_EXTENSION}`);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    const fetchPurchaseRequestData = async (status: string,): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        try {
            const data = await service.getPurchaseRequestDetails(null, status, null);
            const PRDetail = data.PRDetails;
            const PRData: IPRTableDataProps[] = PRDetail.map((item) => ({
                PRNumber: item.Id,
                Status: item.Status,
                Requester: item.Requester?.Title,
                RequesterId: item.Requester?.Id,
                Department: item.Department?.Department,
                DepartmentId: item.Department?.Id,
                RequestedDate: formatDate(item.RequestedDate),
                PurchaseDetails: item.PurchaseDetails,
                ItemServiceDescription: item.ItemServiceDescription,
                Category: item.Category,
                TotalCost: item.TotalCost,
                RecurringCost: item.RecurringCost,
                PurchaseType: item.PurchaseType,
                UseCase: item.UseCase,
                ARRequired: item.ARRequired ? "Yes" : "No",
                ARDetails: item.ARDetails,
                BusinessJustification: item.BusinessJustification,
            }));
            setDataList(PRData);
        } catch (error) {
            console.error('Error fetching PR data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseRequestData("All");
    }, []);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrintPreview = (): void => {
        if (printRef.current) {
            const printContent = printRef.current.cloneNode(true) as HTMLElement;

            // Extract styles and apply inline
            const elements = printContent.querySelectorAll('*');
            elements.forEach((element) => {
                const computedStyle = window.getComputedStyle(element);
                const styleString = Array.from(computedStyle)
                    .map((property) => `${property}: ${computedStyle.getPropertyValue(property)};`)
                    .join(' ');
                element.setAttribute('style', styleString);
            });

            const printPreview = window.open("", "Purchase Request", "resizable=yes,scrollbars=yes,status=yes,toolbar=yes,width=800,height=600");

            if (printPreview) {
                const printDocument = printPreview.document;
                printDocument.open();
                printDocument.write(`
                  <html>
                  <head>
                    <title>Purchase Request</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                      @page {
                        size: A4 landscape;
                        margin: 10mm;
                      }
    
                      @media print {
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 0;
                          font-size: 10px;
                        }
                        .container {
                          width: 100%;
                          max-width: 100%;
                        }
                          
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            border-spacing: 0;
                            text-align: left;
                        }
    
                        th {
                            background: #2A3439 !important;
                            color: white !important;
                            text-align: left;
                            vertical-align: middle;
                            padding: 10px;
                            font-weight: normal !important;
                            font-size: 10px;
                        }
    
                        td {
                            text-align: left;
                            border-bottom: 1px solid #F0F2F7;
                            background: #ffff;
                            text-align: left;
                            vertical-align: middle;
                            color: black !important;
                            padding: 10px;
                            font-size: 10px;
                        }
    
                        .print-button {
                          display: none !important;
                        }
                      }
                     
                      .print-button {
                        padding: 10px 20px;
                        font-size: 16px;
                        margin: 20px;
                        cursor: pointer;
                      }
                    </style>
                  </head>
                  <body onload="window.focus();">
                    <div class="container">
                      <div id="print-content">${printContent.innerHTML}</div>
                      <div class="d-flex justify-content-center align-items-center">
                        <button class="btn btn-primary print-button" onclick="window.print()">Print Form</button>
                      </div>
                    </div>
                  </body>
                  </html>
                `);
                printDocument.close();

                // Ensure styles are applied before printing
                printPreview.onload = () => {
                    printPreview.focus();
                };
            } else {
                alert("Popup blocked! Please allow pop-ups for this site.");
            }
        }
    };



    return (
        <div className='bg-white rounded-5'>
            {loading && <LoadingSpinner />}
            {
                <div style={{ display: "none" }}>
                    <PRReportPDF context={props.context} tableData={paginatedData} ref={printRef} />
                </div>
            }
            <div className='d-flex flex-wrap align-items-center justify-content-between mt-3 px-2'>
                <div>
                    <div className={`${Style.tableTitle}`}>Purchase Requests<div style={{ fontSize: "10px" }}>Total Count: {dataList.length}</div></div>
                </div>
                <div className='d-flex justify-content-end gap-2'>
                    <div className={`${Style.searchInput}`}>
                        <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className={`${Style.selectColumn}`}
                        >
                            <option value="">All Columns</option>
                            <option value="PRNumber">PR Number</option>
                            <option value="Status">Status</option>
                            <option value="Requester">Requestor Name</option>
                            <option value="Department">Department</option>
                            <option value="RequestedDate">Requested Date</option>
                        </select>
                        <input
                            type="search"
                            placeholder="Search..."
                            value={globalFilter}
                            onChange={(e) => handleGlobalFilterChange(e.target.value)}
                            className={`${Style.columnInput}`}
                        />
                    </div>
                    <div className="dropdown">
                        <button
                            className={`${Style.secondaryButton} dropdown-toggle text-decoration-none`}
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            aria-haspopup="true"
                        >
                            Export
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <button className="dropdown-item" onClick={handleExport}>
                                    <BsFileEarmarkSpreadsheetFill size={18} className='me-2' />Export to Excel
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={handlePrintPreview}>
                                    <FaRegFilePdf size={17} className='me-2' />Export to PDF
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
            <div className='p-3'>
                <div className={`${styles.tableResponsive} `}>
                    <table className={`${styles.customTable}`}>
                        <thead>
                            <tr>
                                <th className='p-2'>S.No</th>
                                {columnsData.slice(2).map((column, index) => (
                                    <th key={index} className={`p-2 ${column.label === "Status" && 'ps-3'}`} style={{ minWidth: "80px", textWrap: "wrap", }}>
                                        <span className={`text-nowrap mb-1 d-block ${Style['table-header']}`}>
                                            {column.label}
                                            {sortConfig?.key === column.field && sortConfig.direction === 'ascending' ? (
                                                <FaSortDown onClick={() => handleSort(column.field as keyof IPRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                sortConfig?.key === column.field && sortConfig.direction === 'descending' ? (
                                                    <FaSortUp onClick={() => handleSort(column.field as keyof IPRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                                ) : (
                                                    <FaSort className={Style['sort-icon']} onClick={() => handleSort(column.field as keyof IPRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                                )
                                            )}
                                        </span>
                                        {isFilterApplied === column.field && filterableFields.includes(column.field as keyof IPRTableDataProps) && (
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder={`Search ${column.label}`}
                                                    value={filters[column.field as keyof IPRTableDataProps] || ''}
                                                    onChange={(e) => handleFilterChange(column.field as keyof IPRTableDataProps, e.target.value)}
                                                    className={`d-inline-block px-1 ${Style.searchInput}`}
                                                />
                                                <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((data, index) => (
                                <tr key={index}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className={`ps-5`}>{data.PRNumber}</td>
                                    <td >
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
                                    <td >{data.Requester}</td>
                                    <td >{data.Department}</td>
                                    <td >{data.RequestedDate}</td>
                                    <td >{data.PurchaseDetails}</td>
                                    <td >{data.Category}</td>
                                    <td >${data.TotalCost ? Number(data.TotalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</td>
                                    <td >${data.RecurringCost ? Number(data.RecurringCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</td>
                                    <td >{data.PurchaseType}</td>
                                    <td >{data.UseCase}</td>
                                    <td className={`text-center`}>{data.ARRequired}</td>
                                    <td style={{ minWidth: "200px", textWrap: "wrap" }}>{data.BusinessJustification}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 p-3">
                    <div className="d-flex flex-row align-items-center">
                        <label htmlFor="pageSizeSelect" className='text-nowrap'>Rows Per Page &nbsp;</label>
                        <select id="pageSizeSelect" value={pageSize} onChange={handlePageSizeChange} className={`${Style.inputStyle} text-nowrap`}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <div className='d-flex align-items-center gap-1'>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`${Style.paginationButton}`}>
                            <FiArrowLeftCircle size={20} />
                        </button>
                        <span className="mx-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${Style.paginationButton}`}>
                            <FiArrowRightCircle size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PRReport;