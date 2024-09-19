import { google } from 'googleapis';
import {client_email, private_key_id,sheet_id} from "../secrets.json"

const client_email = client_email;
const private_key = private_key_id;
export const SHEET_ID = sheet_id;

const client = new google.auth.JWT(client_email, null, private_key, [
  'https://www.googleapis.com/auth/spreadsheets',
]);
const sheets = google.sheets({ version: 'v4', auth: client });

export default sheets;

