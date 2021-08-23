import React, { useContext, useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import AlertContext from "./AlertContext";

const PantryAlert = () => {
  const { message, setMessage } = useContext(AlertContext);

  const clearMessage = () => {
    setMessage({ text: "", variant: "" });
  };

  useEffect(() => {
    let timeoutToClearMessage = setTimeout(clearMessage, 10000);

    return () => {
      clearTimeout(timeoutToClearMessage);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (message.text) {
    return (
      <Alert
        variant={message.variant ? message.variant : "primary"}
        onClose={() => clearMessage()}
        className="mt-3"
        dismissible
      >
        {message.text}
      </Alert>
    );
  } else {
    return null;
  }
};

export default PantryAlert;
