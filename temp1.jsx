import { useState } from "react";
import API from "../api";

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

      // Create a URL for preview and download later
      const url = URL.createObjectURL(res.data);
      setRandomResultUrl(url);

      // ✅ Removed auto-download (user will click Download manually)
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Random Augmentation</h3>

      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setRandomImage(e.target.files[0]);
          setRandomResultUrl(null);
        }}
        className="mb-4 block"
      />

      {/* Buttons Row */}
      <div className="flex items-center gap-4 mt-4">
        {/* Generate Button */}
        <button
          onClick={handleRandomAugmentation}
          disabled={isLoadingRandom}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
        >
          {isLoadingRandom ? "Processing..." : "Generate"}
        </button>

        {/* ✅ Download Button — appears only after generation */}
        {randomResultUrl && (
          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = randomResultUrl;
              a.download = "random_augmented_image.png";
              a.click();
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            Download
          </button>
        )}
      </div>

      {/* Image Preview */}
      {randomResultUrl && (
        <div className="mt-4">
          <img
            src={randomResultUrl}
            alt="Augmented Image"
            className="max-w-full h-auto rounded shadow"
          />
        </div>
      )}
    </div>
  );
}