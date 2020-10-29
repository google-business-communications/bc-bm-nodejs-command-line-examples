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
  * Initiates the Location Sample which makes multiple requests against
  * the Business Communications API. The requests this sample
  * makes are:
  *
  * - Creates a test location
  * - Gets a location
  * - Updates a location
  * - Lists locations for a brand
  * - Delete the created location
  */
async function main() {
  const agentName = process.argv[2];

  const regex = 'brands/\\S+/agents/\\S+';

  if ((process.argv.length != 3) || (agentName.match(regex) == null)) {
    console.log('Usage: <AGENT_NAME>');
    return;
  }
  const brandName = agentName.slice(0, agentName.indexOf('/agents'));

  printHeader('Location script for agent - ' + agentName);

  // Using Googleplex for placeId sample.
  const placeId = 'ChIJj61dQgK6j4AR4GeTYWZsKWw';

  printHeader('Create Location');
  const newLocation = await createLocation(brandName, agentName, placeId);

  await delay(3000);

  printHeader('Get Location Details');
  let location = await getLocation(newLocation.name);

  await delay(3000);

  // updateLocation will modify the agentName associated with the location
  // NOTE: This call will fail unless the agentName parameter is a valid value
  printHeader('Updating Location');
  await updateLocation(location, '/brands/BRAND_ID/agents/AGENT_ID');

  await delay(3000);

  printHeader('List Locations');
  await listLocations(brandName);

  await delay(3000);

  printHeader('Deleting Location');
  deleteLocation(location.name);
}

/**
  * Creates a new location associated with a brand and agent.
  *
  * @param {string} brandName The brand associated with the location.
  * @param {string} agentName The agent associated with the location.
  * @param {string} placeId The placeId associated with the location.
  * @return {object} Returns a promise resolving the data returned from the API.
  */
function createLocation(brandName, agentName, placeId) {
  const locationObject = {
    placeId: placeId,
    agent: agentName,
    defaultLocale: 'en', // Must match a conversational setting locale
    conversationalSettings: {
      en: {
        privacyPolicy: {url: 'http://www.company.com/privacy'},
        welcomeMessage: {text: 'Welcome! How can I help?'},
        offlineMessage: {text: 'This location is currently offline, please leave a message and we will get back to you as soon as possible.'},
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
    locationEntryPointConfigs: [
      {allowedEntryPoint: 'PLACESHEET'},
      {allowedEntryPoint: 'MAPS_TACTILE'},
    ],
  };

  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      // setup the parameters for the API call
      const apiParams = {
        auth: apiObject.authClient,
        parent: brandName,
        resource: locationObject,
      };

      apiObject.bcApi.brands.locations.create(apiParams, {},
          (err, response) => {
            if (err !== undefined && err !== null) {
              console.log('Error:');
              console.log(err);
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
  * Based on the location name, looks up and returns the location details.
  *
  * @param {string} locationName The location to be updated.
  * @return {object} Returns a promise resolving the data returned from the API.
  */
function getLocation(locationName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      // setup the parameters for the API call
      const apiParams = {
        auth: apiObject.authClient,
        name: locationName,
      };

      apiObject.bcApi.brands.locations.get(apiParams, {},
          (err, response) => {
            if (err !== undefined && err !== null) {
              console.log('Error:');
              console.log(err);
              reject(err);
            } else {
              printObjectEntities(response.data);
              resolve(response.data);
            }
          },
      );
    });
  });
}

/**
  * Updates the agent associated with the passed in location.
  *
  * @param {string} locationObj The location that needs to be updated.
  * @param {string} newAgentName The new agent to associate with the location.
  * @return {object} Returns a promise resolving the data returned from the API.
  */
function updateLocation(locationObj, newAgentName) {
  locationObj.agent = newAgentName;
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      // setup the parameters for the API call
      const apiParams = {
        auth: apiObject.authClient,
        name: locationObj.name,
        resource: locationObj,
        updateMask: 'agent',
      };

      apiObject.bcApi.brands.locations.patch(apiParams, {},
          (err, response) => {
            if (err !== undefined && err !== null) {
              console.log('Error:');
              console.log(err);
              reject(err);
            } else {
              printObjectEntities(response.data);
              resolve(response.data);
            }
          },
      );
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
}

/**
  * Lists locations associated with a brand.
  *
  * @param {string} brandName The brand name associated with locations.
  * @return {object} A JSON object representing the selected entry points.
  */
function listLocations(brandName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      // setup the parameters for the API call
      const apiParams = {
        auth: apiObject.authClient,
        parent: brandName,
      };

      apiObject.bcApi.brands.locations.list(apiParams, {},
          (err, response) => {
            if (err !== undefined && err !== null) {
              console.log('Error:');
              console.log(err);
              reject(err);
            } else {
              printObjectEntities(response.data);
              resolve(response.data);
            }
          },
      );
    });
  });
}

/**
 * Based on the location name, deletes the location. Only a non-verified location can be deleted.
 *
 * @param {string} locationName The location to be deleted.
 * @return {obj} A promise which resolves to the agent object return
 * by the api.
 */
function deleteLocation(locationName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      const apiParams = {
        auth: apiObject.authClient,
        name: locationName,
      };

      apiObject.bcApi.brands.locations.delete(apiParams, {}, (err, response) => {
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
