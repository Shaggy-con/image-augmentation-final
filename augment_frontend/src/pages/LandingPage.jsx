import React from 'react';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-8">
        SOFTWARE ENGINEERING (IT303) <br />
        COURSE PROJECT TITLE: “WRITE THE TITLE OF YOUR COURSE PROJECT IN CAPITAL LETTERS”
      </h1>

      <div className="mb-10">
        <p className="text-lg">Carried out by</p>
        <p className="text-lg font-medium">Student-1 Name (Roll Number)</p>
        <p className="text-lg font-medium">Student-2 Name (Roll Number)</p>
        <p className="text-lg font-medium">Student-3 Name (Roll Number)</p>
      </div>

      <button
        onClick={() => (window.location.href = '/dashboard')}
        className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default LandingPage;
