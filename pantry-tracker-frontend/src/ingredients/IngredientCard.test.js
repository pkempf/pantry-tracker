import { render } from "@testing-library/react";
import IngredientCard from "./IngredientCard";

it("renders without crashing", () => {
  render(<IngredientCard job={{}} />);
});

it("matches the snapshot", () => {
  const { asFragment } = render(<IngredientCard ingredient={{}} />);
  expect(asFragment()).toMatchSnapshot();
});
