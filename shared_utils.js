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

const util = require('util');

/**
 * The delay prints '...' to standard output to improve
 * readability of the code sample.
 *
 * @param {object} milliseconds The delay in milliseconds
 * @return {object} returns a promise.
 */
function delay(milliseconds) {
  let progress = '';
  const interval = setInterval(function() {
    process.stdout.write(progress + '\r');
    progress = progress + '.';
  }, 500);

  setTimeout(() => {
    process.stdout.write(progress + '\n');
    clearInterval(interval);
  }, milliseconds);

  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds);
  });
}


/**
 * Prints a header containing the input text.
 *
 * @param {string} text The text of the header.
 */
function printHeader(text) {
  console.log('================== ' + text + ': ==================');
}

/**
 * Prints all nested objects.
 *
 * @param {object} obj The object to be printed.
 */
function printObjectEntities(obj) {
  console.log(util.inspect(obj, {showHidden: false, depth: 15, colors: true}));
}

module.exports = {delay, printHeader, printObjectEntities};
