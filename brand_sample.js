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
  * Initiates the Brand Sample which makes multiple requests against
  * the Business Communications API. The requests this sample
  * makes are:
  *
  * - Create a brand
  * - Gets the brand details
  * - Updates the created brand's display name
  * - Lists all brands available
  * - Delete the created agent
  */
async function main() {
  let shouldDeleteBrand = (process.argv.length != 3 || process.argv[2] != 'NO-DELETE');

  printHeader('Create Brand');
  const newBrand = await createBrand();

  await delay(3000);

  printHeader('Get Brand Details');
  brand = await getBrand(newBrand.name);

  await delay(3000);

  printHeader('Updating Brand');
  brand = await updateBrand(brand.name, 'An Updated Test Brand');

  await delay(3000);

  printHeader('List Brands');
  listBrands();

  if (shouldDeleteBrand) {
    await delay(3000);

    printHeader('Deleting Brand');
    deleteBrand(brand.name);
  }
}

/**
  * Creates a brand with the name "Test Brand".
  */
async function createBrand() {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      // setup the parameters for the API call
      const apiParams = {
        auth: apiObject.authClient,
        resource: {
          displayName: 'Test Brand',
        },
      };

      apiObject.bcApi.brands.create(apiParams, {}, (err, response) => {
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
  * Updates the passed in brand object with a new display name.
  *
  * @param {string} brandName The unique identifier for the
  * brand in "brands/BRAND_ID" format.
  * @param {string} displayName The new display name.
  * @return {object} Returns a promise resolving to the updated brand object.
  */
function updateBrand(brandName, displayName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      // setup the parameters for the API call
      const apiParams = {
        auth: apiObject.authClient,
        name: brandName,
        resource: {
          displayName: displayName,
        },
        updateMask: 'displayName',
      };

      apiObject.bcApi.brands.patch(apiParams, {}, (err, response) => {
        if (err !== undefined && err !== null) {
          console.log(err);
        } else {
          printObjectEntities(response.data);
          resolve(response.data);
        }
      });
    });
  });
}

/**
  * Based on the brand name, looks up the brand details.
  *
  * @param {string} brandName The unique identifier for the
  * brand in "brands/BRAND_ID" format.
  * @return {object} Returns a promise resolving to the updated brand object.
  */
async function getBrand(brandName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then((apiObject) => {
      const apiParams = {
        auth: apiObject.authClient,
        name: brandName,
      };
      apiObject.bcApi.brands.get(apiParams, {}, (err, response) => {
        if (err !== undefined && err !== null) {
          console.log(err);
          reject(err);
        } else {
          printObjectEntities(response.data);
          resolve(response.data);
        }
      });
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
}

/**
  * Lists all brands for the configured Cloud project.
  */
function listBrands() {
  const apiConnector = apiHelper.init();
  apiConnector.then((apiObject) => {
    // setup the parameters for the API call
    const apiParams = {
      auth: apiObject.authClient,
    };

    // send the client the message
    apiObject.bcApi.brands.list(apiParams, {}, (err, response) => {
      let brands = [];
      if (response.data != undefined) {
        brands = response.data.brands;
      }
      console.log(brands);
    });
  }).catch((err) => {
    console.log(err);
  });
}

/**
 * Based on the brand name, deletes the brand. Deleting a brand with
 * associated agents will also result in the agents also being deleted.
 * Only brands without verified agents can be deleted.
 * @param {string} brandName The unique identifier for the
 * brand in "brands/BRAND_ID" format.
 * @return {object} Returns a promise resolving to the updated brand object.
 */
async function deleteBrand(brandName) {
  return new Promise((resolve, reject) => {
    const apiConnector = apiHelper.init();
    apiConnector.then(function(apiObject) {
      const apiParams = {
        auth: apiObject.authClient,
        name: brandName,
      };

      apiObject.bcApi.brands.delete(apiParams, {}, function(err, response) {
        if (err !== undefined && err !== null) {
          console.log(err);
          reject(err);
        } else {
          printObjectEntities(response.data);
          resolve(response.data);
        }
      });
    }).catch(function(err) {
      console.log(err);
      reject(err);
    });
  });
}