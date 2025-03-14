import * as React from 'react';
import styles from './PurchaseRequestTravelRequest.module.scss';
import type { IPurchaseRequestTravelRequestProps } from './IPurchaseRequestTravelRequestProps';
import { HashRouter, Route, Routes } from 'react-router-dom';
import PRForm from './PurchaseRequest/PurchaseRequestForm';
import Header from './Header/Header';
import Home from './Home/Home';
import PurchaseRequestTable from './PurchaseRequest/PurchaseRequestTable';
import TravelRequestForm from './TravelRequest/TravelRequestForm';
import PRUpdate from './PurchaseRequest/PRUpdate';
import TravelRequestTable from './TravelRequest/TravelRequestTable';
import TRUpdate from './TravelRequest/TRUpdate';
import Reports from './Report/Report';
import { getSP } from '../Service/PurchaseRequestTravelRequest';

interface IState {
  isUserInGroup: boolean;
}

export default class PurchaseRequestTravelRequest extends React.Component<
  IPurchaseRequestTravelRequestProps,
  IState
> {
  constructor(props: IPurchaseRequestTravelRequestProps) {
    super(props);
    this.state = {
      isUserInGroup: false,
    };
  }

  async componentDidMount() {
    await this.checkUserGroup('PRTRAdminGroup');
  }

  checkUserGroup = async (GroupName: string) => {
    try {
      const sp = getSP(this.props.context);
      const groups = await sp.web.siteUsers.getById(this.props.userId).groups();
      const isInGroup = groups.some((group: { Title: string }) => group.Title === GroupName);

      this.setState({ isUserInGroup: isInGroup });
    } catch (error) {
      console.error('Error checking user group membership', error);
      this.setState({ isUserInGroup: false });
    }
  };

  public render(): React.ReactElement<IPurchaseRequestTravelRequestProps> {
    const { userDisplayName, userId, context } = this.props;
    const { isUserInGroup } = this.state;

    return (
      <section className={styles.purchaseRequestTravelRequest}>
        <HashRouter>
          <Header userDisplayName={userDisplayName} context={context} />
          <Routes>
            <Route path="/" element={<Home context={context} userId={userId} userName={userDisplayName} />} />
            <Route
              path="/purchaseRequest/:PRId?"
              element={<PRForm userId={userId} userName={userDisplayName} context={context} />}
            />
            <Route
              path="/purchaseRequestTable/:table/:status?"
              element={<PurchaseRequestTable userId={userId} userName={userDisplayName} context={context} />}
            />
            <Route
              path="/purchaseRequestUpdate/:PRId"
              element={<PRUpdate userId={userId} isUserInGroup={isUserInGroup} userName={userDisplayName} context={context} />}
            />
            <Route
              path="/travelRequest/:TRId?"
              element={<TravelRequestForm userId={userId} userName={userDisplayName} context={context} />}
            />
            <Route
              path="/travelRequestTable/:table/:status?"
              element={<TravelRequestTable userId={userId} userName={userDisplayName} context={context} />}
            />
            <Route
              path="/travelRequestUpdate/:TRId"
              element={<TRUpdate userId={userId} isUserInGroup={isUserInGroup} userName={userDisplayName} context={context} />}
            />
            <Route path="/report/:table" element={<Reports context={context} />} />
          </Routes>
        </HashRouter>
      </section>
    );
  }
}
