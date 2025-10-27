import React from 'react';

const Output = ({ imageurl }) => {
  return (
    <div className="mt-4">
      <img
        src={imageurl}
        alt="Augmented Image"
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default Output;
