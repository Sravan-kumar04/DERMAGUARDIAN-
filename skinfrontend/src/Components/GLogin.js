import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Correct import statement

const clientId = "1074380280182-oqa8gcgbtet6aig5d48g9u5f8lt5611c.apps.googleusercontent.com";

function GLogin() {
    const navigate = useNavigate();

    const onSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("LOGIN SUCCESS! Current user:", decoded);
            localStorage.setItem("token", decoded.sub); // Use the 'sub' field as the token
            navigate('/');
        } catch (error) {
            console.error("Error decoding JWT: ", error);
        }
    };

    const onError = (error) => {
        console.log("LOGIN FAILED", error);
    };

    return (
        <div id="signInButton">
            <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    useOneTap
                />
            </GoogleOAuthProvider>
        </div>
    );
}

export default GLogin;
