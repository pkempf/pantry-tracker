import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AddRecipeForm from "./AddRecipeForm";
import UserContext from "../UserContext";
import AlertContext from "../AlertContext";

it("renders without crashing", () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ username: "test" }}>
        <AlertContext.Provider value={{ setMessage: {} }}>
          <AddRecipeForm />
        </AlertContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>
  );
});

it("matches the snapshot", () => {
  const { asFragment } = render(
    <MemoryRouter>
      <UserContext.Provider value={{ username: "test" }}>
        <AlertContext.Provider value={{ setMessage: {} }}>
          <AddRecipeForm />
        </AlertContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
