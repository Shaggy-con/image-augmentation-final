import { useState, useEffect } from "react";
import API from "../api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("basic-advanced");
  const [basicImage, setBasicImage] = useState(null);
  const [augType, setAugType] = useState("basic");
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);
  const [basicResultUrl, setBasicResultUrl] = useState(null);
  const [angle, setAngle] = useState(45);
  const [scaleFactor, setScaleFactor] = useState(1.5);
  const [flipDirection, setFlipDirection] = useState("horizontal");
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [blur, setBlur] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [rotateImage, setRotateImage] = useState(null);
  const [numImages, setNumImages] = useState(36);
  const [isLoadingRotate, setIsLoadingRotate] = useState(false);
  const [randomImage, setRandomImage] = useState(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [randomResultUrl, setRandomResultUrl] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/auth";
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleBasicAugmentation = async () => {
    if (!basicImage) return alert("Please select an image");
    setIsLoadingBasic(true);

    const formData = new FormData();
    formData.append("image", basicImage);

    if (augType === "basic") {
      formData.append("angle", angle);
      formData.append("scale_factor", scaleFactor);
      formData.append("flip_direction", flipDirection);
    } else {
      formData.append("brightness", brightness);
      formData.append("contrast", contrast);
      formData.append("blur", blur ? "on" : "off");
      formData.append("grayscale", grayscale ? "on" : "off");
    }

    try {
      const res = await API.post(`/augment/${augType}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      setBasicResultUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${augType}_augmented_image.png`;
      a.click();
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoadingBasic(false);
    }
  };

  const handleRotateAugmentation = async () => {
    if (!rotateImage) return alert("Please select an image");
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

      {/* Tabs */}
      <div className="mb-6">
        <ul className="flex border-b border-gray-200">
          <li className="mr-1">
            <button
              onClick={() => setActiveTab("basic-advanced")}
              className={`inline-block py-2 px-4 ${
                activeTab === "basic-advanced"
                  ? "bg-white border-l border-t border-r rounded-t text-blue-700 font-semibold"
                  : "text-blue-500 hover:text-blue-800"
              }`}
            >
              Basic / Advanced
            </button>
          </li>
          <li className="mr-1">
            <button
              onClick={() => setActiveTab("rotation")}
              className={`inline-block py-2 px-4 ${
                activeTab === "rotation"
                  ? "bg-white border-l border-t border-r rounded-t text-blue-700 font-semibold"
                  : "text-blue-500 hover:text-blue-800"
              }`}
            >
              Rotation
            </button>
          </li>
          <li className="mr-1">
            <button
              onClick={() => setActiveTab("random")}
              className={`inline-block py-2 px-4 ${
                activeTab === "random"
                  ? "bg-white border-l border-t border-r rounded-t text-blue-700 font-semibold"
                  : "text-blue-500 hover:text-blue-800"
              }`}
            >
              Random
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        {activeTab === "basic-advanced" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic / Advanced Augmentation</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setBasicImage(e.target.files[0]);
                setBasicResultUrl(null);
              }}
              className="mb-4 block"
            />
            <div className="mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  value="basic"
                  checked={augType === "basic"}
                  onChange={(e) => setAugType(e.target.value)}
                />{" "}
                Basic
              </label>
              <label>
                <input
                  type="radio"
                  value="advanced"
                  checked={augType === "advanced"}
                  onChange={(e) => setAugType(e.target.value)}
                />{" "}
                Advanced
              </label>
            </div>
            {augType === "basic" && (
              <div className="mb-4 space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rotation Angle</label>
                  <input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scale Factor</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Flip Direction</label>
                  <div>
                    <label className="mr-4">
                      <input
                        type="radio"
                        value="horizontal"
                        checked={flipDirection === "horizontal"}
                        onChange={(e) => setFlipDirection(e.target.value)}
                      />{" "}
                      Horizontal
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="vertical"
                        checked={flipDirection === "vertical"}
                        onChange={(e) => setFlipDirection(e.target.value)}
                      />{" "}
                      Vertical
                    </label>
                  </div>
                </div>
              </div>
            )}
            {augType === "advanced" && (
              <div className="mb-4 space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brightness</label>
                  <input
                    type="number"
                    step="0.1"
                    value={brightness}
                    onChange={(e) => setBrightness(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contrast</label>
                  <input
                    type="number"
                    step="0.1"
                    value={contrast}
                    onChange={(e) => setContrast(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={blur}
                      onChange={(e) => setBlur(e.target.checked)}
                    />
                    <span className="ml-2">Apply Blur</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={grayscale}
                      onChange={(e) => setGrayscale(e.target.checked)}
                    />
                    <span className="ml-2">Apply Grayscale</span>
                  </label>
                </div>
              </div>
            )}
            <button
              onClick={handleBasicAugmentation}
              disabled={isLoadingBasic}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingBasic ? "Processing..." : "Generate"}
            </button>
            {basicResultUrl && (
              <div className="mt-4">
                <img src={basicResultUrl} alt="Augmented Image" className="max-w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {activeTab === "rotation" && (
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
              min={1}
              value={numImages}
              onChange={(e) => setNumImages(e.target.value)}
              className="border px-2 py-1 w-20 mr-2 rounded mb-4"
            />
            <button
              onClick={handleRotateAugmentation}
              disabled={isLoadingRotate}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingRotate ? "Processing..." : "Generate & Download"}
            </button>
          </div>
        )}

        {activeTab === "random" && (
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
        )}
      </div>
    </div>
  );
}