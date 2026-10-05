import section91 from "@/content/paper2/sections/9.1.json";
import section92 from "@/content/paper2/sections/9.2.json";
import section101 from "@/content/paper2/sections/10.1.json";
import section102 from "@/content/paper2/sections/10.2.json";
import section103 from "@/content/paper2/sections/10.3.json";
import section104 from "@/content/paper2/sections/10.4.json";
import section111 from "@/content/paper2/sections/11.1.json";
import section112 from "@/content/paper2/sections/11.2.json";
import section113 from "@/content/paper2/sections/11.3.json";
import section121 from "@/content/paper2/sections/12.1.json";
import section122 from "@/content/paper2/sections/12.2.json";
import section123 from "@/content/paper2/sections/12.3.json";
import patternF01 from "@/content/paper2/patterns/F01.json";
import patternF02 from "@/content/paper2/patterns/F02.json";
import patternF03 from "@/content/paper2/patterns/F03.json";
import patternF04 from "@/content/paper2/patterns/F04.json";
import patternF05 from "@/content/paper2/patterns/F05.json";
import patternF06 from "@/content/paper2/patterns/F06.json";
import patternF07 from "@/content/paper2/patterns/F07.json";
import patternF08 from "@/content/paper2/patterns/F08.json";
import patternF09 from "@/content/paper2/patterns/F09.json";
import patternF10 from "@/content/paper2/patterns/F10.json";
import patternF11 from "@/content/paper2/patterns/F11.json";
import patternF12 from "@/content/paper2/patterns/F12.json";
import patternF13 from "@/content/paper2/patterns/F13.json";
import patternF14 from "@/content/paper2/patterns/F14.json";
import patternF15 from "@/content/paper2/patterns/F15.json";
import patternF16 from "@/content/paper2/patterns/F16.json";
import type { Localized } from "./types";

export interface Paper2SectionEnrichment {
  readonly schemaVersion: 1;
  readonly version: string;
  readonly sectionId: string;
  readonly scenario: {
    readonly label: Localized;
    readonly title: Localized;
    readonly context: Localized;
    readonly bigQuestion: Localized;
  };
  readonly prerequisiteGuidance: readonly {
    readonly topicId: string;
    readonly slug: string;
    readonly title: Localized;
    readonly reason: Localized;
  }[];
  readonly glossary: readonly {
    readonly term: string;
    readonly meaning: Localized;
  }[];
  readonly topicRelationship: {
    readonly title: Localized;
    readonly introduction: Localized;
    readonly items: readonly {
      readonly topicId: string;
      readonly slug: string;
      readonly question: Localized;
      readonly result: Localized;
    }[];
    readonly connection: Localized;
  };
  readonly visual: {
    readonly assetId: string;
    readonly anchorId: string;
    readonly title: Localized;
    readonly introduction: Localized;
    readonly task: Localized;
  };
  readonly workedChapter: {
    readonly title: Localized;
    readonly prompt: Localized;
    readonly fieldTable?: {
      readonly ariaLabel: Localized;
      readonly firstColumn: Localized;
      readonly secondColumn: Localized;
      readonly thirdColumn: Localized;
    };
    readonly moduleTable?: {
      readonly ariaLabel: Localized;
      readonly firstColumn: Localized;
      readonly inputColumn: Localized;
      readonly outputColumn: Localized;
      readonly boundaryColumn: Localized;
    };
    readonly fields: readonly {
      readonly field: string;
      readonly value: string;
      readonly assignment: Localized;
      readonly report: Localized;
    }[];
    readonly modules: readonly {
      readonly name: string;
      readonly input: string;
      readonly output: string;
      readonly boundary: Localized;
    }[];
    readonly fullAnswer: Localized;
    readonly checks: readonly Localized[];
    readonly nextStep: {
      readonly slug: string;
      readonly anchor: string;
      readonly label: Localized;
    };
  };
  readonly patternIds: readonly string[];
}

export interface Paper2PatternGuide {
  readonly schemaVersion: 1;
  readonly version: string;
  readonly id: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly owner: { readonly topicId: string; readonly slug: string };
  readonly related: readonly { readonly topicId: string; readonly slug: string }[];
  readonly positiveCues: readonly Localized[];
  readonly misleadingCues: readonly Localized[];
  readonly answerProduct: Localized;
  readonly recipe: readonly { readonly action: Localized; readonly why: Localized }[];
  readonly nonExample: {
    readonly answer: Localized;
    readonly problem: Localized;
    readonly repair: Localized;
  };
  readonly practiceLinks: readonly {
    readonly topicId: string;
    readonly slug: string;
    readonly anchor: string;
    readonly taskId: string;
    readonly label: Localized;
  }[];
  readonly sourceLocators: readonly {
    readonly sourceId: string;
    readonly label: string;
    readonly locator: string;
  }[];
}

const sectionById: Readonly<Record<string, Paper2SectionEnrichment>> = Object.freeze({
  "9.1": section91 as Paper2SectionEnrichment,
  "9.2": section92 as Paper2SectionEnrichment,
  "10.1": section101 as Paper2SectionEnrichment,
  "10.2": section102 as Paper2SectionEnrichment,
  "10.3": section103 as Paper2SectionEnrichment,
  "10.4": section104 as Paper2SectionEnrichment,
  "11.1": section111 as Paper2SectionEnrichment,
  "11.2": section112 as Paper2SectionEnrichment,
  "11.3": section113 as Paper2SectionEnrichment,
  "12.1": section121 as Paper2SectionEnrichment,
  "12.2": section122 as Paper2SectionEnrichment,
  "12.3": section123 as Paper2SectionEnrichment,
});

const patternById: Readonly<Record<string, Paper2PatternGuide>> = Object.freeze({
  F01: patternF01 as Paper2PatternGuide,
  F02: patternF02 as Paper2PatternGuide,
  F03: patternF03 as Paper2PatternGuide,
  F04: patternF04 as Paper2PatternGuide,
  F05: patternF05 as Paper2PatternGuide,
  F06: patternF06 as Paper2PatternGuide,
  F07: patternF07 as Paper2PatternGuide,
  F08: patternF08 as Paper2PatternGuide,
  F09: patternF09 as Paper2PatternGuide,
  F10: patternF10 as Paper2PatternGuide,
  F11: patternF11 as Paper2PatternGuide,
  F12: patternF12 as Paper2PatternGuide,
  F13: patternF13 as Paper2PatternGuide,
  F14: patternF14 as Paper2PatternGuide,
  F15: patternF15 as Paper2PatternGuide,
  F16: patternF16 as Paper2PatternGuide,
});

export function getPaper2SectionEnrichment(sectionId: string) {
  return sectionById[sectionId];
}

export function getPaper2PatternGuide(patternId: string) {
  return patternById[patternId];
}
