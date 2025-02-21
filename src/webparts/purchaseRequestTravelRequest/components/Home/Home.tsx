import React, { FC, useEffect, useState } from 'react';
import { IHomeProps } from './IHomeProps';
import styles from './Home.module.scss';
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
// import PieChartData from '../PieChart/PieChart';
import HorizontalBarChartView from '../HorizontalBarChart/HorizontalBarChart';
import BarChartData from '../BarChart/BarChart';
import DonutChartComponent from '../DonutChart/DonutChart';


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

  // const [powerBIDashboardLink, setPowerBIDashboardLink] = useState<string>("");

  const fetchTRCounts = async (): Promise<void> => {
    const service = new PurchaseRequestTravelRequestService(props.context);
    try {
      const statusCount = await service.getPRTRTravelRequest();

      setTRCounts({
        total: statusCount?.total,
        approved: statusCount?.approved,
        inProgress: statusCount?.inProgress,
        rejected: statusCount?.rejected
      });
    } catch (error) {
      console.error('Error fetching asset counts:', error);
    }
  };

  const fetchPRDataCount = async (): Promise<void> => {
    const service = new PurchaseRequestTravelRequestService(props.context);
    try {
      const statusCount = await service.getPRTRPurchaseRequest();

      setPRCounts({
        total: statusCount?.total,
        approved: statusCount?.approved,
        inProgress: statusCount?.inProgress,
        rejected: statusCount?.rejected
      });
    } catch (error) {
      console.error('Error fetching PO data:', error);
    }
  };



  useEffect(() => {
    fetchPRDataCount();
    fetchTRCounts();

  }, []);

  const PRCardData = [
    { title: "Total", count: PRCounts.total },
    { title: "In Progress", count: PRCounts.inProgress },
    { title: "Approved", count: PRCounts.approved },
    { title: "Rejected", count: PRCounts.rejected }
  ];

  const TRCardData = [
    { title: "Total", count: TRCounts.total },
    { title: "In Progress", count: TRCounts.inProgress },
    { title: "Approved", count: TRCounts.approved },
    { title: "Rejected", count: TRCounts.rejected }
  ];

  return (
    <div className={styles.home}>
      <div className={styles.homeTitle}>
        Welcome, <b>{props.userName}</b>
      </div>
      <div className='row'>
        {/* Purchase Request Cards */}
        <div className='col-lg-6'>
          <div className={`${styles.homesubtitle} mb-2`}>Purchase Request Status</div>
          <div className={styles.homesubsection}>
            <div className='row'>
              {PRCardData.map((card, index) => (
                <div className='col-lg-3 col-md-4 col-6' key={index}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>{card.title}</div>
                    <div className={styles.cardItemCount}>{card.count}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className='row'>
              <div className='col-12 col-md-12 '>
                <DonutChartComponent context={props.context} userId={props.userId} />
              </div>
            </div>
          </div>
        </div>

        {/* Travel Request Cards */}
        <div className='col-lg-6'>
          <div className={`${styles.homesubtitle} mb-2`}>Travel Request Status</div>
          <div className={styles.homesubsection}>
            <div className='row'>
              {TRCardData.map((card, index) => (
                <div className='col-lg-3 col-md-4 col-6' key={index}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>{card.title}</div>
                    <div className={styles.cardItemCount}>{card.count}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className='row'>
              <div className='col-12 col-md-12'>
                <HorizontalBarChartView context={props.context} userId={props.userId} />
              </div>
            </div>
          </div>
        </div>


        <div className='row'>
          <div className={styles.homesubsection}>
            <div className={`${styles.homesubtitle} mb-2`}>Request Details by Year</div>
            <div className=''>
              <BarChartData context={props.context} userId={props.userId} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
