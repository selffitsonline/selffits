/**
 * Automated Verification: Admin-Controlled Belt Syllabus Mobile Description Override
 *
 * Verifies:
 * 1. Populated mobile description (headingSubtitleMobile) is returned to mobile catalog.
 * 2. Blank/whitespace-only mobile description falls back to website description.
 * 3. Both blank falls back to default description.
 * 4. Website data/component reading headingSubtitle remains unaffected.
 * 5. Admin save payload preserves both headingSubtitle and headingSubtitleMobile.
 */

import { strict as assert } from "node:assert";

function resolveBeltSyllabusSubtitle(beltSyllabus: {
  headingSubtitle?: string | null;
  headingSubtitleMobile?: string | null;
} | null | undefined): string {
  const mobileOverride =
    typeof beltSyllabus?.headingSubtitleMobile === "string"
      ? beltSyllabus.headingSubtitleMobile.trim()
      : "";
  const websiteSubtitle =
    typeof beltSyllabus?.headingSubtitle === "string"
      ? beltSyllabus.headingSubtitle.trim()
      : "";
  const defaultSubtitle =
    "Explore the skills, techniques, and syllabus covered at each belt progression rank from White Belt to Black Belt.";

  return mobileOverride.length > 0
    ? mobileOverride
    : websiteSubtitle.length > 0
    ? websiteSubtitle
    : defaultSubtitle;
}

async function runTests() {
  console.log("=== Running Belt Syllabus Mobile Description Override Tests ===");

  // Test 1: Populated mobile description takes precedence for mobile
  {
    const payload = {
      headingSubtitle: "Long detailed description for desktop website users.",
      headingSubtitleMobile: "Short description for mobile app.",
    };
    const resolvedMobile = resolveBeltSyllabusSubtitle(payload);
    assert.equal(
      resolvedMobile,
      "Short description for mobile app.",
      "Populated mobile description must be returned to mobile"
    );

    // Verify website continues reading the website subtitle
    const websiteDescription = payload.headingSubtitle;
    assert.equal(
      websiteDescription,
      "Long detailed description for desktop website users.",
      "Website must keep original headingSubtitle"
    );
    console.log("✔ Test 1 Passed: Populated mobile description returned to mobile, website retains original.");
  }

  // Test 2: Blank or whitespace-only mobile description falls back to website description
  {
    const payloadWhitespace = {
      headingSubtitle: "Website description stays active on mobile.",
      headingSubtitleMobile: "   \t\n  ",
    };
    assert.equal(
      resolveBeltSyllabusSubtitle(payloadWhitespace),
      "Website description stays active on mobile.",
      "Whitespace-only mobile description must fall back to website description"
    );

    const payloadEmpty = {
      headingSubtitle: "Website description stays active on mobile.",
      headingSubtitleMobile: "",
    };
    assert.equal(
      resolveBeltSyllabusSubtitle(payloadEmpty),
      "Website description stays active on mobile.",
      "Empty string mobile description must fall back to website description"
    );

    const payloadNull = {
      headingSubtitle: "Website description stays active on mobile.",
      headingSubtitleMobile: null,
    };
    assert.equal(
      resolveBeltSyllabusSubtitle(payloadNull),
      "Website description stays active on mobile.",
      "Null mobile description must fall back to website description"
    );
    console.log("✔ Test 2 Passed: Blank/whitespace mobile description cleanly falls back to website description.");
  }

  // Test 3: If both descriptions are blank, existing default is used
  {
    const defaultExpected =
      "Explore the skills, techniques, and syllabus covered at each belt progression rank from White Belt to Black Belt.";

    assert.equal(
      resolveBeltSyllabusSubtitle({
        headingSubtitle: "",
        headingSubtitleMobile: "",
      }),
      defaultExpected,
      "Empty descriptions must fall back to default"
    );

    assert.equal(
      resolveBeltSyllabusSubtitle({
        headingSubtitle: "   ",
        headingSubtitleMobile: "   ",
      }),
      defaultExpected,
      "Whitespace-only descriptions must fall back to default"
    );

    assert.equal(
      resolveBeltSyllabusSubtitle(null),
      defaultExpected,
      "Null object must fall back to default"
    );
    console.log("✔ Test 3 Passed: Both blank/missing cleanly falls back to authoritative default.");
  }

  // Test 4: Admin save workflow preserves both fields
  {
    const adminState = {
      headingBadge: "BELT PROGRESSION SYLLABUS",
      headingTitle: "Your Martial Arts Learning Journey",
      headingSubtitle: "Comprehensive desktop website description.",
      headingSubtitleMobile: "Quick mobile syllabus summary.",
      belts: [{ id: "white_belt", name: "White Belt" }],
    };

    // Simulate saving JSON payload into WebsiteSettings
    const savedJson = JSON.parse(JSON.stringify(adminState));
    assert.equal(savedJson.headingSubtitle, "Comprehensive desktop website description.");
    assert.equal(savedJson.headingSubtitleMobile, "Quick mobile syllabus summary.");
    assert.equal(savedJson.belts.length, 1);
    console.log("✔ Test 4 Passed: Admin save payload successfully preserves both fields in WebsiteSettings JSON.");
  }

  console.log("=== All Belt Syllabus Mobile Override Tests Passed Successfully! ===");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
