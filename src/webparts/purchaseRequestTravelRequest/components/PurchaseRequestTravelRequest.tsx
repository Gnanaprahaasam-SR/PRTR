import * as React from 'react';
import styles from './PurchaseRequestTravelRequest.module.scss';
import type { IPurchaseRequestTravelRequestProps } from './IPurchaseRequestTravelRequestProps';
import { HashRouter, Route, Routes } from 'react-router-dom';
import PRForm from './PurchaseRequest/PurchaseRequestForm';
import Header from './Header/Header';
import Home from './Home/Home';
import PurchaseRequestTable from './PurchaseRequest/PurchaseRequestTable';
import TravelRequestForm from './TravelRequest/TravelRequestFrom';
import PRUpdate from './PurchaseRequest/PRUpdate';
import TravelRequestTable from './TravelRequest/TravelRequestTable';
import TRUpdate from './TravelRequest/TRUpdate';
// import { escape } from '@microsoft/sp-lodash-subset';

export default class PurchaseRequestTravelRequest extends React.Component<IPurchaseRequestTravelRequestProps> {
  public render(): React.ReactElement<IPurchaseRequestTravelRequestProps> {
    const {
      // description,
      // isDarkTheme,
      // environmentMessage,
      // hasTeamsContext,
      userDisplayName,
      // userEmailId,
      userId,
      context
    } = this.props;

    return (
      <section className={`${styles.purchaseRequestTravelRequest}`}>
        <HashRouter>
          <Header userDisplayName={userDisplayName} context={context} />
          <Routes>
            <Route path="/" element={<Home context={context} />} />
            <Route path="/purchaseRequest/:PRId?" element={<PRForm userId={userId} userName={userDisplayName} context={context} />} />
            <Route path="/purchaseRequestTable/:table" element={<PurchaseRequestTable userId={userId} userName={userDisplayName} context={context} />} />
            <Route path='/purchaseRequestUpdate/:PRId' element={<PRUpdate userId={userId} userName={userDisplayName} context={context} />} />

            <Route path='/travelRequest/:TRId?' element={<TravelRequestForm userId={userId} userName={userDisplayName} context={context} />} />
            <Route path='/travelRequestTable/:table' element={<TravelRequestTable userId={userId} userName={userDisplayName} context={context} />} />
            <Route path='/travelRequestUpdate/:TRId' element={<TRUpdate userId={userId} userName={userDisplayName} context={context} />} />
          </Routes>
        </HashRouter>

      </section>
    );
  }
}
