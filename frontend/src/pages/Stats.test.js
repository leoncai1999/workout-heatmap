import React from "react";
import 'jest-canvas-mock';
import '@testing-library/jest-dom'
import { render, screen, act } from "@testing-library/react";
import Stats from "./Stats";
import mockActivities from "../test_files/mock-activities.json";
import mockCities from "../test_files/mock-cities.json";
import mockHeartRateZones from "../test_files/mock-heartratezones.json";

// Mock the data we will use for our tests
beforeEach(() => {
  sessionStorage.setItem("activities", JSON.stringify(mockActivities));
  sessionStorage.setItem("cities", JSON.stringify(mockCities));
  sessionStorage.setItem("heartRateZones", JSON.stringify(mockHeartRateZones));
});

afterEach(() => {
  sessionStorage.clear();
});

test("renders the cities table", async () => {
  render(<Stats />);

  expect(screen.getByTestId("cities-table")).toBeInTheDocument();
});

test("renders the activities line chart", async () => {
  render(<Stats />);

  expect(screen.getByTestId("activities-line-chart")).toBeInTheDocument();
});

test("renders the activities time of day chart", async () => {
  render(<Stats />);

  expect(screen.getByTestId("activities-time-chart")).toBeInTheDocument();
});

test("renders the activities time of day chart", async () => {
  render(<Stats />);

  expect(screen.getByTestId("activities-time-chart")).toBeInTheDocument();
});

test("renders day of week stats only on large screens", async () => {
  render(<Stats />);

  // Increase the screen size so that the day of week stats appear
  act(() => {
    global.innerWidth = 1300;
    global.dispatchEvent(new Event("resize"));
  });

  expect(screen.getByTestId("day-of-week-chart")).toBeInTheDocument();
  expect(screen.getByTestId("day-of-week-table")).toBeInTheDocument();

  // Decrease the screen size so that the day of week stats disappear
  act(() => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));
  });

  expect(screen.queryByTestId("day-of-week-chart")).toBeNull();
  expect(screen.queryByTestId("day-of-week-table")).toBeNull();
});

test("renders intensity stats only on large screens", async () => {
  render(<Stats />);

  // Increase the screen size so that the day of week stats appear
  act(() => {
    global.innerWidth = 1300;
    global.dispatchEvent(new Event("resize"));
  });

  expect(screen.getByTestId("intensity-chart")).toBeInTheDocument();
  expect(screen.getByTestId("intensity-table")).toBeInTheDocument();

  // Decrease the screen size so that the day of week stats disappear
  act(() => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));
  });

  expect(screen.queryByTestId("intensity-chart")).toBeNull();
  expect(screen.queryByTestId("intensitytable")).toBeNull();
});
