import React from "react";
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { filterActivities } from "../utils/filter";
import Heatmap from "./Heatmap";
import mockActivities from "../test_files/mock-activities.json";
import mockCities from "../test_files/mock-cities.json";

// Mock the data we will use for our tests
beforeEach(() => {
  sessionStorage.setItem("activities", JSON.stringify(mockActivities));
  sessionStorage.setItem("cities", JSON.stringify(mockCities))
});

// Mock the map we will use for our tests
jest.mock("google-maps-react", () => ({
  Map: ({ children, center }) => <div data-testid="map" data-center={JSON.stringify(center)}>{children}</div>,
  Polyline: ({ customId, path }) => <div data-testid={customId} data-path={JSON.stringify(path)}></div>,
  GoogleApiWrapper: () => (Component) => (props) => <Component {...props} />,
}));

afterEach(() => {
  sessionStorage.clear();
});

test("renders the google map", async () => {
  render(<Heatmap />);

  await waitFor(() => {
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
  });
});

test("renders the cities dropdown", async () => {
  render(<Heatmap />);

  await waitFor(() => {
    expect(screen.getByTestId("cities-dropdown")).toBeInTheDocument();
  });
});

test("renders the options menu", async () => {
  render(<Heatmap />);

  await waitFor(() => {
    expect(screen.getByTestId("options-menu")).toBeInTheDocument();
  });
});

test("renders polylines for activities", async () => {
  render(<Heatmap />);

  const decodePolyline = require("decode-google-map-polyline");

  mockActivities.forEach((activity, i) => {
    const polyline = screen.getByTestId(`activity-polyline-${i}`);
    expect(polyline).toBeInTheDocument();

    /* 
      Compare the lat/lng paths between the polylines and the corresponding polyline 
      property in their activities to ensure they are identitical
    */
    const polylinePath = JSON.parse(polyline.getAttribute("data-path"));
    expect(polylinePath).toEqual(
      decodePolyline(activity["map"]["summary_polyline"]).map(({ lat, lng }) => ({ lat, lng }))
    );
  });
});

test("dropdown options match city names", async () => {
  render(<Heatmap />);

  // Open the dropdown menu
  await act(async () => {
    const dropdownButton = screen.getByRole("button", { name: "Select City" });
    fireEvent.click(dropdownButton);
  })

  /*
    Ensure the city dropdown options match the exact cities in
    mock-cities.json and are in the same order
  */
  mockCities.forEach((city, i) => {
    const cityDropdown = screen.getByTestId(`city-dropdown-${i}`);
    expect(cityDropdown).toBeInTheDocument();
    expect(cityDropdown.textContent).toBe(city.name);
  })
});

test("map re-centers on dropdown city selection", async () => {
  render(<Heatmap />);

  const map = screen.getByTestId("map");

  // Open the dropdown menu
  await act(async () => {
    const dropdownButton = screen.getByRole("button", { name: "Select City" });
    fireEvent.click(dropdownButton);
  })

  /*
    Select each city in the dropdown and ensure the map recenters
    to the latlng property of that city
  */
  mockCities.forEach((city, i) => {
    const cityDropdown = screen.getByTestId(`city-dropdown-${i}`);
    fireEvent.click(cityDropdown);

    expect(map).toHaveAttribute("data-center", JSON.stringify(city["latlng"]))
  })
})

test("polylines update based on option selected", async () => {
  render(<Heatmap />);

  await waitFor(() => screen.getByTestId("options-menu"));

  const menuOptions = {
    "sport": ["Run", "Ride", "Swim", "Walk", "Hike"],
    "workout": ["Training", "Race"],
    "members": ["Solo", "Partner", "Group"],
    "time": ["morning", "lunch", "afternoon", "evening", "night"]
  }

  /*
    Click on each button in each button group and verify the polylines
    that appear correspond to the selected option
  */
  Object.entries(menuOptions).forEach(([filter, options]) => {
    options.forEach((option) => {
      const button = screen.getByTestId(`${filter}-button-${option}`)
      fireEvent.click(button);

      const polylines = screen.queryAllByTestId(/^activity-polyline-/);
      const filteredActivities = filterActivities(filter, option, mockActivities)

      expect(polylines).toHaveLength(filteredActivities.length);
    })
  })

  /*
    After selecting all of the different options, click the all activites
    button and verify that the filters are reset.
  */
  const allActivitiesButton = screen.getByTestId("all-activities-button")
  fireEvent.click(allActivitiesButton);

  const polylines = screen.queryAllByTestId(/^activity-polyline-/);
  expect(polylines).toHaveLength(mockActivities.length);
});

test("cities dropdown disappears on a small screen if the navbar hamburger is clicked", async () => {
  // Render the Heatmap component
  render(<Heatmap />);

  // Simulate resizing the screen to make the hamburger appear
  act(() => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));
  });

  // Check that the hamburger menu is visible
  const hamburger = screen.getByTestId("navbar-hamburger");
  expect(hamburger).toBeInTheDocument();

  // Click the hamburger to collapse the navbar
  await act(async () => {
    fireEvent.click(hamburger);

    // Wait for the dropdown to disappear
    await waitFor(() => {
      const dropdown = screen.queryByTestId("cities-dropdown");
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  // Click the hamburger again to expand the navbar
  await act(async () => {
    fireEvent.click(hamburger);

    // Wait for the dropdown to reappear
    await waitFor(() => {
      const dropdown = screen.getByTestId("cities-dropdown");
      expect(dropdown).toBeInTheDocument();
    });
  });
});
