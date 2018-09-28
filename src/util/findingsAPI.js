/*
 Copyright 2018 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var exports = module.exports = FindingsAPI

const axios = require('axios')
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

function FindingsAPI(baseEndpoint, accessToken, logger) {
    logger = logger || console

    const rest = axios.create();
    rest.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    logger.log('info', baseEndpoint)

  
    async function createOccurrence(accountId, payload, providerId='test-provider') {
        const url = `${baseEndpoint}/${accountId}/providers/${providerId}/occurrences`
        response = await axios.post(url, payload)
        return response
    }

    async function deleteOccurrence(accountId, providerId='test-provider', id='test-occurrence') {
        const url = `${baseEndpoint}/${accountId}/providers/${providerId}/occurrences/${id}`
        response = await axios.delete(url, body)
        return response
    }

    return {
        createOccurrence: createOccurrence,
        deleteOccurrence: deleteOccurrence
    }
}
