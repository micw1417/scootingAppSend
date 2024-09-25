import { Html5QrcodeScanner } from 'html5-qrcode'
import './App.css'
import { useEffect, useState } from 'react';
import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { Credentials, Provider } from '@aws-sdk/types';

const API_URL: string = import.meta.env.VITE_API_URL || 'https://your-api-id.execute-api.your-region.amazonaws.com/$default';
const REGION: string = import.meta.env.AWS_REGION || 'your-region';
const ACCESS_KEY_ID: string | undefined = import.meta.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY: string | undefined = import.meta.env.AWS_SECRET_ACCESS_KEY;

const credentialProvider: Provider<Credentials> = () => Promise.resolve({
  accessKeyId: ACCESS_KEY_ID!,
  secretAccessKey: SECRET_ACCESS_KEY!
});

const signer = new SignatureV4({
  credentials: credentialProvider,
  region: REGION,
  service: 'execute-api',
  sha256: Sha256
});

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!config.url) {
    return config;
  }
  const url = new URL(config.url, API_URL);
  const signedRequest = await signer.sign({
    method: 'POST',
    hostname: url.hostname,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1), 
    headers: {
      'Content-Type': 'application/json',
      host: url.hostname,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  });
  
  const newHeaders = AxiosHeaders.from({
    ...config.headers,
    ...signedRequest.headers,
    'Content-Type': 'application/json'
  });

  config.headers = newHeaders;
  return config;
});


function App() {
  const [result, setResult] = useState<string>();
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scanningRender, setScanningRender] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    const newScanner = new Html5QrcodeScanner(
      'reader',
      { qrbox: { width: 250, height: 250 }, fps: 60 },
      false 
    );
    setScanner(newScanner);
    return () => {
      if (newScanner) {
        newScanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, []);

  const startScanning = async () => {
    setResult(undefined); 
    setApiResponse(null);
    setScanningRender(true)
    console.log(API_URL, REGION, ACCESS_KEY_ID, SECRET_ACCESS_KEY)
    if (scanner) {
      scanner.render(
        async (decodedText) => {
          setResult(decodedText);
          try {
            const response = await api.post('/add_data', { data: decodedText });
            setApiResponse(response.data);
            console.log('API Response:', response.data);
          } catch (error) {
            console.error('API Error:', error);
            setApiResponse({ error: 'Failed to send data to server' });
          }
          scanner.clear().then(() => {
            setScanningRender(false);
          }).catch(error => console.error("Failed to clear scanner", error));
        },
        () => {
          // Error callback
        }
      );
    }
  };
    
  return (
    <>
      <h1>Scouting App Data Loader</h1>
      {!result && <h2>Scan a QR Code</h2>}
      <div id="reader"></div>
      {result &&
        <div>
          <h2>Success!</h2>
          <p>The data was {result}. The data has been sent to the server.</p>
          {apiResponse && (
            <div>
              <h3>Server Response:</h3>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      }
      
      {!scanningRender && <button onClick={startScanning}>Start Scanning</button>}
    </> 
  )
}

export default App;