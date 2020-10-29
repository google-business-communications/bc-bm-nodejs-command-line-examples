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

const SERVICE_ACCOUNT_LOCATION =
  __dirname + '/../resources/bc-agent-service-account-credentials.json';

// API library reference object
let bcApi = false;

// JWT cloud authentication reference object
let authClient = false;

const apiHelper = {
  init: function(serviceAccountFile) {
    // If no file is supplied, use the default location
    if (serviceAccountFile === undefined) {
      serviceAccountFile = SERVICE_ACCOUNT_LOCATION;
    }

    const authToken = this.generateAuthToken(serviceAccountFile);

    return new Promise(function(resolve, reject) {
      authToken.then(function(response) {
        resolve({authClient: authClient, bcApi: bcApi});
      }).catch(function(err) {
        console.log(err);
      });
    }).catch(function(err) {
      console.log(err);
    });
  },

  /**
   * Creates authorization token for Business Messages API access.
   *
   * @param {string} serviceAccountFile The location of the service account file.
   * @return {obj} A promise that will create the auth bearer.
   */
  generateAuthToken: function(serviceAccountFile) {
    // Auth client has already been created, return existing token
    if (authClient !== false) {
      return new Promise(function(resolve, reject) {
        resolve({authClient: authClient, bcApi: bcApi});
      });
    }

    // Get the GoogleAPI library
    const {google} = require('googleapis');

    // Get the Business Communications API client library
    const businesscommunications = require('businesscommunications');

    // Set the scope that we need for the Business Communications API
    const scopes = [
      'https://www.googleapis.com/auth/businesscommunications',
    ];

    // Set the private key to the service account file
    const privatekey = require(serviceAccountFile);

    // Configure a JWT auth client
    authClient = new google.auth.JWT(
      privatekey.client_email,
      null,
      privatekey.private_key,
      scopes,
    );

    // Initialize the client library
    bcApi = new businesscommunications.businesscommunications_v1.Businesscommunications({}, google);

    return new Promise(function(resolve, reject) {
      // Authenticate request
      authClient.authorize(function(err, tokens) {
        if (err) {
          console.log('Error initiatizing library.');
        } else {
          resolve({authClient: authClient, bcApi: bcApi});
        }
      });
    });
  },
};

module.exports = apiHelper;
