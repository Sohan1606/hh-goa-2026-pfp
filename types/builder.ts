export type AppMode = "pfp" | "builder" | "team";

export type BuilderClass =
  | "CLOUD ARCHITECT"
  | "DEVOPS ENGINEER"
  | "SECURITY BUILDER"
  | "AI BUILDER"
  | "FULL STACK BUILDER"
  | "PROTOCOL BUILDER"
  | "DATA BUILDER"
  | "INFRA BUILDER"
  | "PRODUCT BUILDER"
  | "OPEN SOURCE BUILDER"
  | "SYSTEM BUILDER"
  | "SHIPPER";

export interface BuilderDetails {
  name: string;
  stack: string;
  builderClass: BuilderClass;
}

export interface TeamMember {
  id: string;
  image: HTMLImageElement | null;
  imageObjectUrl: string | null;
  name: string;
  stack: string;
  builderClass: BuilderClass;
}