import React, { FC, useState, useEffect, useRef } from 'react';
import Style from '../PurchaseRequestTravelRequest.module.scss';
import Select, { SingleValue } from 'react-select';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
import { RiArrowUpCircleFill } from 'react-icons/ri';
import { BsBoxArrowLeft, BsHourglassSplit } from "react-icons/bs";
import { GrAttachment, GrPowerReset } from 'react-icons/gr';
import { useNavigate, useParams } from 'react-router-dom';
import { ITravelRequestProps } from './ITravelRequestProps';
import {
    Dialog,
    DialogType,
    IconButton,
} from '@fluentui/react';
import { FaClock, FaUser } from "react-icons/fa6";
import { MdFlightTakeoff } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { TbCancel } from "react-icons/tb";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';


interface ITravelRequestFormProps {
    Id: number | null;
    Requester: string;
    RequesterId?: number;
    Department: string;
    DepartmentId?: number;
    RequestedDate: string;
    Where: string;
    When: string;
    TotalCostEstimate?: number;
    BusinessJustification: string;
    StratigicProjectRelated: boolean;
    EmergencyRelated: boolean;
    Status: string;
}

interface IDepartmentProps {
    id: number;
    label: string;
    value: string;
}

interface IApproversProps {
    Id: number;
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



const TravelRequestForm: FC<ITravelRequestProps> = (props) => {
    const dateFormate = (date: string): string => {
        console.log(date)
        const existingDate = new Date(date).toISOString().split('T')[0];
        return existingDate;
    };
    const currentDate = new Date().toISOString().split('T')[0];

    const navigate = useNavigate();
    const { TRId } = useParams();
    const currentTRId: number | null = TRId ? parseInt(TRId as string, 10) || null : null;


    const [formData, setFormData] = useState<ITravelRequestFormProps>({
        Id: null,
        Requester: props.userName,
        RequesterId: props.userId,
        Department: "",
        DepartmentId: undefined,
        RequestedDate: currentDate,
        Where: "",
        When: "",
        TotalCostEstimate: undefined,
        BusinessJustification: "",
        StratigicProjectRelated: false,
        EmergencyRelated: false,
        Status: "In Progress",
    });
    const [approvers, setApprovers] = useState<IApproversProps[]>([]);
    const [initialApprove, setInitialApprove] = useState<IApproversProps[]>([]);
    const [confirmSubmit, setConfirmSubmit] = useState<boolean>(false);
    const [confirmDraft, setConfirmDraft] = useState<boolean>(false);
    const [departmentData, setDepartmentData] = useState<IDepartmentProps[]>([]);

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
    const [attachment, setAttachment] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleBackClick = (): void => {
        navigate("/travelRequestTable/TR"); // Navigate to the previous page
    };

    const fetchDepartment = async (): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getPRTRDepartment(true);
            const Department = data.map((item: any) => ({
                id: item.ID,
                label: item.Department,
                value: item.Department,
            }));
            setDepartmentData(Department);
        } catch (error) {
            console.log('Error fetching departments:', error);
        }
    };


    const fetchApproverlist = async (): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        try {
            const data = await service.getPRTRApprovers();
            const Approvers = data.map((item: any) => ({
                Id: item.ID,
                Approver: item.Approver?.Title,
                ApproverId: item.Approver?.Id,
                Role: item.Role,
                Status: "Pending",
                Hierarchy: item.Hierarchy,
                Comments: "",
                ApprovedDate: "",
            }));
            if (!TRId && !currentTRId) {
                setApprovers(Approvers);
            }
            if (formData.Status === "Draft") {
                setApprovers(Approvers);
            }
            setInitialApprove(Approvers);

        } catch (error) {
            console.error('Error fetching departments:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDepartment();
        fetchApproverlist();
    }, []);


    const fetchTravelRequestDetails = async (travelRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {
            const existingTR = await service.getTravelRequestDetails(props.userId, "All", travelRequestId);
            console.log("Fetched Travel Request Details:", existingTR);

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
                RequestedDate: TR.RequestedDate ? dateFormate(TR.RequestedDate) : "",
                Where: TR.Where ?? "",
                When: TR.When ? dateFormate(TR.When) : "",
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
    };


    const fetchExistingApproverlist = async (travelRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            setLoading(true);
            const data = await service.getTravelRequestApprovals(travelRequestId);
            console.log(data);
            const Approvers = data.map((item: any) => ({
                Id: item.ID,
                Approver: item.Approver?.Title,
                ApproverId: item.Approver?.Id,
                Role: item.Role,
                Status: item.Status,
                Hierarchy: item.Hierarchy,
                Comments: item.Comments,
                ApprovedDate: item.ApprovedDate ? dateFormate(item.ApprovedDate) : ""
            })).sort((a, b) => (a.Hierarchy || 0) - (b.Hierarchy || 0));;
            setApprovers(Approvers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };


    const fetchTRDocuments = async (TRNumber: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.getTravelRequestDocuments(TRNumber);

            const PODocuments = data.map((item) => ({
                id: item?.Id,
                fileName: item?.FileLeafRef,
                fileRef: item?.FileRef,
            }));

            setDocument(PODocuments);
            setLoading(false);
        } catch (error) {
            console.error('Error on fetching TR documents:', error);
        }
    };

    useEffect(() => {
        if (currentTRId && formData.Status === "Draft") {
            fetchTravelRequestDetails(currentTRId);
            fetchApproverlist();
            fetchTRDocuments(currentTRId);
        }
        else if (currentTRId) {
            fetchTravelRequestDetails(currentTRId);
            fetchExistingApproverlist(currentTRId);
            fetchTRDocuments(currentTRId);
        }
    }, [TRId, formData.Status]);



    const handleAttachment = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setAttachment(prev => [...prev, ...newFiles]);
            setDialogMessage(`Success`);
            setDialogTitle(`File uploaded successfully`);
            setIsDialogOpen(true);
        }
    };

    const handleClearAttachment = (index: number): void => {
        setAttachment(prev => prev.filter((_, i) => i !== index));
    };

    const [fileToDelete, setFileToDelete] = useState<DocumentState | null>(null);
    const [fileDeleteDialogVisible, setFileDeleteDialogVisible] = useState<boolean>(false);
    const handleFileDelete = async (file: DocumentState) => {
        setFileToDelete(file);
        setFileDeleteDialogVisible(true);
    }

    const handleConfirmFileDelete = async () => {
        if (fileToDelete) {
            const service = new PurchaseRequestTravelRequestService(props.context);
            // setLoading(true);
            try {
                await service.deletePRTRTravelRequestDocument(fileToDelete.id);
                setDocument(prevDocuments => prevDocuments.filter(doc => doc.id !== fileToDelete.id));
                // setLoading(false);
            } catch (error) {
                console.error('Error deleting item:', error);
                // setLoading(false);
            }
            setFileDeleteDialogVisible(false);
            setFileToDelete(null);
        }
    };



    const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        let { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };


    const handleTaxToggle = (field: string, checked: boolean): void => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }));
    };

    const handleDepartment = (selectedOption: SingleValue<IDepartmentProps>): void => {
        setFormData(prev => ({
            ...prev,
            Department: selectedOption?.value || '',
            DepartmentId: selectedOption?.id
        }));
    };

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: props.context.pageContext.web.absoluteUrl,
        msGraphClientFactory: props.context.msGraphClientFactory,
        spHttpClient: props.context.spHttpClient,
    };

    const handlePeoplePickerChange = (fieldName: string, items: any[]): void => {
        setFormData(prev => ({
            ...prev,
            [`${fieldName}Id`]: items.length > 0 ? items[0].id : undefined,
            [`${fieldName}`]: items.length > 0 ? items[0].text : '',
        }));
    };

    const handleReset = (): void => {
        setFormData({
            Id: null,
            Requester: props.userName,
            RequesterId: props.userId,
            Department: "",
            DepartmentId: undefined,
            RequestedDate: currentDate,
            Where: "",
            When: "",
            TotalCostEstimate: undefined,
            BusinessJustification: "",
            StratigicProjectRelated: false,
            EmergencyRelated: false,
            Status: "In Progress",
        });
        setAttachment([]);
    };


    const handleFormSubmit = async (): Promise<any> => {
        setConfirmSubmit(false);
        setLoading(true);
        console.log(formData, approvers)
        const newTR = {
            RequesterId: formData.RequesterId,
            DepartmentId: formData.DepartmentId,
            RequestedDate: formData.RequestedDate,
            Where: formData.Where,
            When: formData.When ? formData.When : null,
            TotalCostEstimate: formData.TotalCostEstimate,
            BusinessJustification: formData.BusinessJustification ? formData.BusinessJustification : "",
            StratigicProjectRelated: formData.StratigicProjectRelated,
            EmergencyRelated: formData.EmergencyRelated,
            Status: "In Progress",
        }
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {

            const data = await service.addTravelRequestDetail(newTR, initialApprove, currentTRId, attachment);
            console.log(data)
            if (data) {
                if (data) {
                    setIsDialogOpen(true);
                    setDialogMessage('Form Submitted Successfully');
                    setDialogTitle('Success');
                    setLoading(false);
                    handleReset();
                    setTimeout(() => {
                        navigate("/travelRequestTable/TR")
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error updating TravelRequest:', error);
            setLoading(false);
        }

    }

    const handleSaveAsDraft = async (): Promise<any> => {
        setConfirmSubmit(false);
        setLoading(true);
        console.log(formData, approvers)
        const newTR = {
            RequesterId: formData.RequesterId,
            DepartmentId: formData.DepartmentId,
            RequestedDate: formData.RequestedDate,
            Where: formData.Where,
            When: formData.When ? formData.When : null,
            TotalCostEstimate: formData.TotalCostEstimate,
            BusinessJustification: formData.BusinessJustification ? formData.BusinessJustification : "",
            StratigicProjectRelated: formData.StratigicProjectRelated,
            EmergencyRelated: formData.EmergencyRelated,
            Status: "Draft",
        }
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {
            setConfirmSubmit(false);
            const data = await service.addTravelRequestDetail(newTR, approvers, currentTRId, attachment);
            console.log(data)
            if (data) {
                if (data) {
                    setIsDialogOpen(true);
                    setDialogMessage('Form Saved as Draft Successfully');
                    setDialogTitle('Success');
                    setLoading(false);
                    handleReset();
                    setTimeout(() => {
                        navigate("/travelRequestTable/TR")
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error updating TravelRequest:', error);
            setLoading(false);
        }

    }

    const handleConfirmFormSubmit = (formStatus: string,): void => {

        // if (formStatus === "In Progress") {
        //     if (!formData.Department || !formData.RequestedDate || !formData.Requester) {
        //         setIsDialogOpen(true);
        //         setDialogMessage('Please fill all mandatory field!');
        //         setDialogTitle('Form Validation');
        //         return;
        //     }
        // }
        setFormData(prev => ({
            ...prev,
            Status: formStatus
        }));

        setConfirmSubmit(true);
        setDialogTitle("Form Submission");
        setDialogMessage("Are you sure, You want to submit the TR?");
    }

    return (
        <div className='  p-3 bg-light  rounded-3'>
            {loading && <LoadingSpinner />}

            <div className='d-flex justify-content-between align-items-center mb-3'>
                <div>
                    <div className={Style.tableTitle}>
                        <MdFlightTakeoff size={22} className='mx-1' /> Travel Request Form
                    </div>
                    {/* <div className=''>(<span className='text-danger'>*</span> Please fill in all mandatory fields below)</div> */}
                </div>

                <div className='d-flex flex-wrap gap-2'>
                    <button className={`${Style.primaryButton} text-wrap`} onClick={() => handleConfirmFormSubmit("In Progress")}><RiArrowUpCircleFill size={20} /> Submit</button>
                    <button className={`${Style.ternaryButton} text-wrap`} onClick={() => setConfirmDraft(true)}><BsHourglassSplit size={18} /> Save as Draft</button>
                    <button className={`${Style.closeButton} text-wrap`} onClick={handleReset}><GrPowerReset size={19} /> Reset Form</button>
                    <button className={Style.closeButton} onClick={handleBackClick} ><BsBoxArrowLeft size={15} /> Back</button>
                </div>
            </div>

            <div className=" mb-3 p-3">
                <div className="row d-flex "  >
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap'>Requestor Name</label>
                        <div className="w-100">
                            <PeoplePicker
                                context={peoplePickerContext}
                                personSelectionLimit={1}
                                showtooltip={true}
                                required={true}
                                ensureUser={true}
                                principalTypes={[PrincipalType.User]}
                                resolveDelay={1000}
                                defaultSelectedUsers={formData.Requester ? [formData.Requester] : []}
                                onChange={(items: any[]): void => handlePeoplePickerChange('Requester', items)}
                                styles={{
                                    text:
                                    {
                                        border: "1px solid #cccccc",
                                        padding: "6px"
                                    }

                                }}
                            />
                        </div>
                    </div>

                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap'>Department </label>
                        <Select
                            {...props}
                            className="react-select__menu-list"
                            isClearable={true}
                            isSearchable={true}
                            options={departmentData}
                            value={departmentData.find(option => option.value === formData.Department) || null}
                            onChange={handleDepartment}
                            getOptionLabel={(option: any) => option.value}
                            getOptionValue={(option: any) => option.value}
                            styles={{
                                menuList: (provided: any) => ({
                                    ...provided,
                                    maxHeight: 150,
                                    overflowY: "auto",
                                }),
                                option: (provided: any, state: { isSelected: any; }) => ({
                                    ...provided,
                                    color: state.isSelected ? '#fff' : '#000',
                                }),
                            }}
                        />
                    </div>

                    {/* Requested Date */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label text-nowrap'>Requested Date </label>
                        <input
                            type="date"
                            className={`${Style.inputStyle}`}
                            name="RequestedDate"
                            value={formData.RequestedDate}
                            onChange={handleFormDataChange}
                        />
                    </div>

                    {/* Where */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label'>Where </label>
                        <input
                            type='text'
                            className={`${Style.inputStyle}`}
                            name='Where'
                            value={formData.Where ?? ""}
                            onChange={handleFormDataChange}
                        />
                    </div>

                    {/* When */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label'>When </label>
                        <input
                            type='date'
                            className={`${Style.inputStyle}`}
                            name='When'
                            value={formData.When ?? ""}
                            onChange={handleFormDataChange}
                        />
                    </div>

                    {/* Total Cost Estimate */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label'>Total Cost Estimate </label>
                        <input
                            type='number'
                            className={`${Style.inputStyle}`}
                            name='TotalCostEstimate'
                            value={formData.TotalCostEstimate ?? ""}
                            onChange={handleFormDataChange}
                        />
                    </div>

                    {/* Strategic Project Related */}
                    <div className=" col-12 col-sm-6 col-md-4 d-flex align-items-center">
                        <div className="form-check form-switch gap-2">
                            <input className={`form-check-input ${Style.checkBox} ${Style.inputStyle}`} type="checkbox" id="tax" checked={formData?.StratigicProjectRelated ?? false} onChange={(e) => handleTaxToggle("StratigicProjectRelated", e.target.checked)} />
                            <label className="form-check-label" id="tax">Strategic Project Related </label>
                        </div>
                    </div>

                    {/* Emergency related */}
                    <div className=" col-12 col-sm-6 col-md-4 d-flex align-items-center">
                        <div className="form-check form-switch gap-2">
                            <input className={`form-check-input  ${Style.inputStyle} ${Style.checkBox}`} type="checkbox" id="emergency" checked={formData?.EmergencyRelated ?? false} onChange={(e) => handleTaxToggle("EmergencyRelated", e.target.checked)} />
                            <label className="form-check-label" id="emergency">Emergency Related</label>
                        </div>
                    </div>

                    {/* Business Justification */}
                    <div className='mb-2 col-12 col-sm-6 col-md-4'>
                        <label className='form-label'>Business Justification </label>
                        <textarea
                            rows={3}
                            className={`${Style.inputStyle}`}
                            name='BusinessJustification'
                            value={formData.BusinessJustification ?? ""}
                            onChange={handleFormDataChange}
                        />
                    </div>
                </div>

                <div className='mb-2'>
                    <div className='my-2'>
                        <button type='button' className={`${Style.primaryButton} text-nowrap`} onClick={handleAttachment}>
                            <GrAttachment size={20} /> Attach files
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            name="attachments"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    {attachment.map((file, index) => (
                        <div key={index} className="d-flex align-items-center ">
                            <p className='mb-0 me-1'>{index + 1}. {file.name}</p>
                            <div className='text-danger'>

                                <IconButton
                                    iconProps={{ iconName: 'Delete' }}
                                    title="Delete"
                                    onClick={() => handleClearAttachment(index)}
                                    className={Style.iconButton}
                                />

                            </div>
                        </div>
                    ))}
                    {document.map((file: any, index) => (
                        <div className='d-flex align-items-center' key={index}>
                            <p className='mb-0 me-1'>{attachment.length + index + 1}. {file.fileName}</p>
                            <div>

                                <IconButton
                                    iconProps={{ iconName: 'Delete' }}
                                    title="Delete"
                                    onClick={() => handleFileDelete(file)}
                                    className={Style.iconButton}
                                />
                            </div>
                        </div>
                    ))}
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
                                        <span>
                                            {approver.Status === "Pending" ? <FaClock size={18} className='me-1' style={{ color: "#FF8008" }} /> : approver.Status === "Approved" ? <FaRegCircleCheck size={18} className='text-success me-1' />
                                                : <TbCancel size={20} className='text-danger me-1' />
                                            }
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

                                    </div>
                                </div>

                                {(approver.Status === "Approved" || approver.Status === "Rejected") && (
                                    <div className='d-flex flex-wrap align-items-center justify-content-between row px-2'>
                                        <div className='col-12 col-md-9 text-wrap'><b>Comments:</b> {approver.Comments}</div>
                                        <div className='col-12 col-md-3'>{approver.ApprovedDate}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>

            </div>

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
            </Dialog >


            {/* form submit confirmation */}
            <Dialog
                hidden={!confirmSubmit}
                onDismiss={() => { closeDialog(); setConfirmSubmit(false); }}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: dialogTitle,
                    subText: dialogMessage,
                }}

            >
                <div className="d-flex align-items-center justify-content-end gap-3 ">
                    <button className={`${Style.secondaryButton} px-3`} onClick={handleFormSubmit} > Confirm </button>
                    <button className={`${Style.closeButton} px-3`} onClick={() => { closeDialog(); setConfirmSubmit(false); }} > Cancel </button>
                </div>
            </Dialog >

            {/* confirm Draft */}
            <Dialog
                hidden={!confirmDraft}
                onDismiss={() => setConfirmDraft(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    subText: "Are you sure you want to save the form as a Draft?",
                }}

            >
                <div className=" d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                    <button className={`${Style.secondaryButton} px-3`} onClick={handleSaveAsDraft} > Confirm</button>
                    <button className={`${Style.closeButton} px-3`} onClick={() => setConfirmDraft(false)} > Cancel </button>
                </div>
            </Dialog>

            {/* confirm file Delete */}
            <Dialog
                hidden={!fileDeleteDialogVisible}
                onDismiss={() => setFileDeleteDialogVisible(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    subText: "Are you sure you want to delete this document? This action cannot be reversed.",
                }}

            >
                <div className=" d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                    <button className={`${Style.secondaryButton} px-3`} onClick={handleConfirmFileDelete} > Confirm</button>
                    <button className={`${Style.closeButton} px-3`} onClick={() => setFileDeleteDialogVisible(false)} > Cancel </button>
                </div>
            </Dialog>


        </div >

    );
};

export default TravelRequestForm;
