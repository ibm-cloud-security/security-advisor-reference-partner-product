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

const axios = require('axios')
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

var exports = module.exports = exportedFunction

function exportedFunction(logger) {
    logger = logger || console
    /**
     * obtain access token for api key
     * @param {string} iamTokenURL iam token url
     * @param {string} apiKey an api key to get token for
     * @return {string} the access token
     */
   async function obtainAccessToken(iamTokenURL, apiKey) {
        const requestBody = `grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=${apiKey}&response_type=cloud_iam`
        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        response = await axios.post(iamTokenURL, requestBody, config)
        if (response.status !== 200) {
            throw new Error("Couldn't retrive the token" + response.data)
        }
        return response.data
    };

    async function obtainServiceID(iamServiceIdURL, accountId, accessToken, cname) {
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const body = {
            "name": "SecurityAdvisorBPAccessService",
            "description": "ServiceID for access to SecurityAdvisor",
            "boundTo": `crn:v1:${cname}:public:::a/${accountId}:::`
          }

        response = await axios.post(iamServiceIdURL, body, config)
        if (response.status !== 200) {
            throw new Error("Couldn't retrive the token" + response.data)
        }
        return response.data
    };

    async function deleteServiceId(iamServiceIdURL, accountId, accessToken, serviceId) {
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const deleteURL = `${iamServiceIdURL}/${serviceId}`
        response = await axios.delete(deleteURL, config)
        if (response.status !== 204) {
            throw new Error("Couldn't retrive the service id" + response.data)
        }
        return response.status
    };

    async function obtainServiceApiKey(iamApiKeyURL, accountId, serviceId, accessToken, cname) {

        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const body = {
            "name": "SecurityAdvisorBPAccessServiceApiKey",
            "description": "API key for service id",
            "boundTo": `crn:v1:${cname}:public:iam-identity::a/${accountId}::serviceid:${serviceId}`
          }

        response = await axios.post(iamApiKeyURL, body, config)
        if (response.status !== 201) {
            throw new Error("Couldn't retrive the service api key" + response.data)
        }
        return response.data
    };

    async function grantPAP(iamPAPURL, accountId, iamId, action, accessToken, is_service=true) {
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const body = {
            "roles": [
              {
                "id": `crn:v1:bluemix:public:iam::::serviceRole:${action}`
              }
            ],
            "resources": [
              {
                "serviceName": "security-advisor"
             }
            ]
        }

        let pap_url
        if(is_service) {
            pap_url = iamPAPURL + `/a%2F${accountId}/service_ids/${iamId}/policies`
        } else {
            pap_url = iamPAPURL + `/a%2F${accountId}/users/${iamId}/policies`
        }

        response = await axios.post(pap_url, body, config)
        if (response.status !== 201) {
            throw new Error("Couldn't assign policy" + response.data)
        }
        return response.data
    };

    async function revokePAP(iamPAPURL, accountId, iamId, policyID, accessToken, is_service=true) {
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        let pap_url
        if(is_service) {
            pap_url = iamPAPURL + `/a%2F${accountId}/service_ids/${iamId}/policies/${policyID} `
        } else {
            pap_url = iamPAPURL + `/a%2F${accountId}/users/${iamId}/policies /${policyID}`
        }

        response = await axios.delete(deleteURL, config)
        if (response.status !== 204) {
            throw new Error("Couldn't revoke policy" + response.data)
        }
        return response.status
    };

    return {
        obtainAccessToken: obtainAccessToken,
        obtainServiceID: obtainServiceID,
        obtainServiceApiKey: obtainServiceApiKey,
        grantPAP: grantPAP,
        revokePAP: revokePAP,
        deleteServiceId: deleteServiceId
    }
};
