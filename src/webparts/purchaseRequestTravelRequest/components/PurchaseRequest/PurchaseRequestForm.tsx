import React, { FC, useEffect, useState } from 'react'
import Style from '../PurchaseRequestTravelRequest.module.scss';
import Select, { SingleValue } from 'react-select';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";

import { RiArrowUpCircleFill } from 'react-icons/ri';
import { BsBoxArrowLeft } from "react-icons/bs";
import { BsHourglassSplit } from "react-icons/bs";
import { GrPowerReset } from "react-icons/gr";
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
}


const categoryOptions = [
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Software', label: 'Software' },
    { value: 'Services', label: 'Services' },
];

const purchaseTypeOption = [
    { value: 'New', label: 'New' },
    { value: 'Replacement', label: 'Replacement' },
]

const useCaseOption = [
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Divisional', label: 'Divisional' },
];

interface Department {
    id: number,
    label: string,
    value: string, //department value
}

interface IApproverProps {
    Id: number,
    Approver: string,
    ApproverId: number,
    Role: string,
    Status: string,
    Comments: string,
    Hierarchy: number,
    ApprovedDate: string
}


const PRForm: FC<IPurchaseRequestFormProps> = (props) => {
    const dateFormate = (date: string): string => {
        // console.log(date)
        const existingDate = new Date(date).toISOString().split('T')[0];
        return existingDate;
    };

    const currentDate = new Date().toISOString().split('T')[0];
    const { PRId } = useParams();
    const currentPRId: number | null = PRId ? parseInt(PRId as string, 10) || null : null;


    const [formData, setFormData] = useState<IPurchaseRequestDataProps>({
        id: null,
        requester: props?.userName,
        requesterId: props?.userId,
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
    });

    const [approvers, setApprovers] = useState<IApproverProps[]>([]);
    const [initialApprove, setInitialApprove] = useState<IApproverProps[]>([]);
    const [confirmSubmit, setConfirmSubmit] = useState<boolean>(false);
    const [confirmDraft, setConfirmDraft] = useState<boolean>(false);
    const navigate = useNavigate();


    const [departmentData, setDepartmentData] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const closeDialog = (): void => {
        setIsDialogOpen(false);
        setDialogMessage('');
        setDialogTitle('');
    }

    const handleBackClick = (): void => {
        navigate("/purchaseRequestTable/PR");
    };
    const fetchPurchaseRequestDetails = async (purchaseRequestId: number): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);

        try {
            const existingPR = await service.getPurchaseRequestDetails(props.userId, "All", purchaseRequestId);
            console.log("Fetched Purchase Request Details:", existingPR);

            // Ensure PRDetails is an array before using map
            const PRDetailsArray = existingPR?.PRDetails;
            if (!Array.isArray(PRDetailsArray)) {
                console.warn("PRDetails is not an array or is undefined.");
                return;
            }
            // console.log(PRDetailsArray)
            const data: IPurchaseRequestDataProps[] = PRDetailsArray.map((PR: any) => ({
                id: PR.Id,
                requester: PR.Requester?.Title ?? "",
                requesterId: PR.Requester?.Id ?? undefined,
                department: PR.Department?.Department ?? "",
                departmentId: PR.Department?.Id ?? undefined,
                requestedDate: PR.RequestedDate ? dateFormate(PR.RequestedDate) : "",
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
            // console.log(data);
            const Approvers = data.map((item: any) => ({
                Id: item.ID,
                Approver: item.Approver?.Title,
                ApproverId: item.Approver?.Id,
                Role: item.Role,
                Status: item.Status,
                Hierarchy: item.Hierarchy,
                Comments: item.Comments,
                ApprovedDate: item.ApprovedDate ? dateFormate(item.ApprovedDate) : ""
            })).sort((a, b) => (a.Hierarchy || 0) - (b.Hierarchy || 0));
            setApprovers(Approvers);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };


    useEffect(() => {
        if (currentPRId && PRId) {
            fetchPurchaseRequestDetails(currentPRId);
        }
    }, [PRId]);

    useEffect(() => {
        if (currentPRId && formData.status !== "Draft") {
            fetchExistingApproverlist(currentPRId);
        }
        if (currentPRId && formData.department) {
            getApprover(formData?.department);
        }
    }, [PRId, formData.status, formData.department]);



    const fetchDepartment = async (): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        const ActiveStatus = true;
        try {

            const data = await service.getPRTRDepartment(ActiveStatus);
            const Department = data.map((item, index) => ({
                id: item.ID,
                label: item.Department,
                value: item.Department,
            }));
            setDepartmentData(Department);
        } catch (error) {
            console.error('Error fetching Departments:', error);
        }
    };


    const getApprover = async (department: string): Promise<void> => {
        const service = new PurchaseRequestTravelRequestService(props.context);
        setLoading(true);
        try {

            const data = await service.getPRTRApprovers(department);
            const approver = data.map((item) => ({
                Id: item.ID,
                Approver: item.Approver?.Title,
                ApproverId: item.Approver?.Id,
                Role: item.Role,
                Hierarchy: item.Hierarchy,
                Status: "Pending",
                Comments: "",
                ApprovedDate: ''
            }));
            setApprovers(approver);
            setInitialApprove(approver);
        } catch (error) {
            console.error('Error fetching Approvers:', error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchDepartment();
    }, []);

    useEffect(() => {
        if (formData?.departmentId && formData?.department && !PRId) {
            getApprover(formData?.department);
        }
    }, [formData.departmentId]);




    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: props.context.pageContext.web.absoluteUrl,
        msGraphClientFactory: props.context.msGraphClientFactory,
        spHttpClient: props.context.spHttpClient,
    };

    const handleFormDataChange = (field: keyof IPurchaseRequestDataProps, value: string): void => {
        setFormData({ ...formData, [field]: value });

    };

    const handleFormSubmit = async (): Promise<void> => {
        setLoading(true);
        const newPRData = {
            RequesterId: formData.requesterId,
            DepartmentId: formData.departmentId,
            RequestedDate: formData.requestedDate,
            PurchaseDetails: formData.purchaseDetails,
            ItemServiceDescription: formData.itemServiceDescription,
            Category: formData.category,
            TotalCost: formData.totalCost,
            RecurringCost: formData.recurringCost,
            BusinessJustification: formData.businessJustification,
            PurchaseType: formData.purchaseType,
            ARRequired: formData.ARRequired,
            UseCase: formData.useCase,
            Status: "In Progress",
        };

        const PR = currentPRId;
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.addPurchaseRequestForm(newPRData, initialApprove, PR);
            console.log(data);
            if (data) {
                setIsDialogOpen(true);
                setDialogMessage('Form Submitted Successfully');
                setDialogTitle('Success');
                setLoading(false);
                handleFormReset();
                setTimeout(() => {
                    navigate("/PurchaseRequestTable/PR")
                }, 3000);
            }

        } catch (error) {
            console.error('Error updating purchaseRequestForm:', error);
        }

    };

    const handleSaveAsDraft = async (): Promise<void> => {
        setConfirmDraft(false);
        setLoading(true);
        const newPRData = {
            RequesterId: formData.requesterId,
            DepartmentId: formData.departmentId,
            RequestedDate: formData.requestedDate,
            PurchaseDetails: formData.purchaseDetails,
            ItemServiceDescription: formData.itemServiceDescription,
            Category: formData.category,
            TotalCost: formData.totalCost,
            RecurringCost: formData.recurringCost,
            BusinessJustification: formData.businessJustification,
            PurchaseType: formData.purchaseType,
            ARRequired: formData.ARRequired,
            UseCase: formData.useCase,
            Status: "Draft",
        };

        const PR = currentPRId;
        const service = new PurchaseRequestTravelRequestService(props.context);
        try {
            const data = await service.addPurchaseRequestForm(newPRData, approvers, PR);
            console.log(data);
            if (data) {
                setIsDialogOpen(true);
                setDialogMessage('Form Saved as Draft Successfully');
                setDialogTitle('Success');
                setLoading(false);
                handleFormReset();
                setTimeout(() => {
                    navigate("/PurchaseRequestTable/MyDraft")
                }, 3000);
            }

        } catch (error) {
            console.error('Error updating purchaseRequestForm:', error);
        }

    }


    const handleCategory = (selectedOption: SingleValue<{ value: string; label: string }>): void => {
        setFormData({
            ...formData,
            category: selectedOption?.value || '',
        });
    };

    const handleDepartment = (selectedOption: SingleValue<Department>): void => {
        // console.log(selectedOption)
        setFormData({
            ...formData,
            department: selectedOption?.value || '',
            departmentId: selectedOption?.id || undefined,
        });
    };

    const handlePurchaseType = (selectedOption: SingleValue<{ value: string; label: string }>): void => {
        setFormData({
            ...formData,
            purchaseType: selectedOption?.value || '',
        });
    };

    const handleUseCase = (selectedOption: SingleValue<{ value: string; label: string }>): void => {
        setFormData({
            ...formData,
            useCase: selectedOption?.value || '',
        });
    };

    const handleTaxToggle = (newTaxStatus: boolean): void => {
        // setTax(newTaxStatus);
        setFormData(prevFormData => ({
            ...prevFormData,
            ARRequired: newTaxStatus
        }));

    };

    const handlePeoplePickerChange = (fieldName: string, items: any[]): void => {
        setFormData(prev => ({
            ...prev,
            [`${fieldName}Id`]: items.length > 0 ? items[0].id : undefined,
            [`${fieldName}`]: items.length > 0 ? items[0].text : '',
        }));
    };


    const handleConfirmSubmit = (status: string): void => {

        if (status === 'confirm') {
            handleFormSubmit();
            setConfirmSubmit(false);
        }
        else {
            setConfirmSubmit(false);
        }
    }

    const handleConfirmFormSubmit = (formStatus: string): void => {
        console.log("Current Form Data:", formData); // Debugging line

        if (formStatus === "In Progress") {
            if (!formData.requester || !formData.department || !formData.requestedDate) {
                setIsDialogOpen(true);
                setDialogMessage("Please fill all mandatory fields!");
                setDialogTitle("Form Validation");
                return;
            }
        }

        // Ensure state update is reflected
        setFormData(prev => ({
            ...prev,
            Status: formStatus
        }));

        setConfirmSubmit(true);
        setDialogTitle("Form Submission");
        setDialogMessage("Are you sure you want to submit the form?");
    };


    const handleFormReset = (): void => {
        setFormData({
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
            status: "In Progress",
        })
    }






    return (
        <div className=' p-3 bg-light  rounded-3'>
            {loading && <LoadingSpinner />}

            <div className='d-flex justify-content-between align-items-center pb-3'>
                <div>
                    <div className={Style.tableTitle}>
                        <FiShoppingCart size={20} className='mx-1' /> Purchase Request Form
                    </div>
                    <div className=''>(<span className='text-danger'>*</span> Please fill in all mandatory fields below)</div>
                </div>

                <div className='d-flex flex-wrap gap-2'>
                    <button className={`${Style.primaryButton} text-wrap`} onClick={() => handleConfirmFormSubmit("In Progress")}  ><RiArrowUpCircleFill size={20} /> Submit</button>

                    <>
                        <button className={`${Style.ternaryButton} text-wrap`} onClick={() => setConfirmDraft(true)}><BsHourglassSplit size={18} /> Save as Draft</button>
                        <button className={`${Style.closeButton} text-wrap`} onClick={handleFormReset}><GrPowerReset size={19} /> Reset Form</button>
                    </>

                    <button className={Style.closeButton} onClick={handleBackClick} ><BsBoxArrowLeft size={15} /> Back</button>
                </div>

            </div>

            <div className="row gx-5">
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label text-nowrap'>Requester<span className='text-danger'>*</span></label>
                    <div className="w-100">
                        <PeoplePicker
                            context={peoplePickerContext}
                            personSelectionLimit={1}
                            showtooltip={true}
                            required={true}
                            ensureUser={true}
                            principalTypes={[PrincipalType.User]}
                            resolveDelay={1000}
                            placeholder='Search for users...'
                            defaultSelectedUsers={formData.requester ? [formData.requester] : []}
                            onChange={(items: any[]): void => handlePeoplePickerChange('Requester', items)}
                            styles={{
                                text: {
                                    color: 'black',
                                    border: "1px solid #E3E3E3",
                                    background: "white",
                                    padding: "3.5px",
                                    width: "100%"
                                },
                            }}
                        />
                    </div>
                </div>
                {/* Department */}
                <div className='mb-2 col-12 col-md-4 col-sm-6'>
                    <label className='form-label'>Department<span className='text-danger'>*</span></label>
                    <Select
                        {...props}
                        isClearable={true}
                        isSearchable={true}
                        options={departmentData}
                        value={departmentData.find(option => option.value === formData.department) || null}
                        onChange={handleDepartment}
                        styles={{
                            menuList: (provided: any) => ({
                                ...provided,
                                maxHeight: 150,
                                overflowY: "auto",
                            }),
                        }}
                    />
                </div>
                {/* Requested Date */}
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label text-nowrap'>Requested Date<span className='text-danger'>*</span></label>
                    <input
                        type="date"
                        className={`${Style.inputStyle}`}
                        name="requestedDate"
                        value={formData.requestedDate}
                        onChange={(e) => handleFormDataChange('requestedDate', e.target.value)}
                    />
                </div>

                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label text-nowrap'>Category </label>
                    <Select
                        {...props}
                        isClearable={true}
                        isSearchable={true}
                        onChange={handleCategory}
                        options={categoryOptions}
                        value={categoryOptions.find(option => option.value === formData.category) || null}
                        styles={{
                            menuList: (provided: any) => ({
                                ...provided,
                                maxHeight: 150,
                                overflowY: "auto",
                            }),
                        }}
                    />
                </div>
                {/* Total Cost */}
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label'>Total Cost </label>
                    <input
                        type='number'
                        className={`${Style.inputStyle}`}
                        name='totalCost'
                        value={formData.totalCost ?? ""}
                        onChange={(e) => handleFormDataChange('totalCost', e.target.value)}
                    />
                </div>

                {/* Recurring Cost */}
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label'>Recurring Cost </label>
                    <input
                        type='number'
                        className={`${Style.inputStyle}`}
                        name='recurringCost'
                        value={formData.recurringCost ?? ""}
                        onChange={(e) => handleFormDataChange('recurringCost', e.target.value)}
                    />
                </div>

                {/* useCase */}
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label text-nowrap'>UseCase </label>
                    <Select
                        {...props}
                        isClearable={true}
                        isSearchable={true}
                        options={useCaseOption}
                        value={useCaseOption.find(option => option.value === formData.useCase) || null}
                        onChange={handleUseCase}
                        styles={{
                            menuList: (provided: any) => ({
                                ...provided,
                                maxHeight: 150,
                                overflowY: "auto",
                            }),
                        }}
                    />
                </div>

                {/* PurchaseType */}
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label text-nowrap'>PurchaseType </label>
                    <Select
                        {...props}
                        isClearable={true}
                        isSearchable={true}
                        options={purchaseTypeOption}
                        value={purchaseTypeOption.find(option => option.value === formData.purchaseType) || null}
                        onChange={handlePurchaseType}
                        styles={{
                            menuList: (provided: any) => ({
                                ...provided,
                                maxHeight: 150,
                                overflowY: "auto",
                            }),
                        }}
                    />
                </div>

                {/* Purchase Details */}
                <div className='mb-2 col-12 col-sm-6 col-md-4'>
                    <label className='form-label'>Purchase Details</label>
                    <input
                        type='text'
                        className={`${Style.inputStyle}`}
                        name='purchaseDetails'
                        value={formData.purchaseDetails}
                        onChange={(e) => handleFormDataChange('purchaseDetails', e.target.value)}
                    />
                </div>

                {/* Item/Service Description */}
                <div className='mb-2 col-12 col-md-6 '>
                    <label className='form-label'>Item/Service Description</label>
                    <textarea
                        rows={3}
                        className={`${Style.inputStyle}`}
                        name='itemServiceDescription'
                        value={formData.itemServiceDescription}
                        onChange={(e) => handleFormDataChange('itemServiceDescription', e.target.value)}
                    />
                </div>

                {/* Business Justification */}
                <div className='mb-2 col-12 col-md-6'>
                    <label className='form-label'>Business Justification</label>
                    <textarea
                        rows={3}
                        className={`${Style.inputStyle}`}
                        name='businessJustification'
                        value={formData.businessJustification}
                        onChange={(e) => handleFormDataChange('businessJustification', e.target.value)}
                    />
                </div>
                {/* AR Required */}
                <div className=" mb-2 col-12 col-md-6 d-flex align-items-center">
                    <div className="form-check gap-2">
                        <input className={`form-check-input ${Style.inputStyle}`} type="checkbox" id="tax" checked={formData?.ARRequired} onChange={(e) => handleTaxToggle(e.target.checked)} />
                        <label className="form-check-label">AR Required</label>
                    </div>
                </div>
                {formData?.department && formData?.departmentId && (
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
                )}

            </div>
           

            {/* confirm form submit */}
            <Dialog
                hidden={!confirmSubmit}
                onDismiss={() => setConfirmSubmit(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    subText: "Are you sure? You want to Submit the PRForm",
                }}

            >
                <div className=" d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                    <button className={`${Style.secondaryButton} px-3`} onClick={() => handleConfirmSubmit("confirm")} > Confirm</button>
                    <button className={`${Style.closeButton} px-3`} onClick={() => handleConfirmSubmit("cancel")} > Cancel </button>
                </div>
            </Dialog>

            {/* confirm Draft */}
            <Dialog
                hidden={!confirmDraft}
                onDismiss={() => setConfirmDraft(false)}
                dialogContentProps={{
                    type: DialogType.normal,
                    subText: "Are you sure you want to save the form as a draft?",
                }}

            >
                <div className=" d-flex gap-2 flex-nowrap align-items-center justify-content-end">
                    <button className={`${Style.secondaryButton} px-3`} onClick={handleSaveAsDraft} > Confirm</button>
                    <button className={`${Style.closeButton} px-3`} onClick={() => setConfirmDraft(false)} > Cancel </button>
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
        </div>
    );
};

export default PRForm;