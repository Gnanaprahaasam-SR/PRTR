import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ITravelRequestProps {
  userId: number;
  userName: string;
  context: WebPartContext;
  isUserInGroup?:boolean;
}