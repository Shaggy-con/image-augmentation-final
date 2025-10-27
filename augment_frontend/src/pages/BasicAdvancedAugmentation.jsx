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

    // Validate file type
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const extension = basicImage.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      alert("Invalid file type. Please upload a PNG, JPG, or JPEG image.");
      return;
    }

    // Validate file size (15MB)
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
      formData.append("saturation", saturation); // Added
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

  return (
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
            <label className="block text-sm font-medium text-gray-700">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            >
              <option value="rotate">Rotate</option>
              <option value="scale">Scale</option>
              <option value="flip">Flip</option>
            </select>
          </div>
          {operation === "rotate" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Rotation Angle (0–360)</label>
              <input
                type="number"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
          )}
          {operation === "scale" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Scale Factor (0.1–2.0)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="2.0"
                value={scaleFactor}
                onChange={(e) => setScaleFactor(Number(e.target.value))}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
          )}
          {operation === "flip" && (
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
          )}
        </div>
      )}
      {augType === "advanced" && (
        <div className="mb-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Brightness (0.1–3.0)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="border px-2 py-1 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contrast (0.1–3.0)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="border px-2 py-1 rounded w-full"
            />
          </div>
          <div> {/* Added saturation input */}
            <label className="block text-sm font-medium text-gray-700">Saturation (0.1–3.0)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
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
      <button>
        This is button
      </button>
      {basicResultUrl && (
        <Output basicResultUrl={basicResultUrl} />
      )}
    </div>
  );
}