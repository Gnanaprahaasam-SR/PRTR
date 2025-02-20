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
    //     console.log(date)
    //     const existingDate = new Date(date).toISOString().split('T')[0];
    //     return existingDate;
    // };

    const currentDate = new Date().toISOString().split('T')[0];
    const { PRId } = useParams();
    const currentPRId: number | null = PRId ? Number(PRId) : null;

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
            console.log("Fetched Purchase Request Details:", existingPR);

            // Ensure PRDetails is an array before using map
            const PRDetailsArray = existingPR?.PRDetails;
            if (!Array.isArray(PRDetailsArray)) {
                console.warn("PRDetails is not an array or is undefined.");
                return;
            }
            console.log(PRDetailsArray)
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
            }));

            setFormData(data[0]);

        } catch (error) {
            console.error("Error fetching Travel Request:", error);
        }
    };

    const fetchExistingApproverlist = async (purchaseRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPurchaseRequestApprovals(purchaseRequestId);
            console.log("Fetched Approvers:", data);
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
                    ApprovedDate: item.ApprovedDate ??  ""
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

    useEffect(() => {
        setLoading(true);
        if (currentPRId) {
            fetchPurchaseRequestDetails(currentPRId);
            fetchExistingApproverlist(currentPRId);
            fetchPRDocuments(currentPRId);
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
                console.log(updateApproval);
                if (updateApproval) {
                    setLoading(false);
                    setUpdateApprovalData(null);
                    setIsDialogOpen(true);
                    setDialogTitle('Approval Update');
                    setDialogMessage('Purchase Request approval updated successfully.');
                    setTimeout(() => {
                        navigate("/purchaseRequestTable/PR")
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


    return (
        <div className=' p-3 bg-light  rounded-3'>
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
                        <div className=''>{formData.requestedDate? format(new Date(formData.requestedDate), "MM-dd-yyyy"):""}</div>

                    </div>

                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Category </label>
                        <div className=''>{formData.category}</div>

                    </div>
                    {/* Total Cost */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Total Cost </label>
                        <div className=''>$ {formData.totalCost ? Number(formData.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</div>

                    </div>

                    {/* Recurring Cost */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Recurring Cost </label>
                        <div className=''>$ {formData.recurringCost ? Number(formData.recurringCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
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

                    {/* AR Required */}
                    <div className=" mb-2 col-12 col-sm-6 col-md-4 ">
                        <div className="gap-2">
                            <label className="form-check-label fw-bold">AR Required</label>
                            <div>{formData?.ARRequired ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    {/* ARDetails */}
                    {
                        formData?.ARRequired &&
                        <div className=" mb-2 col-12 col-sm-6 col-md-4 ">
                            <div className="gap-2">
                                <label className="form-check-label fw-bold">AR Details</label>
                                <div>{formData?.ARDetails}</div>
                            </div>
                        </div>
                    }

                    {/* Business Justification */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Business Justification</label>
                        <div className='label text-wrap'>{formData.businessJustification}</div>
                    </div>
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
                                                    <span className='text-nowrap'>{approver.Approver}</span>
                                                    <span className='fw-bold text-nowrap'>{approver.Role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-6 col-md-3'>
                                        {approver.ApproverId === props.userId && approver.Hierarchy === minHierarchy ? (
                                            <div className='gap-3 d-flex'>
                                                <button className={`${Style.secondaryButton} px-3`} onClick={() => handleApprovals("Approved", approver.Id)}> Approve</button>
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
                                        <div className='col-12 col-md-3'>{approver.ApprovedDate? format(new Date(approver.ApprovedDate), "MM-dd-yyyy"):""}</div>
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
        </div >
    );
};

export default PRUpdate;