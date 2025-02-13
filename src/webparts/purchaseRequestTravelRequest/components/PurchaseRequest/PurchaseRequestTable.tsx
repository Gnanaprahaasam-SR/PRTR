import React, { FC, useEffect, useState } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import { IconButton } from '@fluentui/react/lib/Button';
import { FaClock, FaRegCircleCheck, FaRegClipboard, FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { BsFileEarmarkSpreadsheetFill } from "react-icons/bs";
import { HiPlusCircle } from "react-icons/hi";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { RiDraftLine } from "react-icons/ri";
import { BiPurchaseTagAlt } from "react-icons/bi";
import styles from '../PurchaseRequestTravelRequest.module.scss';
import { IPurchaseRequestFormProps } from './IPurchaseRequestFormProps';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { TbCancel } from 'react-icons/tb';

const columnsData: { label: string, field: string }[] = [
    { label: 'S.No', field: 'serialNumber' },
    { label: 'Action', field: 'Action' },
    { label: 'PR Number', field: 'PRNumber' },
    { label: 'Status', field: 'Status' },
    { label: 'Requester', field: 'Requester' },
    { label: 'Department', field: 'Department' },
    { label: 'Requested Date', field: 'RequestedDate' },
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
}

const PurchaseRequestTable: FC<IPurchaseRequestFormProps> = (props) => {
    const { table } = useParams();
    const [dataList, setDataList] = useState<IPRTableDataProps[]>([]);
    const [filters, setFilters] = useState<Partial<IPRTableDataProps>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof IPRTableDataProps; direction: 'ascending' | 'descending'; dataType: string } | null>(null);
    const [isFilterApplied, setIsFilterApplied] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedColumn, setSelectedColumn] = useState('');

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
            "PR Number": data.PRNumber,
            "Status": data.Status,
            "Requester": data.Requester,
            "Department": data.Department,
            "Requested Date": data.RequestedDate,

        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductRequestDetails');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
        saveAs(data, `${table === 'PR' ? `PRTR_PurchaseRequests_${new Date().getTime()}${EXCEL_EXTENSION}` : `PRTR_Drafts_${new Date().getTime()}${EXCEL_EXTENSION}`}`);
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
            const data = await service.getPurchaseRequestDetails(userId, status, null);
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
            }));
            setDataList(PRData);
        } catch (error) {
            console.error('Error fetching PR data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (table === 'PR') {
            fetchPurchaseRequestData("All", props.userId);
            handlePageChange(1);
        } else if (table === 'MyDraft') {
            fetchPurchaseRequestData("Draft", props.userId);
            handlePageChange(1);
        }
    }, [table]);

    const tabs = [
        {
            key: 'PR',
            label: "Purchase Request",
            icon: <BiPurchaseTagAlt size={18} />,
            link: '/purchaseRequestTable/PR',
        },
        {
            key: 'MyDraft',
            label: "Draft(s)",
            icon: <RiDraftLine size={18} />,
            link: '/purchaseRequestTable/MyDraft',
        }
    ];

    return (
        <section className='bg-white rounded-5'>
            {loading && <LoadingSpinner />}
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
                    <div className={`${Style.tableTitle}`}>Purchase Requests<div style={{ fontSize: "10px" }}>Total Count: {dataList.length}</div></div>
                </div>
                <div className='d-flex justify-content-end gap-2'>
                    <div className={`${styles.searchInput}`}>
                        <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className={`${styles.selectColumn}`}
                        >
                            <option value="">All Columns</option>
                            <option value="PRNumber">PR Number</option>
                            <option value="Status">Status</option>
                            <option value="Requester">Requester</option>
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
                    <Link to="/purchaseRequest" className='text-decoration-none'>
                        <button className={`${Style.primaryButton}`}>
                            <HiPlusCircle size={20} />
                            Add PR
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
                                <th className='p-2' style={{ minWidth: "80px", maxWidth: "80px" }}>Action</th>
                                {columnsData.slice(2).map((column, index) => (
                                    <th key={index} className='p-2' style={{ minWidth: "80px", maxWidth: "150px", textWrap:"wrap",}}>
                                        <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                            {column.label}
                                            {sortConfig?.key === column.field && sortConfig.direction === 'ascending' ? (
                                                <FaSortDown onClick={() => handleSort(column.field as keyof IPRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                sortConfig?.key === column.field && sortConfig.direction === 'descending' ? (
                                                    <FaSortUp onClick={() => handleSort(column.field as keyof IPRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                                ) : (
                                                    <FaSort className={styles['sort-icon']} onClick={() => handleSort(column.field as keyof IPRTableDataProps)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
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
                                    <td>
                                        {table === 'PR' ? (
                                            data.Status === "Approved" || data.Status === "In Progress" ? (
                                                <>
                                                    <Link to={`/purchaseRequestUpdate/${data.PRNumber}`}>
                                                        <IconButton iconProps={{ iconName: 'View' }} title="View" className={Style.iconButton} />
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    {data.RequesterId === props.userId && data.Status === "Rejected" ?
                                                        <Link to={`/purchaseRequest/${data.PRNumber}`}>
                                                            <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" className={Style.iconButton} />
                                                        </Link>
                                                        :
                                                        <Link to={`/purchaseRequestUpdate/${data.PRNumber}`}>
                                                            <IconButton iconProps={{ iconName: 'View' }} title="View" className={Style.iconButton} />
                                                        </Link>
                                                    }
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <Link to={`/purchaseRequest/${data.PRNumber}`}>
                                                    <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" className={Style.iconButton} />
                                                </Link>
                                            </>
                                        )}
                                    </td>
                                    <td className={`ps-4`}>{data.PRNumber}</td>
                                    <td >
                                        <span className={
                                            data.Status === "Approved" ? Style.approved :
                                                data.Status === "Rejected" ? Style.rejected :
                                                    data.Status === "Draft" ? Style.draft :
                                                        data.Status === "In Progress" ? Style.pending :
                                                            ""
                                        }>
                                            {data.Status === "Approved" && <FaRegCircleCheck size={14} />}
                                            {data.Status === "Rejected" && <TbCancel size={15} />}
                                            {data.Status === "Draft" && <FaRegClipboard size={14} />}
                                            {data.Status === "In Progress" && <FaClock size={14} />}
                                            {data.Status}
                                        </span>
                                    </td>
                                    <td >{data.Requester}</td>
                                    <td >{data.Department}</td>
                                    <td >{data.RequestedDate}</td>
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
        </section>
    );
};

export default PurchaseRequestTable;