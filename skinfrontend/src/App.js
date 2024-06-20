import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, Route, Routes } from "react-router-dom";

import './App.css';
import Chat from './Components/Chat';
import SkinGPTNavbar from './Components/Navbar';
import Alert from './Components/Alert';
import Login from './Components/Login';
import Signup from './Components/Signup';
import VerifyEmail from './email';
import {gapi} from 'gapi-script'
const clientId="280898050607-qgsm03gqibjrv9m28ee5ufifbejh98nq.apps.googleusercontent.com"

function App() {
  const [alert, setAlert] = useState();

  useEffect(()=>{
    function start(){
      gapi.client.init({
        clientId:clientId,
        scope:""
      })
    };
    gapi.load("client:auth2",start)
  })

  const showAlert = (message, type) => {
    setAlert({
      message: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };


  return (
    <>
    <div className="App">
    
    <BrowserRouter>
    <SkinGPTNavbar/>
    <Alert alert={alert} />
      <Routes>
      <Route  path='/' element={<Chat/>} />
      <Route  path='login' element={<Login     />}/>
      <Route path="/signup" element={<Signup  />}/>
      

      </Routes>
    </BrowserRouter>
   
    {/* <GLogin/>
    <GLogout/> */}
    {/* <VerifyEmail/> */}
  
    </div>
    </>





  );
}

export default App;


// import React from 'react';
// import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

// const libraries = ['places'];
// const mapContainerStyle = {
//   width: '100vw',
//   height: '100vh',
// };
// const center = {
//   lat: 7.2905715, // default latitude
//   lng: 80.6337262, // default longitude
// };

// const App = () => {
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: 'AIzaSyDnxYvIEFO9t0IhEx4WerKsUyKWq2agtGY',
//     libraries,
//   });

//   if (loadError) {
//     return <div>Error loading maps</div>;
//   }

//   if (!isLoaded) {
//     return <div>Loading maps</div>;
//   }

//   return (
//     <div>
//       <GoogleMap
//         mapContainerStyle={mapContainerStyle}
//         zoom={10}
//         center={center}
//       >
//         <Marker position={center} />
//       </GoogleMap>
//     </div>
//   );
// };

// export default App;