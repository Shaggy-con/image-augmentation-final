import { useState } from 'react';
import API from '../api';
import Output from '../components/Output';

function RandomAugmentation() {
  const [randomImage, setRandomImage] = useState(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [randomResultUrl, setRandomResultUrl] = useState(null);

  const handleRandomAugmentation = async () => {
    if (!randomImage) {
      alert('Please select an image');
      return;
    }
    setIsLoadingRandom(true);

    const formData = new FormData();
    formData.append('image', randomImage);

    try {
      const res = await API.post('/augment/random', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(res.data);
      setRandomResultUrl(url);
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 border">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">
            Random Augmentation
          </h3>
        </div>

        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setRandomImage(e.target.files[0]);
              setRandomResultUrl(null);
            }}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pink-600 file:text-white hover:file:bg-pink-700 file:cursor-pointer border border-gray-300 rounded p-2"
          />
          {randomImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {randomImage.name}
            </p>
          )}
        </div>



        <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleRandomAugmentation}
          disabled={isLoadingRandom}
          className="w-full py-3 font-medium rounded text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingRandom ? 'Processing...' : 'Generate Random Augmentation'}
        </button>


        {randomResultUrl && (
          <button
            type="button"
            onClick={() => {
              const a = document.createElement('a');
              a.href = randomResultUrl;
              a.download = 'random_augmented_image.png';
              a.click();
            }}
            className="w-full py-3 font-medium rounded text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download
          </button>
        )}

          </div>

        

        {randomResultUrl && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            <div className="border rounded-lg p-3 bg-gray-50">
              <Output imageurl={randomResultUrl} />
            </div>
            <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
              Augmentation complete! The image has been downloaded automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RandomAugmentation;