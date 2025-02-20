import React, { FC, useEffect, useRef, useState } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import { IconButton } from '@fluentui/react/lib/Button';
import { FaClock, FaRegClipboard, FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { MdCardTravel, MdOutlineCancel } from "react-icons/md";
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { BsFileEarmarkSpreadsheetFill } from "react-icons/bs";
import { HiPlusCircle } from "react-icons/hi";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { FaCheckCircle } from 'react-icons/fa';
import { RiDraftLine } from "react-icons/ri";
import styles from '../PurchaseRequestTravelRequest.module.scss';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { ITravelRequestProps } from './ITravelRequestProps';
import { TbCancel } from 'react-icons/tb';
import TRDocument from './TRpdfView';

// const columnsData: { label: string, field: string }[] = [
//     { label: 'S.No', field: 'serialNumber' },
//     { label: 'Action', field: 'Action' },
//     { label: 'TR Number', field: 'TRNumber' },
//     { label: 'Status', field: 'Status' },
//     { label: 'Requester', field: 'Requester' },
//     { label: 'Department', field: 'Department' },
//     { label: 'Requested Date', field: 'RequestedDate' },
// ];

export interface ITRTableDataProps {
    TRNumber: string; // Changed from number to string
    Status: string;
    Requester: string;
    RequesterId: number;
    Department: string;
    DepartmentId: number;
    RequestedDate: string;
    Where: string;
    When: string;
    TotalCostEstimate: number;
    BusinessJustification: string;
}

const TravelRequestTable: FC<ITravelRequestProps> = (props) => {
    const { table } = useParams();
    const [dataList, setDataList] = useState<ITRTableDataProps[]>([]);
    const [filters, setFilters] = useState<Partial<ITRTableDataProps>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof ITRTableDataProps; direction: 'ascending' | 'descending'; dataType: string } | null>(null);
    const [isFilterApplied, setIsFilterApplied] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedColumn, setSelectedColumn] = useState('');
    const [currentTR, setCurrentTR] = useState<number | null>(null);

    const handleGlobalFilterChange = (value: string) => {
        setGlobalFilter(value);
    };

    const handleFilterChange = (field: keyof ITRTableDataProps, value: string) => {
        setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
    };

    const handleSort = (field: keyof ITRTableDataProps) => {
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
            return data[selectedColumn as keyof ITRTableDataProps]
                ?.toString()
                .toLowerCase()
                .includes(globalFilter.toLowerCase());
        } else {
            return Object.keys(data).some((key) =>
                data[key as keyof ITRTableDataProps]
                    ?.toString()
                    .toLowerCase()
                    .includes(globalFilter.toLowerCase())
            );
        }
    });

    const filterableFields: Array<keyof ITRTableDataProps> = [
        "TRNumber", "Status", "Requester", "Department", "RequestedDate"
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
            "TR Number": data.TRNumber,
            "Status": data.Status,
            "Requester": data.Requester,
            "Department": data.Department,
            "Requested Date": data.RequestedDate,

        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TravelRequestDetails');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
        saveAs(data, `${table === 'TR' ? `PRTR_TravelRequests_${new Date().getTime()}${EXCEL_EXTENSION}` : `PRTR_Drafts_${new Date().getTime()}${EXCEL_EXTENSION}`}`);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const fetchPurchaseRequestData = async (status: string, userId: number): Promise<void> => {
        console.log(status, userId);
        setLoading(true);
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getTravelRequestDetails(userId, status, null);
            const TRDetails = data.TRDetails;
            const TRData: ITRTableDataProps[] = TRDetails.map((item: any) => ({
                TRNumber: item.Id,
                Requester: item.Requester?.Title,
                RequesterId: item.Requester?.Id,
                Department: item.Department?.Department,
                DepartmentId: item.Department?.Id,
                RequestedDate: formatDate(item?.RequestedDate),
                Where: item.Where ?? "",
                When: item.When ? formatDate(item.When) : "",
                TotalCostEstimate: item.TotalCostEstimate ?? 0,
                BusinessJustification: item.BusinessJustification ?? "",
                Status: item.Status ?? "",
            }));
            console.log(TRData)
            setDataList(TRData);
        } catch (error) {
            console.error('Error fetching PR data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (table === 'TR') {
            fetchPurchaseRequestData("All", props.userId);
            handlePageChange(1);
        } else if (table === 'MyDraft') {
            fetchPurchaseRequestData("Draft", props.userId);
            handlePageChange(1);
        }
    }, [table]);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrintPreview = () => {

        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            const printPreview = window.open("", "print_preview", "resizable=yes,scrollbars=yes,status=yes,toolbar=yes,width=800,height=600");

            if (printPreview) {
                const printDocument = printPreview.document;
                printDocument.open();
                printDocument.write(`
                  <html>
                  <head>
                    <title>Print Preview</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                      @page {
                        size: A4;
                        margin: 20mm;
                      }
    
                      @media print {
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                        
                        }
                        .container {
                          width: 100%;
                          max-width: 100%;
                          padding: 0;
                          margin: 0; 
                        }
                        .table {
                          width: 100%;
                          border-collapse: collapse;
                        }
                        .table th, .table td {
                          border: 1px solid #000 !important;
                          padding: 8px;
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
                      <div id="print-content">${printContent}</div>
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


    const tabs = [
        {
            key: 'TR',
            label: "Travel Request",
            icon: <MdCardTravel size={18} />,
            link: '/travelRequestTable/TR',
        },
        {
            key: 'MyDraft',
            label: "Draft(s)",
            icon: <RiDraftLine size={18} />,
            link: '/travelRequestTable/MyDraft',
        }
    ];

    return (
        <section className='bg-white rounded-5'>
            {loading && <LoadingSpinner />}
            <div style={{ display: "none" }}>
                {currentTR && <TRDocument context={props.context} currentTRId={currentTR} ref={printRef} />}
            </div>
            <div className='d-flex flex-wrap align-items-center justify-content-between'>
                <div className={Style['tabs-container']}>
                    {tabs.map((tab, index) => (
                        <div key={tab.key} className={`${Style.tabBg} ${table === tab.key ? Style.active : index > 0 && table === tabs[index - 1].key
                            ? Style.rightActive  // Apply 'rightActive' for the tab to the right
                            : index < tabs.length - 1 && table === tabs[index + 1].key
                                ? Style.leftActive  // Apply 'leftActive' for the tab to the left
                                : ''
                            }`}>
                            <div className={`${Style.tabSecondaryBg} ${table === tab.key ? Style.active : ''}`}>
                                <Link to={tab.link} className={table === tab.key ? `${Style.tab} ${Style.active}` : `${Style.tab}`}>
                                    <div className={Style['tab-icon']}>{tab.icon}</div>
                                    <div className={Style['tab-label']}>
                                        <span className={Style['main-label']}>{tab.label}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='d-flex flex-wrap align-items-center justify-content-between mt-3 px-2'>
                <div>
                    <div className={`${Style.tableTitle}`}>Travel Requests<div style={{ fontSize: "10px" }}>Total Count: {dataList.length}</div></div>
                </div>
                <div className='d-flex justify-content-end gap-2'>
                    <div className={`${styles.searchInput}`}>
                        <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className={`${styles.selectColumn}`}
                        >
                            <option value="">All Columns</option>
                            <option value="TRNumber">TR Number</option>
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
                            className={`${styles.columnInput}`}
                        />
                    </div>
                    <Link to="/travelRequest" className='text-decoration-none'>
                        <button className={`${Style.primaryButton}`}>
                            <HiPlusCircle size={20} />
                            Add TR
                        </button>
                    </Link>
                    <button className={`${Style.secondaryButton} text-nowrap`} onClick={handleExport}>
                        <BsFileEarmarkSpreadsheetFill size={15} />
                        Export to Excel
                    </button>
                </div>
            </div>
            <div className='p-3'>
                <div className={`${Style.tableResponsive}`}>
                    <table className={`${Style.customTable}`}>
                        <thead>
                            <tr>
                                <th className='p-2'>S.No</th>
                                <th className='p-2' style={{ minWidth: "80px", maxWidth: "80px", }}>Action</th>
                                <th className='p-2' style={{ textWrap: "wrap" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        TR Number
                                        {sortConfig?.key === 'TRNumber' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('TRNumber' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : sortConfig?.key === 'TRNumber' && sortConfig.direction === 'descending' ? (
                                            <FaSortUp onClick={() => handleSort('TRNumber' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            <FaSort className={styles['sort-icon']} onClick={() => handleSort('TRNumber' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        )}
                                    </span>
                                    {isFilterApplied === 'TRNumber' && filterableFields.includes('TRNumber' as keyof ITRTableDataProps) && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search TR Number"
                                                value={filters['TRNumber' as keyof ITRTableDataProps] || ''}
                                                onChange={(e) => handleFilterChange('TRNumber' as keyof ITRTableDataProps, e.target.value)}
                                                className={`d-inline-block px-1 ${Style.searchInput}`}
                                            />
                                            <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                        </div>
                                    )}
                                </th>

                                <th className='ps-4' style={{ textWrap: "wrap", textAlign: "left" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        Status
                                        {sortConfig?.key === 'Status' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('Status' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : sortConfig?.key === 'Status' && sortConfig.direction === 'descending' ? (
                                            <FaSortUp onClick={() => handleSort('Status' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            <FaSort className={styles['sort-icon']} onClick={() => handleSort('Status' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        )}
                                    </span>
                                    {isFilterApplied === 'Status' && filterableFields.includes('Status' as keyof ITRTableDataProps) && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Status"
                                                value={filters['Status' as keyof ITRTableDataProps] || ''}
                                                onChange={(e) => handleFilterChange('Status' as keyof ITRTableDataProps, e.target.value)}
                                                className={`d-inline-block px-1 ${Style.searchInput}`}
                                            />
                                            <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                        </div>
                                    )}
                                </th>

                                <th className='p-2' style={{ textWrap: "wrap" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        Requestor Name
                                        {sortConfig?.key === 'Requester' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('Requester' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : sortConfig?.key === 'Requester' && sortConfig.direction === 'descending' ? (
                                            <FaSortUp onClick={() => handleSort('Requester' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            <FaSort className={styles['sort-icon']} onClick={() => handleSort('Requester' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        )}
                                    </span>
                                    {isFilterApplied === 'Requester' && filterableFields.includes('Requester' as keyof ITRTableDataProps) && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Requester"
                                                value={filters['Requester' as keyof ITRTableDataProps] || ''}
                                                onChange={(e) => handleFilterChange('Requester' as keyof ITRTableDataProps, e.target.value)}
                                                className={`d-inline-block px-1 ${Style.searchInput}`}
                                            />
                                            <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                        </div>
                                    )}
                                </th>

                                <th className='p-2 ps-3' style={{ textWrap: "wrap" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        Department
                                        {sortConfig?.key === 'Department' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('Department' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : sortConfig?.key === 'Department' && sortConfig.direction === 'descending' ? (
                                            <FaSortUp onClick={() => handleSort('Department' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            <FaSort className={styles['sort-icon']} onClick={() => handleSort('Department' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        )}
                                    </span>
                                    {isFilterApplied === 'Department' && filterableFields.includes('Department' as keyof ITRTableDataProps) && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Department"
                                                value={filters['Department' as keyof ITRTableDataProps] || ''}
                                                onChange={(e) => handleFilterChange('Department' as keyof ITRTableDataProps, e.target.value)}
                                                className={`d-inline-block px-1 ${Style.searchInput}`}
                                            />
                                            <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                        </div>
                                    )}
                                </th>

                                <th className='p-2 ps-3' style={{ textWrap: "wrap" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        Requested Date
                                        {sortConfig?.key === 'RequestedDate' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('RequestedDate' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : sortConfig?.key === 'RequestedDate' && sortConfig.direction === 'descending' ? (
                                            <FaSortUp onClick={() => handleSort('RequestedDate' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            <FaSort className={styles['sort-icon']} onClick={() => handleSort('RequestedDate' as keyof ITRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        )}
                                    </span>
                                    {isFilterApplied === 'RequestedDate' && filterableFields.includes('RequestedDate' as keyof ITRTableDataProps) && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Requested Date"
                                                value={filters['RequestedDate' as keyof ITRTableDataProps] || ''}
                                                onChange={(e) => handleFilterChange('RequestedDate' as keyof ITRTableDataProps, e.target.value)}
                                                className={`d-inline-block px-1 ${Style.searchInput}`}
                                            />
                                            <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                        </div>
                                    )}
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((data, index) => (
                                <tr key={index}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>
                                        {table === "TR" ? (
                                            data.Status === "Approved" || data.Status === "In Progress" ? (
                                                <>
                                                    <Link to={`/travelRequestUpdate/${data.TRNumber}`}>
                                                        <IconButton iconProps={{ iconName: "View" }} title="View" className={Style.iconButton} />
                                                    </Link>
                                                    <IconButton iconProps={{ iconName: 'PDF' }} title="PDF" className={Style.iconButton} disabled={data.Status !== "Approved"} onClick={() => { handlePrintPreview(); setCurrentTR(Number(data.TRNumber)) }} />
                                                </>
                                            ) : (
                                                <>
                                                    {data.RequesterId !== props.userId && data.Status === "Rejected" ?
                                                        <Link to={`/travelRequestUpdate/${data.TRNumber}`}>
                                                            <IconButton iconProps={{ iconName: "View" }} title="View" className={Style.iconButton} />
                                                        </Link>
                                                        :
                                                        <Link to={`/travelRequest/${data.TRNumber}`}>
                                                            <IconButton iconProps={{ iconName: "Edit" }} title="Edit" className={Style.iconButton} />
                                                        </Link>
                                                    }
                                                    <IconButton iconProps={{ iconName: 'PDF' }} title="PDF" className={Style.iconButton} disabled={data.Status !== "Approved"} onClick={() => { handlePrintPreview(); setCurrentTR(Number(data.TRNumber)) }} />
                                                </>
                                            )
                                        ) : (
                                            <Link to={`/travelRequest/${data.TRNumber}`}>
                                                <IconButton iconProps={{ iconName: "Edit" }} title="Edit" className={Style.iconButton} />
                                            </Link>
                                        )}
                                    </td>

                                    <td className={``}>{data.TRNumber}</td>
                                    <td>
                                        <span className={
                                            data.Status === "Approved" ? Style.approved :
                                                data.Status === "Rejected" ? Style.rejected :
                                                    data.Status === "Draft" ? Style.draft :
                                                        data.Status === "In Progress" ? Style.pending :
                                                            ""
                                        }>
                                            {data.Status === "Approved" && <FaCheckCircle size={14} />}
                                            {data.Status === "Rejected" && <TbCancel size={15} />}
                                            {data.Status === "Draft" && <FaRegClipboard size={14} />}
                                            {data.Status === "In Progress" && <FaClock size={14} />}
                                            {data.Status}
                                        </span>
                                    </td>
                                    <td >{data.Requester}</td>
                                    <td>{data.Department}</td>
                                    <td>{data.RequestedDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-between align-items-center my-3 p-3 ">
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
        </section>
    );
};

export default TravelRequestTable;