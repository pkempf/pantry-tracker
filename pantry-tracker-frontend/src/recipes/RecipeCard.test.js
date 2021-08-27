import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecipeCard from "./RecipeCard";

it("renders without crashing", () => {
  render(
    <MemoryRouter>
      <RecipeCard recipe={{}} />
    </MemoryRouter>
  );
});

it("matches the snapshot", () => {
  const { asFragment } = render(
    <MemoryRouter>
      <RecipeCard recipe={{}} />
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
