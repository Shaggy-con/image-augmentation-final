import { useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [randomImage, setRandomImage] = useState(null);
  const [rotateImage, setRotateImage] = useState(null);
  const [numImages, setNumImages] = useState(36);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleRandomAugmentation = async () => {
    
    if (!randomImage) return alert("Please select an image");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", randomImage);

    try {
      const res = await API.post("/augment/random", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // important for files
      });

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "random_augmented_image.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotateAugmentation = async () => {
    if (!rotateImage) return alert("Please select an image");
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  if (!token) {
    window.location.href = "/";
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
        >
          Logout
        </button>
      </div>

      <div className="space-y-8">
        {/* Random Augmentation */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Random Augmentation</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRandomImage(e.target.files[0])}
            className="mb-2"
          />
          <button
            onClick={handleRandomAugmentation}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Generate"}
          </button>
        </div>

        {/* Rotate Augmentation */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Rotate & Zip</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRotateImage(e.target.files[0])}
            className="mb-2"
          />
          <input
            type="number"
            min={1}
            value={numImages}
            onChange={(e) => setNumImages(e.target.value)}
            className="border px-2 py-1 w-20 mr-2 rounded"
          />
          <button
            onClick={handleRotateAugmentation}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Generate & Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
