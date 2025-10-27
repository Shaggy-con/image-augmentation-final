import PropTypes from 'prop-types';

function Output({ imageurl }) {
  return (
    <div className="mt-4">
      <img
        src={imageurl}
        alt="Augmented Image"
        className="max-w-full h-auto"
      />
    </div>
  );
}

Output.propTypes = {
  imageurl: PropTypes.string.isRequired,
};

export default Output;
