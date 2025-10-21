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
    <div>
      <h3 className="text-xl font-semibold mb-4">Rotation Augmentation</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setRotateImage(e.target.files[0])}
        className="mb-4 block"
      />
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
        className="border px-2 py-1 w-20 mr-2 rounded mb-4"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleRotateAugmentation}
        disabled={isLoadingRotate}
        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingRotate ? "Processing..." : "Generate & Download"}
      </button>
    </div>
  );
}