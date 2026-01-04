import React, { createContext, useContext, useState, useCallback } from "react";
import { CustomAlert, AlertType, AlertButton } from "../components/CustomAlert";

interface AlertContextType {
  showAlert: (
    title: string,
    message?: string,
    type?: AlertType,
    buttons?: AlertButton[]
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: "",
  });

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      type: AlertType = "info",
      buttons?: AlertButton[]
    ) => {
      setAlert({
        visible: true,
        title,
        message,
        type,
        buttons: buttons || [{ text: "OK" }],
      });
    },
    []
  );

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};

