import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PantryForm from "./PantryForm";

it("renders without crashing", () => {
  render(
    <MemoryRouter>
      <PantryForm fields={[]} />
    </MemoryRouter>
  );
});

it("matches the snapshot", () => {
  const { asFragment } = render(
    <MemoryRouter>
      <PantryForm fields={[]} />
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
