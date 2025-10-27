import { useState } from 'react';
import API from '../api';
import Output from '../components/Output';

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MIN_ANGLE = 0;
const MAX_ANGLE = 360;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2.0;
const MIN_BRIGHTNESS = 0.1;
const MAX_BRIGHTNESS = 3.0;
const MIN_CONTRAST = 0.1;
const MAX_CONTRAST = 3.0;
const MIN_SATURATION = 0.1;
const MAX_SATURATION = 3.0;

const AUG_TYPE_BASIC = 'basic';
const AUG_TYPE_ADVANCED = 'advanced';
const OPERATION_ROTATE = 'rotate';
const OPERATION_SCALE = 'scale';
const OPERATION_FLIP = 'flip';
const DIRECTION_HORIZONTAL = 'horizontal';
const DIRECTION_VERTICAL = 'vertical';

function BasicAdvancedAugmentation() {
  const [basicImage, setBasicImage] = useState(null);
  const [augType, setAugType] = useState(AUG_TYPE_BASIC);
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);
  const [basicResultUrl, setBasicResultUrl] = useState(null);
  const [angle, setAngle] = useState(45);
  const [scaleFactor, setScaleFactor] = useState(1.5);
  const [flipDirection, setFlipDirection] = useState(DIRECTION_HORIZONTAL);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const [blur, setBlur] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [operation, setOperation] = useState(OPERATION_ROTATE);

  const handleBasicAugmentation = async () => {
    if (!basicImage) {
      alert('Please select an image');
      return;
    }

    const extension = basicImage.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      alert('Invalid file type. Please upload a PNG, JPG, or JPEG image.');
      return;
    }

    if (basicImage.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 15MB.');
      return;
    }

    setIsLoadingBasic(true);

    const formData = new FormData();
    formData.append('image', basicImage);

    if (augType === AUG_TYPE_BASIC) {
      formData.append('operation', operation);
      if (operation === OPERATION_ROTATE) {
        if (angle < MIN_ANGLE || angle > MAX_ANGLE) {
          alert(`Angle must be between ${MIN_ANGLE} and ${MAX_ANGLE} degrees.`);
          setIsLoadingBasic(false);
          return;
        }
        formData.append('angle', angle);
      } else if (operation === OPERATION_SCALE) {
        if (scaleFactor < MIN_SCALE || scaleFactor > MAX_SCALE) {
          alert(`Scale factor must be between ${MIN_SCALE} and ${MAX_SCALE}.`);
          setIsLoadingBasic(false);
          return;
        }
        formData.append('scale_factor', scaleFactor);
      } else if (operation === OPERATION_FLIP) {
        if (![DIRECTION_HORIZONTAL, DIRECTION_VERTICAL].includes(flipDirection)) {
          alert('Flip direction must be horizontal or vertical.');
          setIsLoadingBasic(false);
          return;
        }
        formData.append('direction', flipDirection);
      }
    } else {
      if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) {
        alert(`Brightness must be between ${MIN_BRIGHTNESS} and ${MAX_BRIGHTNESS}.`);
        setIsLoadingBasic(false);
        return;
      }
      if (contrast < MIN_CONTRAST || contrast > MAX_CONTRAST) {
        alert(`Contrast must be between ${MIN_CONTRAST} and ${MAX_CONTRAST}.`);
        setIsLoadingBasic(false);
        return;
      }
      if (saturation < MIN_SATURATION || saturation > MAX_SATURATION) {
        alert(`Saturation must be between ${MIN_SATURATION} and ${MAX_SATURATION}.`);
        setIsLoadingBasic(false);
        return;
      }
      formData.append('brightness', brightness);
      formData.append('contrast', contrast);
      formData.append('saturation', saturation);
      formData.append('blur', blur ? 'on' : 'off');
      formData.append('grayscale', grayscale ? 'on' : 'off');
    }

    try {
      const res = await API.post(`/augment/${augType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(res.data);
      setBasicResultUrl(url);

      localStorage.setItem('lastAugmentedImage', url);
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoadingBasic(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = basicResultUrl;
    a.download = 'augmented_image.png';
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg border overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex gap-2">
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

        <div className="p-6">
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setBasicImage(e.target.files[0]);
                setBasicResultUrl(null);
              }}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer border border-gray-300 rounded p-2"
            />
            {basicImage && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {basicImage.name}
              </p>
            )}
          </div>

          {augType === AUG_TYPE_BASIC && (
            <div className="space-y-4">
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

          {augType === AUG_TYPE_ADVANCED && (
            <div className="space-y-4">
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

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleBasicAugmentation}
              disabled={isLoadingBasic}
              className="flex-1 py-3 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingBasic ? 'Processing...' : 'Generate'}
            </button>

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

      {basicResultUrl && (
        <div className="mt-6">
          <Output imageurl={basicResultUrl} />
        </div>
      )}
    </div>
  );
}

export default BasicAdvancedAugmentation;