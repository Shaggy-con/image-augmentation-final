// Import React hooks for state management
import { useState } from 'react';
import API from '../api';
import Output from '../components/Output';

// Constants for file validation
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg']; // Supported image formats
const MAX_FILE_SIZE = 15 * 1024 * 1024; // Maximum file size (15MB)

// Constants for basic augmentation parameters
const MIN_ANGLE = 0;
const MAX_ANGLE = 360;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2.0;

// Constants for advanced augmentation parameters
const MIN_BRIGHTNESS = 0.1;
const MAX_BRIGHTNESS = 3.0;
const MIN_CONTRAST = 0.1;
const MAX_CONTRAST = 3.0;
const MIN_SATURATION = 0.1;
const MAX_SATURATION = 3.0;

// Constants for augmentation types and operations
const AUG_TYPE_BASIC = 'basic';
const AUG_TYPE_ADVANCED = 'advanced';
const OPERATION_ROTATE = 'rotate';
const OPERATION_SCALE = 'scale';
const OPERATION_FLIP = 'flip';
const DIRECTION_HORIZONTAL = 'horizontal';
const DIRECTION_VERTICAL = 'vertical';

/**
 * BasicAdvancedAugmentation component - Handles comprehensive image augmentation
 * Provides both basic operations (rotate, scale, flip) and advanced adjustments
 * @returns {JSX.Element} The basic/advanced augmentation interface
 */
function BasicAdvancedAugmentation() {
  // State management for image and processing
  const [basicImage, setBasicImage] = useState(null); // Uploaded image file
  const [augType, setAugType] = useState(AUG_TYPE_BASIC); // Augmentation type (basic/advanced)
  const [isLoadingBasic, setIsLoadingBasic] = useState(false); // Loading state for processing
  const [basicResultUrl, setBasicResultUrl] = useState(null); // URL of augmented result

  // State for basic augmentation parameters
  const [angle, setAngle] = useState(45); // Rotation angle in degrees
  const [scaleFactor, setScaleFactor] = useState(1.5); // Scale factor for resizing
  const [flipDirection, setFlipDirection] = useState(DIRECTION_HORIZONTAL); // Flip direction

  // State for advanced augmentation parameters
  const [brightness, setBrightness] = useState(1.0); // Brightness adjustment
  const [contrast, setContrast] = useState(1.0); // Contrast adjustment
  const [saturation, setSaturation] = useState(1.0); // Saturation adjustment
  const [blur, setBlur] = useState(false); // Blur effect toggle
  const [grayscale, setGrayscale] = useState(false); // Grayscale effect toggle

  // State for current operation selection
  const [operation, setOperation] = useState(OPERATION_ROTATE);

  /**
   * Handles basic/advanced augmentation API call
   * Validates inputs, prepares form data, and processes augmentation
   */
  const handleBasicAugmentation = async () => {
    // Validate image selection
    if (!basicImage) {
      alert('Please select an image');
      return;
    }

    // Validate file extension
    const extension = basicImage.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      alert('Invalid file type. Please upload a PNG, JPG, or JPEG image.');
      return;
    }

    // Validate file size
    if (basicImage.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 15MB.');
      return;
    }

    setIsLoadingBasic(true);

    // Prepare form data for API request
    const formData = new FormData();
    formData.append('image', basicImage);

    // Handle basic augmentation parameters
    if (augType === AUG_TYPE_BASIC) {
      formData.append('operation', operation);
      
      // Rotation operation validation and parameters
      if (operation === OPERATION_ROTATE) {
        if (angle < MIN_ANGLE || angle > MAX_ANGLE) {
          alert(`Angle must be between ${MIN_ANGLE} and ${MAX_ANGLE} degrees.`);
          setIsLoadingBasic(false);
          return;
        }
        formData.append('angle', angle);
      } 
      // Scale operation validation and parameters
      else if (operation === OPERATION_SCALE) {
        if (scaleFactor < MIN_SCALE || scaleFactor > MAX_SCALE) {
          alert(`Scale factor must be between ${MIN_SCALE} and ${MAX_SCALE}.`);
          setIsLoadingBasic(false);
          return;
        }
        formData.append('scale_factor', scaleFactor);
      } 
      // Flip operation validation and parameters
      else if (operation === OPERATION_FLIP) {
        if (![DIRECTION_HORIZONTAL, DIRECTION_VERTICAL].includes(flipDirection)) {
          alert('Flip direction must be horizontal or vertical.');
          setIsLoadingBasic(false);
          return;
        }
        formData.append('direction', flipDirection);
      }
    } 
    // Handle advanced augmentation parameters
    else {
      // Brightness validation
      if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) {
        alert(`Brightness must be between ${MIN_BRIGHTNESS} and ${MAX_BRIGHTNESS}.`);
        setIsLoadingBasic(false);
        return;
      }
      // Contrast validation
      if (contrast < MIN_CONTRAST || contrast > MAX_CONTRAST) {
        alert(`Contrast must be between ${MIN_CONTRAST} and ${MAX_CONTRAST}.`);
        setIsLoadingBasic(false);
        return;
      }
      // Saturation validation
      if (saturation < MIN_SATURATION || saturation > MAX_SATURATION) {
        alert(`Saturation must be between ${MIN_SATURATION} and ${MAX_SATURATION}.`);
        setIsLoadingBasic(false);
        return;
      }
      // Add advanced parameters to form data
      formData.append('brightness', brightness);
      formData.append('contrast', contrast);
      formData.append('saturation', saturation);
      formData.append('blur', blur ? 'on' : 'off');
      formData.append('grayscale', grayscale ? 'on' : 'off');
    }

    try {
      // Make API call to appropriate augmentation endpoint
      const res = await API.post(`/augment/${augType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include auth token
        },
        responseType: 'blob', // Expect binary response (image)
      });

      // Create object URL from blob response
      const url = URL.createObjectURL(res.data);
      setBasicResultUrl(url);

      // Store result in localStorage for persistence
      localStorage.setItem('lastAugmentedImage', url);
    } catch (err) {
      // Handle API errors
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoadingBasic(false);
    }
  };

  /**
   * Handles download of the augmented image
   * Creates download link programmatically and triggers click
   */
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = basicResultUrl;
    a.download = 'augmented_image.png';
    a.click();
  };

  return (
    // Main container with centered layout and max width
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg border overflow-hidden">
        {/* Tab switcher for Basic/Advanced modes */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex gap-2">
            {/* Basic mode tab */}
            <button
              type="button"
              onClick={() => setAugType(AUG_TYPE_BASIC)}
              className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                augType === AUG_TYPE_BASIC
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Basic
            </button>
            {/* Advanced mode tab */}
            <button
              type="button"
              onClick={() => setAugType(AUG_TYPE_ADVANCED)}
              className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                augType === AUG_TYPE_ADVANCED
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-6">
          {/* File upload section */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setBasicImage(e.target.files[0]);
                setBasicResultUrl(null); // Clear previous result on new file selection
              }}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer border border-gray-300 rounded p-2"
            />
            {/* Display selected file name */}
            {basicImage && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {basicImage.name}
              </p>
            )}
          </div>

          {/* Basic augmentation controls - shown only in basic mode */}
          {augType === AUG_TYPE_BASIC && (
            <div className="space-y-4">
              {/* Operation selector */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={OPERATION_ROTATE}>Rotate</option>
                  <option value={OPERATION_SCALE}>Scale</option>
                  <option value={OPERATION_FLIP}>Flip</option>
                </select>
              </div>

              {/* Rotation angle input - shown only for rotate operation */}
              {operation === OPERATION_ROTATE && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Angle (0-360°)</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Scale factor input - shown only for scale operation */}
              {operation === OPERATION_SCALE && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Scale Factor (0.1-2.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="2.0"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Flip direction radio buttons - shown only for flip operation */}
              {operation === OPERATION_FLIP && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Direction</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={DIRECTION_HORIZONTAL}
                        checked={flipDirection === DIRECTION_HORIZONTAL}
                        onChange={(e) => setFlipDirection(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Horizontal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={DIRECTION_VERTICAL}
                        checked={flipDirection === DIRECTION_VERTICAL}
                        onChange={(e) => setFlipDirection(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Vertical</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced augmentation controls - shown only in advanced mode */}
          {augType === AUG_TYPE_ADVANCED && (
            <div className="space-y-4">
              {/* Brightness adjustment input */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Brightness (0.1-3.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contrast adjustment input */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Contrast (0.1-3.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Saturation adjustment input */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Saturation (0.1-3.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Effect toggles for blur and grayscale */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={blur}
                    onChange={(e) => setBlur(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Apply Blur</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={grayscale}
                    onChange={(e) => setGrayscale(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Grayscale</span>
                </label>
              </div>
            </div>
          )}

          {/* Action buttons container */}
          <div className="flex gap-3 mt-6">
            {/* Generate augmentation button */}
            <button
              type="button"
              onClick={handleBasicAugmentation}
              disabled={isLoadingBasic}
              className="flex-1 py-3 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingBasic ? 'Processing...' : 'Generate'}
            </button>

            {/* Download button - shown only when result is available */}
            {basicResultUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3 font-medium rounded text-white bg-green-600 hover:bg-green-700"
              >
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result preview section - shown when augmentation is complete */}
      {basicResultUrl && (
        <div className="mt-6">
          <Output imageurl={basicResultUrl} />
        </div>
      )}
    </div>
  );
}

export default BasicAdvancedAugmentation;