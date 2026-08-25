import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { structure } from "./deskStructure";

export default defineConfig({
  name: "default",
  title: "Gameinside",
  projectId: "aydnlbgw",
  dataset: "production",
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
});
