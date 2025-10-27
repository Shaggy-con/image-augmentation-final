import { useState } from "react";
import API from "../api";

export default function RotationAugmentation() {
  const [rotateImage, setRotateImage] = useState(null);
  const [numImages, setNumImages] = useState(36);
  const [isLoadingRotate, setIsLoadingRotate] = useState(false);
  const [error, setError] = useState("");

  const handleRotateAugmentation = async () => {
    if (!rotateImage) return alert("Please select an image");
    if (numImages < 2 || numImages > 360) {
      return alert("Please enter a number between 2 and 360");
    }
    setIsLoadingRotate(true);

    const formData = new FormData();
    formData.append("image", rotateImage);
    formData.append("num_images", numImages);

    try {
      const res = await API.post("/augment/rotate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "augmented_rotated_images.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoadingRotate(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 border">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">
            Rotation Augmentation
          </h3>
        </div>

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
          {rotateImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {rotateImage.name}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-2">
            Number of Rotated Images
          </label>
          <input
            type="number"
            min={2}
            max={360}
            value={numImages}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 2 && value <= 360) {
                setNumImages(value);
                setError("");
              } else {
                setError("Please enter a number between 2 and 360");
              }
            }}
            className={`border rounded px-3 py-2 w-full ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
          
          {!error && (
            <p className="mt-2 text-sm text-gray-500">
              Will generate {numImages} images with {Math.round(360 / numImages)}° intervals
            </p>
          )}
        </div>

        <button
          onClick={handleRotateAugmentation}
          disabled={isLoadingRotate}
          className="w-full py-3 font-medium rounded text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingRotate ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Generate & Download"
          )}
        </button>

        
      </div>
    </div>
  );
}