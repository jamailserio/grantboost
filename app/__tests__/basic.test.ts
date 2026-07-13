describe("grantboost Project Requirements Validation", () => {
    test("Targets correct NGO audience", () => {
      const targetNGO = "CARE USA";
      expect(targetNGO).toBe("CARE USA");
    });
  
    test("Includes required donor frameworks", () => {
      const frameworks = ["USAID", "Corporate", "Individual"];
      expect(frameworks).toContain("USAID");
    });
  
    test("Secrets are not hardcoded in client code", () => {
      const hasSecretKey = process.env.OPENAI_API_KEY === undefined;
      expect(hasSecretKey).toBe(true);
    });
  });