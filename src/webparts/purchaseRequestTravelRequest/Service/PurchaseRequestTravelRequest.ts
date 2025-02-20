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

    // public async getPOIMCompanyDetails(): Promise<{ logo: string, companyName: string, companyAddress: string, companyPhoneNumber: string, powerBIDashboardLink: string }> {
    //     const sp = getSP(this.context);
    //     const web = sp?.web;

    //     if (!web) {
    //         throw new Error("Unable to access SharePoint web object.");
    //     }

    //     const documentsLibrary = web.lists.getByTitle("POIMCompanyDetails");

    //     try {
    //         // Select the required fields including the CompanyName, CompanyAddress, and CompanyPhoneNumber
    //         const documents = await documentsLibrary.items.select(
    //             "FileLeafRef", "FileRef", "Id", "Modified", "CompanyName", "CompanyAddress", "CompanyPhoneNumber", "PowerBIDashboardLink"
    //         )
    //             .orderBy("Modified", false) // Order by Modified date in descending order
    //             .top(1)(); // Get only the top (latest) item

    //         if (documents.length > 0) {
    //             const { FileRef, CompanyName, CompanyAddress, CompanyPhoneNumber, PowerBIDashboardLink } = documents[0];

    //             // Fetch the file (logo)
    //             const response = await fetch(FileRef);
    //             const blob = await response.blob();
    //             const reader = new FileReader();

    //             // Return the logo (as Data URL), company name, address, and phone number
    //             return new Promise((resolve, reject) => {
    //                 reader.onloadend = () => {
    //                     resolve({
    //                         logo: reader.result as string,
    //                         companyName: CompanyName,
    //                         companyAddress: CompanyAddress,
    //                         companyPhoneNumber: CompanyPhoneNumber,
    //                         powerBIDashboardLink: PowerBIDashboardLink
    //                     });
    //                 };
    //                 reader.onerror = reject;
    //                 reader.readAsDataURL(blob);
    //             });
    //         } else {
    //             throw new Error("No company details found.");
    //         }
    //     } catch (error) {
    //         console.error("Error retrieving POIMCompanyDetails:", error);
    //         throw error;
    //     }
    // }



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
            console.log("Fetched Department items:", departmentData);
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
            console.log("Fetched Department items:", departmentData);
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

            console.log("Fetched PurchaseRequest items:", purchaseRequest);
            console.log("Status Counts:", statusCounts);

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

            console.log("Fetched PurchaseRequest items:", TravelRequest);
            console.log("Status Counts:", statusCounts);

            return { ...statusCounts };
        } catch (error) {
            console.error("Error retrieving PRTR Travel Request:", error);
            throw error;
        }
    }

    public async getPRTRApprovers(): Promise<any[]> {
        try {
            const sp = getSP(this.context);
            const list = sp?.web?.lists?.getByTitle("PRTRApprover");

            if (!list) {
                throw new Error("List 'PRTRApprover' not found.");
            }

            // Query to select fields and filter by Department
            const query = list.items
                .select("ID", "Approver/Id", "Approver/Title", "Approver/EMail", "Role", "Hierarchy")
                .expand("Approver")
                .orderBy("Hierarchy", true);
            const approversData = await query();
            console.log("Fetched Approvers:", approversData);
            return approversData;

        } catch (error) {
            console.error("Error retrieving PRTR Approvers:", error);
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

        console.log(newTR, approver, TRId);

        try {
            let newTRId: number;
            let newTRDetails: any;
            let newDocument: any;
            if (newTR?.Status !== "Draft") {
                if (TRId) {
                    const existingTR = await TravelRequestList.items.getById(TRId)();
                    if (existingTR) {
                        const updatedTR = await TravelRequestList.items.getById(TRId).update(newTR);
                        console.log("Updated existing TR:", updatedTR);
                        newTRDetails = updatedTR;
                    }
                    newTRId = TRId;

                    // Delete existing approvals
                    const existingApprovals = await ApprovalList.items
                        .filter(`TravelRequestId/Id eq ${TRId}`)();

                    for (const approval of existingApprovals) {
                        await ApprovalList.items.getById(approval.ID).delete();
                    }
                    console.log(`Deleted ${existingApprovals.length} old approvals for TR ID ${TRId}`);
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
                        console.log("Adding Approval:", formattedDetail);
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

                    // console.log("fileId", fileId)

                    const DocumentItem = await TRDocument.items.getById(fileId).update({
                        TravelRequestIdId: newTRId
                    });
                    newDocument = DocumentItem
                    console.log(`File ${fileName} uploaded   ${DocumentItem} to TRUploadDocuments library and associated with PRGeneralDetailID ${newTRId}.`);
                }

                return { TRDetails: newTRDetails, ApprovalDetails: newApprovals, Documents: newDocument };
            } else {
                if (TRId) {
                    const existingTR = await TravelRequestList.items.getById(TRId)();
                    if (existingTR) {
                        const updatedTR = await TravelRequestList.items.getById(TRId).update(newTR);
                        console.log("Updated existing TR:", updatedTR);
                        newTRDetails = updatedTR;
                    }
                    newTRId = TRId;
                    // Delete existing approvals
                    const existingApprovals = await ApprovalList.items
                        .filter(`TravelRequestId/Id eq ${TRId}`)();

                    for (const approval of existingApprovals) {
                        await ApprovalList.items.getById(approval.ID).delete();
                    }
                    console.log(`Deleted ${existingApprovals.length} old approvals for TR ID ${TRId}`);


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

                    // console.log("fileId", fileId)

                    const DocumentItem = await TRDocument.items.getById(fileId).update({
                        TravelRequestIdId: newTRId
                    });
                    newDocument = DocumentItem
                    console.log(`File ${fileName} uploaded   ${DocumentItem} to TRUploadDocuments library and associated with PRGeneralDetailID ${newTRId}.`);
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

            let query = list.items.select("ID", "Requester/Id", "Requester/Title", "Requester/EMail", "RequestedDate", "Department/Department", "Department/Id", "Where", "When", "TotalCostEstimate", "StratigicProjectRelated", "EmergencyRelated", "Status", "BusinessJustification", "Author/Title", "Created")
                .expand("Requester", "Department", "Author",);

            // Apply filter only if a condition exists
            if (filterCondition) {
                query = query.filter(filterCondition);
            }

            const TRDetails = await query.top(5000)();

            // Get total count
            const totalCount = TRDetails.length;

            console.log("Filtered TRDetails:", TRDetails);
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

            console.log("Fetched Approvers with details for TRId:", TRId, approversData);
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
        console.log("Input Data:", newPRData, approvers, PRId);

        try {
            let newPRId: number;
            let newPRDetails: any;
            let newDocument: any;
            if (Status !== "Draft") {
                if (PRId) {
                    const existingPR = await PurchaseRequestList.items.getById(PRId)();
                    if (existingPR) {
                        const updatedPR = await PurchaseRequestList.items.getById(PRId).update(newPRData);
                        console.log("Updated existing PR:", updatedPR);
                        newPRDetails = updatedPR;
                    }
                    newPRId = PRId;

                    // Delete existing approvals
                    const existingApprovals = await ApprovalsTranstion.items.filter(`PurchaseRequestId/Id eq '${PRId}'`)();
                    for (const approval of existingApprovals) {
                        await ApprovalsTranstion.items.getById(approval.ID).delete();
                    }
                    console.log(`Deleted ${existingApprovals.length} old approvals for PR ID ${PRId}`);


                } else {
                    const newPRDetail = await PurchaseRequestList.items.add(newPRData);
                    newPRDetails = newPRDetail;
                    newPRId = newPRDetail.ID;
                }

                console.log("New PR ID:", newPRId);

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
                        console.log("Adding Approval:", formattedDetail);
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

                    // console.log("fileId", fileId)

                    const DocumentItem = await PRDocument.items.getById(fileId).update({
                        PurchaseRequestIdId: newPRId
                    });
                    newDocument = DocumentItem
                    console.log(`File ${fileName} uploaded   ${DocumentItem} to PRUploadDocuments library and associated with PRGeneralDetailID ${newPRId}.`);
                }

                return { TRDetails: newPRDetails, ApprovalDetails: newApprovals, document: newDocument };
            }
            else {

                if (PRId) {
                    const existingPR = await PurchaseRequestList.items.getById(PRId)();
                    if (existingPR) {
                        const updatedPR = await PurchaseRequestList.items.getById(PRId).update(newPRData);
                        console.log("Updated existing PR:", updatedPR);
                        newPRDetails = updatedPR;
                    }
                    newPRId = PRId;

                    // Delete existing approvals
                    const existingApprovals = await ApprovalsTranstion.items.filter(`PurchaseRequestId/Id eq '${PRId}'`)();
                    for (const approval of existingApprovals) {
                        await ApprovalsTranstion.items.getById(approval.ID).delete();
                    }
                    console.log(`Deleted ${existingApprovals.length} old approvals for PR ID ${PRId}`);


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

                    // console.log("fileId", fileId)

                    const DocumentItem = await PRDocument.items.getById(fileId).update({
                        PurchaseRequestIdId: newPRId
                    });
                    newDocument = DocumentItem;
                    console.log(`File ${fileName} uploaded   ${DocumentItem} to PRUploadDocuments library and associated with PRGeneralDetailID ${PRId}.`);
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

            console.log("Fetched PRTRTravelRequestAttachment:", TravelDocument);
            return TravelDocument;
        } catch (error) {
            console.error("Error retrieving PRTRTravelRequestAttachment:", error);
            throw error;
        }
    }

    public async deletePRTRTravelRequestDocument(documentId: number): Promise<void> {
        console.log(documentId);
        try {
            const sp = getSP(this.context);
            const web = sp?.web;
            const documentsLibrary = web.lists.getByTitle("PRTRTravelRequestAttachment");
            await documentsLibrary.items.getById(documentId).delete();

            console.log(`Document with ID ${documentId} deleted successfully from PRTRTravelRequest Attachment.`);
        } catch (error) {
            console.error(`Error deleting document with ID ${documentId}:`, error);
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

            console.log("Fetched Approvers with details for TRId:", PRId, approversData);
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

            let query = list.items.select("ID", "Requester/Id", "Requester/Title", "Requester/EMail", "RequestedDate", "Department/Department", "Department/Id", "PurchaseDetails", "PurchaseType", "Category", "TotalCost", "RecurringCost", "ItemServiceDescription", "UseCase", "Status", "BusinessJustification", "ARRequired", "Author/Title", "Created", "ARDetails")
                .expand("Requester", "Department", "Author");

            // Apply filter only if a condition exists
            if (filterCondition) {
                query = query.filter(filterCondition);
            }

            const PRDetails = await query.top(5000)();

            // Get total count
            const totalCount = PRDetails.length;

            console.log("Filtered PRDetails:", PRDetails);
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

            console.log("Fetched PRTRPurchaseRequestAttachment:", PurchaseDocument);
            return PurchaseDocument;
        } catch (error) {
            console.error("Error retrieving PRTRPurchaseRequestAttachment:", error);
            throw error;
        }
    }

    public async deletePRTRPurchaseRequestDocument(documentId: number): Promise<void> {
        console.log(documentId);
        try {
            const sp = getSP(this.context);
            const web = sp?.web;
            const documentsLibrary = web.lists.getByTitle("PRTRPurchaseRequestAttachment");
            await documentsLibrary.items.getById(documentId).delete();

            console.log(`Document with ID ${documentId} deleted successfully from PRTRPurchaseRequest Attachment.`);
        } catch (error) {
            console.error(`Error deleting document with ID ${documentId}:`, error);
            throw error;
        }
    }

    public async UpdatePurchaseRequestApproval(approver: any, approverCount: number): Promise<any> {
        const sp = getSP(this.context);
        const web = sp?.web;
        const ApprovalsTranstion = web?.lists?.getByTitle("PRTRPurchaseRequestApprovals");
        const PurchaseRequestList = web?.lists?.getByTitle("PRTRPurchaseRequestDetails");
        console.log("Input Data:", approver);

        try {

            const existingPRApproval = await ApprovalsTranstion.items.select("ID",
                "PurchaseRequestId/Id",
                "Approver/Id",
                "Approver/Title",
                "Approver/EMail",
                "Comments",
                "Status",
                "ApprovedDate").expand('PurchaseRequestId', 'Approver').filter(`PurchaseRequestId/Id eq ${approver.PRId} and Approver/Id eq ${approver.ApproverId} and ID eq ${approver.Id}`)();
            console.log(existingPRApproval);

            if (existingPRApproval.length > 0) {
                if (approver.Status === "Rejected") {
                    const UpdatePurchaseRequest = await PurchaseRequestList.items.getById(approver.PRId).update({ Status: "Rejected" });
                    console.log("Updated existing PRstatus:", UpdatePurchaseRequest);
                }

                if (approver.Status === "Approved" && approver.Hierarchy === approverCount) {
                    const UpdatePurchaseRequest = await PurchaseRequestList.items.getById(approver.PRId).update({ Status: "Approved" });
                    console.log("Updated existing PRstatus:", UpdatePurchaseRequest);
                }
                const updatedPRApproval = await ApprovalsTranstion.items.getById(existingPRApproval[0].ID).update({
                    Comments: approver.Comments,
                    Status: approver.Status,
                    ApprovedDate: approver.ApprovedDate,
                });
                console.log("Updated existing PRApproval:", updatedPRApproval);
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
        console.log("Input Data:", approver);

        try {

            const existingPRApproval = await ApprovalsTranstion.items.select("ID",
                "TravelRequestId/Id",
                "Approver/Id",
                "Approver/Title",
                "Approver/EMail",
                "Comments",
                "Status",
                "ApprovedDate").expand('TravelRequestId', 'Approver').filter(`TravelRequestId/Id eq ${approver.TRId} and Approver/Id eq ${approver.ApproverId} and ID eq ${approver.Id}`)();
            console.log(existingPRApproval);

            if (existingPRApproval.length > 0) {
                if (approver.Status === "Rejected") {
                    const UpdatePurchaseRequest = await TravelRequestList.items.getById(approver.TRId).update({ Status: "Rejected" });
                    console.log("Updated existing TRstatus:", UpdatePurchaseRequest);
                }

                if (approver.Status === "Approved" && approver.Hierarchy === approverCount) {
                    const UpdatePurchaseRequest = await TravelRequestList.items.getById(approver.TRId).update({ Status: "Approved" });
                    console.log("Updated existing TRstatus:", UpdatePurchaseRequest);
                }
                const updatedPRApproval = await ApprovalsTranstion.items.getById(existingPRApproval[0].ID).update({
                    Comments: approver.Comments,
                    Status: approver.Status,
                    ApprovedDate: approver.ApprovedDate,
                });
                console.log("Updated existing TRApproval:", updatedPRApproval);
                return updatedPRApproval;
            }

        }
        catch (error) {
            console.error("Error in UpdateTravelRequestApproval:", error);
            throw error;
        }
    }

};