import { google } from 'googleapis';
import {client_email, private_key_id,sheet_id} from "../secrets.json"

export const SHEET_ID = "1WA_EN4Qu6P65vuK8MeNP6sU1o3Cgn5USSjVKt_B_ngs";
const client = new google.auth.JWT(client_email, null, private_key_id, [
  'https://www.googleapis.com/auth/spreadsheets',
]);
const sheets = google.sheets({ version: 'v4', auth: client });

export default sheets;

