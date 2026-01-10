import MinimalTemplate from "./minimal";

export const templates = {
  minimal: MinimalTemplate,
};

export type TemplateName = keyof typeof templates;
