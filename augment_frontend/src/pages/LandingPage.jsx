import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-8">
        SOFTWARE ENGINEERING (IT303) <br />
        COURSE PROJECT TITLE: "IMPLEMENTATION OF RGB IMAGE DATASET AUGMENTATION TECHNIQUES" <br />
      </h1>

      <div className="mb-10">
        <p className="text-lg">Carried out by</p>
        <p className="text-lg font-medium">Prathamesh (231IT051)</p>
        <p className="text-lg font-medium">Ullas R (231IT082)</p>
        <p className="text-lg font-medium">Swaroop R Rao (231IT078)</p>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default LandingPage;
