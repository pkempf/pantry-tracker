import { useEffect } from "react";
import PantryApi from "./api";

const TokenSetter = ({ token }) => {
  useEffect(() => {
    PantryApi.setToken(token);
  }, [token]);
  return null;
};

export default TokenSetter;
