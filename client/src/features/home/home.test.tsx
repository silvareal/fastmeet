import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

const MockHome = () => {
  return <Home />;
};

describe("Home Component", () => {
  describe("Header test", () => {
    it("renders first header texts", async () => {
      render(<MockHome />);
      const headerElement = await screen.findByRole("heading", {
        name: /No Account Needed/i,
      });
      expect(headerElement).toBeInTheDocument();
    });

    it("renders Second header texts", async () => {
      render(<MockHome />);
      const headerElement = await screen.findByRole("heading", {
        name: /Start & join meetings free/i,
      });
      expect(headerElement).toBeInTheDocument();
    });

    it("renders Third header texts", async () => {
      render(<MockHome />);
      const headerElement = await screen.findByRole("heading", {
        name: /Opensource service we built for secure business and social meetings to make it free and available for all./i,
      });
      expect(headerElement).toBeInTheDocument();
    });
  });
});
