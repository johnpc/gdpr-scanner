# GDPR Scanning Tool

This tool scans your email history to find all services that have your data. It identifies them and saves them in `/tmp/yourSubscriptions.json`. You can use this information to send GDPR deletion requests to those services.

## Authentication

### Gmail API

You need to generate an API key and save it at the root of this project in `credentials.json` file for this to work:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. At the top-left, click Menu menu > APIs & Services > Credentials.
3. Click Create Credentials > OAuth client ID.
4. Click Application type > Desktop app.
5. In the "Name" field, type a name for the credential. This name is only shown in the Cloud Console.
6. Click Create. The OAuth client created screen appears, showing your new Client ID and Client secret.
7. Click OK. The newly created credential appears under "OAuth 2.0 Client IDs."

Download the credential and store it as `credentials.json` within this project.

### hunter.io API

Create an account and visit https://hunter.io/api-keys. Run `cp .env.example .env` and replace `abc123` with your hunter.io api key.

## Running the program

First, run `npm install`.

`npm identify` scans your email history, creates a listing of all services that may have your data, and stores it in `/tmp/yourSubscriptions.json`.

`npm populate` uses hunter.io to fill in support email addresses that you can reach out to for each service to request deletion in `/tmp/yourSubscriptions.json`.

`npm gdpr` sends a gdpr data deletion request email to all support emails in `/tmp/yourSubscriptions.json`.

## TODO

- implement `npm gdpr` - automate sending gdpr deletion request template
