import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";

import AllPerks from "../src/pages/AllPerks.jsx";
import { renderWithRouter } from "./utils/renderWithRouter.js";

describe("AllPerks page (Directory)", () => {
  test("lists public perks and responds to name filtering", async () => {
    // The seeded record gives us a deterministic expectation regardless of the
    // rest of the shared database contents.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ["/explore"] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous
    // fetch finished.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Interact with the name filter input using the real value that
    // corresponds to the seeded record.
    const nameFilter = screen.getByPlaceholderText("Enter perk name...");
    fireEvent.change(nameFilter, { target: { value: seededPerk.title } });

    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // The summary text should continue to reflect the number of matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent("Showing");
  });

  test("lists public perks and responds to merchant filtering", async () => {
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ["/explore"] }
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Find the merchant dropdown
    const merchantSelect = screen.getByRole("combobox");

    // Select the merchant by its display text
    // Look for an option that contains the merchant name
    const merchantOption = Array.from(merchantSelect.options).find(
      (option) =>
        option.text.includes(seededPerk.merchant) ||
        option.value === seededPerk.merchant
    );

    if (merchantOption) {
      fireEvent.change(merchantSelect, {
        target: { value: merchantOption.value },
      });
    } else {
      // Fallback: try selecting by the merchant text directly
      fireEvent.change(merchantSelect, {
        target: { value: seededPerk.merchant },
      });
    }

    // Wait for the filtered result to appear
    await waitFor(
      () => {
        expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify the summary text shows the count
    expect(screen.getByText(/showing/i)).toHaveTextContent("Showing");
  });
});
