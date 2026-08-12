import { BuilderClass } from "@/types/builder";

interface ClassRule {
  cls: BuilderClass;
  keywords: string[];
  weight: number;
}

const RULES: ClassRule[] = [
  {
    cls: "CLOUD ARCHITECT",
    keywords: [
      "cloud", "aws", "azure", "gcp", "google cloud", "infrastructure",
      "terraform", "cloudformation", "serverless", "lambda",
    ],
    weight: 1,
  },
  {
    cls: "DEVOPS ENGINEER",
    keywords: [
      "devops", "ci/cd", "cicd", "docker", "kubernetes", "k8s",
      "jenkins", "github actions", "ansible", "helm", "argocd",
    ],
    weight: 1,
  },
  {
    cls: "SECURITY BUILDER",
    keywords: [
      "security", "devsecopz", "devsecops", "cybersecurity", "cyber",
      "pentest", "pentesting", "appsec", "infosec", "cryptography",
      "vulnerability", "red team", "blue team", "sast", "dast",
    ],
    weight: 2,
  },
  {
    cls: "AI BUILDER",
    keywords: [
      "ai", "ml", "machine learning", "llm", "agents", "gpt",
      "pytorch", "tensorflow", "deep learning", "nlp", "diffusion",
      "langchain", "rag", "vector",
    ],
    weight: 2,
  },
  {
    cls: "PROTOCOL BUILDER",
    keywords: [
      "solidity", "web3", "blockchain", "ethereum", "evm", "smart contract",
      "defi", "zk", "zero knowledge", "rust", "solana", "cairo",
    ],
    weight: 2,
  },
  {
    cls: "DATA BUILDER",
    keywords: [
      "data", "analytics", "spark", "pandas", "sql", "postgres",
      "warehouse", "etl", "airflow", "dbt", "snowflake", "bigquery",
    ],
    weight: 1,
  },
  {
    cls: "FULL STACK BUILDER",
    keywords: [
      "react", "next.js", "nextjs", "node", "node.js", "frontend",
      "backend", "typescript", "javascript", "vue", "svelte",
      "express", "nestjs", "tailwind", "full stack", "fullstack",
    ],
    weight: 1,
  },
  {
    cls: "INFRA BUILDER",
    keywords: [
      "linux", "networking", "systems", "kernel", "bare metal",
      "hardware", "embedded", "iot",
    ],
    weight: 1,
  },
  {
    cls: "PRODUCT BUILDER",
    keywords: [
      "product", "design", "ui", "ux", "figma", "founder", "pm",
    ],
    weight: 1,
  },
  {
    cls: "OPEN SOURCE BUILDER",
    keywords: [
      "open source", "opensource", "oss", "maintainer", "contributor",
    ],
    weight: 1,
  },
];

/**
 * Deterministic builder-class detection based on stack keywords.
 * Chooses the class with the highest weighted keyword matches.
 * Ties broken by rule order in RULES array.
 */
export function detectBuilderClass(stack: string): BuilderClass {
  const s = stack.toLowerCase();
  if (!s.trim()) return "SYSTEM BUILDER";

  let best: { cls: BuilderClass; score: number } = {
    cls: "SYSTEM BUILDER",
    score: 0,
  };

  for (const rule of RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (s.includes(kw)) score += rule.weight;
    }
    if (score > best.score) {
      best = { cls: rule.cls, score };
    }
  }

  if (best.score === 0) {
    // No matches — cycle deterministically based on stack length
    const fallbacks: BuilderClass[] = ["SYSTEM BUILDER", "SHIPPER"];
    return fallbacks[s.length % fallbacks.length];
  }

  return best.cls;
}

/**
 * Regenerate: cycles through the top 3 matches or fallback list.
 */
export function alternativeBuilderClass(
  stack: string,
  current: BuilderClass
): BuilderClass {
  const s = stack.toLowerCase();
  const scored = RULES.map((rule) => {
    let score = 0;
    for (const kw of rule.keywords) {
      if (s.includes(kw)) score += rule.weight;
    }
    return { cls: rule.cls, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 1) {
    const idx = scored.findIndex((r) => r.cls === current);
    const next = scored[(idx + 1) % scored.length];
    return next.cls;
  }

  const cycle: BuilderClass[] = [
    "SYSTEM BUILDER",
    "SHIPPER",
    "FULL STACK BUILDER",
    "PRODUCT BUILDER",
  ];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}