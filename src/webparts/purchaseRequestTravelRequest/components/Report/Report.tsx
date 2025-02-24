import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from '../PurchaseRequestTravelRequest.module.scss'
import { IReportsProps } from './IReportsProps';

import { MdCardTravel } from 'react-icons/md'
import PRReport from './PRReport';
import TRReport from './TRReport';
import { BiPurchaseTagAlt } from 'react-icons/bi';

const Reports: React.FC<IReportsProps> = (props) => {
    const { table } = useParams();

    // Define the tab configuration with label, icon, and corresponding component
    const tabs = [
        {
            key: 'PR',
            label: 'Purchase Report',
            icon: <BiPurchaseTagAlt size={18} />,
            component: <PRReport context={props.context} />,
        },
        {
            key: 'TR',
            label: 'Travel Report',
            icon: <MdCardTravel size={18} />,
            component: <TRReport context={props.context} />,
        },

    ];

    return (
        <section className='bg-white rounded-5 ' style={{ minHeight: "500px" }}>
            <div className='d-flex flex-wrap align-items-center justify-content-between '>
                <div className={styles['tabs-container']}>
                    {tabs.map((tab, index) => (
                        <div
                            key={tab.key}
                            className={`${styles.tabBg} ${table === tab.key
                                ? styles.active  // Apply 'active' for the selected tab
                                : index > 0 && table === tabs[index - 1].key
                                    ? styles.rightActive  // Apply 'rightActive' for the tab to the right
                                    : index < tabs.length - 1 && table === tabs[index + 1].key
                                        ? styles.leftActive  // Apply 'leftActive' for the tab to the left
                                        : ''
                                }`}
                        >
                            <div className={`${styles.tabSecondaryBg}  ${table === tab.key ? styles.active : ''} `}>
                                <Link
                                    to={`/report/${tab.key}`}
                                    className={table === tab.key ? `${styles.tab} ${styles.active}` : `${styles.tab}`}
                                >
                                    <div className={styles['tab-icon']}>{tab.icon}</div>
                                    <div className={styles['tab-label']}>
                                        <span className={styles['main-label']}>{tab.label}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                {/* <PRReport context={props.context} /> */}
                <div className='w-100 px-2'>
                    {tabs.map((tab) => (
                        table === tab.key ? tab.component : null
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reports;
