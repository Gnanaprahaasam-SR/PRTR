import React, { FC, useState, useEffect } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
// import { RiArrowUpCircleFill } from 'react-icons/ri';
import { BsBoxArrowLeft } from "react-icons/bs";
import { useNavigate, useParams } from 'react-router-dom';
import { ITravelRequestProps } from './ITravelRequestProps';
import {
    Dialog,
    DialogType,
} from '@fluentui/react';
import { FaClock, FaUser } from "react-icons/fa6";
import { MdFlightTakeoff } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { TbCancel } from "react-icons/tb";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { GrAttachment } from 'react-icons/gr';
import { format } from "date-fns";


interface ITravelRequestFormProps {
    Id?: number;
    Requester: string;
    RequesterId?: number;
    Department: string;
    DepartmentId?: number;
    RequestedDate: string;
    TravelFrom: string;
    TravelTo: string;
    StartDate: string;
    EndDate: string;
    TotalCostEstimate?: number;
    BusinessJustification: string;
    StratigicProjectRelated: boolean;
    EmergencyRelated: boolean;
    Status: string;
}

interface IApproversProps {
    Id: number;
    TRId: number;
    Approver: string;
    ApproverId: number;
    Role: string;
    Status: string;
    Comments: string;
    Hierarchy: number;
    ApprovedDate: string;
}

interface DocumentState {
    id: number;
    fileName: string;
    fileRef: string;
}


const TRUpdate: FC<ITravelRequestProps> = (props) => {
    // const dateFormate = (date: string): string => {
    //     const existingDate = new Date(date).toISOString().split('T')[0];
    //     return existingDate;
    // };
    const currentDate = new Date().toISOString().split('T')[0];

    const navigate = useNavigate();
    const { TRId } = useParams();
    const currentTRId: number | null = TRId ? Number(TRId) : null;

    const [formData, setFormData] = useState<ITravelRequestFormProps>({
        Id: undefined,
        Requester: props.userName,
        RequesterId: props.userId,
        Department: "",
        DepartmentId: undefined,
        RequestedDate: currentDate,
        TravelFrom: "",
        TravelTo: "",
        StartDate: "",
        EndDate:"",
        TotalCostEstimate: undefined,
        BusinessJustification: "",
        StratigicProjectRelated: false,
        EmergencyRelated: false,
        Status: "In Progress",
    });
    const [approvers, setApprovers] = useState<IApproversProps[]>([]);
    const [updateApprovalData, setUpdateApprovalData] = useState<IApproversProps | null>(null);
    const [approvalDialog, setApprovalDialog] = useState<boolean>(false);
    const [confirmApproval, setConfirmApproval] = useState<boolean>(false);
    const [approvalStatus, setApprovalStatus] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
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
        navigate("/travelRequestTable/TR"); // Navigate to the previous page
    };

    const fetchTravelRequestDetails = async (travelRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        try {
            const existingTR = await service.getTravelRequestDetails(props.userId, "All", travelRequestId);
          
            // Ensure TRDetails is an array before using map
            const TRDetailsArray = existingTR?.TRDetails;
            if (!Array.isArray(TRDetailsArray)) {
                console.warn("TRDetails is not an array or is undefined.");
                return;
            }

            const data: ITravelRequestFormProps[] = TRDetailsArray.map((TR: any) => ({
                Id: TR.Id,
                Requester: TR.Requester?.Title ?? "",
                RequesterId: TR.Requester?.Id ?? undefined,
                Department: TR.Department?.Department ?? "",
                DepartmentId: TR.Department?.Id ?? undefined,
                RequestedDate: TR.RequestedDate ?? "",
                TravelFrom: TR.TravelFrom ?? "",
                TravelTo: TR.TravelTo ?? "",
                StartDate: TR.StartDate ?? "",
                EndDate: TR.EndDate ?? "",
                TotalCostEstimate: TR.TotalCostEstimate ?? undefined,
                BusinessJustification: TR.BusinessJustification ?? "",
                StratigicProjectRelated: TR.StratigicProjectRelated ?? false,
                EmergencyRelated: TR.EmergencyRelated ?? false,
                Status: TR.Status ?? "",
            }));

            setFormData(data[0]);

        } catch (error) {
            console.error("Error fetching Travel Request:", error);
        }
        setLoading(false);
    };


    const fetchExistingApproverlist = async (travelRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        try {
            const data = await service.getTravelRequestApprovals(travelRequestId);
           
            const Approvers = data.map((item: any) => ({
                Id: item.ID,
                TRId: item.TravelRequestId.Id,
                Approver: item.Approver?.Title,
                ApproverId: item.Approver?.Id,
                Role: item.Role,
                Status: item.Status,
                Hierarchy: item.Hierarchy,
                Comments: item.Comments,
                ApprovedDate: item.ApprovedDate ??  ""
            })).sort((a, b) => (a.Hierarchy || 0) - (b.Hierarchy || 0));;
            setApprovers(Approvers);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
        setLoading(false);
    };

    const fetchTRDocuments = async (TRNumber: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getTravelRequestDocuments(TRNumber);

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
        if (currentTRId) {
            fetchTravelRequestDetails(currentTRId);
            fetchExistingApproverlist(currentTRId);
            fetchTRDocuments(currentTRId);
        }
    }, [currentTRId]);

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
                const updateApproval = await service.UpdateTravelRequestApproval(updateApprovalData, approvers?.length);
               
                if (updateApproval) {
                    setLoading(false);
                    setUpdateApprovalData(null);
                    setIsDialogOpen(true);
                    setDialogTitle('Approval Update');
                    setDialogMessage('Travel Request approval updated successfully.');
                    setTimeout(() => {
                        navigate("/travelRequestTable/TR")
                    }, 3000);
                }
            } catch (error) {
                console.error('Error updating Approvers:', error);
                setLoading(false);
            }
        } else {
            setConfirmApproval(false);
            setApprovalDialog(false);
            setUpdateApprovalData(null);
            setApprovalStatus("");
        }
    }

    const pendingApprovers = approvers.filter(a => a.Status === "Pending");
    const minHierarchy = pendingApprovers.length > 0 ? Math.min(...pendingApprovers.map(a => a.Hierarchy || Infinity)) : null;

    return (
        <div className='  p-3 bg-light  rounded-3'>
            {loading && <LoadingSpinner />}

            <div className='d-flex justify-content-between align-items-center mb-3'>
                <div>
                    <div className={Style.tableTitle}>
                        <MdFlightTakeoff size={22} className='mx-1' /> Travel Request Approval
                    </div>
                </div>

                <div className='d-flex flex-wrap gap-2'>
                    <button className={Style.closeButton} onClick={handleBackClick} ><BsBoxArrowLeft size={15} /> Back</button>
                </div>
            </div>

            <div className=" mb-3 p-3">
                <div className="row d-flex rounded-4 bg-white mb-3 p-4 "  >
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap fw-bold'>Requestor Name</label>
                        <div>{formData.Requester}</div>
                    </div>

                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap fw-bold'>Department </label>
                        <div>{formData.Department}</div>
                    </div>

                    {/* Requested Date */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap fw-bold'>Requested Date </label>
                        <div>{formData.RequestedDate? format(new Date(formData.RequestedDate), "MM-dd-yyyy"):""}</div>
                    </div>

                    {/* Where */}

                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Travel From</label>
                        <div>{formData.TravelFrom}</div>
                    </div>
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Travel To</label>
                        <div>{formData.TravelTo}</div>
                    </div>

                    {/* When */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Start Date</label>
                        <div>{formData.StartDate? format(new Date(formData.StartDate), "MM-dd-yyyy"):""}</div>
                    </div>

                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>End Date</label>
                        <div>{formData.EndDate? format(new Date(formData.EndDate), "MM-dd-yyyy"):""}</div>
                    </div>

                    {/* Total Cost Estimate */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Total Estimate Cost</label>
                        <div>${formData.TotalCostEstimate ? Number(formData.TotalCostEstimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</div>
                    </div>

                    {/* Strategic Project Related */}
                    <div className=" col-12 col-sm-6 col-md-4">
                        <div className="gap-2">

                            <label className="form-label fw-bold">Strategic Project Related </label>
                            <div>{formData?.StratigicProjectRelated ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    {/* Emergency related */}
                    <div className=" col-12 col-sm-6 col-md-4">
                        <div className="">
                            <label className="form-label fw-bold">Emergency Related</label><div>{formData?.EmergencyRelated ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    {/* Business Justification */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label fw-bold'>Business Justification </label>
                        <div className='text-wrap'>{formData.BusinessJustification}</div>
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
                                        {approver.ApproverId === props.userId && approver.Hierarchy === minHierarchy && formData.Status === "In Progress"? (
                                            <div className='d-flex gap-2'>
                                                <button className={`${Style.secondaryButton} px-3 `} onClick={() => handleApprovals("Approved", approver.Id)}> Approve</button>
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
                    title: "Travel Request Approval",
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
                    subText: `Are you sure, You want to ${approvalStatus} this TR?`,
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

export default TRUpdate;
