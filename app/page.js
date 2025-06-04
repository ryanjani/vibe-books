'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setImageBase64(base64);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    setLoading(true);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        userPrompt: 'Recommend a book that fits the feeling of this image.',
      }),
    });
    const data = await res.json();
    console.log('GPT result:', data.result);
    setResult(data.result);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-center leading-tight text-gray-800 mb-10">
        Show me a book <br className="sm:hidden" />
        that feels like this:
      </h1>

      <input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
  className="mb-6 w-full max-w-xs text-sm text-gray-700
             file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0
             file:text-sm file:font-semibold
             file:bg-blue-100 file:text-blue-700
             hover:file:bg-blue-200"
/>

      {preview && (
        <>
          <img
            src={preview}
            alt="Uploaded"
            className="w-72 sm:w-80 rounded-xl shadow-lg mb-6"
          />
          <button
            onClick={analyzeImage}
            className="w-full max-w-xs bg-black hover:bg-gray-800 transition text-white font-medium px-6 py-3 rounded-full shadow"
          >
            {loading ? 'Thinking...' : 'Get Book Suggestion'}
          </button>
        </>
      )}

      {result && (
        <div className="mt-10 w-full max-w-2xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-blue-900 text-center">
            📖 Recommendation
          </h2>
          <div className="prose prose-lg text-center text-gray-800">
            <ReactMarkdown>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </main>
  );
}