import React from "react";
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Landing from "./Landing";

test("renders landing page ui", () => {
  render(<Landing />);

  expect(screen.getByTestId("app-logo")).toBeInTheDocument();
  expect(screen.getByTestId("app-name")).toBeInTheDocument();
  expect(screen.getByTestId("app-description")).toBeInTheDocument();
  expect(screen.getByTestId("connect-strava-button")).toBeInTheDocument();
  expect(screen.getByTestId("demo-account-text")).toBeInTheDocument();
})

test("redirects to strava authentication on button click", () => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: "" },
  });

  render(<Landing />);

  // Find and click the Connect with Strava button
  const stravaButton = screen.getByTestId("connect-strava-button")
  fireEvent.click(stravaButton);

  // Verify user is redirected to Strava to grant permissions
  expect(window.location.href).toContain("https://www.strava.com/oauth/authorize?");
});

test("clicking demo text pops up loading modal", async () => {
  render(<Landing />);

  // Find and click the demo link
  const demoLink = screen.getByTestId("demo-account-text");
  fireEvent.click(demoLink);

  // Verify that the loading modal appears
  expect(screen.getByTestId("loading-modal")).toBeInTheDocument();
});
