import { WebPartContext } from "@microsoft/sp-webpart-base";

interface IChartData {
    name: string;
    series: {
        key: string;
        data: number;
        xAxisCalloutData: string;
        color: string;
        legend: string;
    }[];
}

export interface IBarChartProps {
    context: WebPartContext;
    userId: number;
    chartData: IChartData[];
}