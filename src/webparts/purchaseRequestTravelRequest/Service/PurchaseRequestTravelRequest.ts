import { SPFI, spfi, SPFx } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

let _sp: SPFI | null = null;

export const getSP = (context?: WebPartContext): SPFI => {
    if (!_sp) {
        if (!context) {
            throw new Error("SPFI is not initialized. Make sure to call getSP function with a valid context first.");
        }
        _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
    }
    return _sp;
};

export class PurchaseRequestTravelRequestService {
    private context: WebPartContext;

    constructor(context: WebPartContext) {
        this.context = context;
    }

    public async getPRTRLogo(): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;

        if (!web) {
            throw new Error("Unable to access SharePoint web object.");
        }

        const documentsLibrary = web.lists.getByTitle("PRTRCompanyDetails");
        try {
            const documents = await documentsLibrary.items.select(
                "FileLeafRef", "FileRef", "Id", "Modified"
            )
                .orderBy("Modified", false)
                .top(1)();

            if (documents.length > 0) {
                return { document: documents[0] };
            } else {
                return { document: null };
            }
        } catch (error) {
            console.error("Error retrieving POIMLogo:", error);
            throw error;
        }
    }


    public async getPRTRDepartment(activeStatus?: boolean): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRDepartments");

            if (!list) {
                throw new Error("List 'PRTRDepartments' not found.");
            }

            let query = list.items.select("ID", "Department", "IsActive");

            if (activeStatus) {
                query = query.filter("IsActive eq 1");
            }

            const departmentData = await query();
            return departmentData;
        } catch (error) {
            console.error("Error retrieving PRTR Departments:", error);
            throw error;
        }
    }


    public async updatePRTRDepartment(id: number, department: any): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRDepartments");

            if (!list) {
                throw new Error("List 'PRTRDepartments' not found.");
            }

            let query = list.items.select("ID", "Department", "IsActive");


            const departmentData = await query();
            return departmentData;
        } catch (error) {
            console.error("Error retrieving PRTR Departments:", error);
            throw error;
        }
    }


    public async getPRTRPurchaseRequest(): Promise<any> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRPurchaseRequestDetails");

            if (!list) {
                throw new Error("List 'PRTRPurchaseRequestDetails' not found.");
            }

            let filterCondition = "(Status ne 'Draft')";

            const purchaseRequest = await list.items
                .select(
                    "ID",
                    "Requester/Id",
                    "Requester/Title",
                    "Requester/EMail",
                    "Department/Department",
                    "Department/ID",
                    "RequestedDate",
                    "PurchaseDetails",
                    "ItemServiceDescription",
                    "Category",
                    "TotalCost",
                    "RecurringCost",
                    "PurchaseType",
                    "ARRequired",
                    "UseCase",
                    "BusinessJustification",
                    "Status",
                    "Created"
                )
                .expand("Requester", "Department")
                .filter(filterCondition)
                .top(5000)();

            // Count status occurrences
            const statusCounts = {
                total: purchaseRequest.length,
                inProgress: purchaseRequest.filter(item => item.Status === "In Progress").length,
                approved: purchaseRequest.filter(item => item.Status === "Approved").length,
                rejected: purchaseRequest.filter(item => item.Status === "Rejected").length,
            };


            return { ...statusCounts };
        } catch (error) {
            console.error("Error retrieving PRTR Purchase Request:", error);
            throw error;
        }
    }

    public async getPRTRTravelRequest(): Promise<any> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRTravelRequestDetails");

            if (!list) {
                throw new Error("List 'PRTRTravelRequestDetails' not found.");
            }

            let filterCondition = "(Status ne 'Draft')";

            const TravelRequest = await list.items
                .select(
                    "ID",
                    "Requester/Id",
                    "Requester/Title",
                    "Requester/EMail",
                    "Department/Department",
                    "Department/ID",
                    "RequestedDate",
                    "When",
                    "Where",
                    "TotalCostEstimate",
                    "StratigicProjectRelated",
                    "EmergencyRelated",
                    "BusinessJustification",
                    "Status",
                    "Created"
                )
                .expand("Requester", "Department")
                .filter(filterCondition)
                .top(5000)();

            // Count status occurrences
            const statusCounts = {
                total: TravelRequest.length,
                inProgress: TravelRequest.filter(item => item.Status === "In Progress").length,
                approved: TravelRequest.filter(item => item.Status === "Approved").length,
                rejected: TravelRequest.filter(item => item.Status === "Rejected").length,
            };

            return { ...statusCounts };
        } catch (error) {
            console.error("Error retrieving PRTR Travel Request:", error);
            throw error;
        }
    }

    public async getPRTRApprovers(Team: string): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRApprover");

            if (!list) {
                throw new Error("List 'PRTRApprover' not found.");
            }

            // Query to select fields and filter by Department
            const query = list.items
                .select("ID", "Approver/Id", "Approver/Title", "Approver/EMail", "Role", "Hierarchy", "Team")
                .expand("Approver")
                .filter(`Team eq '${Team}'`)
                .orderBy("Hierarchy", true);
            const approversData = await query();
            return approversData;

        } catch (error) {
            console.error("Error retrieving PRTR Approvers:", error);
            throw error;
        }
    }

    public async getPRTRTeams(): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRTeams");

            if (!list) {
                throw new Error("List 'PRTRTeams' not found.");
            }

            // Query to select fields and filter by Department
            const query = list.items
                .select("ID", "User/Id", "User/Title", "User/EMail", "Team")
                .expand("User")
            const TeamsData = await query();
            return TeamsData;

        } catch (error) {
            console.error("Error retrieving PRTR Teams:", error);
            throw error;
        }
    }


    private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to read file."));
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    public async addTravelRequestDetail(newTR: any, approver: any[], TRId: number | null, attachment: File[]): Promise<any> {
        const sp = getSP(this.context);
        const TravelRequestList = sp?.web?.lists?.getByTitle("PRTRTravelRequestDetails");
        const ApprovalList = sp?.web?.lists?.getByTitle("PRTRTravelRequestApprovals");
        const TRDocument = sp?.web?.lists?.getByTitle("PRTRTravelRequestAttachment");

        if (!TravelRequestList || !ApprovalList) {
            throw new Error("List 'PRTRTravelRequestApprovals' or 'PRTRTravelRequestDetails' not found.");
        }


        try {
            let newTRId: number;
            let newTRDetails: any;
            let newDocument: any;
            if (newTR?.Status !== "Draft") {
                if (TRId) {
                    const existingTR = await TravelRequestList.items.getById(TRId)();
                    if (existingTR) {
                        const updatedTR = await TravelRequestList.items.getById(TRId).update(newTR);
                        newTRDetails = updatedTR;
                    }
                    newTRId = TRId;

                    // Delete existing approvals
                    const existingApprovals = await ApprovalList.items
                        .filter(`TravelRequestId/Id eq ${TRId}`)();

                    for (const approval of existingApprovals) {
                        await ApprovalList.items.getById(approval.ID).delete();
                    }
                } else {
                    const newTRDetail = await TravelRequestList.items.add(newTR);
                    newTRDetails = newTRDetail;
                    newTRId = newTRDetail.ID;
                }

                // Insert new approvals
                const newApprovals = await Promise.all(
                    approver.map(async (Approver) => {
                        const formattedDetail = {
                            TravelRequestIdId: newTRId,
                            ApproverId: Approver.ApproverId,
                            Role: Approver.Role,
                            Hierarchy: Approver.Hierarchy,
                            Comments: Approver.Comments ?? "",
                            Status: Approver.Status ?? "Pending",
                            ApprovedDate: Approver.ApprovedDate
                                ? new Date(Approver.ApprovedDate).toISOString() // Ensure correct DateTime format
                                : null,
                        };
                        return await ApprovalList.items.add(formattedDetail);
                    })
                );
                for (const file of attachment) {
                    const fileName = `${newTRId}_${file.name}`;
                    const fileContent = await this.readFileAsArrayBuffer(file); // Function to read file as ArrayBuffer

                    // Upload the file
                    await TRDocument.rootFolder.files.addUsingPath(fileName, fileContent, { Overwrite: true });

                    const items = await TRDocument.items.filter(`FileLeafRef eq '${fileName}'`).top(1)();
                    if (items.length === 0) {
                        throw new Error(`Uploaded file '${fileName}' not found in the document library.`);
                    }
                    const fileId = items[0].Id;

                    const DocumentItem = await TRDocument.items.getById(fileId).update({
                        TravelRequestIdId: newTRId
                    });
                    newDocument = DocumentItem
                }

                return { TRDetails: newTRDetails, ApprovalDetails: newApprovals, Documents: newDocument };
            } else {
                if (TRId) {
                    const existingTR = await TravelRequestList.items.getById(TRId)();
                    if (existingTR) {
                        const updatedTR = await TravelRequestList.items.getById(TRId).update(newTR);
                        newTRDetails = updatedTR;
                    }
                    newTRId = TRId;
                    // Delete existing approvals
                    const existingApprovals = await ApprovalList.items
                        .filter(`TravelRequestId/Id eq ${TRId}`)();

                    for (const approval of existingApprovals) {
                        await ApprovalList.items.getById(approval.ID).delete();
                    }


                } else {
                    const newTRDetail = await TravelRequestList.items.add(newTR);
                    newTRDetails = newTRDetail;
                    newTRId = newTRDetail.ID;
                }

                for (const file of attachment) {
                    const fileName = `${newTRId}_${file.name}`;
                    const fileContent = await this.readFileAsArrayBuffer(file); // Function to read file as ArrayBuffer

                    // Upload the file
                    await TRDocument.rootFolder.files.addUsingPath(fileName, fileContent, { Overwrite: true });

                    const items = await TRDocument.items.filter(`FileLeafRef eq '${fileName}'`).top(1)();
                    if (items.length === 0) {
                        throw new Error(`Uploaded file '${fileName}' not found in the document library.`);
                    }
                    const fileId = items[0].Id;

                    const DocumentItem = await TRDocument.items.getById(fileId).update({
                        TravelRequestIdId: newTRId
                    });
                    newDocument = DocumentItem
                }

                return { TRDetails: newTRDetails, Documents: newDocument };
            }
        } catch (error) {
            console.error("Error handling Travel Request and Approvals:", error);
            throw error; // Throw the error instead of returning false
        }
    }


    public async getTravelRequestDetails(userId: number | null, Status: string, TravelRequestId: number | null): Promise<{ TRDetails: any[], totalCount: number }> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRTravelRequestDetails");

            if (!list) {
                throw new Error("List 'PRTRTravelRequestDetails' not found.");
            }

            let filterCondition
            if (Status === 'Draft' && userId) {
                filterCondition = `Status eq 'Draft' and Requester/Id eq '${userId}'`;
            }
            else if (Status !== "Draft" && TravelRequestId) {
                filterCondition = `ID eq ${TravelRequestId}`;
            } else {
                filterCondition = `Status ne 'Draft'`; // If a specific status is provided
            }

            let query = list.items.select("ID", "Requester/Id", "Requester/Title", "Requester/EMail", "RequestedDate", "Department/Department", "Department/Id", "TravelFrom", "TravelTo", "StartDate", "EndDate", "TotalCostEstimate", "StratigicProjectRelated", "EmergencyRelated", "Status", "BusinessJustification", "Author/Id", "Author/Title", "Created")
                .expand("Requester", "Department", "Author",);

            // Apply filter only if a condition exists
            if (filterCondition) {
                query = query.filter(filterCondition);
            }

            const TRDetails = await query.top(5000)();

            // Get total count
            const totalCount = TRDetails.length;

            return { TRDetails, totalCount };

        } catch (error) {
            console.error("Error retrieving PRTR TravelRequest:", error);
            throw error;
        }
    }


    public async getTravelRequestApprovals(TRId: number): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRTravelRequestApprovals");

            if (!list) {
                throw new Error("List 'PRTRTravelRequestApprovals' not found.");
            }

            // Fetch all travel request approvals
            const approversData = await list.items
                .select(
                    "ID",
                    "TravelRequestId/Id",
                    "Approver/Id",
                    "Approver/Title",
                    "Approver/EMail",
                    "Role",
                    "Hierarchy",
                    "Comments",
                    "Status",
                    "ApprovedDate"
                )
                .expand("Approver", "TravelRequestId")
                .filter(`TravelRequestId/Id eq ${TRId}`)
                .orderBy("Hierarchy", true)();

            return approversData;

        } catch (error) {
            console.error("Error retrieving PRTR Approvers:", error);
            throw error;
        }
    }


    public async addPurchaseRequestForm(newPRData: any, approvers: any[], PRId: number | null, attachment: File[]): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;
        const PurchaseRequestList = web?.lists?.getByTitle("PRTRPurchaseRequestDetails");
        const ApprovalsTranstion = web?.lists?.getByTitle("PRTRPurchaseRequestApprovals");
        const PRDocument = web?.lists?.getByTitle("PRTRPurchaseRequestAttachment");
        const Status = newPRData?.Status;

        try {
            let newPRId: number;
            let newPRDetails: any;
            let newDocument: any;
            if (Status !== "Draft") {
                if (PRId) {
                    const existingPR = await PurchaseRequestList.items.getById(PRId)();
                    if (existingPR) {
                        const updatedPR = await PurchaseRequestList.items.getById(PRId).update(newPRData);
                        newPRDetails = updatedPR;
                    }
                    newPRId = PRId;

                    // Delete existing approvals
                    const existingApprovals = await ApprovalsTranstion.items.filter(`PurchaseRequestId/Id eq '${PRId}'`)();
                    for (const approval of existingApprovals) {
                        await ApprovalsTranstion.items.getById(approval.ID).delete();
                    }

                } else {
                    const newPRDetail = await PurchaseRequestList.items.add(newPRData);
                    newPRDetails = newPRDetail;
                    newPRId = newPRDetail.ID;
                }


                // Insert new approvals
                const newApprovals = await Promise.all(
                    approvers.map(async (Approver) => {
                        const formattedDetail = {
                            PurchaseRequestIdId: newPRId,
                            ApproverId: Approver.ApproverId,
                            Role: Approver.Role,
                            Hierarchy: Approver.Hierarchy,
                            Comments: Approver.Comments ?? "",
                            Status: Approver.Status ?? "Pending",
                            ApprovedDate: Approver.ApprovedDate ? Approver.ApprovedDate : null,
                        };
                        return await ApprovalsTranstion.items.add(formattedDetail);
                    })
                );

                for (const file of attachment) {
                    const fileName = `${newPRId}_${file.name}`;
                    const fileContent = await this.readFileAsArrayBuffer(file); // Function to read file as ArrayBuffer

                    // Upload the file
                    await PRDocument.rootFolder.files.addUsingPath(fileName, fileContent, { Overwrite: true });

                    const items = await PRDocument.items.filter(`FileLeafRef eq '${fileName}'`).top(1)();
                    if (items.length === 0) {
                        throw new Error(`Uploaded file '${fileName}' not found in the document library.`);
                    }
                    const fileId = items[0].Id;


                    const DocumentItem = await PRDocument.items.getById(fileId).update({
                        PurchaseRequestIdId: newPRId
                    });
                    newDocument = DocumentItem
                }

                return { PRDetails: newPRDetails, ApprovalDetails: newApprovals, document: newDocument };
            }
            else {

                if (PRId) {
                    const existingPR = await PurchaseRequestList.items.getById(PRId)();
                    if (existingPR) {
                        const updatedPR = await PurchaseRequestList.items.getById(PRId).update(newPRData);
                        newPRDetails = updatedPR;
                    }
                    newPRId = PRId;

                    // Delete existing approvals
                    const existingApprovals = await ApprovalsTranstion.items.filter(`PurchaseRequestId/Id eq '${PRId}'`)();
                    for (const approval of existingApprovals) {
                        await ApprovalsTranstion.items.getById(approval.ID).delete();
                    }


                } else {
                    const newPRDetail = await PurchaseRequestList.items.add(newPRData);
                    newPRDetails = newPRDetail;
                    newPRId = newPRDetail.ID;
                }

                for (const file of attachment) {
                    const fileName = `${newPRId}_${file.name}`;
                    const fileContent = await this.readFileAsArrayBuffer(file); // Function to read file as ArrayBuffer

                    // Upload the file
                    await PRDocument.rootFolder.files.addUsingPath(fileName, fileContent, { Overwrite: true });

                    const items = await PRDocument.items.filter(`FileLeafRef eq '${fileName}'`).top(1)();
                    if (items.length === 0) {
                        throw new Error(`Uploaded file '${fileName}' not found in the document library.`);
                    }
                    const fileId = items[0].Id;


                    const DocumentItem = await PRDocument.items.getById(fileId).update({
                        PurchaseRequestIdId: newPRId
                    });
                    newDocument = DocumentItem;
                }
                return { PRDetails: newPRDetails, document: newDocument };
            }

        } catch (error) {
            console.error("Error in addPurchaseRequestForm:", error);
            throw error;
        }
    }

    public async getTravelRequestDocuments(TravelRequestId: number): Promise<any[]> {
        const sp = getSP(this.context);
        const web = sp?.web;
        const documentList = web?.lists?.getByTitle("PRTRTravelRequestAttachment");

        try {
            const TravelDocument = await documentList.items
                .select("FileLeafRef", "FileRef", "Id")
                .filter(`TravelRequestId eq '${TravelRequestId}'`)();

            return TravelDocument;
        } catch (error) {
            console.error("Error retrieving PRTRTravelRequestAttachment:", error);
            throw error;
        }
    }

    public async deletePRTRTravelRequestDocument(documentId: number): Promise<void> {
        try {
            const sp = getSP(this.context);
            const web = sp?.web;
            const documentsLibrary = web.lists.getByTitle("PRTRTravelRequestAttachment");
            await documentsLibrary.items.getById(documentId).delete();
        } catch (error) {
            console.error(`Error deleting document with ID ${documentId}:`, error);
            throw error;
        }
    }

    public async deleteTravelRequest(TRId: number): Promise<void> {
        try {
            const sp = getSP(this.context);
            const web = sp?.web;
            const TRList = web?.lists?.getByTitle("PRTRTravelRequestDetails");
            const ApprovalList = sp?.web?.lists?.getByTitle("PRTRTravelRequestApprovals");
            const TRDocument = sp?.web?.lists?.getByTitle("PRTRTravelRequestAttachment");
            await TRList.items.getById(TRId).delete();
            // Delete existing approvals
            const existingApprovals = await ApprovalList.items.filter(`TravelRequestId/Id eq '${TRId}'`)();
            for (const approval of existingApprovals) {
                await ApprovalList.items.getById(approval.ID).delete();
            }


            const existingDocuments = await TRDocument.items.filter(`TravelRequestId/Id eq '${TRId}'`)();
            for (const document of existingDocuments) {
                await TRDocument.items.getById(document.ID).delete();
            }


        } catch (error) {
            console.error(`Error deleting Travel Request with ID ${TRId}:`, error);
            throw error;
        }
    }

    public async getPurchaseRequestApprovals(PRId: number): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRPurchaseRequestApprovals");

            if (!list) {
                throw new Error("List 'PRTRPurchaseRequestApprovals' not found.");
            }
            // Fetch all travel request approvals
            const approversData = await list.items
                .select(
                    "ID",
                    "PurchaseRequestId/Id",
                    "Approver/Id",
                    "Approver/Title",
                    "Approver/EMail",
                    "Role",
                    "Hierarchy",
                    "Comments",
                    "Status",
                    "ApprovedDate"
                )
                .expand("Approver", "PurchaseRequestId")
                .filter(`PurchaseRequestId/Id eq ${PRId}`)
                .orderBy("Hierarchy", true)();

            return approversData;


        } catch (error) {
            console.error("Error retrieving PRTR Approvers:", error);
            throw error;
        }
    }

    public async getPurchaseRequestDetails(userId: number | null, Status: string, PurchaseRequestId: number | null): Promise<{ PRDetails: any[], totalCount: number }> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRPurchaseRequestDetails");

            if (!list) {
                throw new Error("List 'PRTRPurchaseRequestDetails' not found.");
            }

            let filterCondition
            if (Status === 'Draft' && userId) {
                filterCondition = `Status eq 'Draft' and Requester/Id eq '${userId}'`;
            }
            else if (Status !== "Draft" && PurchaseRequestId) {
                filterCondition = `ID eq ${PurchaseRequestId}`;
            } else {
                filterCondition = `Status ne 'Draft'`; // If a specific status is provided
            }

            let query = list.items.select("ID", "Requester/Id", "Requester/Title", "Requester/EMail", "RequestedDate", "Department/Department", "Department/Id", "PurchaseDetails", "PurchaseType", "Category", "TotalCost", "RecurringCost", "ItemServiceDescription", "UseCase", "Status", "BusinessJustification", "ARRequired", "Author/Id", "Author/Title", "Created", "ARDetails")
                .expand("Requester", "Department", "Author");

            // Apply filter only if a condition exists
            if (filterCondition) {
                query = query.filter(filterCondition);
            }

            const PRDetails = await query.top(5000)();

            // Get total count
            const totalCount = PRDetails.length;

            return { PRDetails, totalCount };

        } catch (error) {
            console.error("Error retrieving PRTR PurchaseRequest:", error);
            throw error;
        }
    }

    public async getPurchaseRequestDocuments(PurchaseRequestId: number): Promise<any[]> {
        const sp = getSP(this.context);
        const web = sp?.web;
        const documentList = web?.lists?.getByTitle("PRTRPurchaseRequestAttachment");

        try {
            const PurchaseDocument = await documentList.items
                .select("FileLeafRef", "FileRef", "Id")
                .filter(`PurchaseRequestId eq '${PurchaseRequestId}'`)();

            return PurchaseDocument;
        } catch (error) {
            console.error("Error retrieving PRTRPurchaseRequestAttachment:", error);
            throw error;
        }
    }

    public async deletePRTRPurchaseRequestDocument(documentId: number): Promise<void> {

        try {
            const sp = getSP(this.context);
            const web = sp?.web;
            const documentsLibrary = web.lists.getByTitle("PRTRPurchaseRequestAttachment");
            await documentsLibrary.items.getById(documentId).delete();

        } catch (error) {
            console.error(`Error deleting document with ID ${documentId}:`, error);
            throw error;
        }
    }


    public async deletePurchaseRequest(PRId: number): Promise<void> {
        try {
            const sp = getSP(this.context);
            const web = sp?.web;
            const PRList = web?.lists?.getByTitle("PRTRPurchaseRequestDetails");
            const PRDocument = web?.lists?.getByTitle("PRTRPurchaseRequestAttachment");

            const ApprovalsTranstion = web?.lists?.getByTitle("PRTRPurchaseRequestApprovals");
            await PRList.items.getById(PRId).delete();

            // Delete existing approvals
            const existingApprovals = await ApprovalsTranstion.items.filter(`PurchaseRequestId/Id eq '${PRId}'`)();
            for (const approval of existingApprovals) {
                await ApprovalsTranstion.items.getById(approval.ID).delete();
            }

            const existingDocuments = await PRDocument.items.filter(`PurchaseRequestId/Id eq '${PRId}'`)();
            for (const document of existingDocuments) {
                await PRDocument.items.getById(document.ID).delete();
            }

        } catch (error) {
            console.error(`Error deleting Purchase Request with ID ${PRId}:`, error);
            throw error;
        }
    }

    public async UpdatePurchaseRequestApproval(approver: any, approverCount: number): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;
        const ApprovalsTranstion = web?.lists?.getByTitle("PRTRPurchaseRequestApprovals");
        const PurchaseRequestList = web?.lists?.getByTitle("PRTRPurchaseRequestDetails");

        try {

            const existingPRApproval = await ApprovalsTranstion.items.select("ID",
                "PurchaseRequestId/Id",
                "Approver/Id",
                "Approver/Title",
                "Approver/EMail",
                "Comments",
                "Status",
                "ApprovedDate").expand('PurchaseRequestId', 'Approver').filter(`PurchaseRequestId/Id eq ${approver.PRId} and Approver/Id eq ${approver.ApproverId} and ID eq ${approver.Id}`)();

            if (existingPRApproval.length > 0) {
                if (approver.Status === "Rejected") {
                    await PurchaseRequestList.items.getById(approver.PRId).update({ Status: "Rejected" });
                }

                if (approver.Status === "Approved" && approver.Hierarchy === approverCount) {
                    await PurchaseRequestList.items.getById(approver.PRId).update({ Status: "Approved" });
                } else if (approver.Status === "Approved" && approver.Hierarchy !== approverCount) {
                    await PurchaseRequestList.items.getById(approver.PRId).update({ Status: "In Progress" });
                }

                const updatedPRApproval = await ApprovalsTranstion.items.getById(existingPRApproval[0].ID).update({
                    Comments: approver.Comments,
                    Status: approver.Status,
                    ApprovedDate: approver.ApprovedDate,
                });
                return updatedPRApproval;
            }

        }
        catch (error) {
            console.error("Error in UpdatePurchaseRequestApproval:", error);
            throw error;
        }
    }

    public async UpdateTravelRequestApproval(approver: any, approverCount: number): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;
        const ApprovalsTranstion = web?.lists?.getByTitle("PRTRTravelRequestApprovals");
        const TravelRequestList = web?.lists?.getByTitle("PRTRTravelRequestDetails");


        try {

            const existingPRApproval = await ApprovalsTranstion.items.select("ID",
                "TravelRequestId/Id",
                "Approver/Id",
                "Approver/Title",
                "Approver/EMail",
                "Comments",
                "Status",
                "ApprovedDate").expand('TravelRequestId', 'Approver').filter(`TravelRequestId/Id eq ${approver.TRId} and Approver/Id eq ${approver.ApproverId} and ID eq ${approver.Id}`)();


            if (existingPRApproval.length > 0) {
                if (approver.Status === "Rejected") {
                    await TravelRequestList.items.getById(approver.TRId).update({ Status: "Rejected" });
                }

                if (approver.Status === "Approved" && approver.Hierarchy === approverCount) {
                    await TravelRequestList.items.getById(approver.TRId).update({ Status: "Approved" });
                } else if (approver.Status === "Approved" && approver.Hierarchy !== approverCount) {
                    await TravelRequestList.items.getById(approver.TRId).update({ Status: "In Progress" });
                }

                const updatedPRApproval = await ApprovalsTranstion.items.getById(existingPRApproval[0].ID).update({
                    Comments: approver.Comments,
                    Status: approver.Status,
                    ApprovedDate: approver.ApprovedDate,
                });
                return updatedPRApproval;
            }

        }
        catch (error) {
            console.error("Error in UpdateTravelRequestApproval:", error);
            throw error;
        }
    }

    public async updatePurchaseRequestApprover(approver: any): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const approvalsTransition = web.lists.getByTitle("PRTRPurchaseRequestApprovals");

            if (!approvalsTransition) throw new Error("Approvals list not found");

            // Update the approver
            const updatedApprover = await approvalsTransition.items.getById(approver.Id).update({
                ApproverId: approver.ApproverId
            });

            return updatedApprover;
        } catch (error) {
            console.error("Error updating purchase request approver:", error);
            throw new Error(`Failed to update approver: ${error.message}`);
        }
    }

    public async updateTravelRequestApprover(approver: any): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const approvalsTransition = web.lists.getByTitle("PRTRTravelRequestApprovals");

            if (!approvalsTransition) throw new Error("Approvals list not found");

            // Update the approver
            const updatedApprover = await approvalsTransition.items.getById(approver.Id).update({
                ApproverId: approver.ApproverId
            });

            return updatedApprover;
        } catch (error) {
            console.error("Error updating travel request approver:", error);
            throw new Error(`Failed to update approver: ${error.message}`);
        }
    }

    public async getPRApprovalsByUser(userId: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const approvalsTransition = web.lists.getByTitle("PRTRPurchaseRequestApprovals");
            if (!approvalsTransition) throw new Error("Approvals list not found");

            // Fetch all approvals for the given user where status is 'Pending'
            const prApprovals = await approvalsTransition.items
                .select("ID", "PurchaseRequestId/Id", "Approver/Id", "Approver/Title", "Approver/EMail", "Comments", "Status", "ApprovedDate")
                .expand("PurchaseRequestId", "Approver")
                .filter(`Approver/Id eq ${userId} and Status eq 'Pending'`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly

            const filteredApprovals: any[] = [];
            const uniquePRIds = new Set<number>(); // To track unique PurchaseRequestIds

            for (const approval of prApprovals) {
                const purchaseRequestId = approval.PurchaseRequestId.Id;

                // Skip if this purchaseRequestId is already processed
                if (uniquePRIds.has(purchaseRequestId)) {
                    continue;
                }

                // Get all approvals for the same Purchase Request, sorted by ID
                const allApprovals = await approvalsTransition.items
                    .select("ID", "Approver/Id", "Status","Hierarchy")
                    .expand("Approver")
                    .filter(`PurchaseRequestId/Id eq ${purchaseRequestId}`)
                    .orderBy("Hierarchy", true).top(5000)(); // Sorting ensures sequential approval order

                // Find the current user's position in the approval sequence
                const currentIndex = allApprovals.findIndex(a => a.Approver.Id === userId);

                if (currentIndex === 0 || (currentIndex > 0 && allApprovals[currentIndex - 1].Status === "Approved")) {
                    filteredApprovals.push(approval);
                    uniquePRIds.add(purchaseRequestId); // Mark this purchaseRequestId as processed
                }
            }

            return filteredApprovals;
        } catch (error) {
            console.error("Error getting PR approvals by user:", error);
            throw new Error(`Failed to get PR approvals: ${error.message}`);
        }
    }


    public async getTRApprovalsByUser(userId: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const approvalsTransition = web.lists.getByTitle("PRTRTravelRequestApprovals");
            if (!approvalsTransition) throw new Error("Approvals list not found");

            // Fetch all approvals for the given user where status is 'Pending'
            const trApprovals = await approvalsTransition.items
                .select("ID", "TravelRequestId/Id", "Approver/Id", "Approver/Title", "Approver/EMail", "Comments", "Status", "ApprovedDate")
                .expand("TravelRequestId", "Approver")
                .filter(`Approver/Id eq ${userId} and Status eq 'Pending'`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly

                console.log("Pending Approvals", trApprovals);

            const filteredApprovals: any[] = [];
            const uniqueTRIds = new Set<number>(); // To track unique TravelRequestIds

            for (const approval of trApprovals) {
                const travelRequestId = approval.TravelRequestId.Id;

                // Skip if this TravelRequestId is already processed
                if (uniqueTRIds.has(travelRequestId)) {
                    continue;
                }

                // Get all approvals for the same Purchase Request, sorted by ID
                const allApprovals = await approvalsTransition.items
                    .select("ID", "Approver/Id", "Status", "Hierarchy")
                    .expand("Approver")
                    .filter(`TravelRequestId/Id eq ${travelRequestId}`)
                    .orderBy("Hierarchy", true).top(5000)(); // Sorting ensures sequential approval order

                    console.log("All Approvals related to the above Travel Request", allApprovals);

                // Find the current user's position in the approval sequence
                const currentIndex = allApprovals.findIndex(a => a.Approver.Id === userId);

                if (currentIndex === 0 || (currentIndex > 0 && allApprovals[currentIndex - 1].Status === "Approved")) {
                    filteredApprovals.push(approval);
                    uniqueTRIds.add(travelRequestId); // Mark this purchaseRequestId as processed
                }
            }

            return filteredApprovals;
        } catch (error) {
            console.error("Error getting TR approvals by user:", error);
            throw new Error(`Failed to get TR approvals: ${error.message}`);
        }
    }

    public async getPRApprovalsByPR(currentPR: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const prTransition = web.lists.getByTitle("PRTRPurchaseRequestApprovals");
            if (!prTransition) throw new Error("PRTRPurchaseRequestApprovals list not found");

            // Fetch all approvals for the given Purchase Request where status is 'Pending'
            const prApprovals = await prTransition.items
                .select("ID", "PurchaseRequestId/Id", "Approver/Id", "Approver/Title", "Approver/EMail", "Comments", "Status", "ApprovedDate")
                .expand("PurchaseRequestId", "Approver")
                .filter(`PurchaseRequestId/Id eq ${currentPR}`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly

            return prApprovals;
        } catch (error) {
            console.error("Error getting PR approvals by PR:", error);
            throw new Error(`Failed to get PR approvals: ${error.message}`);

        }
    }

    public async addQuestionToPR(question: any): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const prQuestions = web.lists.getByTitle("PRTRPurchaseRequestDiscussions");
            if (!prQuestions) throw new Error("PRTRPurchaseRequestDiscussions list not found");

            const response = await prQuestions.items.add(question);

            return response;
        } catch (err) {
            console.error("Error adding question to PR:", err);
            throw new Error(`Failed to add question: ${err.message}`);
        }
    }

    public async addAnswerToPR(answer: any): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const list = web.lists.getByTitle("PRTRPurchaseRequestDiscussions");
            if (!list) throw new Error("PRTRPurchaseRequestDiscussions list not found");

            const response = await list.items.getById(answer.Id).update({
                Answer: answer.Answer,
                AnswerBy: answer.AnswerBy,
                AnsweredOn: answer.AnsweredOn
            });

            return response;
        } catch (err) {
            console.error("Error adding answer to PR:", err);
            throw new Error(`Failed to add answer: ${err.message}`);
        }
    }


    public async getPRQuestionsByUser(userId: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const prQuestions = web.lists.getByTitle("PRTRPurchaseRequestDiscussions");
            if (!prQuestions) throw new Error("PRTRPurchaseRequestDiscussions list not found");

            // Fetch all questions where AnswerBy/Id matches userId
            const questions = await prQuestions.items
                .select(
                    "ID",
                    "PRNumber/Id",
                    "Question",
                    "RaisedBy/Id",
                    "RaisedBy/Title",
                    "RaisedOn",
                    "Answer",  // Cannot filter directly, but we fetch it
                    "AnswerBy/Id",
                    "AnswerBy/Title",
                    "AnsweredOn"
                )
                .expand("PRNumber", "RaisedBy", "AnswerBy")
                .filter(`AnswerBy/Id eq ${userId} and AnsweredOn eq null`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly


            return questions;
        } catch (error) {
            console.error("Error getting PR questions by user:", error);
            throw new Error(`Failed to get PR questions: ${error.message}`);
        }
    }


    public async getPRDiscussionsByPR(prNumber: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const list = web.lists.getByTitle("PRTRPurchaseRequestDiscussions");
            if (!list) throw new Error("PRTRPurchaseRequestDiscussions list not found");

            // Fetch all questions where PRNumber/Id matches prNumber
            const discussions = await list.items
                .select(
                    "ID",
                    "PRNumber/Id",
                    "Question",
                    "RaisedBy/Id",
                    "RaisedBy/Title",
                    "RaisedOn",
                    "Answer",  // Cannot filter directly, but we fetch it
                    "AnswerBy/Id",
                    "AnswerBy/Title",
                    "AnsweredOn"
                )
                .expand("PRNumber", "RaisedBy", "AnswerBy")
                .filter(`PRNumber/Id eq ${prNumber}`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly
            return discussions;
        } catch (error) {
            console.error("Error getting PR questions by PR:", error);
            throw new Error(`Failed to get PR questions: ${error.message}`);
        }
    }

    
    public async addQuestionToTR(question: any): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const prQuestions = web.lists.getByTitle("PRTRTravelRequestDiscussions");
            if (!prQuestions) throw new Error("PRTRTravelRequestDiscussions list not found");

            const response = await prQuestions.items.add(question);

            return response;
        } catch (err) {
            console.error("Error adding question to TR:", err);
            throw new Error(`Failed to add question: ${err.message}`);
        }
    }

    public async addAnswerToTR(answer: any): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const list = web.lists.getByTitle("PRTRTravelRequestDiscussions");
            if (!list) throw new Error("PRTRTravelRequestDiscussions list not found");

            const response = await list.items.getById(answer.Id).update({
                Answer: answer.Answer,
                AnswerBy: answer.AnswerBy,
                AnsweredOn: answer.AnsweredOn
            });

            return response;
        } catch (err) {
            console.error("Error adding answer to TR:", err);
            throw new Error(`Failed to add answer: ${err.message}`);
        }
    }


    public async getTRQuestionsByUser(userId: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const prQuestions = web.lists.getByTitle("PRTRTravelRequestDiscussions");
            if (!prQuestions) throw new Error("PRTRTravelRequestDiscussions list not found");

            // Fetch all questions where AnswerBy/Id matches userId
            const questions = await prQuestions.items
                .select(
                    "ID",
                    "TRNumber/Id",
                    "Question",
                    "RaisedBy/Id",
                    "RaisedBy/Title",
                    "RaisedOn",
                    "Answer",  // Cannot filter directly, but we fetch it
                    "AnswerBy/Id",
                    "AnswerBy/Title",
                    "AnsweredOn"
                )
                .expand("TRNumber", "RaisedBy", "AnswerBy")
                .filter(`AnswerBy/Id eq ${userId} and AnsweredOn eq null`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly


            return questions;
        } catch (error) {
            console.error("Error getting TR questions by user:", error);
            throw new Error(`Failed to get TR questions: ${error.message}`);
        }
    }

    public async getTRDiscussionsByTR(trNumber: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const list = web.lists.getByTitle("PRTRTravelRequestDiscussions");
            if (!list) throw new Error("PRTRTravelRequestDiscussions list not found");

            // Fetch all questions where TRNumber/Id matches trNumber
            const discussions = await list.items
                .select(
                    "ID",
                    "TRNumber/Id",
                    "Question",
                    "RaisedBy/Id",
                    "RaisedBy/Title",
                    "RaisedOn",
                    "Answer",  // Cannot filter directly, but we fetch it
                    "AnswerBy/Id",
                    "AnswerBy/Title",
                    "AnsweredOn"
                )
                .expand("TRNumber", "RaisedBy", "AnswerBy")
                .filter(`TRNumber/Id eq ${trNumber}`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly
            return discussions;
        } catch (error) {
            console.error("Error getting TR questions by TR:", error);
            throw new Error(`Failed to get TR questions: ${error.message}`);
        }
    }

    public async getTRApprovalsByTR(currentTR: number): Promise<any> {
        try {
            const sp = getSP(this.context);
            if (!sp) throw new Error("Failed to get SP context");

            const web = sp.web;
            if (!web) throw new Error("Failed to access SharePoint web");

            const trTransition = web.lists.getByTitle("PRTRTravelRequestApprovals");
            if (!trTransition) throw new Error("PRTRTravelRequestApprovals list not found");

            // Fetch all approvals for the given Purchase Request where status is 'Pending'
            const prApprovals = await trTransition.items
                .select("ID", "TravelRequestId/Id", "Approver/Id", "Approver/Title", "Approver/EMail", "Comments", "Status", "ApprovedDate")
                .expand("TravelRequestId", "Approver")
                .filter(`TravelRequestId/Id eq ${currentTR}`)
                .orderBy("ID", true).top(5000)(); // Ensure it's ordered correctly

            return prApprovals;
        } catch (error) {
            console.error("Error getting TR approvals by TR:", error);
            throw new Error(`Failed to get TR approvals: ${error.message}`);
        }
    }
};