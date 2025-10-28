// Import React hooks for state management
import { useState } from 'react';
import API from '../api';

// Constants for rotation augmentation validation
const MIN_IMAGES = 2; // Minimum number of rotated images to generate
const MAX_IMAGES = 360; // Maximum number of rotated images to generate
const DEFAULT_NUM_IMAGES = 36; // Default number of images (10-degree intervals)

/**
 * RotationAugmentation component - Handles rotation-based image augmentation
 * Allows users to upload an image and generate multiple rotated versions
 * @returns {JSX.Element} The rotation augmentation interface
 */
function RotationAugmentation() {
  // State management for rotation augmentation
  const [rotateImage, setRotateImage] = useState(null); // Uploaded image file
  const [numImages, setNumImages] = useState(DEFAULT_NUM_IMAGES); // Number of images to generate
  const [isLoadingRotate, setIsLoadingRotate] = useState(false); // Loading state for processing
  const [error, setError] = useState(''); // Error message state

  /**
   * Handles rotation augmentation API call
   * Uploads image to server and processes multiple rotated versions
   * Downloads result as a zip file containing all rotated images
   */
  const handleRotateAugmentation = async () => {
    // Validate image selection
    if (!rotateImage) {
      alert('Please select an image');
      return;
    }
    // Validate number of images range
    if (numImages < MIN_IMAGES || numImages > MAX_IMAGES) {
      alert(`Please enter a number between ${MIN_IMAGES} and ${MAX_IMAGES}`);
      return;
    }
    setIsLoadingRotate(true);

    // Prepare form data for API request
    const formData = new FormData();
    formData.append('image', rotateImage);
    formData.append('num_images', numImages);

    try {
      // Make API call to rotation augmentation endpoint
      const res = await API.post('/augment/rotate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expect binary response (zip file)
      });

      // Create download link for zip file
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'augmented_rotated_images.zip';
      a.click();
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(url);
    } catch (err) {
      // Handle API errors
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoadingRotate(false);
    }
  };

  return (
    // Container with centered layout and max width
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 border">
        {/* Section header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">
            Rotation Augmentation
          </h3>
        </div>

        {/* File upload section */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRotateImage(e.target.files[0])}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer border border-gray-300 rounded p-2"
          />
          {/* Display selected file name */}
          {rotateImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {rotateImage.name}
            </p>
          )}
        </div>

        {/* Number input section for image count */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-2">
            Number of Rotated Images
          </label>
          <input
            type="number"
            min={MIN_IMAGES}
            max={MAX_IMAGES}
            value={numImages}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              // Validate input range and update state
              if (value >= MIN_IMAGES && value <= MAX_IMAGES) {
                setNumImages(value);
                setError('');
              } else {
                setError(`Please enter a number between ${MIN_IMAGES} and ${MAX_IMAGES}`);
              }
            }}
            // Dynamic styling based on validation state
            className={`border rounded px-3 py-2 w-full ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          
          {/* Error message display */}
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
          
          {/* Helper text showing rotation intervals */}
          {!error && (
            <p className="mt-2 text-sm text-gray-500">
              Will generate {numImages} images with {Math.round(MAX_IMAGES / numImages)}° intervals
            </p>
          )}
        </div>

        {/* Generate and download button */}
        <button
          type="button"
          onClick={handleRotateAugmentation}
          disabled={isLoadingRotate}
          className="w-full py-3 font-medium rounded text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingRotate ? 'Processing...' : 'Generate & Download'}
        </button>
      </div>
    </div>
  );
}

export default RotationAugmentation;