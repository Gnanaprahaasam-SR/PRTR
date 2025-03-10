import React, { FC, useEffect, useState } from 'react'
import Style from '../PurchaseRequestTravelRequest.module.scss';
import { BsBoxArrowLeft } from "react-icons/bs";
import { FaClock, FaUser } from "react-icons/fa6";
import {
    Dialog,
    DialogType,
} from '@fluentui/react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { IPurchaseRequestFormProps } from './IPurchaseRequestFormProps';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { FaRegCircleCheck } from "react-icons/fa6";
import { TbCancel } from "react-icons/tb";
import { FiShoppingCart } from 'react-icons/fi';
import { GrAttachment } from 'react-icons/gr';
import { format } from "date-fns";
import { FaUserEdit } from 'react-icons/fa';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { PRDiscussionState } from './PurchaseRequestTable';

interface IPurchaseRequestDataProps {
    id: number | null;
    requester: string;
    requesterId: number | undefined;
    department: string;
    departmentId: number | undefined;
    requestedDate: string;
    purchaseDetails: string;
    itemServiceDescription: string;
    category: string;
    totalCost: number | undefined;
    recurringCost: number | undefined;
    businessJustification: string;
    purchaseType: string;
    ARRequired: boolean;
    useCase: string;
    status: string;
    ARDetails: string;
    AuthorId?: number;
}

interface IApproverProps {
    Id: number,
    PRId: number,
    Approver: string,
    ApproverId: number,
    Role: string,
    Status: string,
    Comments: string,
    Hierarchy: number,
    ApprovedDate: string
}

interface DocumentState {
    id: number;
    fileName: string;
    fileRef: string;
}

const PRUpdate: FC<IPurchaseRequestFormProps> = (props) => {
    // const dateFormate = (date: string): string => {
    //     const existingDate = new Date(date).toISOString().split('T')[0];
    //     return existingDate;
    // };

    const currentDate = new Date().toISOString().split('T')[0];
    const { PRId } = useParams();
    const currentPRId: number | null = PRId ? Number(PRId) : null;
    const [isEditApprover, setIsEditApprover] = useState(false);
    const [selectedNewApprover, setSelectedNewApprover] = useState<{ ApproverId: number, Approver: string }>();
    const [selectedCurrentApprover, setSelectedCurrentApprover] = useState<IApproverProps>();
    const [formData, setFormData] = useState<IPurchaseRequestDataProps>({
        id: null,
        requester: props.userName,
        requesterId: props.userId,
        department: "",
        departmentId: undefined,
        requestedDate: currentDate,
        purchaseDetails: "",
        itemServiceDescription: "",
        category: "",
        totalCost: undefined,
        recurringCost: undefined,
        businessJustification: "",
        purchaseType: "",
        ARRequired: false,
        useCase: "",
        status: "Pending",
        ARDetails: "",
        AuthorId: undefined
    });

    const [approvers, setApprovers] = useState<IApproverProps[]>([]);
    const [updateApprovalData, setUpdateApprovalData] = useState<IApproverProps | null>(null);
    const [approvalDialog, setApprovalDialog] = useState<boolean>(false);
    const [confirmApproval, setConfirmApproval] = useState<boolean>(false);
    const navigate = useNavigate();
    const [approvalStatus, setApprovalStatus] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [discussions, setDiscussions] = useState<PRDiscussionState[]>([]);
    const closeDialog = (): void => {
        setIsDialogOpen(false);
        setDialogMessage('');
        setDialogTitle('');
    }
    const [document, setDocument] = useState<DocumentState[]>([]);

    const handleBackClick = (): void => {
        navigate(-1);
    };

    const fetchPurchaseRequestDetails = async (purchaseRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {
            const existingPR = await service.getPurchaseRequestDetails(null, "All", purchaseRequestId);

            // Ensure PRDetails is an array before using map
            const PRDetailsArray = existingPR?.PRDetails;
            if (!Array.isArray(PRDetailsArray)) {
                console.warn("PRDetails is not an array or is undefined.");
                return;
            }
            const data: IPurchaseRequestDataProps[] = PRDetailsArray.map((PR: any) => ({
                id: PR.Id,
                requester: PR.Requester?.Title ?? "",
                requesterId: PR.Requester?.Id ?? undefined,
                department: PR.Department?.Department ?? "",
                departmentId: PR.Department?.Id ?? undefined,
                requestedDate: PR.RequestedDate ?? "",
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
                ARDetails: PR.ARDetails ?? "",
                AuthorId: PR.Author?.Id ?? undefined
            }));

            // console.log("PR Author Id:",data[0].AuthorId);

            setFormData(data[0]);

        } catch (error) {
            console.error("Error fetching Travel Request:", error);
        }
    };

    const fetchExistingApproverlist = async (purchaseRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPurchaseRequestApprovals(purchaseRequestId);

            if (data) {
                setLoading(false);
                const Approvers = data.map((item: any) => ({
                    Id: item.ID,
                    PRId: item.PurchaseRequestId?.Id,
                    Approver: item.Approver?.Title,
                    ApproverId: item.Approver?.Id,
                    Role: item.Role,
                    Status: item.Status,
                    Hierarchy: item.Hierarchy,
                    Comments: item.Comments,
                    ApprovedDate: item.ApprovedDate ?? ""
                })).sort((a, b) => (a.Hierarchy || 0) - (b.Hierarchy || 0));
                setApprovers(Approvers);
            }

        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchPRDocuments = async (PRNumber: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPurchaseRequestDocuments(PRNumber);

            const PRDocuments = data.map((item) => ({
                id: item?.Id,
                fileName: item?.FileLeafRef,
                fileRef: item?.FileRef,
            }));

            setDocument(PRDocuments);
            setLoading(false);
        } catch (error) {
            console.error('Error on fetching PO documents:', error);
        }
    };

    const fetchPRDiscussionsByPR = async (PRNumber: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPRDiscussionsByPR(PRNumber);
            const formatDiscussions = data.map((item: any) => {
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
            setDiscussions(formatDiscussions);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching discussions:', error);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (currentPRId) {
            fetchPurchaseRequestDetails(currentPRId);
            fetchExistingApproverlist(currentPRId);
            fetchPRDocuments(currentPRId);
            fetchPRDiscussionsByPR(currentPRId);
        }
    }, [currentPRId]);

    const handleApprovals = (status: string, id: number,): void => {
        setApprovalStatus(status);
        const selectedApprover = approvers.find((approver) => approver.Id === id);
        if (selectedApprover) {
            setUpdateApprovalData({ ...selectedApprover, Status: status, ApprovedDate: currentDate });
            setApprovalDialog(true);
        }
    };

    const handleConfirmApproval = async (status: string): Promise<void> => {
        if (status === 'confirm') {
            setConfirmApproval(false);
            setApprovalDialog(false);
            setApprovalStatus("");
            setLoading(true);
            const service = new PurchaseRequestTravelRequestService(props.context);
            try {
                const updateApproval = await service.UpdatePurchaseRequestApproval(updateApprovalData, approvers?.length);

                if (updateApproval) {
                    setLoading(false);
                    setUpdateApprovalData(null);
                    setIsDialogOpen(true);
                    setDialogTitle('Approval Update');
                    setDialogMessage('Purchase Request approval updated successfully.');
                    setTimeout(() => {
                        navigate("/purchaseRequestTable/AllPRs")
                    }, 3000);
                }
            } catch (error) {
                console.error('Error updating Approvers:', error);
            }
        } else {
            setConfirmApproval(false);
            setApprovalDialog(false)
            setUpdateApprovalData(null);
            setApprovalStatus("");
        }
    }

    const pendingApprovers = approvers.filter(a => a.Status === "Pending");
    const minHierarchy = pendingApprovers.length > 0 ? Math.min(...pendingApprovers.map(a => a.Hierarchy || Infinity)) : null;

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: props.context.pageContext.web.absoluteUrl,
        msGraphClientFactory: props.context.msGraphClientFactory,
        spHttpClient: props.context.spHttpClient,
    };

    const handlePeoplePickerChange = (items: any[]): void => {
        setSelectedNewApprover(prev => ({
            ...prev,
            [`ApproverId`]: items.length > 0 ? items[0].id : undefined,
            [`Approver`]: items.length > 0 ? items[0].text : '',
        }));
    };

    const handleApproverChange = async () => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        setIsEditApprover(false);
        try {
            // formating the necessary approver data to update the Approver information
            const formatApprover = {
                Id: selectedCurrentApprover?.Id,
                // PRId: selectedCurrentApprover?.PRId,
                // Approver: selectedNewApprover?.Approver,
                ApproverId: selectedNewApprover?.ApproverId,
                // Role: selectedCurrentApprover?.Role,
                // Status: selectedCurrentApprover?.Status,
                // Comments: selectedCurrentApprover?.Comments,
                // Hierarchy: selectedCurrentApprover?.Hierarchy,
                // ApprovedDate: selectedCurrentApprover?.ApprovedDate
            }

            // console.log("Format Approver",formatApprover);

            // passing the formated approver data to update the approver
            const updateApprover = await service.updatePurchaseRequestApprover(formatApprover);

            if (updateApprover) {
                if (formData.id) {
                    fetchExistingApproverlist(formData?.id)
                }
                setIsDialogOpen(true);
                setDialogTitle('Update Approver');
                setDialogMessage('Purchase Request approver updated successfully.');
                // setTimeout(() => {
                //     navigate("/purchaseRequestTable/PR")
                // }, 3000);
            }

        } catch (error) {
            console.error('Error updating approver:', error);
        } finally {
            setLoading(false);
            setUpdateApprovalData(null);
            setSelectedNewApprover(undefined);
            setSelectedCurrentApprover(undefined);
        }
    }

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric"
        }) + " " + date.toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit", hour12: false
        });
    };


    return (
        <div className=' p-3 bg-light rounded-3'>
            {loading && <LoadingSpinner />}

            <div className='d-flex justify-content-between align-items-center'>
                <div>
                    <div className={Style.tableTitle}>
                        <FiShoppingCart size={20} className='mx-1' /> Purchase Request Approval
                    </div>
                </div>

                <div className='d-flex flex-wrap gap-2'>
                    <button className={Style.closeButton} onClick={handleBackClick} ><BsBoxArrowLeft size={15} /> Back</button>
                </div>
            </div>

            <div className=" mb-3 p-3">
                <div className='rounded-4 bg-white mb-3 row p-4'>
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Requestor Name</label>
                        <div className=''>{formData.requester}</div>
                    </div>

                    {/* Department */}
                    <div className='mb-2 col-12 col-md-4 col-sm-6'>
                        <label className='form-label fw-bold'>Department</label>
                        <div className=''>{formData.department}</div>

                    </div>

                    {/* Requested Date */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap fw-bold'>Requested Date </label>
                        <div className=''>{formData.requestedDate ? format(new Date(formData.requestedDate), "MM-dd-yyyy") : ""}</div>

                    </div>

                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Category </label>
                        <div className=''>{formData.category}</div>

                    </div>
                    {/* Total Cost */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Total Cost </label>
                        <div className=''>${formData.totalCost ? Number(formData.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</div>

                    </div>

                    {/* Recurring Cost */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Recurring Cost </label>
                        <div className=''>${formData.recurringCost ? Number(formData.recurringCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                        </div>

                    </div>

                    {/* useCase */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap fw-bold'>Use Case </label>
                        <div className=''>{formData.useCase}</div>
                    </div>

                    {/* PurchaseType */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap fw-bold'>Purchase Type </label>
                        <div className=' '>{formData.purchaseType}</div>
                    </div>

                    {/* Purchase Details */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Purchase Details</label>
                        <div className=' text-wrap'>{formData.purchaseDetails}</div>
                    </div>

                    {/* Item/Service Description */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Item / Service Description</label>
                        <div className=' text-wrap'>{formData.itemServiceDescription}</div>
                    </div>

                    {/* Business Justification */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Business Justification</label>
                        <div className='label text-wrap'>{formData.businessJustification}</div>
                    </div>

                    {/* AR Required */}
                    <div className=" mb-2 col-12 col-sm-6 col-md-4 ">
                        <div className="gap-2">
                            <label className="form-check-label fw-bold">AR Required</label>
                            <div>{formData?.ARRequired ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    {/* ARDetails */}
                    {formData?.ARRequired &&
                        <div className=" mb-2 col-12 col-sm-6 col-md-4 ">
                            <div className="gap-2">
                                <label className="form-check-label fw-bold">AR Details</label>
                                <div>{formData?.ARDetails}</div>
                            </div>
                        </div>
                    }
                </div>
                <div className='col my-2'>
                    <label className='form-label fw-bold'><GrAttachment /> Attached files</label>
                    {document.length > 0 ? (document.map((doc, index) => (
                        <div key={doc.id} className="d-flex align-items-center ">
                            <a
                                href={`${doc.fileRef.split('/').map(encodeURIComponent).join('/')}`}
                                download={doc.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {(index + 1) + `) `}{doc.fileName}
                            </a>
                        </div>))) : <div>
                        <p>No attachment found</p>
                    </div>}
                </div>
                <>
                    {discussions.length > 0 &&
                        <>
                            <hr />
                            <h6>Discussions:</h6>
                            {discussions?.map((discussion) => (
                                <div key={discussion.Id} className="my-3 p-3 border rounded shadow-sm">
                                    {/* Question Section */}
                                    <div className="border rounded p-3 bg-light">
                                        <p className="mb-1">
                                            <strong>Question:</strong> {discussion.Question}
                                        </p>
                                        <div className="d-flex justify-content-between text-muted small">
                                            <span>Raised By: <strong>{discussion.RaisedBy}</strong></span>
                                            <span>Raised On: <strong>{formatDateTime(discussion.RaisedOn)}</strong></span>
                                        </div>
                                    </div>

                                    {/* Answer Section */}
                                    <div className="border rounded p-3 mt-2 bg-white">
                                        <p className="mb-1">
                                            <strong>Answer:</strong> {discussion.Answer || <span className="text-danger">Not answered yet</span>}
                                        </p>
                                        <div className="d-flex justify-content-between text-muted small">
                                            <span>Answered By: <strong>{discussion.AnswerBy || "N/A"}</strong></span>
                                            <span>Answered On: <strong>{formatDateTime(discussion.AnsweredOn)}</strong></span>
                                        </div>
                                    </div>

                                    <hr className="my-3" />
                                </div>

                            ))}
                        </>}
                    <hr />
                    <div>
                        <h6>Approvals:</h6>
                        {approvers.map((approver, index) => (
                            <div key={approver.Id} className='mb-4 border rounded-4 mb-2 p-3 px-2'>
                                <div className='d-flex flex-wrap align-items-center justify-content-between mb-2'>
                                    <div>
                                        <div className='d-flex row flex-nowrap align-items-center gap-3'>
                                            <div className='col'>
                                                <FaUser size={35} />
                                            </div>
                                            <div className='col'>
                                                <div className='d-flex flex-column'>

                                                    <div className='d-flex align-items-center gap-2'>
                                                        <span className='text-nowrap'>{approver.Approver}</span>
                                                        {(approver.Status === "Pending" && formData.status === "In Progress" && props.isUserInGroup) &&
                                                            <div className=''>
                                                                <button
                                                                    className={`${Style.grayButton} px-3`}
                                                                    onClick={() => {
                                                                        setSelectedCurrentApprover(approver);
                                                                        setIsEditApprover(true)
                                                                    }}
                                                                    style={{ minWidth: "140px" }}
                                                                >
                                                                    <FaUserEdit size={18} />
                                                                    Edit Approver
                                                                </button>
                                                            </div>
                                                        }
                                                    </div>
                                                    <span className='fw-bold text-nowrap'>{approver.Role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-6 col-md-3'>
                                        {approver.ApproverId === props.userId && approver.Hierarchy === minHierarchy && formData.status === "In Progress" ? (
                                            <div className='gap-2 d-flex'>
                                                <button className={`${Style.secondaryButton} px-3`} onClick={() => handleApprovals("Approved", approver.Id)}>Approve</button>
                                                <button className={`${Style.rejecteButton} px-3 `} onClick={() => handleApprovals("Rejected", approver.Id)}>Reject</button>
                                            </div>
                                        ) : (
                                            <span>
                                                {approver.Status === "Pending" ? <FaClock size={18} className=' me-1' style={{ color: "#FF8008" }} /> : approver.Status === "Approved" ? <FaRegCircleCheck size={18} className='text-success me-1' />
                                                    : <TbCancel className='text-danger me-1' size={20} />}
                                                <b className={
                                                    approver.Status === "Pending" ? ""
                                                        : approver.Status === "Approved" ? "text-success"
                                                            : "text-danger"
                                                }
                                                    style={{ color: approver?.Status === "Pending" ? "#FF8008" : "" }}
                                                >
                                                    {approver.Status}
                                                </b>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {(approver.Status === "Approved" || approver.Status === "Rejected") && (
                                    <div className='d-flex flex-wrap align-items-center justify-content-between row px-2'>
                                        <div className='col-12 col-md-9 text-wrap'><b>Comments:</b> {approver.Comments}</div>
                                        <div className='col-12 col-md-3'>{approver.ApprovedDate ? format(new Date(approver.ApprovedDate), "MM-dd-yyyy") : ""}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>

            </div>
            <Dialog
                hidden={!approvalDialog}
                onDismiss={() => setApprovalDialog(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Purchase Request Approval",
                    subText: dialogMessage,
                }}
                styles={{
                    main: {
                        minWidth: '400px !important',
                    },
                }}
            >
                <div className='p-3'>

                    <div className="form-group mb-2">
                        <label className={Style.label}>Approver Comment</label>
                        <textarea
                            className={`${Style.inputStyle}`}
                            name='comments'
                            value={updateApprovalData?.Comments || ''}
                            rows={3}
                            onChange={(e) =>
                                setUpdateApprovalData((prev) =>
                                    prev ? { ...prev, Comments: e.target.value } : null
                                )
                            }
                        />
                    </div>
                    <div className="float-end m-3">
                        <button
                            className={`${Style.closeButton} px-3`}
                            onClick={() => setConfirmApproval(true)}
                        > Submit </button>
                    </div>
                </div>
            </Dialog>

            {/* confirm user Approval */}
            <Dialog
                hidden={!confirmApproval}
                onDismiss={() => setConfirmApproval(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Confirm Approval",
                    subText: `Are you sure, You want to ${approvalStatus} this PR?`,
                }}

            >
                <div className=" d-flex flex-row flex-nowrap gap-2 align-items-center justify-content-end">
                    <button className={`${Style.secondaryButton} px-3`} onClick={() => handleConfirmApproval("confirm")} > Confirm</button>
                    <button className={`${Style.closeButton} px-3`} onClick={() => handleConfirmApproval("cancel")} > Cancel </button>
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

            <Dialog
                hidden={!isEditApprover}
                onDismiss={() => setIsEditApprover(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: 'Edit Approver',
                    closeButtonAriaLabel: 'Close'
                }} >

                <div className='mb-3'>
                    Please select a new approver. The current approver,
                    <strong> {selectedCurrentApprover?.Approver} ({selectedCurrentApprover?.Role}) </strong>,
                    will be updated with the newly selected approver on this Purchase Request.
                </div>
                <PeoplePicker
                    context={peoplePickerContext}
                    personSelectionLimit={1}
                    showtooltip={true}
                    required={true}
                    ensureUser={true}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={1000}
                    placeholder='Search for users...'
                    onChange={(items: any[]): void => handlePeoplePickerChange(items)}
                />

                <div className="float-end my-3">
                    <div className="d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                        <button className={`${Style.primaryButton} px-3`} onClick={handleApproverChange}>Update</button>
                        <button className={`${Style.grayButton} px-3`} onClick={() => setIsEditApprover(false)}>Close</button>
                    </div>
                </div>
            </Dialog>
        </div >
    );
};

export default PRUpdate;