import { render } from "@testing-library/react";
import TokenSetter from "./TokenSetter";

it("renders without crashing", () => {
  render(<TokenSetter token="" />);
});

it("matches the snapshot", () => {
  const { asFragment } = render(<TokenSetter token="" />);
  expect(asFragment()).toMatchSnapshot();
});
