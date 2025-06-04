'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [amazonUrl, setAmazonUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setResult('');
      setAmazonUrl('');
      setCoverUrl('');
    }
  };

  const analyzeImage = async () => {
    if (!preview) return;

    setLoading(true);
    setResult('');
    setAmazonUrl('');
    setCoverUrl('');

    try {
      const image = new Image();
      image.src = preview;

      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement('canvas');
      const maxSize = 512;
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await response.json();
      setResult(data.result || '');
      setAmazonUrl(data.amazonUrl || '');
      setCoverUrl(data.coverUrl || '');
    } catch (error) {
      console.error(error);
      setResult('Error analyzing image.');
    } finally {
      setLoading(false);
    }
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
        className="mb-6 w-full max-w-xs text-sm file:bg-blue-100 file:border-0 file:rounded file:px-4 file:py-2 file:cursor-pointer"
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
        <div className="mt-10 w-full max-w-4xl bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-gray-800 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Book Cover"
            className="w-32 sm:w-40 rounded shadow-md object-contain"
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2 justify-center sm:justify-start">
            📖 Recommendation
          </h2>
          <p className="text-sm text-gray-500 uppercase mb-4">Recommended by GPT-4o</p>
          <blockquote className="text-lg text-gray-700 leading-relaxed italic mb-4 prose prose-gray max-w-none mx-auto">
            <ReactMarkdown>{result}</ReactMarkdown>
          </blockquote>
      
          {amazonUrl && (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-full shadow transition"
            >
              🔗 Search on Amazon
            </a>
          )}
        </div>
      </div>
      )}

      <footer className="mt-16 text-sm text-gray-400 text-center">
        Created by <a href="https://github.com/ryanjani" className="underline hover:text-gray-600">ryanjani</a>
      </footer>
    </main>
  );
}