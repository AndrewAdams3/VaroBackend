const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

//Accepts a list of values to be inserted as a row
async function AppendDB(data, state) {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return //console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), appendRow, data, state); // change function name
  });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, data, state) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback, data, state);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, data, state);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback, data, state) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  //console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        //console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, data, state);
    });
  });
}
function appendRow(auth, data, state) {
  const sheets = google.sheets({ version: 'v4', auth });
  //console.log("data", data);
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: '1tXGvEaXKGvkJoLCM4GNs5uuO1seupeBarC13UZRqH5s', //"1IeIOmvfcHc6tTFwjOEs4qT4Q0yJIwfVsnkLSmC0LuKc" 1tXGvEaXKGvkJoLCM4GNs5uuO1seupeBarC13UZRqH5s
    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: state === "nevada" ? 'Nevada Drive-By!A3:A3' : 'App Drive-By!A3:A3', // main -- New Drive-By *test*
    // How the input data should be interpreted.
    valueInputOption: 'USER_ENTERED',
    // How the input data should be inserted.
    insertDataOption: 'INSERT_ROWS',
    resource: {
      "values": [data]
    },
    auth: auth
  };
  sheets.spreadsheets.values.append(request, function (err, response) {
    if (err) {
      console.error(err);
      return;
    }
    // TODO: Change code below to process the `response` object:
    ////console.log(JSON.stringify(response, null, 2));
  });
}

module.exports = AppendDB;