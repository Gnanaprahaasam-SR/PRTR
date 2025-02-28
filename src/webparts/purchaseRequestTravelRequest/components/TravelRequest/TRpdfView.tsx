import React, { forwardRef, useState, useEffect } from 'react';
// import Style from '../PurchaseRequestTravelRequest.module.scss';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { FaClock, FaUser } from "react-icons/fa6";
import { FaRegCircleCheck } from "react-icons/fa6";
import { TbCancel } from "react-icons/tb";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { WebPartContext } from '@microsoft/sp-webpart-base';
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
    Author: string;
    CreatedDate: string;
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

interface ITravelRequestProps {
    context: WebPartContext;
    currentTRId: number;
}



const TRDocument = forwardRef<HTMLDivElement, ITravelRequestProps>(({ context, currentTRId }, ref) => {
    const dateFormate = (date: string): string => {
      
        const existingDate = new Date(date).toISOString().split('T')[0];
        return existingDate;
    };
    const currentDate = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<ITravelRequestFormProps>({
        Id: undefined,
        Requester: "",
        RequesterId: undefined,
        Department: "",
        DepartmentId: undefined,
        RequestedDate: currentDate,
        TravelFrom: "",
        TravelTo: "",
        StartDate: "",
        EndDate: "",
        TotalCostEstimate: undefined,
        BusinessJustification: "",
        StratigicProjectRelated: false,
        EmergencyRelated: false,
        Status: "In Progress",
        Author: "",
        CreatedDate: "",
    });
    const [approvers, setApprovers] = useState<IApproversProps[]>([]);
    const [logo, setLogo] = useState<string>("");


    const fetchLogo = async () => {
        const service = new PurchaseRequestTravelRequestService(context);
        const logoUrl = await service.getPRTRLogo();
        setLogo(logoUrl?.document?.FileRef ?? "");
    }

    const [loading, setLoading] = useState<boolean>(true);

    const fetchTravelRequestDetails = async (travelRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(context);
        setLoading(true);
        try {
            const existingTR = await service.getTravelRequestDetails(null, "All", travelRequestId);
          
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
                Author: TR.Author.Title ?? "",
                CreatedDate: TR.Created ?? "",
            }));

            setFormData(data[0]);

        } catch (error) {
            console.error("Error fetching Travel Request:", error);
        }
        setLoading(false);
    };


    const fetchExistingApproverlist = async (travelRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(context);
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
                ApprovedDate: item.ApprovedDate ? dateFormate(item.ApprovedDate) : ""
            })).sort((a, b) => (a.Hierarchy || 0) - (b.Hierarchy || 0));;
            setApprovers(Approvers);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
        setLoading(false);
    };


    useEffect(() => {
        if (currentTRId) {
            fetchTravelRequestDetails(currentTRId);
            fetchExistingApproverlist(currentTRId);
            fetchLogo();
        }
    }, [currentTRId]);


    return (
        <div className='  p-3 bg-light  rounded-3' ref={ref}>
            {loading && <LoadingSpinner />}
            
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <img src={logo} alt="logo" width="100" />
                </div>
                <h5 className="">
                    Travel Request Approval
                </h5>

                <div className=''>
                    <div className="text-start text-wrap" style={{ fontSize: "14px" }}>TR No: {formData.Id}</div>
                    <div className="text-start text-wrap" style={{ fontSize: "14px" }}>Created by: {formData.Author ?? "N/A"}</div>
                    <div className="text-start text-wrap" style={{ fontSize: "14px" }}>Date: {formData.CreatedDate ? format(new Date(formData.CreatedDate), "MM-dd-yyy") : 'N/A'}</div>
                </div>
            </div>

            {/* <div className=" clearfix">
                <div className=" float-end">
                    <div className="text-start text-wrap" style={{ fontSize: "12px" }}>TR#:{formData.Id}</div>
                    <div className="text-start text-wrap" style={{ fontSize: "12px" }}>Created By:{formData.Author ?? "N/A"}</div>
                    <div className="text-start text-wrap" style={{ fontSize: "12px" }}>Date: {formData.CreatedDate ?? "N/A"}</div>
                </div>
            </div> */}

            <div className="row p-4 "  >
                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className=' text-nowrap '>Requestor Name</label>
                    <div className='fw-bold'>{formData.Requester}</div>
                </div>

                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className=' text-nowrap '>Department </label>
                    <div className='fw-bold'>{formData.Department}</div>
                </div>

                {/* Requested Date */}
                {/* <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className='text-nowrap '>Requested Date </label>
                    <div className='fw-bold'>{format(new Date(formData.RequestedDate), "MM-dd-yyy")}</div>
                </div> */}

                {/* Where */}
                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className=''>Travel From</label>
                    <div className=' fw-bold'>{formData.TravelFrom}</div>
                </div>

                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className=''>Travel To</label>
                    <div className=' fw-bold'>{formData.TravelTo}</div>
                </div>

                {/* When */}
                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className=''>Start Date</label>
                    <div className=' fw-bold'>{formData.StartDate ? format(new Date(formData.StartDate), "MM-dd-yyy") : ""}</div>
                </div>

                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className=''>End Date</label>
                    <div className=' fw-bold'>{formData.EndDate ? format(new Date(formData.EndDate), "MM-dd-yyy") : ""}</div>
                </div>

                {/* Total Cost Estimate */}
                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className='text-nowrap'>Total Estimate Cost</label>
                    <div className='fw-bold'>${formData.TotalCostEstimate ? Number(formData.TotalCostEstimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</div>
                </div>

                {/* Strategic Project Related */}
                <div className="col-12 col-sm-4 col-md-4">
                    <div className="gap-2">
                        <label className="text-nowrap">Strategic Project Related </label>
                        <div className='fw-bold'>{formData?.StratigicProjectRelated ? "Yes" : "No"}</div>
                    </div>
                </div>

                {/* Emergency related */}
                <div className=" col-12 col-sm-4 col-md-4">
                    <div className="">
                        <label className="text-nowrap">Emergency Related</label>
                        <div className='fw-bold'>{formData?.EmergencyRelated ? "Yes" : "No"}</div>
                    </div>
                </div>

                {/* Status */}
                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className='text-nowrap '>Status </label>
                    <div className=' fw-bold'>{formData.Status}</div>
                </div>

                {/* Business Justification */}
                <div className='mb-3 col-12 col-sm-4 col-md-4'>
                    <label className='text-nowrap'>Business Justification </label>
                    <div className='text-wrap fw-bold'>{formData.BusinessJustification}</div>
                </div>
            </div>

            <>
                <hr />
                <div>
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
                                        <div className="fst-italic ms-2">{format(new Date(approver.ApprovedDate), "MM-dd-yyy")}</div>
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
            </>
        </div>

    );
})

export default TRDocument;
