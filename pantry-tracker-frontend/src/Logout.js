import React, { useContext } from "react";
import { Redirect, Link } from "react-router-dom";
import UserContext from "./UserContext";

const Logout = ({ logOutFunction }) => {
  const user = useContext(UserContext);
  if (!user.username) {
    return <Redirect to="/" />;
  }

  const delayAndLogout = (e) => {
    e.preventDefault();
    setTimeout(() => logOutFunction(), 300);
  };

  return (
    <Link to="/" onClick={delayAndLogout}>
      Confirm Log Out{" "}
    </Link>
  );
};

export default Logout;
