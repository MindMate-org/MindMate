import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

import { CustomAlertManager } from '../ui/custom-alert';

interface AlertProviderProps {
  children: React.ReactNode;
}

const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [currentAlert, setCurrentAlert] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    // AlertManager에 컨테이너 등록
    CustomAlertManager.setAlertContainer({
      showAlert: (alert: React.ReactElement) => {
        setCurrentAlert(alert);
      },
      hideAlert: () => {
        setCurrentAlert(null);
      },
    });

    return () => {
      CustomAlertManager.setAlertContainer(null);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {currentAlert}
    </View>
  );
};

export default AlertProvider;
