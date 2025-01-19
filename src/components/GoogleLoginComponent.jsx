import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify"; // Import toast
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { BiLoaderAlt } from "react-icons/bi"; // Import BiLoaderAlt icon

const GoogleLoginComponent = () => {  
  const navigate = useNavigate(); // Hook for navigation
  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = async (credentialResponse) => {    
    setIsLoading(true);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const token = credentialResponse.credential; // Get the token    

    // Send token to backend
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }), // Send the token in the body
          credentials: "include", // Include credentials (cookies)
        }
      );
      const data = await response.json();
      if (!data.success) {
        toast.error(data.message); // Show error message
        return;
      }
      if (data.success) {
        toast.success("Login successful!"); // Show success message
        navigate("/dashboard"); // Change to your dashboard route        
      }
    } catch (error) {
      console.error("Error sending token to backend:", error);
      toast.error("Failed to authenticate with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const onFailure = (error) => {    
    console.error("Login Failed:", error); // Handle login failure
    setIsLoading(false);
    toast.error("Google login failed");
  };

  return (
    <div className="flex justify-center items-center mt-1">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <BiLoaderAlt className="animate-spin text-2xl text-green-600 mr-2" />
          <span className="text-gray-600">Authenticating...</span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={onSuccess}
          onFailure={onFailure}
          className="border border-gray-300 rounded-lg shadow-lg p-2 flex items-center justify-center"
        >
          <span className="text-lg font-semibold">Sign in with Google</span>
        </GoogleLogin>
      )}
    </div>
  );
};

export default GoogleLoginComponent;
