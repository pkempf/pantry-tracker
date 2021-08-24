import { render } from "@testing-library/react";
import SearchBar from "./SearchBar";

it("renders without crashing", () => {
  render(<SearchBar />);
});

it("matches the snapshot", () => {
  const { asFragment } = render(<SearchBar />);
  expect(asFragment()).toMatchSnapshot();
});
