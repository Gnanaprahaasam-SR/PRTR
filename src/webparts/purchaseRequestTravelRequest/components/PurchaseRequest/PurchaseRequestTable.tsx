import React, { FC, useEffect, useState, useRef } from 'react';
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
import { AiOutlineExclamationCircle } from 'react-icons/ai';
// import jsPDF from 'jspdf';
import PRDocument from './PRpdfView';
import { Dialog, DialogType } from '@fluentui/react';

// const columnsData: { label: string, field: string }[] = [
//     { label: 'S.No', field: 'serialNumber' },
//     { label: 'Action', field: 'Action' },
//     { label: 'PR Number', field: 'PRNumber' },
//     { label: 'Status', field: 'Status' },
//     { label: 'Requester', field: 'Requester' },
//     { label: 'Department', field: 'Department' },
//     { label: 'Requested Date', field: 'RequestedDate' },
// ];

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
    AuthorId: number;
}

export interface PRDiscussionState {
    Id: number;
    PRNumberId: number;
    Question: string;
    RaisedById: number;
    RaisedBy: string;
    RaisedOn: string;
    Answer: string;
    AnsweredById: number;
    AnswerBy: string;
    AnsweredOn: string;
}

const PurchaseRequestTable: FC<IPurchaseRequestFormProps> = (props) => {
    const { table, status } = useParams();
    const [dataList, setDataList] = useState<IPRTableDataProps[]>([]);
    const [filters, setFilters] = useState<Partial<IPRTableDataProps>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof IPRTableDataProps; direction: 'ascending' | 'descending'; dataType: string } | null>(null);
    const [isFilterApplied, setIsFilterApplied] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedColumn, setSelectedColumn] = useState('');
    const [currentPR, setCurrentPR] = useState<number | null>(null);
    const [currentPRNumber, setCurrentPRNumber] = useState<number>();

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState<boolean>(false);
    const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState<boolean>(false);

    const [currentPRApprovers, setCurrentPRApprovers] = useState<{ Id: number, Title: string }[]>([]);
    const [toWhom, setToWhom] = useState<string>();
    const [question, setQuestion] = useState<string>();
    const [answer, setAnswer] = useState<string>();

    const [userQuestions, setUserQuestions] = useState<PRDiscussionState[]>([]);
    const [currentUserQuestions, setCurrentUserQuestions] = useState<PRDiscussionState | null>();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');

    const closeDialog = (): void => {
        setIsQuestionDialogOpen(false);
        setIsDialogOpen(false);
        setDialogMessage('');
        setDialogTitle('');
    };

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
            "Requestor": data.Requester,
            "Department": data.Department,
            "Requested Date": data.RequestedDate,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductRequestDetails');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
        saveAs(data, `${(table === 'AllPRs' || table === 'MyPendingApprovals') ? `PRTR_PurchaseRequests_${new Date().getTime()}${EXCEL_EXTENSION}` : `PRTR_Drafts_${new Date().getTime()}${EXCEL_EXTENSION}`}`);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    const fetchPRApprovalsByUser = async (userId: number): Promise<any> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const response = await service.getPRApprovalsByUser(userId);
            // console.log("response", response);
            return response;
        } catch (error) {
            console.error("Error fetching User Approvals", error);
        }
    }

    const fetchQuestionsByUser = async (): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const response = await service.getPRQuestionsByUser(props.userId);
            console.log("Unanswer Questions for the user:", response);

            const formatQuestions = response.map((item: any) => {
                return {
                    Id: item?.ID,
                    PRNumberId: item?.PRNumber?.Id,
                    Question: item?.Question,
                    RaisedById: item?.RaisedBy?.Id,
                    RaisedBy: item?.RaisedBy?.Title,
                    RaisedOn: item?.RaisedOn,
                    Answer: item?.Answer,
                    AnswerById: item?.AnswerBy?.Id,
                    AnswerBy: item?.AnswerBy?.Title,
                    AnsweredOn: item?.AnsweredOn
                }
            });

            setUserQuestions(formatQuestions);
            console.log("Formated items", formatQuestions);

            return response;
        } catch (error) {
            console.error("Error fetching User Approvals", error);
        }
    }

    const fetchPurchaseRequestData = async (status: string, userId: number): Promise<void> => {
        setLoading(true);
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPurchaseRequestDetails(userId, status, null);
            const PRDetail = data.PRDetails;
            const PRData: IPRTableDataProps[] = PRDetail.reverse().map((item) => ({
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
                AuthorId: item?.Author?.Id,
            }));

            fetchQuestionsByUser();

            if (table === "MyPendingApprovals") {
                const response = await fetchPRApprovalsByUser(props.userId);
                // console.log("response", response);

                const newPRData = PRData.filter((PR) =>
                    response.some((item: any) => item.PurchaseRequestId.Id === PR.PRNumber && PR.Status === "In Progress")
                );

                // console.log("newPRData", newPRData);
                setDataList(newPRData);
            } else {
                setDataList(PRData);
            }

        } catch (error) {
            console.error('Error fetching PR data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePRDelete = async (PRId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        try {
            await service.deletePurchaseRequest(PRId);
            setCurrentPR(null);
            fetchPurchaseRequestData(table === 'AllPRs' ? 'All' : 'Draft', props.userId);
        } catch (error) {
            console.error('Error deleting PR:', error);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (status && dataList.length > 0) {
            handleGlobalFilterChange(status);
        }
    }, [dataList])

    useEffect(() => {
        if (table === 'AllPRs') {
            fetchPurchaseRequestData("All", props.userId);
            handlePageChange(1);
        } else if (table === 'MyDraft') {
            fetchPurchaseRequestData("Draft", props.userId);
            handlePageChange(1);
        }
        else if (table === 'MyPendingApprovals') {
            fetchPurchaseRequestData("All", props.userId);
        }

    }, [table]);

    const fetchPRApprovalsByPR = async (currentPRNumber: number) => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const response = await service.getPRApprovalsByPR(currentPRNumber);
            console.log("current PR item's approvers:", response);
            return response;

        } catch (error) {
            console.error("Error fetching User Approvals", error);
        }
    }

    const handleQuestionClick = async (currentPRNumber: number): Promise<void> => {
        setIsQuestionDialogOpen(true);
        setLoading(true);
        setCurrentPRNumber(currentPRNumber);
        try {
            const response = await fetchPRApprovalsByPR(currentPRNumber);

            const formatPRApprovers = response.map((item: any) => {
                return {
                    Id: item.Approver.Id,
                    Title: item.Approver.Title
                };
            })
            console.log("format PR Approvers", formatPRApprovers);
            setCurrentPRApprovers(formatPRApprovers);

            console.log(currentPRApprovers);
            // setPRApprovals(response);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching User Approvals", error);
        }
    }

    const handleAnswerClick = async (currentPRNumber: number) => {
        setIsAnswerDialogOpen(true);
        setCurrentUserQuestions(userQuestions.find(question => question.PRNumberId === currentPRNumber));
    }

    const handleAnswerSubmit = async () => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        setIsAnswerDialogOpen(false);
        const currentDate = new Date();
        try {
            const formatedData = {
                Id: currentUserQuestions?.Id,
                PRNumberId: currentUserQuestions?.PRNumberId,
                Question: currentUserQuestions?.Question,
                RaisedById: currentUserQuestions?.RaisedById,
                RaisedOn: currentUserQuestions?.RaisedOn,
                Answer: answer,
                AnswerById: currentUserQuestions?.AnsweredById,
                AnsweredOn: currentDate
            };

            const response = await service.addAnswerToPR(formatedData);

            if (response) {
                setIsDialogOpen(true);
                setDialogMessage('Your answer has been submitted successfully.');
                setDialogTitle('Answer Submitted');
                fetchQuestionsByUser();
            }
            // console.log("Answered:", response);

        } catch (err) {
            console.error("Error formatting data", err);
        } finally {
            setLoading(false);
            setAnswer("");
            setCurrentUserQuestions(null);
        }
    }

    const handleQuestionSubmit = async () => {
        // handle question submission logic here
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        setIsQuestionDialogOpen(false);

        const currentDate = new Date();
        try {
            const formatedData = {
                PRNumberId: currentPRNumber,
                Question: question,
                RaisedById: props.userId,
                RaisedOn: currentDate,
                Answer: undefined,
                AnswerById: Number(toWhom),
                AnsweredOn: undefined
            };
            const response = await service.addQuestionToPR(formatedData);
            if (response) {
                setIsDialogOpen(true);
                setDialogMessage('Your Question has been submitted successfully.');
                setDialogTitle('Question Submitted');
            }
            // console.log("Quesition Asked:", response);
        } catch (err) {
            console.error('Error adding question:', err);
        } finally {
            setLoading(false);
            setQuestion("");
            setCurrentPRApprovers([]);
            setToWhom("");
            setCurrentPR(null);
            setCurrentPRNumber(undefined);
        }
    }

    const tabs = [
        {
            key: 'AllPRs',
            label: "All PR(s)",
            icon: <BiPurchaseTagAlt size={18} />,
            link: '/purchaseRequestTable/AllPRs',
        },
        {
            key: 'MyPendingApprovals',
            label: "My Pending Approval(s)",
            icon: <AiOutlineExclamationCircle size={18} />,
            link: '/purchaseRequestTable/MyPendingApprovals',
        },
        {
            key: 'MyDraft',
            label: "Draft(s)",
            icon: <RiDraftLine size={18} />,
            link: '/purchaseRequestTable/MyDraft',
        }
    ];

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrintPreview = (PRId: number): void => {
        setCurrentPR(PRId);
        setTimeout(() => {
            if (printRef.current) {
                const printContent = printRef.current.innerHTML;
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
                    size: A4;
                    margin: 10mm;
                  }

                  @media print {
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                    }
                    .container {
                      width: 100%;
                      max-width: 100%;
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
        }, 500);
    };

    return (
        <section className='bg-white rounded-5'>
            {loading && <LoadingSpinner />}
            {currentPR !== null && (
                <div style={{ display: "none" }}>
                    <PRDocument context={props.context} currentPRId={currentPR} ref={printRef} />
                </div>
            )}

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

            <div className='d-flex justify-content-between align-items-center w-100 gap-2 mt-3 px-2'>
                <div className='d-flex flex-wrap gap-2 align-items-center'>
                    <label><b>Filter By:</b></label>
                    <div className={`${styles.searchInput}`}>
                        <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className={`${styles.selectColumn}`}
                        >
                            <option value="">All</option>
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
                            className={`${styles.columnInput}`}
                        />
                    </div>
                </div>

                <div className='d-flex align-items-center gap-2'>
                    <Link to="/purchaseRequest" className='text-decoration-none'>
                        <button className={`${Style.primaryButton}`}>
                            <HiPlusCircle size={20} />
                            Create Purchase
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
                                <th className='p-2 text-center'>S.No</th>
                                <th className='p-2 text-center' style={{ width: "80px", maxWidth: "80px" }}>Action</th>
                                <th className='p-2' style={{ textWrap: "wrap" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        PR Number
                                        {sortConfig?.key === 'PRNumber' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('PRNumber')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            sortConfig?.key === 'PRNumber' && sortConfig.direction === 'descending' ? (
                                                <FaSortUp onClick={() => handleSort('PRNumber')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                <FaSort className={styles['sort-icon']} onClick={() => handleSort('PRNumber')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            )
                                        )}
                                    </span>
                                    {isFilterApplied === 'PRNumber' && filterableFields.includes('PRNumber') && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search PR Number"
                                                value={filters['PRNumber'] || ''}
                                                onChange={(e) => handleFilterChange('PRNumber', e.target.value)}
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
                                            <FaSortDown onClick={() => handleSort('Status')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            sortConfig?.key === 'Status' && sortConfig.direction === 'descending' ? (
                                                <FaSortUp onClick={() => handleSort('Status')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                <FaSort className={styles['sort-icon']} onClick={() => handleSort('Status')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            )
                                        )}
                                    </span>
                                    {isFilterApplied === 'Status' && filterableFields.includes('Status') && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Status"
                                                value={filters['Status'] || ''}
                                                onChange={(e) => handleFilterChange('Status', e.target.value)}
                                                className={`d-inline-block px-1 ${Style.searchInput}`}
                                            />
                                            <MdOutlineCancel onClick={() => { setIsFilterApplied(''); setFilters({}) }} style={{ cursor: 'pointer', marginLeft: '5px' }} size={18} />
                                        </div>
                                    )}
                                </th>

                                <th className='p-2 ps-3' style={{ textWrap: "wrap" }}>
                                    <span className={`text-nowrap mb-1 d-block ${styles['table-header']}`}>
                                        Requestor Name
                                        {sortConfig?.key === 'Requester' && sortConfig.direction === 'ascending' ? (
                                            <FaSortDown onClick={() => handleSort('Requester')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            sortConfig?.key === 'Requester' && sortConfig.direction === 'descending' ? (
                                                <FaSortUp onClick={() => handleSort('Requester')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                <FaSort className={styles['sort-icon']} onClick={() => handleSort('Requester')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            )
                                        )}
                                    </span>
                                    {isFilterApplied === 'Requester' && filterableFields.includes('Requester') && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Requester"
                                                value={filters['Requester'] || ''}
                                                onChange={(e) => handleFilterChange('Requester', e.target.value)}
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
                                            <FaSortDown onClick={() => handleSort('Department')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            sortConfig?.key === 'Department' && sortConfig.direction === 'descending' ? (
                                                <FaSortUp onClick={() => handleSort('Department')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                <FaSort className={styles['sort-icon']} onClick={() => handleSort('Department')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            )
                                        )}
                                    </span>
                                    {isFilterApplied === 'Department' && filterableFields.includes('Department') && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Department"
                                                value={filters['Department'] || ''}
                                                onChange={(e) => handleFilterChange('Department', e.target.value)}
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
                                            <FaSortDown onClick={() => handleSort('RequestedDate')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                        ) : (
                                            sortConfig?.key === 'RequestedDate' && sortConfig.direction === 'descending' ? (
                                                <FaSortUp onClick={() => handleSort('RequestedDate')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            ) : (
                                                <FaSort className={styles['sort-icon']} onClick={() => handleSort('RequestedDate')} style={{ cursor: 'pointer', marginLeft: '5px' }} />
                                            )
                                        )}
                                    </span>
                                    {isFilterApplied === 'RequestedDate' && filterableFields.includes('RequestedDate') && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search Requested Date"
                                                value={filters['RequestedDate'] || ''}
                                                onChange={(e) => handleFilterChange('RequestedDate', e.target.value)}
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
                                    <td className='text-center'>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className='text-center'>
                                        {table === 'AllPRs' ? (
                                            data.Status === "Approved" || data.Status === "In Progress" ? (
                                                <>
                                                    <Link to={`/purchaseRequestUpdate/${data.PRNumber}`}>
                                                        <IconButton iconProps={{ iconName: 'View' }} title="View" className={Style.iconButton} />
                                                    </Link>

                                                    <IconButton iconProps={{ iconName: 'PDF' }} title="PDF" className={Style.iconButton} disabled={data.Status !== "Approved"} onClick={() => { handlePrintPreview(Number(data.PRNumber)); }} />

                                                    {(data.Status === "In Progress"  && userQuestions.find((question: PRDiscussionState) => question.PRNumberId === Number(data.PRNumber))) ? (
                                                        <IconButton
                                                            iconProps={{ iconName: 'Comment' }}
                                                            title="Question Raised"
                                                            className={Style.iconButton}
                                                            onClick={() => handleAnswerClick(Number(data.PRNumber))}
                                                        />
                                                    ) : null}

                                                </>
                                            ) : (
                                                <>
                                                    {(data.RequesterId === props.userId || data.AuthorId === props.userId) && data.Status === "Rejected" ?
                                                        <>
                                                            <Link to={`/purchaseRequest/${data.PRNumber}`}>
                                                                <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" className={Style.iconButton} />
                                                            </Link>
                                                            <Link to={`/purchaseRequestUpdate/${data.PRNumber}`}>
                                                                <IconButton iconProps={{ iconName: 'View' }} title="View" className={Style.iconButton} />
                                                            </Link>
                                                        </>
                                                        :
                                                        <>
                                                            <Link to={`/purchaseRequestUpdate/${data.PRNumber}`}>
                                                                <IconButton iconProps={{ iconName: 'View' }} title="View" className={Style.iconButton} />
                                                            </Link>
                                                            <IconButton iconProps={{ iconName: 'PDF' }} title="PDF" className={Style.iconButton} disabled={data.Status !== "Approved"} onClick={() => { handlePrintPreview(Number(data.PRNumber)); }} />
                                                        </>
                                                    }

                                                </>
                                            )
                                        ) : (table === "MyDraft" ? (
                                            <>
                                                <Link to={`/purchaseRequest/${data.PRNumber}`}>
                                                    <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" className={Style.iconButton} />
                                                </Link>
                                                <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" onClick={() => { handlePRDelete(Number(data.PRNumber)); }} className={Style.iconButton} />
                                            </>
                                        ) : (table === "MyPendingApprovals" &&
                                            <>
                                                <Link to={`/purchaseRequestUpdate/${data.PRNumber}`}>
                                                    <IconButton iconProps={{ iconName: 'View' }} title="View" className={Style.iconButton} />
                                                </Link>
                                                <IconButton
                                                    iconProps={{ iconName: 'SurveyQuestions' }}
                                                    onClick={() => {
                                                        setCurrentPRNumber(Number(data.PRNumber));
                                                        handleQuestionClick(Number(data.PRNumber));
                                                    }}
                                                    title="Question"
                                                    className={Style.iconButton}
                                                />
                                            </>
                                        )
                                        )}

                                    </td>
                                    <td className={``}>{data.PRNumber}</td>
                                    <td className=''>
                                        <span className={
                                            data.Status === "Approved" ? Style.approved :
                                                data.Status === "Rejected" ? Style.rejected :
                                                    data.Status === "Draft" ? Style.draft :
                                                        data.Status === "In Progress" ? Style.pending :
                                                            ""
                                        } >
                                            {data.Status === "Approved" && <FaRegCircleCheck size={14} />}
                                            {data.Status === "Rejected" && <TbCancel size={15} />}
                                            {data.Status === "Draft" && <FaRegClipboard size={14} />}
                                            {data.Status === "In Progress" && <FaClock size={14} />}
                                            {data.Status}
                                        </span>
                                    </td>
                                    <td >{data.Requester}</td>
                                    <td >{data.Department}</td>
                                    <td className='text-center'>{data.RequestedDate}</td>
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
                    <div style={{ fontSize: "12px" }}>Total Count: <b>{dataList.length}</b></div>
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

            <Dialog
                hidden={!isQuestionDialogOpen}
                onDismiss={closeDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Question",
                }}
            >
                <label htmlFor="toWhom">To Whom:</label>
                <select id="toWhom" value={toWhom} onChange={(e) => setToWhom(e.target.value)} className={Style.inputStyle}>
                    <option value="">---- SELECT ----</option>
                    {currentPRNumber && (
                        <option
                            key={dataList.find(data => Number(data.PRNumber) === currentPRNumber)?.RequesterId ?? ''}
                            value={dataList.find(data => Number(data.PRNumber) === currentPRNumber)?.RequesterId ?? ''}
                        >
                            {dataList.find(data => Number(data.PRNumber) === currentPRNumber)?.Requester ?? ''} (Requester)
                        </option>
                    )}
                    {currentPRApprovers.map((item) => (
                        <option key={item.Id} value={item.Id}>{item.Title} (Approver)</option>
                    ))}
                </select>
                <label htmlFor="questionInput">Question:</label>
                <textarea id="questionInput" value={question} onChange={(e) => setQuestion(e.target.value)} className={`${Style.inputStyle} w-100`} rows={5} placeholder="Enter your question here..." />
                <div className="float-end my-3">
                    <div className="d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                        <button className={`${Style.primaryButton} px-3`} onClick={handleQuestionSubmit}>Submit</button>
                        <button className={`${Style.grayButton} px-3`} onClick={() => setIsQuestionDialogOpen(false)}>Close</button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                hidden={!isAnswerDialogOpen}
                onDismiss={closeDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Answer",
                }}
            >
                <label>Raised by <b>{currentUserQuestions?.RaisedBy}</b></label><br />
                <label htmlFor="question">Question: <b>{currentUserQuestions?.Question}</b></label><br />

                <label htmlFor="answerInput">Answer:</label>
                <textarea id="answerInput" value={answer} onChange={(e) => setAnswer(e.target.value)} className={`${Style.inputStyle} w-100`} rows={5} placeholder="Enter your question here..." />

                <div className="float-end my-3">
                    <div className="d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                        <button className={`${Style.primaryButton} px-3`} onClick={handleAnswerSubmit}>Submit</button>
                        <button className={`${Style.grayButton} px-3`} onClick={() => setIsAnswerDialogOpen(false)}>Close</button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                hidden={!isDialogOpen}
                onDismiss={closeDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: dialogTitle,
                    subText: dialogMessage,
                }}
            >
                <div className="float-end m-3">
                    <button className={`${Style.closeButton} px-3`} onClick={closeDialog} > OK </button>
                </div>
            </Dialog>
        </section>
    );
};

export default PurchaseRequestTable;