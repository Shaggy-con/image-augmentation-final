import { useState } from "react";
import API from "../api";
import Output from "../components/Output";

export default function BasicAdvancedAugmentation() {
  const [basicImage, setBasicImage] = useState(null);
  const [augType, setAugType] = useState("basic");
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);
  const [basicResultUrl, setBasicResultUrl] = useState(null);
  const [angle, setAngle] = useState(45);
  const [scaleFactor, setScaleFactor] = useState(1.5);
  const [flipDirection, setFlipDirection] = useState("horizontal");
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const [blur, setBlur] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [operation, setOperation] = useState("rotate");

  const handleBasicAugmentation = async () => {
    if (!basicImage) return alert("Please select an image");

    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const extension = basicImage.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      alert("Invalid file type. Please upload a PNG, JPG, or JPEG image.");
      return;
    }

    if (basicImage.size > 15 * 1024 * 1024) {
      alert("File is too large. Maximum size is 15MB.");
      return;
    }

    setIsLoadingBasic(true);

    const formData = new FormData();
    formData.append("image", basicImage);

    if (augType === "basic") {
      formData.append("operation", operation);
      if (operation === "rotate") {
        if (angle < 0 || angle > 360) {
          alert("Angle must be between 0 and 360 degrees.");
          setIsLoadingBasic(false);
          return;
        }
        formData.append("angle", angle);
      } else if (operation === "scale") {
        if (scaleFactor < 0.1 || scaleFactor > 2.0) {
          alert("Scale factor must be between 0.1 and 2.0.");
          setIsLoadingBasic(false);
          return;
        }
        formData.append("scale_factor", scaleFactor);
      } else if (operation === "flip") {
        if (!["horizontal", "vertical"].includes(flipDirection)) {
          alert("Flip direction must be horizontal or vertical.");
          setIsLoadingBasic(false);
          return;
        }
        formData.append("direction", flipDirection);
      }
    } else {
      if (brightness < 0.1 || brightness > 3.0) {
        alert("Brightness must be between 0.1 and 3.0.");
        setIsLoadingBasic(false);
        return;
      }
      if (contrast < 0.1 || contrast > 3.0) {
        alert("Contrast must be between 0.1 and 3.0.");
        setIsLoadingBasic(false);
        return;
      }
      if (saturation < 0.1 || saturation > 3.0) {
        alert("Saturation must be between 0.1 and 3.0.");
        setIsLoadingBasic(false);
        return;
      }
      formData.append("brightness", brightness);
      formData.append("contrast", contrast);
      formData.append("saturation", saturation);
      formData.append("blur", blur ? "on" : "off");
      formData.append("grayscale", grayscale ? "on" : "off");
    }

    try {
      const res = await API.post(`/augment/${augType}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      setBasicResultUrl(url);

      localStorage.setItem("lastAugmentedImage", url);
      
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoadingBasic(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = basicResultUrl;
    a.download = "augmented_image.png";
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg border overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setAugType("basic")}
              className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                augType === "basic"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setAugType("advanced")}
              className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                augType === "advanced"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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

          {augType === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rotate">Rotate</option>
                  <option value="scale">Scale</option>
                  <option value="flip">Flip</option>
                </select>
              </div>

              {operation === "rotate" && (
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

              {operation === "scale" && (
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

              {operation === "flip" && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Direction</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="horizontal"
                        checked={flipDirection === "horizontal"}
                        onChange={(e) => setFlipDirection(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Horizontal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="vertical"
                        checked={flipDirection === "vertical"}
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

          {augType === "advanced" && (
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
              onClick={handleBasicAugmentation}
              disabled={isLoadingBasic}
              className="flex-1 py-3 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingBasic ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Generate"
              )}
            </button>

            {basicResultUrl && (
              <button
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