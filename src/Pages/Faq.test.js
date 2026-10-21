import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import Faq from "./Faq";
import { BUILT_IN_FAQS, NOT_FOUND_ID } from "../shared/faq/faqs";

jest.mock("../helpers/supabaseClient", () => {
  const fail = () => Promise.resolve({ data: null, error: { message: "offline" }, count: null });
  const chain = { select: () => chain, order: fail, eq: () => chain, maybeSingle: fail, then: (r) => fail().then(r) };
  return { supabase: { from: () => chain } };
});

test("every question is on the page, and the structured data matches it", () => {
  render(
    <MemoryRouter>
      <Faq />
    </MemoryRouter>
  );
  const shown = BUILT_IN_FAQS.filter((f) => f.is_visible && f.id !== NOT_FOUND_ID);
  expect(document.querySelectorAll("details.fq-item")).toHaveLength(shown.length);

  const ld = Helmet.peek().scriptTags.map((s) => JSON.parse(s.innerHTML)).find((d) => d["@type"] === "FAQPage");
  const tamil = ld.mainEntity.filter((q) => q.inLanguage === "ta");
  expect(tamil).toHaveLength(shown.length);
  tamil.forEach((q) => {
    expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain(q.name);
  });
  ld.mainEntity
    .filter((q) => q.inLanguage === "en")
    .forEach((q) => expect(document.body.textContent).toContain(q.name));
});
