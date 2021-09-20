import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import UserContext from "./UserContext";
import AlertContext from "./AlertContext";
import NavBar from "./NavBar";
import PantryAlert from "./PantryAlert";
import Routes from "./Routes";
import getHelperFunctions, { useLocalStorage } from "./appHelpers";
import TokenSetter from "./TokenSetter";

function App() {
  const [user, setUser] = useLocalStorage("pantry-user", {});
  const [token, setToken] = useLocalStorage("pantry-token", "");

  const [message, setMessage] = useState({
    text: "",
    variant: "",
  });

  const [logIn, logOut, signUp, editUser] = getHelperFunctions(
    user,
    setUser,
    setMessage,
    setToken
  );

  return (
    <UserContext.Provider value={user}>
      <NavBar />
      <AlertContext.Provider value={{ message, setMessage }}>
        <Container className="mt-3" fluid="lg">
          <PantryAlert />
          <TokenSetter token={token} />
          <Routes
            logIn={logIn}
            logOut={logOut}
            signUp={signUp}
            editUser={editUser}
          />
        </Container>
      </AlertContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
