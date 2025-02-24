import React, { forwardRef } from "react";
import { FaClock, FaRegCircleCheck, FaUser } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { PurchaseRequestTravelRequestService } from "../../Service/PurchaseRequestTravelRequest";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { TbCancel } from "react-icons/tb";
import { format } from "date-fns";

interface IPurchaseRequestDataProps {
    id: number | null;
    requester: string;
    requesterId?: number;
    department: string;
    departmentId?: number;
    requestedDate: string;
    purchaseDetails: string;
    itemServiceDescription: string;
    category: string;
    totalCost?: number;
    recurringCost?: number;
    businessJustification: string;
    purchaseType: string;
    ARRequired: boolean;
    useCase: string;
    status: string;
    author: string;
    createdDate: string;
}

interface IApproverProps {
    Id: number;
    PRId: number;
    Approver: string;
    ApproverId: number;
    Role: string;
    Status: string;
    Comments: string;
    Hierarchy: number;
    ApprovedDate: string;
}

interface IPurchaseRequestDocument {
    context: WebPartContext;
    currentPRId: number;
}

const PRDocument = forwardRef<HTMLDivElement, IPurchaseRequestDocument>(({ context, currentPRId }, ref) => {
    const formatDate = (date?: string): string => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    const currentDate = formatDate(new Date().toISOString());

    const [formData, setFormData] = useState<IPurchaseRequestDataProps>({
        id: null,
        requester: "",
        requesterId: undefined,
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
        author: "",
        createdDate: "",
    });

    const [approvers, setApprovers] = useState<IApproverProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [logo, setLogo] = useState<string>("");


    const fetchLogo = async () => {
        const service = new PurchaseRequestTravelRequestService(context);
        const logoUrl = await service.getPRTRLogo();
        setLogo(logoUrl?.document?.FileRef ?? "");

    }


    const fetchPurchaseRequestDetails = async (purchaseRequestId: number) => {
        const service = new PurchaseRequestTravelRequestService(context);

        try {
            const existingPR = await service.getPurchaseRequestDetails(null, "All", purchaseRequestId);
            console.log("Fetched Purchase Request Details:", existingPR);

            const PRDetailsArray = existingPR?.PRDetails;
            if (!Array.isArray(PRDetailsArray) || PRDetailsArray.length === 0) {
                console.warn("PRDetails is not an array or is undefined.");
                return;
            }

            const PR = PRDetailsArray[0]; // Directly use first element

            setFormData({
                id: PR.Id,
                requester: PR.Requester?.Title ?? "",
                requesterId: PR.Requester?.Id,
                department: PR.Department?.Department ?? "",
                departmentId: PR.Department?.Id,
                requestedDate: PR.RequestedDate,
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
                author: PR.Author?.Title ?? "",
                createdDate: PR.Created,
            });
        } catch (error) {
            console.error("Error fetching Travel Request:", error);
        }
    };

    const fetchApproverList = async (purchaseRequestId: number) => {
        const service = new PurchaseRequestTravelRequestService(context);
        try {
            const data = await service.getPurchaseRequestApprovals(purchaseRequestId);
            console.log("Fetched Approvers:", data);

            if (!data) return;

            setApprovers(
                data
                    .map((item: any) => ({
                        Id: item.ID,
                        PRId: item.PurchaseRequestId?.Id,
                        Approver: item.Approver?.Title ?? "Unknown",
                        ApproverId: item.Approver?.Id ?? 0,
                        Role: item.Role ?? "Unknown",
                        Status: item.Status ?? "Pending",
                        Hierarchy: item.Hierarchy ?? 0,
                        Comments: item.Comments ?? "No comments",
                        ApprovedDate: formatDate(item.ApprovedDate),
                    }))
                    .sort((a, b) => a.Hierarchy - b.Hierarchy)
            );
        } catch (error) {
            console.error("Error fetching approvers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPRId) {
            setLoading(true);
            fetchLogo();
            fetchPurchaseRequestDetails(currentPRId);
            fetchApproverList(currentPRId);
        }
    }, [currentPRId]);

    return (
        <div className="p-3 bg-light rounded-3" ref={ref} >
            {loading && <LoadingSpinner />}

            <div className="d-flex align-items-center justify-content-between">
                <img src={logo} alt="logo" width="100" />
                <h5 className="">
                    Purchase Request Approval
                </h5>
                <div className="">
                    <div className="text-nowrap text-start" style={{ fontSize: "12px" }}>PR No: {formData.id}</div>
                    <div className="text-nowrap text-start" style={{ fontSize: "12px" }}>Created by: {formData.author ?? "N/A"}</div>
                    <div className="text-nowrap text-start" style={{ fontSize: "12px" }}>Date: {formData.createdDate?format(new Date(formData.createdDate), "MM-dd-yyy"):'N/A'}</div>
                </div>
            </div>
            {/* <div className=" clearfix">
                <div className=" float-end">
                    <div className="text-nowrap text-start" style={{ fontSize: "12px" }}>PR#: {formData.id}</div>
                    <div className="text-nowrap text-start" style={{ fontSize: "12px" }}>Created By: {formData.author ?? "N/A"}</div>
                    <div className="text-nowrap text-start" style={{ fontSize: "12px" }}>Date: {formData.createdDate ?? "N/A"}</div>
                </div>
            </div> */}

            <div className="row p-4">
                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <div className=" text-nowrap">Requestor Name</div>
                    <div className="fw-bold">{formData.requester}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="">Department</label>
                    <div className="fw-bold">{formData.department}</div>
                </div>

                {/* <div className="mb-2 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Requested Date</label>
                    <div className="fw-bold">{formData.requestedDate ? format(new Date(formData?.requestedDate), "MM-dd-yyy") : ""}</div>
                </div> */}

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="">Category</label>
                    <div className="fw-bold">{formData.category}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Total Cost</label>
                    <div className="fw-bold">
                        {`$${formData.totalCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
                    </div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Recurring Cost</label>
                    <div className="fw-bold">
                        {`$${formData.recurringCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
                    </div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Use Case</label>
                    <div className="fw-bold">{formData.useCase}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Purchase Type</label>
                    <div className="fw-bold">{formData.purchaseType}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Purchase Details</label>
                    <div className="fw-bold">{formData.purchaseDetails}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="">Item / Service Description</label>
                    <div className="fw-bold">{formData.itemServiceDescription}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">AR Required</label>
                    <div className="fw-bold">{formData.ARRequired ? "Yes" : "No"}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="">Status</label>
                    <div className="fw-bold">{formData.status}</div>
                </div>

                <div className="mb-3 col-12 col-sm-4 col-md-4">
                    <label className="text-nowrap">Business Justification</label>
                    <div className="fw-bold">{formData.businessJustification}</div>
                </div>
            </div>
            <hr />
            <h6 className="p-2">Approvals:</h6>
            {approvers.map((approver, index) => (
                <div key={approver.Id} className='mb-4 border rounded-4 mb-2 p-3 px-2'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between mb-2'>
                        <div className="col-12 col-sm-8 col-md-9">
                            <div className='d-flex flex-row flex-nowrap align-items-center gap-3'>
                                <div className=''>
                                    <FaUser size={35} />
                                </div>
                                <div className=''>
                                    <div className='d-flex flex-column'>
                                        <span className='text-nowrap'>{approver.Approver}</span>
                                        <span className='fw-bold text-nowrap'>{approver.Role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-12 col-sm-4 col-md-3'>
                            <div className="d-flex justify-content-center flex-column">
                                <span className="mb-2 text-nowrap">
                                    {approver.Status === "Pending" ? <FaClock size={18} className=' me-1' style={{ color: "#FF8008" }} /> : approver.Status === "Approved" ? <FaRegCircleCheck size={18} className='text-success me-1' />
                                        : <TbCancel className='text-danger me-1' size={20} />}
                                    <b className={
                                        approver.Status === "Pending" ? ""
                                            : approver.Status === "Approved" ? "text-success"
                                                : "text-danger"
                                    }
                                        style={{ color: approver?.Status === "Pending" ? "#FF8008" : "", textWrap: "nowrap" }}
                                    >
                                        {approver.Status}
                                    </b>
                                </span>
                                <div className="fst-italic ms-2">{format(new Date(approver.ApprovedDate),"MM-dd-yyyy")}</div>
                            </div>
                        </div>
                    </div>

                    {(approver.Status === "Approved" || approver.Status === "Rejected") && (
                        <div className='d-flex flex-wrap align-items-center justify-content-between row px-2'>
                            <div className='col-12  text-wrap'><b>Comments:</b> {approver.Comments}</div>

                        </div>
                    )}
                </div>
            ))}

        </div>
    );
});

export default PRDocument;
