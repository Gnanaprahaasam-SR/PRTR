import React, { FC, useEffect, useState } from 'react';
import { IHomeProps } from './IHomeProps';
import styles from './Home.module.scss';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
// import PieChartData from '../PieChart/PieChart';
// import HorizontalBarChartView from '../HorizontalBarChart/HorizontalBarChart';
import BarChartData from '../BarChart/BarChart';
import { IPRTableDataProps } from '../PurchaseRequest/PurchaseRequestTable';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { ITRTableDataProps } from '../TravelRequest/TravelRequestTable';
import mainStyles from '../PurchaseRequestTravelRequest.module.scss';
import { Link } from 'react-router-dom';
// import DonutChartComponent from '../DonutChart/DonutChart';

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

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];


const Home: FC<IHomeProps> = (props) => {
  const [PRCounts, setPRCounts] = useState({
    total: 0,
    approved: 0,
    inProgress: 0,
    rejected: 0
  });
  const [TRCounts, setTRCounts] = useState({
    total: 0,
    approved: 0,
    inProgress: 0,
    rejected: 0
  });

  // const [chartData, setChartData] = useState<IChartData[]>([]);

  const [prChartData, setPRChartData] = useState<IChartData[]>([]);
  const [trChartData, setTRChartData] = useState<IChartData[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [purchaseRequestData, setPurchaseRequestData] = useState<IPRTableDataProps[]>([]);
  const [travelRequestData, setTravelRequestData] = useState<ITRTableDataProps[]>([]);
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

   
  const [prSelectedYear, setPRSelectedYear] = useState<number>();
  const [trSelectedYear, setTRSelectedYear] = useState<number>();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const fetchPurchaseRequestData = async (status: string, userId: number): Promise<void> => {
    
    setLoading(true);
    const service = new PurchaseRequestTravelRequestService(props.context);
    try {
      const data = await service.getPurchaseRequestDetails(userId, status, null);
      const PRDetail = data.PRDetails;
      const PRData: IPRTableDataProps[] = PRDetail.map((item) => ({
        PRNumber: item.Id,
        Status: item.Status,
        Requester: item.Requester?.Title,
        RequesterId: item.Requester?.Id,
        Department: item.Department?.Department,
        DepartmentId: item.Department?.Id,
        RequestedDate: formatDate(item.RequestedDate),
        PurchaseDetails: item.PurchaseDetails,
        ItemServiceDescription: item.ItemServiceDescription,
        Category: item.Category,
        TotalCost: item.TotalCost,
        RecurringCost: item.RecurringCost,
        PurchaseType: item.PurchaseType,
        UseCase: item.UseCase,
      }));

      setPurchaseRequestData(PRData);

      setPRCounts({
        total: PRData.length,
        inProgress: PRData.filter(item => item.Status === "In Progress").length,
        approved: PRData.filter(item => item.Status === "Approved").length,
        rejected: PRData.filter(item => item.Status === "Rejected").length,
      });

    } catch (error) {
      console.error('Error fetching PR data:', error);
    } finally {
      setPRSelectedYear(currentYear);
      setLoading(false);
    }
  };

  const fetchTravelRequestData = async (status: string, userId: number): Promise<void> => {
   
    setLoading(true);
    const service = new PurchaseRequestTravelRequestService(props.context);
    try {
      const data = await service.getTravelRequestDetails(userId, status, null);
      const TRDetails = data.TRDetails;
      const TRData: ITRTableDataProps[] = TRDetails.map((item: any) => ({
        TRNumber: item.Id,
        Requester: item.Requester?.Title,
        RequesterId: item.Requester?.Id,
        Department: item.Department?.Department,
        DepartmentId: item.Department?.Id,
        RequestedDate: formatDate(item?.RequestedDate),
        TravelFrom: item.TravelFrom ?? "",
        TravelTo: item.TravelTo ?? "",
        StartDate: item.StartDate ? formatDate(item.StartDate) : "",
        EndDate: item.StartDate ? formatDate(item.EndDate) : "",
        TotalCostEstimate: item.TotalCostEstimate ?? 0,
        BusinessJustification: item.BusinessJustification ?? "",
        Status: item.Status ?? "",
      }));
      setTravelRequestData(TRData);
      
      setTRCounts({
        total: TRData.length,
        inProgress: TRData.filter(item => item.Status === "In Progress").length,
        approved: TRData.filter(item => item.Status === "Approved").length,
        rejected: TRData.filter(item => item.Status === "Rejected").length,
      });
    } catch (error) {
      console.error('Error fetching PR data:', error);
    } finally {
      setTRSelectedYear(currentYear);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseRequestData("All", props.userId);
    fetchTravelRequestData("All", props.userId);
  }, []);

  const fetchPRChartData = () => {
    // Temporary object to store the accumulated amount for each month based on status
    const tempData: {
      [key: string]: { Approved: number; InProgress: number; Rejected: number }
    } = {};


    purchaseRequestData.forEach((item: any) => {
      const date = new Date(item.RequestedDate);
      const month = months[date.getMonth()]; // Get month name
      const dataYear = date.getFullYear(); // Get year

      if (dataYear === prSelectedYear) {
        // Initialize if month is not present
        if (!tempData[month]) {
          tempData[month] = { Approved: 0, InProgress: 0, Rejected: 0 };
        }

        // Accumulate amount based on status
        const amount = item.TotalCost || 0; // Ensure amount is numeric
        switch (item.Status) {
          case "Approved":
            tempData[month].Approved += amount;
            break;
          case "In Progress":
            tempData[month].InProgress += amount;
            break;
          case "Rejected":
            tempData[month].Rejected += amount;
            break;
          default:
            break;
        }
      }
    });

    // Convert tempData into chart-friendly format
    const finalChartData = months.map((month) => ({
      name: month,
      series: [
        {
          key: 'Approved',
          data: tempData[month]?.Approved || 0, // Ensure data is always present
          xAxisCalloutData: `${month} - Approved`,
          YAxisCalloutData: `$${tempData[month]?.Approved || 0}`,
          color: '#1D8843',
          legend: 'Approved',
        },
        {
          key: 'InProgress',
          data: tempData[month]?.InProgress || 0,
          xAxisCalloutData: `${month} - In Progress`,
          YAxisCalloutData: `$${tempData[month]?.InProgress || 0}`,
          color: '#FF8008',
          legend: 'In Progress',
        },
        {
          key: 'Rejected',
          data: tempData[month]?.Rejected || 0,
          xAxisCalloutData: `${month} - Rejected`,
          YAxisCalloutData: `$${tempData[month]?.Rejected || 0}`,
          color: '#ff3149',
          legend: 'Rejected',
        },
      ],
    }));

    setPRChartData(finalChartData); // Update the state with the processed data
    return finalChartData; // Return the processed data for chart rendering
  };

  useEffect(() => {
    fetchPRChartData();
  },[prSelectedYear])

  const fetchTRChartData = () => {
    // Temporary object to store the accumulated amount for each month based on status
    const tempData: {
      [key: string]: { Approved: number; InProgress: number; Rejected: number }
    } = {};

    travelRequestData.forEach((item: any) => {
      const date = new Date(item.RequestedDate);
      const month = months[date.getMonth()]; // Get month name
      const dataYear = date.getFullYear(); // Get year

      if (dataYear === trSelectedYear) {
        // Initialize if month is not present
        if (!tempData[month]) {
          tempData[month] = { Approved: 0, InProgress: 0, Rejected: 0 };
        }

        // Accumulate amount based on status
        const amount = item.TotalCostEstimate || 0; // Ensure amount is numeric
        switch (item.Status) {
          case "Approved":
            tempData[month].Approved += amount;
            break;
          case "In Progress":
            tempData[month].InProgress += amount;
            break;
          case "Rejected":
            tempData[month].Rejected += amount;
            break;
          default:
            break;
        }
      }
    });

    // Convert tempData into chart-friendly format
    const finalChartData = months.map((month) => ({
      name: month,
      series: [
        {
          key: 'Approved',
          data: tempData[month]?.Approved || 0, // Ensure data is always present
          xAxisCalloutData: `${month} - Approved`,
          YAxisCalloutData: `$${tempData[month]?.Approved || 0}`,
          color: '#1D8843',
          legend: 'Approved',
        },
        {
          key: 'InProgress',
          data: tempData[month]?.InProgress || 0,
          xAxisCalloutData: `${month} - In Progress`,
          YAxisCalloutData: `$${tempData[month]?.InProgress || 0}`,
          color: '#FF8008',
          legend: 'In Progress',
        },
        {
          key: 'Rejected',
          data: tempData[month]?.Rejected || 0,
          xAxisCalloutData: `${month} - Rejected`,
          YAxisCalloutData: `$${tempData[month]?.Rejected || 0}`,
          color: '#ff3149',
          legend: 'Rejected',
        },
      ],
    }));

    setTRChartData(finalChartData); // Update the state with the processed data
    return finalChartData; // Return the processed data for chart rendering
  };

  useEffect(() => {
    fetchTRChartData();
  },[trSelectedYear])

 



  const PRCardData = [
    { title: "Total PR", count: PRCounts.total, color: "#004b87", status: "" },
    { title: "In Progress PR", count: PRCounts.inProgress, color: "#FF8008", status: "In Progress" },
    { title: "Approved PR", count: PRCounts.approved, color: "#1D8843", status: "Approved" },
    { title: "Rejected PR", count: PRCounts.rejected, color: "#ff3149", status: "Rejected" }
  ];

  const TRCardData = [
    { title: "Total TR", count: TRCounts.total, color: "#004b87", status: "" },
    { title: "In Progress TR", count: TRCounts.inProgress, color: "#FF8008", status: "In Progress" },
    { title: "Approved TR", count: TRCounts.approved, color: "#1D8843", status: "Approved" },
    { title: "Rejected TR", count: TRCounts.rejected, color: "#ff3149", status: "Rejected" }
  ];

  return (
    <div className={styles.home}>
      {loading && <LoadingSpinner />}
      <div className={styles.homeTitle}>
        Welcome, <b style={{ color: "#004b87" }}>{props.userName}</b>
      </div>
      <div className='row '>
        {/* Purchase Request Cards */}
        <div className='col-lg-6 m-0 p-0 '>
          {/* <div className={`${styles.homesubtitle} mb-2`}>PR Status</div> */}
          <div className={styles.homesubsection}>
            <div className='row'>
              {PRCardData.map((card, index) => (
                <div className='col-lg-3 col-md-4 col-6' key={index}>
                  <Link to={`/purchaseRequestTable/PR/${card.status}`} className='w-100 text-decoration-none'>
                  <div className={styles.card} style={{ backgroundColor: card.color }}>
                    <div className={styles.cardTitle}>{card.title}</div>
                    <div className={styles.cardItemCount}>{card.count}</div>
                  </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* <div className='row'>
              <div className='col-12 col-md-12 '>
                <DonutChartComponent context={props.context} userId={props.userId} />
              </div>
            </div> */}
          </div>
        </div>

        {/* Travel Request Cards */}
        <div className='col-lg-6 m-0 p-0'>
          {/* <div className={`${styles.homesubtitle} mb-2`}>TR Status</div> */}
          <div className={styles.homesubsection}>
            <div className='row'>
              {TRCardData.map((card, index) => (
                <div className='col-lg-3 col-md-4 col-6' key={index}>
                  <Link to={`/travelRequestTable/TR/${card.status}`} className='w-100 text-decoration-none'>
                  <div className={styles.card} style={{ backgroundColor: card.color }}>
                    <div className={styles.cardTitle}>{card.title}</div>
                    <div className={styles.cardItemCount}>{card.count}</div>
                  </div>
                  </Link>
                </div>
              ))}
            </div>
            
          </div>
        </div>

        <div className='row'>
          <div className={styles.homesubsection}>
            <div className={`${styles.homesubtitle} mb-2`}>Status - Purchase Request</div>
            <div className='bg-white rounded-5 p-2'>
              <div className='col-12 col-sm-4 col-md-3 float-end'>
                <div className='form-group px-4'>
                  <label className="form-label fw-bold">Select Year</label>
                  <select
                    className={mainStyles.inputStyle}
                    value={prSelectedYear}
                    onChange={(e) => setPRSelectedYear(Number(e.target.value))}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <BarChartData context={props.context} userId={props.userId} chartData={prChartData} />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className={styles.homesubsection}>
            <div className={`${styles.homesubtitle} mb-2`}>Status - Travel Request</div>
            <div className='bg-white rounded-5 p-2'>
              <div className='col-12 col-sm-4 col-md-3 float-end'>
                <div className='form-group px-4'>
                  <label className="form-label fw-bold">Select Year</label>
                  <select
                    className={mainStyles.inputStyle}
                    value={trSelectedYear}
                    onChange={(e) => setTRSelectedYear(Number(e.target.value))}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <BarChartData context={props.context} userId={props.userId} chartData={trChartData} />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Home;
