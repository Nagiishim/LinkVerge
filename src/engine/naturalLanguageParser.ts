import { ParserOutputSchema } from "../schemas/parserOutput.js";
import type { ParserOutput } from "../schemas/parserOutput.js";
import type {
  HardConstraint,
  SoftPreference,
} from "../schemas/intent.js";

export function parseNaturalLanguage(
  input: string
): ParserOutput {
  const text = input.trim().toLowerCase();

  if (!text) {
    throw new Error("User request cannot be empty.");
  }

  const category = detectCategory(text);
  const location = "NG";

  const hard_constraints: HardConstraint[] = [];
  const soft_preferences: SoftPreference[] = [];

  addBudgetConstraint(text, hard_constraints);
  addProductTypeConstraint(text, hard_constraints);
  addTopicConstraint(text, hard_constraints);

  addSoftPreferences(text, soft_preferences);

  return ParserOutputSchema.parse({
    category,
    location,
    hard_constraints,
    soft_preferences,
  });
}

function detectCategory(text: string): string {
  if (
    containsAny(text, [
      "physics",
      "biology",
      "chemistry",
      "jamb",
      "waec",
      "neco",
      "post utme",
      "exam",
      "study",
      "studying",
      "education",
      "school",
      "academic",
      "mathematics",
      "maths",
      "math",
      "english",
    ])
  ) {
    return "Education";
  }

  if (
    containsAny(text, [
      "python",
      "coding",
      "programming",
      "javascript",
      "typescript",
      "html",
      "css",
      "web development",
      "software development",
      "app development",
      "tech",
      "computer",
      "software",
    ])
  ) {
    return "Tech & Coding";
  }

  if (
    containsAny(text, [
      "business",
      "money",
      "make money",
      "making money",
      "entrepreneur",
      "entrepreneurship",
      "finance",
      "financial",
      "online business",
      "side hustle",
      "startup",
      "marketing",
      "sales",
    ])
  ) {
    return "Business & Money";
  }

  if (
    containsAny(text, [
      "design",
      "graphic design",
      "canva",
      "creativity",
      "ui design",
      "ux design",
      "figma",
    ])
  ) {
    return "Design & Creativity";
  }

  if (
    containsAny(text, [
      "social media",
      "instagram",
      "tiktok",
      "facebook",
      "twitter",
      "social media marketing",
      "influencer",
      "content marketing",
    ])
  ) {
    return "Social Media";
  }

  if (
    containsAny(text, [
      "video editing",
      "video",
      "content creation",
      "content creator",
      "youtube",
      "reels",
      "shorts",
      "premiere pro",
      "after effects",
      "capcut",
    ])
  ) {
    return "Video & Content";
  }

  if (
    containsAny(text, [
      "personal development",
      "self improvement",
      "self-improvement",
      "habits",
      "mindset",
      "discipline",
      "confidence",
      "productivity",
      "motivation",
    ])
  ) {
    return "Personal Development";
  }

  if (
    containsAny(text, [
      "career",
      "job",
      "jobs",
      "cv",
      "resume",
      "skill",
      "skills",
      "interview",
      "employment",
      "freelance",
    ])
  ) {
    return "Career & Skills";
  }

  if (
    containsAny(text, [
      "template",
      "templates",
      "notion",
      "spreadsheet",
      "excel",
      "tool",
      "tools",
      "checklist",
      "planner",
    ])
  ) {
    return "Tools & Templates";
  }

  throw new Error(
    "Could not determine the product category."
  );
}

function addBudgetConstraint(
  text: string,
  hardConstraints: HardConstraint[]
): void {
  const budget = detectBudget(text);

  if (budget === undefined) {
    return;
  }

  hardConstraints.push({
    attribute: "price",
    operator: "LESS_THAN_OR_EQUAL",
    value: budget,
  });
}

function detectBudget(
  text: string
): number | undefined {
  const match = text.match(
    /(?:under|below|less than|up to|max(?:imum)?(?: of)?|budget(?: of)?)\s*[₦n]?\s*([\d,]+(?:\.\d+)?)\s*(k|000)?\b/i
  );

  if (!match) {
    return undefined;
  }

  const rawNumber = match[1].replace(/,/g, "");

  let amount = Number(rawNumber);

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  const unit = match[2]?.toLowerCase();

  if (unit === "k" || unit === "000") {
    amount *= 1000;
  }

  return amount;
}

function addProductTypeConstraint(
  text: string,
  hardConstraints: HardConstraint[]
): void {
  const productType = detectProductType(text);

  if (!productType) {
    return;
  }

  hardConstraints.push({
    attribute: "product_type",
    operator: "EQUALS",
    value: productType,
  });
}

function detectProductType(
  text: string
): string | undefined {
  if (
    containsAny(text, [
      "ebook",
      "e-book",
      "book",
      "pdf book",
      "digital book",
    ])
  ) {
    return "ebook";
  }

  if (
    containsAny(text, [
      "course",
      "online course",
      "training",
      "masterclass",
      "class",
    ])
  ) {
    return "course";
  }

  if (
    containsAny(text, [
      "template",
      "templates",
      "notion template",
      "excel template",
      "canva template",
    ])
  ) {
    return "template";
  }

  if (
    containsAny(text, [
      "guide",
      "manual",
      "handbook",
      "blueprint",
    ])
  ) {
    return "guide";
  }

  if (
    containsAny(text, [
      "community",
      "membership",
      "group",
    ])
  ) {
    return "community";
  }

  if (
    containsAny(text, [
      "software",
      "app",
      "application",
      "saas",
    ])
  ) {
    return "software";
  }

  return undefined;
}

function addTopicConstraint(
  text: string,
  hardConstraints: HardConstraint[]
): void {
  const topic = detectTopic(text);

  if (!topic) {
    return;
  }

  hardConstraints.push({
    attribute: "topic",
    operator: "CONTAINS",
    value: topic,
  });
}

function detectTopic(
  text: string
): string | undefined {
  const topics: Array<{
    keywords: string[];
    value: string;
  }> = [
    {
      keywords: [
        "online business",
        "internet business",
        "online entrepreneurship",
      ],
      value: "online business",
    },
    {
      keywords: [
        "make money online",
        "making money online",
        "earn money online",
        "earn online",
      ],
      value: "making money online",
    },
    {
      keywords: [
        "digital marketing",
        "online marketing",
      ],
      value: "digital marketing",
    },
    {
      keywords: [
        "social media marketing",
      ],
      value: "social media marketing",
    },
    {
      keywords: [
        "web development",
        "website development",
      ],
      value: "web development",
    },
    {
      keywords: [
        "app development",
        "mobile development",
      ],
      value: "app development",
    },
    {
      keywords: [
        "graphic design",
      ],
      value: "graphic design",
    },
    {
      keywords: [
        "video editing",
      ],
      value: "video editing",
    },
    {
      keywords: [
        "personal finance",
        "managing money",
        "money management",
      ],
      value: "personal finance",
    },
    {
      keywords: [
        "jamb",
        "utme",
      ],
      value: "JAMB",
    },
    {
      keywords: [
        "waec",
      ],
      value: "WAEC",
    },
    {
      keywords: [
        "neco",
      ],
      value: "NECO",
    },
    {
      keywords: [
        "physics",
      ],
      value: "physics",
    },
    {
      keywords: [
        "chemistry",
      ],
      value: "chemistry",
    },
    {
      keywords: [
        "biology",
      ],
      value: "biology",
    },
    {
      keywords: [
        "mathematics",
        "maths",
        "math",
      ],
      value: "mathematics",
    },
  ];

  for (const topic of topics) {
    if (containsAny(text, topic.keywords)) {
      return topic.value;
    }
  }

  return undefined;
}

function addSoftPreferences(
  text: string,
  softPreferences: SoftPreference[]
): void {
  if (
    containsAny(text, [
      "beginner",
      "beginners",
      "starting from scratch",
      "from scratch",
      "new to",
      "newbie",
    ])
  ) {
    softPreferences.push({
      attribute: "difficulty",
      value: "beginner",
      weight: 1,
    });
  }

  if (
    containsAny(text, [
      "practical",
      "hands-on",
      "step by step",
      "step-by-step",
      "actionable",
    ])
  ) {
    softPreferences.push({
      attribute: "style",
      value: "practical",
      weight: 1,
    });
  }

  if (
    containsAny(text, [
      "advanced",
      "expert",
      "professional",
      "deep dive",
    ])
  ) {
    softPreferences.push({
      attribute: "difficulty",
      value: "advanced",
      weight: 1,
    });
  }

  if (
    containsAny(text, [
      "quick",
      "short",
      "fast",
      "quickly",
    ])
  ) {
    softPreferences.push({
      attribute: "length",
      value: "short",
      weight: 1,
    });
  }

  if (
    containsAny(text, [
      "complete",
      "comprehensive",
      "all-in-one",
      "everything",
    ])
  ) {
    softPreferences.push({
      attribute: "coverage",
      value: "comprehensive",
      weight: 1,
    });
  }
}

function containsAny(
  text: string,
  keywords: string[]
): boolean {
  return keywords.some((keyword) =>
    text.includes(keyword)
  );
}