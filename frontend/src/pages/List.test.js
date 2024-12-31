import React from "react";
import '@testing-library/jest-dom'
import { render, screen, act } from "@testing-library/react";
import List from "./List";
import mockActivities from "../test_files/mock-activities.json";

// Mock the data we will use for our tests
beforeEach(() => {
  sessionStorage.setItem("activities", JSON.stringify(mockActivities));
});

// Mock the table we will use for our tests
jest.mock("react-bootstrap-table-next", () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="activities-table"></div>),
  };
});

afterEach(() => {
  sessionStorage.clear();
});

test("renders the table", async () => {
  render(<List />);

  // Increase the screen size so that the table will appear
  act(() => {
    global.innerWidth = 1300;
    global.dispatchEvent(new Event("resize"));
  });

  expect(screen.getByTestId("activities-table")).toBeInTheDocument();
});

test("renders the download button", () => {
  render(<List />);
  
  const downloadButton = screen.getByText("Download as CSV");
  expect(downloadButton).toBeInTheDocument();
});

test("table is only visible on a large screen", () => {
  render(<List />);

  // Initially, the table is visible
  expect(screen.getByTestId("activities-table")).toBeInTheDocument();
  expect(screen.queryByTestId("hidden-table-description")).toBeNull();

  // Resize to small screen
  act(() => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));
  });

  // Verify the table is replaced with a message explaining the table isn't visible
  expect(screen.getByTestId("hidden-table-description")).toBeInTheDocument();
  expect(screen.queryByTestId("activities-table")).toBeNull();
  
  // Resize back to large screen
  act(() => {
    global.innerWidth = 1300;
    global.dispatchEvent(new Event("resize"));
  });

  // Verify table is visible again
  expect(screen.getByTestId("activities-table")).toBeInTheDocument();
  expect(screen.queryByTestId("hidden-table-description")).toBeNull();
});
