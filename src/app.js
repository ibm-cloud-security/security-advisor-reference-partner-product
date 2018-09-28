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

const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  swaggerUi = require('swagger-ui-express'),
  https = require('https'),
  swaggerDocument = require('../api/BP.json');

const iamapi = require('./util/iam')()
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

let apiKey, providerId, findingsURL, tokenURL, accountID

const bootTime = new Date()

var getMetadata = function (req, res, next) {
  const notes = [
    {
      "kind": "CARD",
      "provider_id": "security-advisor",
      "id": "bp-card-1",
      "short_description": "business partner card template",
      "long_description": "business partner card template",
      "reported_by": {
        "id": "business partner card 1",
        "title": "Business Partner Card 1"
      },
      "card": {
        "section": "Business Partner Tools",
        "title": "Business Partner Card 1",
        "finding_note_names": [
          "providers/security-advisor/notes/bp-findings-type"
        ],
        "elements": [
          {
            "kind": "NUMERIC",
            "text": "Number of findings reported by business partner",
            "default_time_range": "7d",
            "value_type": {
              "kind": "FINDING_COUNT",
              "finding_note_names": [
                "providers/security-advisor/notes/bp-findings-type"
              ]
            }
          }
        ]
      }
    },
    {
      "kind": "FINDING",
      "short_description": "business partner card findings template",
      "long_description": "business partner card findings template",
      "provider_id": "security-advisor",
      "id": "bp-findings-type",
      "reported_by": {
        "id": "business partner findings ",
        "title": "Business Partner Findings"
      },
      "finding": {
        "severity": "LOW"
      }
    }
  ]
  const metadata = {
      notes: notes,
      changedSince: bootTime,
  }

  res.json(metadata)
};

var bpSetUpConfig = function (req, res, next) {
  apiKey = req.body.apikey
  accountID = req.body.accountID
  findingsURL = req.body.findingsURL
  tokenURL = req.body.tokenURL
  providerId = req.body.providerId
  res.json({status: 'OK'})
};

var bpSetUpTest = async function (req, res, next) {
    try{
        const iamResponse = await iamapi.obtainAccessToken(tokenURL, apiKey)
        const iamAccessToken = iamResponse.access_token
        const api = require('./util/findingsAPI')(findingsURL, iamAccessToken)
        const occurrencePayload = req.body
        const providerId = req.body.provider_id
        const response = await api.createOccurrence(accountID, occurrencePayload, providerId)
        if(response.status === 200) {
            res.json({status: 'OK'})
        }else{
            res.status(response.status).send({status: 'FAILED'})
        }
    }catch(err){
        res.status(400).send({status: 'FAILED'})
        console.log(err)
    }
}

var bpSetUp = function (req, res, next) {
  res.json({status: 'OK'})
};

var getDashboardUrl = function (req, res, next) {
  res.json({url: `https://localhost:${port}/v1/setup/sample-dashboard`})
};

var getSampleDashboard = function (req, res, next) {
  res.set('Content-Type', 'text/html');
  res.send(new Buffer('<h2>Business partner sample dashboard</h2>'));
}

router.route('/')
  .get(bpSetUp)

router.route('/configuration')
  .post(bpSetUpConfig)

router.route('/test')
  .post(bpSetUpTest)

router.route('/metadata')
  .get(getMetadata)

router.route('/dashboard')
  .get(getDashboardUrl)

router.route('/sample-dashboard')
  .get(getSampleDashboard)

router.get('/api-docs', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocument)
})

app.use('/v1/setup/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/v1/setup', router);

const port =  process.env.PORT || 8888;

const certificate = process.env.tls_cert.split("\\r\\n").join("\r\n");
const privateKey = process.env.tls_key.split("\\r\\n").join("\r\n");

var server = https.createServer({ key: privateKey, cert: certificate }, app);
server.listen(port, '0.0.0.0', function () {
  console.log(`Service listening on port ${port}`);
});

module.exports = app;
