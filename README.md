# Security Advisor Reference Partner Product 

### How to run locally
**Pre-requisites** :
  - Create key and certificate for the ssl connection.
    `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365`
  - Create a kuberenetes secret with these key and cert to be used during helm deployment.

**Steps**:
1) Clone the repo
2) npm install
3) npm start
4) Access the swagger UI at https://localhost:8888/v1/setup/docs


### How to modify the functionality of exposed API's
1) Clone the repo
2) All the API routes are defined under `src/app.js`, following is the API-function mapping:
   - Setup (/v1/setup) : `bpSetUp` function
   - Setup configuration (/v1/setup/configuration): `bpSetUpConfig` function
   - Setup test (/v1/setup/test): `bpSetUpTest` function
   - Dashboard URL (/v1/setup/dashboard): `getDashboardUrl` function
   - Metadata (/v1/setup/metadata): `getMetadata` function
