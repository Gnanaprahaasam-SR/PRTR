import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from '../PurchaseRequestTravelRequest.module.scss'
// import DivisionTable from '../Division/Division'
// import DepartmentTable from '../Department/Department';
// import { IoPersonOutline } from "react-icons/io5"
// import { MdOutlineCategory } from 'react-icons/md'
import { IMasterDataProps } from './IMasterDataProps'
// import { AiOutlinePieChart } from 'react-icons/ai'
import { GrInherit } from 'react-icons/gr'

const MasterData: React.FC<IMasterDataProps> = (props) => {
  const { table } = useParams();

  // Define the tab configuration with label, icon, and corresponding component
  const tabs = [

    // {
    //   key: 'division',
    //   label: 'Division',
    //   icon: <AiOutlinePieChart size={18} />,
    //   component: <DivisionTable context={props.context} />,
    // },
    {
      key: 'department',
      label: 'Department',
      icon: <GrInherit size={18} />,
      component: "<DepartmentTable context={props.context} />",
    },
    
  ];

  return (
    <section className='bg-white rounded-5'>
      <div className='d-flex flex-wrap align-items-center justify-content-between'>
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
                  to={`/masterData/${tab.key}`}
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

        <div className='w-100  px-2'>
          {tabs.map((tab) => (
            table === tab.key ? tab.component : null
          ))}
        </div>
      </div>
    </section>
  );
};

export default MasterData;
