// Import PropTypes for component prop validation
import PropTypes from 'prop-types';

/**
 * Output component - Displays an augmented image with responsive styling
 * @param {Object} props - Component props
 * @param {string} props.imageurl - URL of the image to display
 * @returns {JSX.Element} The image output component
 */
function Output({ imageurl }) {
  return (
    // Container with top margin for spacing
    <div className="mt-4">
      {/* Responsive image that maintains aspect ratio */}
      <img
        src={imageurl}
        alt="Augmented Image"
        className="max-w-full h-auto"
      />
    </div>
  );
}

// Component prop type definitions for validation
Output.propTypes = {
  imageurl: PropTypes.string.isRequired,
};

export default Output;
