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
    <div>
      <h3 className="text-xl font-semibold mb-4">Random Augmentation</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setRandomImage(e.target.files[0]);
          setRandomResultUrl(null);
        }}
        className="mb-4 block"
      />
      <button
        onClick={handleRandomAugmentation}
        disabled={isLoadingRandom}
        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingRandom ? "Processing..." : "Generate"}
      </button>
      {randomResultUrl && (
        <div className="mt-4">
          <img src={randomResultUrl} alt="Augmented Image" className="max-w-full h-auto" />
        </div>
      )}
    </div>
  );
}