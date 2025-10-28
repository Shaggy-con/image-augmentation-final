// Import React hooks for state management
import { useState } from 'react';
import API from '../api';
import Output from '../components/Output';

/**
 * RandomAugmentation component - Handles random image augmentation operations
 * Allows users to upload an image and apply random augmentation effects
 * @returns {JSX.Element} The random augmentation interface
 */
function RandomAugmentation() {
  // State management for random augmentation
  const [randomImage, setRandomImage] = useState(null); // Uploaded image file
  const [isLoadingRandom, setIsLoadingRandom] = useState(false); // Loading state for processing
  const [randomResultUrl, setRandomResultUrl] = useState(null); // URL of augmented result

  /**
   * Handles random augmentation API call
   * Uploads image to server and processes random augmentation
   */
  const handleRandomAugmentation = async () => {
    // Validate image selection
    if (!randomImage) {
      alert('Please select an image');
      return;
    }
    setIsLoadingRandom(true);

    // Prepare form data for API request
    const formData = new FormData();
    formData.append('image', randomImage);

    try {
      // Make API call to random augmentation endpoint
      const res = await API.post('/augment/random', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expect binary response (image)
      });

      // Create object URL from blob response
      const url = URL.createObjectURL(res.data);
      setRandomResultUrl(url);
    } catch (err) {
      // Handle API errors
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    // Container with centered layout and max width
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 border">
        {/* Section header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">
            Random Augmentation
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
            onChange={(e) => {
              setRandomImage(e.target.files[0]);
              setRandomResultUrl(null); // Clear previous result on new file selection
            }}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pink-600 file:text-white hover:file:bg-pink-700 file:cursor-pointer border border-gray-300 rounded p-2"
          />
          {/* Display selected file name */}
          {randomImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {randomImage.name}
            </p>
          )}
        </div>

        {/* Action buttons container */}
        <div className="flex space-x-2">
          {/* Generate augmentation button */}
          <button
            type="button"
            onClick={handleRandomAugmentation}
            disabled={isLoadingRandom}
            className="w-full py-3 font-medium rounded text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingRandom ? 'Processing...' : 'Generate Random Augmentation'}
          </button>

          {/* Download button - shown only when result is available */}
          {randomResultUrl && (
            <button
              type="button"
              onClick={() => {
                // Create download link programmatically
                const a = document.createElement('a');
                a.href = randomResultUrl;
                a.download = 'random_augmented_image.png';
                a.click();
              }}
              className="w-full py-3 font-medium rounded text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download
            </button>
          )}
        </div>

        {/* Result preview section - shown when augmentation is complete */}
        {randomResultUrl && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            {/* Output container with border and background */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <Output imageurl={randomResultUrl} />
            </div>
            {/* Success message */}
            <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
              Augmentation complete! The image has been downloaded automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RandomAugmentation;