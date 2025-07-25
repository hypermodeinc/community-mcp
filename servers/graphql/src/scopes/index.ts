export * from "./graphql";

import { graphqlToolDefinitions } from "./graphql";
export const allToolDefinitions = graphqlToolDefinitions;

import { graphqlActions } from "./graphql";
export const allActions = graphqlActions;

export const toolDefinitions = allToolDefinitions;
export const actions = allActions;
