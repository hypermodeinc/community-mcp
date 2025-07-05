async function makeAttioRequest(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env["ATTIO_API_BASE_URL"] || "https://api.attio.com";
  const apiKey = process.env["ATTIO_API_KEY"];

  if (!apiKey) {
    return {
      content: [
        {
          type: "text",
          text: "Error: ATTIO_API_KEY environment variable is required. Please set it in your .env.local file.",
        },
      ],
    };
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Attio API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Workspace Introspection Actions
export async function introspectWorkspace() {
  try {
    const [self, objects, lists, members] = await Promise.all([
      makeAttioRequest("/v2/self"),
      makeAttioRequest("/v2/objects"),
      makeAttioRequest("/v2/lists"),
      makeAttioRequest("/v2/workspace_members"),
    ]);

    const workspaceInfo = {
      workspace: self,
      objects: objects,
      lists: lists,
      members: members,
      summary: {
        total_objects: objects.data?.length || 0,
        total_lists: lists.data?.length || 0,
        total_members: members.data?.length || 0,
      },
    };

    return {
      content: [
        {
          type: "text",
          text: `Workspace Structure:\n\n${JSON.stringify(workspaceInfo, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error introspecting workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getWorkspaceMembers(args: any) {
  try {
    const response = await makeAttioRequest("/v2/workspace_members");
    return {
      content: [
        {
          type: "text",
          text: `Workspace Members:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting workspace members: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getWorkspaceMember(args: any) {
  const { workspace_member_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/workspace_members/${workspace_member_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Workspace Member Details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting workspace member: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Object Management Actions
export async function listObjects(args: any) {
  try {
    const response = await makeAttioRequest("/v2/objects");
    return {
      content: [
        {
          type: "text",
          text: `Objects in workspace:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing objects: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getObject(args: any) {
  const { object } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}`);
    return {
      content: [
        {
          type: "text",
          text: `Object details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting object: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createObject(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest("/v2/objects", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created object:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating object: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateObject(args: any) {
  const { object, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated object:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating object: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getObjectAttributes(args: any) {
  const { object } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}/attributes`);
    return {
      content: [
        {
          type: "text",
          text: `Attributes for ${object}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting object attributes: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Attribute Management Actions
export async function listAttributes(args: any) {
  const { target, identifier } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Attributes for ${target}/${identifier}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing attributes: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createAttribute(args: any) {
  const { target, identifier, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully created attribute:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getAttribute(args: any) {
  const { target, identifier, attribute } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Attribute details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateAttribute(args: any) {
  const { target, identifier, attribute, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated attribute:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Select Options Management Actions
export async function listSelectOptions(args: any) {
  const { target, identifier, attribute } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}/options`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Select options:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing select options: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createSelectOption(args: any) {
  const { target, identifier, attribute, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}/options`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully created select option:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating select option: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateSelectOption(args: any) {
  const { target, identifier, attribute, option, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}/options/${option}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated select option:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating select option: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Status Management Actions
export async function listStatuses(args: any) {
  const { target, identifier, attribute } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}/statuses`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Statuses:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing statuses: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createStatus(args: any) {
  const { target, identifier, attribute, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}/statuses`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully created status:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating status: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateStatus(args: any) {
  const { target, identifier, attribute, status, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/${target}/${identifier}/attributes/${attribute}/statuses/${status}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated status:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating status: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Generic Record Operations Actions
export async function searchRecords(args: any) {
  const { object, query = {} } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} records:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching records: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getRecord(args: any) {
  const { object, record_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Record details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createRecord(args: any) {
  const { object, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new record:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateRecord(args: any) {
  const { object, record_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated record ${record_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function putUpdateRecord(args: any) {
  const { object, record_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated record ${record_id} (overwrite):\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function upsertRecord(args: any) {
  const { object, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/${object}/records`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully upserted record:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error upserting record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteRecord(args: any) {
  const { object, record_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/${object}/records/${record_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted record ${record_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting record: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getRecordAttributeValues(args: any) {
  const { object, record_id, attribute, show_historic } = args;
  try {
    const queryParams = new URLSearchParams();
    if (show_historic) queryParams.append("show_historic", "true");

    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}/attributes/${attribute}/values?${queryParams}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Attribute values:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting record attribute values: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getRecordEntries(args: any) {
  const { object, record_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/${object}/records/${record_id}/entries`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Record entries:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting record entries: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// =============================================================================
// PEOPLE-SPECIFIC ACTIONS
// =============================================================================

export async function searchPeople(args: any) {
  const { query = {} } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/people/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} people:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching people: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getPerson(args: any) {
  const { person_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/people/records/${person_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Person details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting person: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createPerson(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/people/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new person:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating person: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updatePerson(args: any) {
  const { person_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/people/records/${person_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated person ${person_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating person: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deletePerson(args: any) {
  const { person_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/people/records/${person_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted person ${person_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting person: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// =============================================================================
// COMPANIES-SPECIFIC ACTIONS
// =============================================================================

export async function searchCompanies(args: any) {
  const { query = {} } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} companies:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching companies: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getCompany(args: any) {
  const { company_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${company_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Company details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting company: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createCompany(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/companies/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new company:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating company: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateCompany(args: any) {
  const { company_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/companies/records/${company_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated company ${company_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating company: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteCompany(args: any) {
  const { company_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/companies/records/${company_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted company ${company_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting company: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// =============================================================================
// DEALS-SPECIFIC ACTIONS
// =============================================================================

export async function searchDeals(args: any) {
  const { query = {} } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/deals/records/query`, {
      method: "POST",
      body: JSON.stringify({
        limit: query.limit || 25,
        offset: query.offset || 0,
        sorts: query.sorts || [],
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} deals:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching deals: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getDeal(args: any) {
  const { deal_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${deal_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Deal details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting deal: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createDeal(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/deals/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new deal:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating deal: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateDeal(args: any) {
  const { deal_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/deals/records/${deal_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated deal ${deal_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating deal: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteDeal(args: any) {
  const { deal_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/deals/records/${deal_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted deal ${deal_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting deal: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// =============================================================================
// USERS-SPECIFIC ACTIONS
// =============================================================================

export async function searchUsers(args: any) {
  const { query = {} } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/users/records/query`, {
      method: "POST",
      body: JSON.stringify({
        limit: query.limit || 25,
        offset: query.offset || 0,
        sorts: query.sorts || [],
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} users:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching users: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getUser(args: any) {
  const { user_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/users/records/${user_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `User details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting user: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createUser(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/users/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new user:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating user: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateUser(args: any) {
  const { user_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/users/records/${user_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated user ${user_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating user: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteUser(args: any) {
  const { user_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/users/records/${user_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted user ${user_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting user: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// =============================================================================
// WORKSPACES-SPECIFIC ACTIONS
// =============================================================================

export async function searchWorkspaces(args: any) {
  const { query = {} } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records/query`,
      {
        method: "POST",
        body: JSON.stringify({
          limit: query.limit || 25,
          offset: query.offset || 0,
          sorts: query.sorts || [],
        }),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} workspaces:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching workspaces: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getWorkspace(args: any) {
  const { workspace_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records/${workspace_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `Workspace details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createWorkspace(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest(`/v2/objects/workspaces/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created new workspace:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateWorkspace(args: any) {
  const { workspace_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/objects/workspaces/records/${workspace_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated workspace ${workspace_id}:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteWorkspace(args: any) {
  const { workspace_id } = args;
  try {
    await makeAttioRequest(`/v2/objects/workspaces/records/${workspace_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted workspace ${workspace_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// List Operations Actions
export async function listLists(args: any) {
  try {
    const response = await makeAttioRequest("/v2/lists");
    return {
      content: [
        {
          type: "text",
          text: `Lists in workspace:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing lists: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createList(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest("/v2/lists", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created list:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getList(args: any) {
  const { list } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}`);
    return {
      content: [
        {
          type: "text",
          text: `List details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateList(args: any) {
  const { list, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated list:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function searchListEntries(args: any) {
  const { list, query = {} } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}/entries/query`, {
      method: "POST",
      body: JSON.stringify({
        limit: query.limit || 25,
        offset: query.offset || 0,
        sorts: query.sorts || [],
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data?.length || 0} list entries:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching list entries: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function addToList(args: any) {
  const { list, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}/entries`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully added entry to list:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding to list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function upsertListEntry(args: any) {
  const { list, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/lists/${list}/entries`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully upserted list entry:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error upserting list entry: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function removeFromList(args: any) {
  const { list, entry_id } = args;
  try {
    await makeAttioRequest(`/v2/lists/${list}/entries/${entry_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully removed entry ${entry_id} from list ${list}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error removing from list: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getListEntry(args: any) {
  const { list, entry_id } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${list}/entries/${entry_id}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `List entry details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting list entry: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateListEntry(args: any) {
  const { list, entry_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${list}/entries/${entry_id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated list entry:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating list entry: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function putUpdateListEntry(args: any) {
  const { list, entry_id, data } = args;
  try {
    const response = await makeAttioRequest(
      `/v2/lists/${list}/entries/${entry_id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated list entry (overwrite):\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating list entry: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getListEntryAttributeValues(args: any) {
  const { list, entry_id, attribute, show_historic } = args;
  try {
    const queryParams = new URLSearchParams();
    if (show_historic) queryParams.append("show_historic", "true");

    const response = await makeAttioRequest(
      `/v2/lists/${list}/entries/${entry_id}/attributes/${attribute}/values?${queryParams}`,
    );
    return {
      content: [
        {
          type: "text",
          text: `List entry attribute values:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting list entry attribute values: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Notes Management Actions
export async function listNotes(args: any) {
  try {
    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/notes?${queryParams}`);
    return {
      content: [
        {
          type: "text",
          text: `Notes:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing notes: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getNote(args: any) {
  const { note_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/notes/${note_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Note details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting note: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createNote(args: any) {
  const { record_id, content, title, parent_object = "people" } = args;
  try {
    const response = await makeAttioRequest("/v2/notes", {
      method: "POST",
      body: JSON.stringify({
        data: {
          parent_object,
          parent_record_id: record_id,
          title: title || "Note",
          format: "plaintext",
          content,
        },
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created note:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating note: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteNote(args: any) {
  const { note_id } = args;
  try {
    await makeAttioRequest(`/v2/notes/${note_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted note ${note_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting note: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Tasks Management Actions
export async function listTasks(args: any) {
  try {
    const queryParams = new URLSearchParams();
    if (args.assignee_id) queryParams.append("assignee_id", args.assignee_id);
    if (args.is_completed !== undefined)
      queryParams.append("is_completed", args.is_completed.toString());
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/tasks?${queryParams}`);
    return {
      content: [
        {
          type: "text",
          text: `Tasks:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing tasks: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getTask(args: any) {
  const { task_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/tasks/${task_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Task details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createTask(args: any) {
  const { content, assignee_id, deadline_at, linked_records = [] } = args;
  try {
    const assignees = assignee_id
      ? [
          {
            referenced_actor_type: "workspace-member",
            referenced_actor_id: assignee_id,
          },
        ]
      : [];

    const response = await makeAttioRequest("/v2/tasks", {
      method: "POST",
      body: JSON.stringify({
        data: {
          format: "plaintext",
          content,
          deadline_at: deadline_at || null,
          is_completed: false,
          linked_records: linked_records.map((recordId: string) => ({
            target_object: "people",
            target_record_id: recordId,
          })),
          assignees,
        },
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created task:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateTask(args: any) {
  const { task_id, ...updateData } = args;
  try {
    const response = await makeAttioRequest(`/v2/tasks/${task_id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated task:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteTask(args: any) {
  const { task_id } = args;
  try {
    await makeAttioRequest(`/v2/tasks/${task_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted task ${task_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting task: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Comments and Threads Actions
export async function listThreads(args: any) {
  try {
    const queryParams = new URLSearchParams();
    if (args.record_id) queryParams.append("record_id", args.record_id);
    if (args.entry_id) queryParams.append("entry_id", args.entry_id);
    if (args.limit) queryParams.append("limit", args.limit.toString());

    const response = await makeAttioRequest(`/v2/threads?${queryParams}`);
    return {
      content: [
        {
          type: "text",
          text: `Threads:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing threads: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getThread(args: any) {
  const { thread_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/threads/${thread_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Thread details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting thread: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createComment(args: any) {
  const { content, record_id, entry_id, thread_id } = args;
  try {
    let commentData: any = {
      format: "plaintext",
      content,
      author: {
        type: "workspace-member",
        id: "current",
      },
    };

    if (thread_id) {
      commentData.thread_id = thread_id;
    } else if (record_id) {
      commentData.record = {
        target_object: "people",
        target_record_id: record_id,
      };
    } else if (entry_id) {
      commentData.entry = {
        target_list: "default",
        target_entry_id: entry_id,
      };
    }

    const response = await makeAttioRequest("/v2/comments", {
      method: "POST",
      body: JSON.stringify({
        data: commentData,
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created comment:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getComment(args: any) {
  const { comment_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/comments/${comment_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Comment details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteComment(args: any) {
  const { comment_id } = args;
  try {
    await makeAttioRequest(`/v2/comments/${comment_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted comment ${comment_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Meeting Actions
export async function getMeeting(args: any) {
  const { meeting_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/meetings/${meeting_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Meeting details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting meeting: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Webhook Actions
export async function listWebhooks(args: any) {
  try {
    const response = await makeAttioRequest("/v2/webhooks");
    return {
      content: [
        {
          type: "text",
          text: `Webhooks:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing webhooks: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function createWebhook(args: any) {
  const { data } = args;
  try {
    const response = await makeAttioRequest("/v2/webhooks", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully created webhook:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function getWebhook(args: any) {
  const { webhook_id } = args;
  try {
    const response = await makeAttioRequest(`/v2/webhooks/${webhook_id}`);
    return {
      content: [
        {
          type: "text",
          text: `Webhook details:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function updateWebhook(args: any) {
  const { webhook_id, data } = args;
  try {
    const response = await makeAttioRequest(`/v2/webhooks/${webhook_id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated webhook:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function deleteWebhook(args: any) {
  const { webhook_id } = args;
  try {
    await makeAttioRequest(`/v2/webhooks/${webhook_id}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted webhook ${webhook_id}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Self/Identity Actions
export async function getSelf(args: any) {
  try {
    const response = await makeAttioRequest("/v2/self");
    return {
      content: [
        {
          type: "text",
          text: `Self information:\n\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting self: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

// Export action mapping
export const actions = {
  // Workspace Introspection
  introspect_workspace: introspectWorkspace,
  get_workspace_members: getWorkspaceMembers,
  get_workspace_member: getWorkspaceMember,

  // Object Management
  list_objects: listObjects,
  get_object: getObject,
  create_object: createObject,
  update_object: updateObject,
  get_object_attributes: getObjectAttributes,

  // Attribute Management
  list_attributes: listAttributes,
  create_attribute: createAttribute,
  get_attribute: getAttribute,
  update_attribute: updateAttribute,

  // Select Options Management
  list_select_options: listSelectOptions,
  create_select_option: createSelectOption,
  update_select_option: updateSelectOption,

  // Status Management
  list_statuses: listStatuses,
  create_status: createStatus,
  update_status: updateStatus,

  // Generic Record Operations
  search_records: searchRecords,
  get_record: getRecord,
  create_record: createRecord,
  update_record: updateRecord,
  put_update_record: putUpdateRecord,
  upsert_record: upsertRecord,
  delete_record: deleteRecord,
  get_record_attribute_values: getRecordAttributeValues,
  get_record_entries: getRecordEntries,

  // People-specific actions
  search_people: searchPeople,
  get_person: getPerson,
  create_person: createPerson,
  update_person: updatePerson,
  delete_person: deletePerson,

  // Companies-specific actions
  search_companies: searchCompanies,
  get_company: getCompany,
  create_company: createCompany,
  update_company: updateCompany,
  delete_company: deleteCompany,

  // Deals-specific actions
  search_deals: searchDeals,
  get_deal: getDeal,
  create_deal: createDeal,
  update_deal: updateDeal,
  delete_deal: deleteDeal,

  // Users-specific actions
  search_users: searchUsers,
  get_user: getUser,
  create_user: createUser,
  update_user: updateUser,
  delete_user: deleteUser,

  // Workspaces-specific actions
  search_workspaces: searchWorkspaces,
  get_workspace: getWorkspace,
  create_workspace: createWorkspace,
  update_workspace: updateWorkspace,
  delete_workspace: deleteWorkspace,

  // List Operations
  list_lists: listLists,
  create_list: createList,
  get_list: getList,
  update_list: updateList,
  search_list_entries: searchListEntries,
  add_to_list: addToList,
  upsert_list_entry: upsertListEntry,
  remove_from_list: removeFromList,
  get_list_entry: getListEntry,
  update_list_entry: updateListEntry,
  put_update_list_entry: putUpdateListEntry,
  get_list_entry_attribute_values: getListEntryAttributeValues,

  // Notes Management
  list_notes: listNotes,
  get_note: getNote,
  create_note: createNote,
  delete_note: deleteNote,

  // Tasks Management
  list_tasks: listTasks,
  get_task: getTask,
  create_task: createTask,
  update_task: updateTask,
  delete_task: deleteTask,

  // Comments and Threads
  list_threads: listThreads,
  get_thread: getThread,
  create_comment: createComment,
  get_comment: getComment,
  delete_comment: deleteComment,

  // Meetings
  get_meeting: getMeeting,

  // Webhooks
  list_webhooks: listWebhooks,
  create_webhook: createWebhook,
  get_webhook: getWebhook,
  update_webhook: updateWebhook,
  delete_webhook: deleteWebhook,

  // Self/Identity
  get_self: getSelf,
};
