import { getName } from "../../src/utils/pokemon";

describe("Test cases for getName function", () => {
  const cases = [
    {
      headName: "Hoothoot",
      headNameIndexSeparator: "4",
      bodyName: "Clefable",
      bodyNameIndexSeparator: "4.3",
      expected: "Hootfable",
    },
    {
      headName: "Whimsicott",
      headNameIndexSeparator: "6",
      bodyName: "Kangaskhan",
      bodyNameIndexSeparator: "6",
      expected: "Whimsikhan",
    },
    {
      headName: "Klinklang",
      headNameIndexSeparator: "5.4",
      bodyName: "Girafarig",
      bodyNameIndexSeparator: "4",
      expected: "Klinkfarig",
    },
    {
      headName: "Girafarig",
      headNameIndexSeparator: "4",
      bodyName: "Klinklang",
      bodyNameIndexSeparator: "5.4",
      expected: "Giraklang",
    },
  ];

  cases.forEach(
    ({
      headName,
      headNameIndexSeparator,
      bodyName,
      bodyNameIndexSeparator,
      expected,
    }) => {
      test(`Name should work properly for ${headName} + ${bodyName} = ${expected}`, () => {
        expect(
          getName(
            headName,
            headNameIndexSeparator,
            bodyName,
            bodyNameIndexSeparator
          )
        ).toBe(expected);
      });
    }
  );
});
