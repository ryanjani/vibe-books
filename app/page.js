"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [amazonUrl, setAmazonUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const resultRef = useRef(null);

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
      const base64 = await fetch(preview)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ imageBase64: base64 }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data.result || '');
      setAmazonUrl(data.amazonUrl || '');
      setCoverUrl(data.coverUrl || '');
    } catch (error) {
      setResult('Error analyzing image.');
      setAmazonUrl('');
      setCoverUrl('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

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
        <div
          ref={resultRef}
          className="mt-10 w-full max-w-2xl bg-white/70 backdrop-blur border border-white/20 shadow-md rounded-xl p-6 text-gray-800 flex flex-col sm:flex-row gap-6 transition-opacity duration-700 ease-in opacity-100"
        >
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Book cover"
              className="w-32 h-auto object-contain rounded-lg mx-auto sm:mx-0 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-blue-900 text-center sm:text-left">
              📖 Recommendation
            </h2>
            <span className="text-xs uppercase tracking-wide text-gray-400 block mb-4 text-center sm:text-left">
              Recommended by GPT-4o
            </span>
            <div className="prose prose-lg sm:prose-xl prose-neutral max-w-none text-center sm:text-left">
              <ReactMarkdown>{result}</ReactMarkdown>
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
        </div>
      )}
    </main>
  );
}
