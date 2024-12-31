import React from "react";
import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import Settings from "./Settings";

test("shows the delete account button if it is not a sample account", async () => {
  sessionStorage.setItem("savedAthleteId", 12)

  render(<Settings />);
  expect(screen.getByTestId("delete-account-button")).toBeInTheDocument();

  sessionStorage.clear();
});

test("doesn't show the delete account button if it is a sample account", async () => {
  sessionStorage.setItem("savedAthleteId", 0)

  render(<Settings />);
  expect(screen.queryByTestId("delete-account-button")).toBeNull();

  sessionStorage.clear();
});
