import { Snackbar } from "@material/react-snackbar";
import React, { useCallback, useReducer, useRef } from "react";

type AlertOptions = {
  message: string;
  actionText?: string;
  action?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type AlertState = AlertOptions & {
  showing: boolean;
  onClose?: () => void;
};

type Props = React.PropsWithChildren<AlertState>;

function Alert({ showing, message, actionText, action, onClose }: Props) {
  const setup = (snackbar: Snackbar) => {
    if (snackbar && action) {
      snackbar.handleActionClick = action;
    }
  };

  return (
    <Snackbar
      open={showing}
      message={message}
      ref={setup}
      actionText={actionText}
      onClose={onClose}
    />
  );
}

type R = {
  showAlert: (config: AlertOptions) => void;
  alertState: AlertState;
  closeAlert: () => void;
};

function useAlert(): R {
  const initState = useRef<AlertState>({
      showing: false,
      message: "",
      actionText: undefined,
      action: undefined,
      onClose: undefined,
  })

  const [alertState, setAlertState] = useReducer(
    (s: AlertState, a: AlertState) => ({ ...s, ...a }),
    initState.current
  );

  const clearState = useCallback(() => {
    setAlertState(initState.current);
  }, []);

  const showAlert = useCallback(
    (config: AlertOptions) => {
      setAlertState({
        showing: true,
        onClose: clearState,
        ...config,
      });
    },
    [clearState]
  );

  return { showAlert, alertState, closeAlert: clearState };
}

export default Alert;
export { useAlert };
