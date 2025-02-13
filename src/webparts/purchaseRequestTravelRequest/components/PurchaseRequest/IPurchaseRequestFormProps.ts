import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IPurchaseRequestFormProps {
    userId: number;
    userName: string;
    context: WebPartContext;
}

