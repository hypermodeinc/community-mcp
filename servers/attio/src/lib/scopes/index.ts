export * from "./test";
export * from "./workspace";
export * from "./objects";
export * from "./attributes";
export * from "./records";
export * from "./people";
export * from "./companies";
export * from "./deals";
export * from "./lists";
export * from "./notes";
export * from "./comments";
export * from "./misc";

import { testToolDefinitions } from "./test";
import { workspaceToolDefinitions } from "./workspace";
import { objectsToolDefinitions } from "./objects";
import { attributesToolDefinitions } from "./attributes";
import { recordsToolDefinitions } from "./records";
import { peopleToolDefinitions } from "./people";
import { companiesToolDefinitions } from "./companies";
import { dealsToolDefinitions } from "./deals";
import { listsToolDefinitions } from "./lists";
import { notesToolDefinitions } from "./notes";
import { commentsToolDefinitions } from "./comments";
import { miscToolDefinitions } from "./misc";

export const allToolDefinitions = {
  ...testToolDefinitions,
  ...workspaceToolDefinitions,
  ...objectsToolDefinitions,
  ...attributesToolDefinitions,
  ...recordsToolDefinitions,
  ...peopleToolDefinitions,
  ...companiesToolDefinitions,
  ...dealsToolDefinitions,
  ...listsToolDefinitions,
  ...notesToolDefinitions,
  ...commentsToolDefinitions,
  ...miscToolDefinitions,
};

import { testActions } from "./test";
import { workspaceActions } from "./workspace";
import { objectsActions } from "./objects";
import { attributesActions } from "./attributes";
import { recordsActions } from "./records";
import { peopleActions } from "./people";
import { companiesActions } from "./companies";
import { dealsActions } from "./deals";
import { listsActions } from "./lists";
import { notesActions } from "./notes";
import { commentsActions } from "./comments";
import { miscActions } from "./misc";

export const allActions = {
  ...testActions,
  ...workspaceActions,
  ...objectsActions,
  ...attributesActions,
  ...recordsActions,
  ...peopleActions,
  ...companiesActions,
  ...dealsActions,
  ...listsActions,
  ...notesActions,
  ...commentsActions,
  ...miscActions,
};

export const toolDefinitions = allToolDefinitions;
export const actions = allActions;
