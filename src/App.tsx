import { Html5QrcodeScanner } from 'html5-qrcode'
import './App.css'
import { useEffect, useState } from 'react';
import { Axios } from 'axios';

function App() {
  const [result, setResult] = useState<string>();
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scanningRender, setScanningRender] = useState(false);

  const meA = new Axios;
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
 
  const startScanning = () => {
    setResult(undefined); 
    setScanningRender(true)
    if (scanner) {
      scanner.render(
        (decodedText) => {
          setResult(decodedText);
          console.log(meA.post("localhost:5000/add_data", decodedText));
          scanner.clear().then(() => {
            // console.log("Scanner cleared successfully");
            setScanningRender(false);
          }).catch(error => console.error("Failed to clear scanner", error));
        },
        () => {

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
          <p>The data was {result}. The data is being sent to a server and should be sent to the spreadsheet.</p>
        </div>
      }
      
      {
        !scanningRender && <button onClick={startScanning}>Start Scanning</button>
      }
    </> 
  )
}
export default App;
