import { useState } from "react";
import API from "../api";
import Output from "../components/Output";

export default function RandomAugmentation() {
  const [randomImage, setRandomImage] = useState(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [randomResultUrl, setRandomResultUrl] = useState(null);

  const handleRandomAugmentation = async () => {
    if (!randomImage) return alert("Please select an image");
    setIsLoadingRandom(true);

    const formData = new FormData();
    formData.append("image", randomImage);

    try {
      const res = await API.post("/augment/random", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      setRandomResultUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = "random_augmented_image.png";
      a.click();
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white to-pink-50 shadow-xl rounded-2xl p-8 border border-pink-100 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Random Augmentation
            </h3>
          </div>
          <p className="text-gray-600 ml-13">Apply random transformations to create unique variations</p>
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
              onChange={(e) => {
                setRandomImage(e.target.files[0]);
                setRandomResultUrl(null);
              }}
              className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-pink-500 file:to-purple-600 file:text-white hover:file:from-pink-600 hover:file:to-purple-700 file:cursor-pointer file:transition-all file:shadow-md hover:file:shadow-lg border-2 border-dashed border-pink-200 rounded-xl p-4 bg-white hover:border-pink-400 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-pink-100"
            />
            {randomImage && (
              <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                <p className="text-sm text-pink-700 font-medium">
                  ✓ {randomImage.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleRandomAugmentation}
          disabled={isLoadingRandom}
          className="w-full mt-4 py-4 font-bold text-lg rounded-xl text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg relative overflow-hidden group"
        >
          {isLoadingRandom ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Random Augmentation
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>

        {/* Preview Section */}
        {randomResultUrl && (
          <div className="mt-8 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-bold text-gray-800">Preview</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative border-2 border-pink-200 rounded-2xl p-4 bg-white shadow-lg">
                <Output imageurl={randomResultUrl} />
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700 font-medium">
                Augmentation complete! The image has been downloaded automatically.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-pink-50 border border-pink-100 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-pink-700">
              <p className="font-semibold mb-1">What are random augmentations?</p>
              <p className="text-pink-600">Random augmentations apply a variety of transformations like rotation, flipping, brightness adjustment, and more to create diverse training data for machine learning models.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

