

import React from 'react';
import { Spinner } from '@fluentui/react';
import styles from '../PurchaseRequestTravelRequest.module.scss';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.loadingOverlay}>
      <Spinner label="Loading..." />
    </div>
  );
};

export default LoadingSpinner;
