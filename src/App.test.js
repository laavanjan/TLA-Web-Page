// The whole site starts: the router, the maintenance gate, the navbar and the
// footer render the home page without throwing. Supabase and the old API
// server are offline here, which the site must handle quietly.
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./providers/AuthProvider";

jest.mock("./helpers/supabaseClient", () => {
  const result = { data: null, error: { message: "offline" }, count: null };
  const chain = new Proxy(
    {},
    {
      get: (target, key) => (key === "then" ? (resolve) => Promise.resolve(result).then(resolve) : () => chain),
    }
  );
  return {
    supabase: {
      from: () => chain,
      rpc: () => Promise.resolve(result),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        getUser: () => Promise.resolve({ data: { user: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
      removeChannel: () => {},
    },
  };
});

beforeAll(() => {
  global.fetch = jest.fn(() => Promise.reject(new Error("offline")));
  window.scrollTo = () => {};
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  global.ResizeObserver = global.ResizeObserver || global.IntersectionObserver;
});

test("the home page renders", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
  expect((await screen.findAllByText(/தமிழ் இலக்கிய மன்றம்/)).length).toBeGreaterThan(0);
});
