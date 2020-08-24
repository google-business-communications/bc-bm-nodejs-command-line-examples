#!/usr/bin/env node
// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const apiHelper = require('./lib/api_helper');
const {delay, printHeader, printObjectEntities} = require('./shared_utils');

main();

/**
  * Initiates the Agent Sample that makes multiple requests against
  * the Business Communications API. The requests this sample
  * makes are:
  *
  * - Creates a test agent
  * - Gets an agent
  * - Updates the agent's display name
  * - Updates the agent's logo
  * - Updates the agent's welcome message
  * - Lists agents for a brand
  * - Delete the created agent
  */
async function main() {
  const brandName = process.argv[2];
  const regex = 'brands/\\S+';

  if ((process.argv.length < 3) || (brandName.match(regex) == null)) {
    console.log('Usage: <BRAND_NAME>');
    return;
  }

  let shouldDeleteAgent = process.argv.length != 4 || process.argv[3] != 'NO-DELETE';

  printHeader('Agent script for brand - ' + brandName);

  printHeader('Create Agent');
  const newAgent = await createAgent(brandName);

  await delay(3000);

  printHeader('Get Agent Details');
  const agent = await getAgent(newAgent.name);

  await delay(3000);

  printHeader('Updating Agent Display Name');
  updateAgentDisplayName(agent.name, 'Newly Edited Agent Test');

  await delay(3000);

  printHeader('Updating Agent Logo URL');
  updateAgentLogo(agent.name, 'https://developers.google.com/business-communications/images/logo-guidelines/do-logo-alt.png');

  await delay(3000);

  printHeader('Updating Agent Welcome Message');
  updateAgentConversationalSettings(agent.name, {'en':
    {
      welcomeMessage: {text: 'The updated welcome message!'},
    },
  });

  await delay(3000);

  printHeader('List Agents');
  listAgents(brandName);

  if (shouldDeleteAgent) {
    await delay(3000);

    printHeader('Deleting Agent');
    deleteAgent(agent.name);
  }
}

/**
  * Creates an agent with the Business Communications API.
  *
  * @param {object} brandName The object to be printed.
  * @return {obj} A promise resolving to the agent object returned by the api.
  */
function createAgent(brandName) {
  const agentObject = {
    displayName: 'A Test Agent',
    businessMessagesAgent: {
      defaultLocale: 'en', // Must match a conversational setting locale
      customAgentId: '', // Optional
      logoUrl: 'https://storage.googleapis.com/sample-logos/google-logo.png',
      conversationalSettings: {
        en: {
          privacyPolicy: {url: 'http://www.company.com/privacy'},
          welcomeMessage: {text: 'Welcome! How can I help?'},
          offlineMessage: {text: 'We are currently offline, please leave a message and we will get back to you as soon as possible.'},
          conversationStarters: [
            {
              suggestion: {
                reply: {
                  text: 'Chip #1',
                  postbackData: 'chip_1',
                },
              },
            },
            {
              suggestion: {
                reply: {
                  text: 'Chip #2',
                  postbackData: 'chip_2',
                },
              },
            },
            {
              suggestion: {
                reply: {
                  text: 'Chip #3',
                  postbackData: 'chip_3',
                },
              },
            },
            {
              suggestion: {
                reply: {
                  text: 'Chip #4',
                  postbackData: 'chip_4',
                },
              },
            },
            {
              suggestion: {
                action: {
                  text: 'Chip #5',
                  postbackData: 'chip_5',
                  openUrlAction: {url: 'https://www.google.com'},
                },
              },
            },
          ],
        },
      },
      entryPointConfigs: [
        {
          allowedEntryPoint: 'LOCATION',
        },
      ],
      primaryAgentInteraction: {
        interactionType: 'BOT',
        botRepresentative: {
          botMessagingAvailability: {
            hours: [
              {
                startTime: {hours: '0', minutes: '0'},
                endTime: {hours: '23', minutes: '59'},
                timeZone: 'Africa/Bamako',
                startDay: 'MONDAY',
                endDay: 'SUNDAY',
              },
            ],
          },
        },
      },
      additionalAgentInteractions: {
        interactionType: 'HUMAN',
        humanRepresentative: {
          humanMessagingAvailability: {
            hours: [
              {
                startTime: {hours: '0', minutes: '0'},
                endTime: {hours: '23', minutes: '59'},
                timeZone: 'Africa/Bamako',
                startDay: 'MONDAY',
                endDay: 'SUNDAY',
              },
            ],
          },
        },
      },
    },
  };

  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      const params = {
        auth: apiObject.authClient,
        parent: brandName,
        resource: agentObject,
      };
      apiObject.bcApi.brands.agents.create(params, {}, (err, response) => {
        if (err !== undefined && err !== null) {
          reject(err);
        } else {
          printObjectEntities(response.data);
          resolve(response.data);
        }
      });
    });
  });
}

/**
  * Updates the agent's display name.
  *
  * @param {string} agentName The agent name for the agent being updated.
  * @param {object} displayName The new agent agent display name.
  */
function updateAgentDisplayName(agentName, displayName) {
  const agentObject = {
    displayName: displayName,
  };

  const apiConnector = apiHelper.init();
  apiConnector.then((apiObject) => {
    // Update Agent
    updateAgent(agentName, agentObject, apiObject, 'displayName');
  });
}
/**
  * Updates the agent logo URL.
  *
  * @param {string} agentName The agent name for the agent being updated.
  * @param {string} logoUrl The new agent agent logo URL.
  */
function updateAgentLogo(agentName, logoUrl) {
  const agentObject = {
    businessMessagesAgent: {
      logoUrl: logoUrl,
    },
  };

  const apiConnector = apiHelper.init();
  apiConnector.then((apiObject) => {
    // Update Agent
    updateAgent(agentName,
        agentObject,
        apiObject,
        'businessMessagesAgent.logoUrl',
    );
  });
}

/**
  * Update the agent's conversational settings.
  *
  * @param {string} agentName The agent name for the agent being updated.
  * @param {string} conversationalSettings The new conversational settings.
  */
function updateAgentConversationalSettings(agentName, conversationalSettings) {
  const agentObject = {
    businessMessagesAgent: {
      conversationalSettings: conversationalSettings,
    },
  };

  const apiConnector = apiHelper.init();
  apiConnector.then((apiObject) => {
    // Update Agent
    updateAgent(
        agentName,
        agentObject,
        apiObject,
        'businessMessagesAgent.conversationalSettings.en',
    );
  });
}

/**
  * Updates the saved agent with the passed in agent object for
  * the fields specified in the update mask.
  *
  * @param {string} agentName The agent name for the agent being updated.
  * @param {object} agentObject The JSON object to post.
  * @param {object} apiObject The BC API object.
  * @param {string} updateMask A comma-separated list of fully qualified names
  * of fields that are to be included in the update
  */
function updateAgent(agentName, agentObject, apiObject, updateMask) {
  // setup the parameters for the API call
  const apiParams = {
    auth: apiObject.authClient,
    name: agentName,
    resource: agentObject,
    updateMask: updateMask,
  };

  apiObject.bcApi.brands.agents.patch(apiParams, {}, (err, response) => {
    if (err !== undefined && err !== null) {
      console.log('Error: ');
      console.log(err);
    } else {
      printObjectEntities(response.data);
    }
  });
}

/**
  * Based on the agent name, looks up the agent details.
  *
  * @param {string} agentName The unique identifier for the in
  * "brands/BRAND_ID/agents/AGENT_ID" format.
  * @return {obj} A promise which resolves to the agent object return
  * by the api.
  */
function getAgent(agentName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      const apiParams = {
        auth: apiObject.authClient,
        name: agentName,
      };

      // Get the agent details to show in the edit form
      apiObject.bcApi.brands.agents.get(apiParams, {}, (err, response) => {
        if (err !== undefined && err !== null) {
          reject(err);
        } else {
          printObjectEntities(response.data);
          resolve(response.data);
        }
      });
    });
  });
}

/**
  * Lists all agents for the given brand.
  *
  * @param {string} brandName The unique identifier for
  * the brand in "brands/BRAND_ID" format.
  */
function listAgents(brandName) {
  const apiConnector = apiHelper.init();
  apiConnector.then((apiObject) => {
    // setup the parameters for the API call
    const apiParams = {
      auth: apiObject.authClient,
      parent: brandName,
    };

    apiObject.bcApi.brands.agents.list(apiParams, {}, (err, response) => {
      if (err !== undefined && err !== null) {
        console.log('Error:');
        console.log(err);
      } else {
        printObjectEntities(response.data.agents);
      }
    });
  });
}

/**
 * Based on the agent name, deletes the agent. Only a non-verified agent can be deleted.
 *
 * @param {string} agentName The unique identifier for the in
 * "brands/BRAND_ID/agents/AGENT_ID" format.
 * @return {obj} A promise which resolves to the agent object return
 * by the api.
 */
function deleteAgent(agentName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      const apiParams = {
        auth: apiObject.authClient,
        name: agentName,
      };

      apiObject.bcApi.brands.agents.delete(apiParams, {}, (err, response) => {
        if (err !== undefined && err !== null) {
          reject(err);
        } else {
          printObjectEntities(response.data);
          resolve(response.data);
        }
      });
    });
  });
}
