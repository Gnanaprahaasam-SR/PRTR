import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IPurchaseRequestTravelRequestProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userEmailId: string;
  userId: number;
  context: WebPartContext;
}
