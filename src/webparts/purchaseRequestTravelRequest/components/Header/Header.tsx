import React, { FC, useState, useEffect } from 'react';
import { IHeaderProps } from './IHeaderProps';
import styles from './Header.module.scss';
import { Link, useLocation } from 'react-router-dom';

// import CustomDropdown from './CustomDropdown';
import { TiThMenu } from "react-icons/ti";
// import { FaQuestion } from 'react-icons/fa6';
import { TbReportAnalytics } from "react-icons/tb";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { BiSolidHome } from "react-icons/bi";
import { MdCardTravel } from "react-icons/md";
// import { FaDatabase } from "react-icons/fa6";
import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';

export interface DocumentState {
  id: number;
  fileName: string;
  fileRef: string;
}

const Header: FC<IHeaderProps> = (props) => {
  const [logo, setLogo] = useState<DocumentState>();
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const [isMenuActive, setIsMenuActive] = useState<boolean>(false);

  const handleMenu = () => {
    if (isMenuActive) {
      setIsMenuActive(false);
    } else {
      setIsMenuActive(true);
    }
  }

  const fetchPRTRLogo = async () => {
    const service = new PurchaseRequestTravelRequestService(props.context);
    try {
      const data = await service.getPRTRLogo();
      const document = data.document;
      const formattedDocument = {
        id: document.Id,
        fileName: document.FileLeafRef,
        fileRef: document.FileRef
      };
      setLogo(formattedDocument);
    } catch (error) {
      console.error('Error fetching Logo:', error);
    }
  };

  useEffect(() => {
    fetchPRTRLogo();
  }, [props.context]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(`.${styles.dropdown}`) === null) {
        // setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // const handleToggle = (dropdownId: string) => {
  //   setOpenDropdown(prev => (prev === dropdownId ? null : dropdownId));
  // };

  // const handleClose = () => {
  //   setOpenDropdown(null);
  // };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(props.userDisplayName);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div style={{ maxWidth: "230px", maxHeight: "50px", display: "flex", gap: "5px", alignItems: "center" }}>
          <div className='d-flex gap-2 align-items-center h-100 pe-2'>
            <img src={logo?.fileRef} alt='logo' className='rounded' width="auto" height="60px" />
          </div>
          <div className={styles.appName}>
            Purchase and Travel Requisition App
          </div>
        </div>

        <nav className={`${styles.navbar}   ${isMenuActive ? styles.active : ''}`}>
          <Link className={`${styles.navbarItem} ${location.pathname === '/' ? styles.active : ''}`} to="/">
            <div className={styles.navicon}><BiSolidHome size={18} /></div>  <div className={styles.navtext}>Home</div>
          </Link>

          {/* <CustomDropdown
            toggleText="Purchase Order"
            icon={<FontAwesomeIcon icon={faBagShopping} className={styles.dropdownicon} />}
            items={[
              { text: "My Active PO's", link: '/purchaseOrder/MyPO' },
              { text: "My Draft's", link: '/purchaseOrder/MyDraft' }
            ]}
            activePath={location.pathname}
            isOpen={openDropdown === 'purchaseOrder'}
            onToggle={() => handleToggle('purchaseOrder')}
            onClose={handleClose}
            onSelect={handleClose} // Close dropdown when item is selected
          /> */}

          <Link className={`${styles.navbarItem} ${location.pathname.startsWith('/purchaseRequest') ? styles.active : ''}`} to="/purchaseRequestTable/AllPRs">
            <div className={styles.navicon}><BiSolidPurchaseTag size={18} /></div><div className={styles.navtext}> Purchase Request</div>
          </Link>

          <Link className={`${styles.navbarItem} ${location.pathname.startsWith('/travelRequest') ? styles.active : ''}`} to="/travelRequestTable/TR">
            <div className={styles.navicon}><MdCardTravel size={18} /></div><div className={styles.navtext}> Travel Request</div>
          </Link>

          <Link
            className={`${styles.navbarItem} ${location.pathname.startsWith('/report') ? styles.active : ''}`}
            to="/report/PR"
          >
            <div className={styles.navicon}><TbReportAnalytics size={18} /></div>
            <div className={styles.navtext}>Reports</div>
          </Link>

          {/* <Link
            className={`${styles.navbarItem} ${location.pathname.startsWith('/masterData') ? styles.active : ''}`}
            to="/masterData/vendor"
          >

            <div className={styles.navicon}><FaDatabase size={15} /></div>

            <div className={styles.navtext}>Master Data</div>
          </Link> */}


          {/* <CustomDropdown
            toggleText="Reports"
            icon={<FontAwesomeIcon icon={faReceipt} className={styles.dropdownicon} />}
            items={[
              { text: "Product Category by Status", link: '/report/status' },
              { text: "Product Category by Division", link: '/report/division' }
            ]}
            activePath={location.pathname}
            isOpen={openDropdown === 'reports'}
            onToggle={() => handleToggle('reports')}
            onClose={handleClose}
            onSelect={handleClose} // Close dropdown when item is selected
          /> */}

          {/* <CustomDropdown
            toggleText="Admin"
            icon={<FontAwesomeIcon icon={faGear} className={styles.dropdownicon} />}
            items={[
              { text: "Division", link: '/admin/division' },
              { text: "Department", link: '/admin/department' },
              { text: "Product Category", link: '/admin/Category' },
              { text: "Vendor", link: '/admin/vendor' },
            ]}
            activePath={location.pathname}
            isOpen={openDropdown === 'settings'}
            onToggle={() => handleToggle('settings')}
            onClose={handleClose}
            onSelect={handleClose} // Close dropdown when item is selected
          /> */}


        </nav>

        <div className='d-flex align-items-center gap-3'>
          {/* <div className={styles.headerIcon}>
            <FaRegBell size={20} />
          </div> */}
          {/* <span title="User Guide">
            <a href={`${props.context.pageContext.site.absoluteUrl}/POIMDocuments/POIMUserGuide.pdf`} target='_blank' style={{ color: "#021B79" }} ><div className={styles.headerIcon}>
              <FaQuestion size={20} />
            </div></a>
          </span> */}
          <span
            title={props.userDisplayName}
            className={styles.userInitials}
          >
            {initials}
          </span>
          <span onClick={handleMenu} className={`${styles.menuIcon}`}>
            <TiThMenu size={30} />
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
