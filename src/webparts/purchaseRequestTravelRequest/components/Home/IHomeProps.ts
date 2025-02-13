import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IHomeProps {
  userId: number;
  userName: string;
  context: WebPartContext;
}