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
      <div className="bg-gradient-to-br from-white to-purple-50 shadow-xl rounded-2xl p-8 border border-purple-100 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Rotation Augmentation
            </h3>
          </div>
          <p className="text-gray-600 ml-13">Generate multiple rotated variations of your image</p>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Upload Image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setRotateImage(e.target.files[0])}
              className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-indigo-600 file:text-white hover:file:from-purple-600 hover:file:to-indigo-700 file:cursor-pointer file:transition-all file:shadow-md hover:file:shadow-lg border-2 border-dashed border-purple-200 rounded-xl p-4 bg-white hover:border-purple-400 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
            {rotateImage && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">
                  ✓ {rotateImage.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Number of Images Input */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Number of Rotated Images
          </label>
          <div className="relative">
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
              className={`border-2 rounded-xl px-4 py-3 w-full font-medium text-lg transition-all focus:outline-none focus:ring-4 ${
                error 
                  ? "border-red-400 focus:ring-red-100 bg-red-50" 
                  : "border-purple-200 focus:ring-purple-100 bg-white focus:border-purple-400"
              }`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              2-360
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          {!error && (
            <p className="mt-2 text-sm text-gray-500">
              This will generate {numImages} rotated versions with {Math.round(360 / numImages)}° intervals
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleRotateAugmentation}
          disabled={isLoadingRotate}
          className="w-full mt-6 py-4 font-bold text-lg rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg relative overflow-hidden group"
        >
          {isLoadingRotate ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Generate & Download
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-purple-700">
              <p className="font-semibold mb-1">How it works</p>
              <p className="text-purple-600">The image will be rotated evenly across 360 degrees and all variations will be downloaded as a ZIP file.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}