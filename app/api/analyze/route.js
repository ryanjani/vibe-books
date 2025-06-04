// app/api/your-route-name/route.js (or wherever your file is located)
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { imageBase64, userPrompt } = await req.json();

    // Log the received request body (optional, but can be useful)
    console.log('Received request with imageBase64 (first 50 chars):', imageBase64 ? imageBase64.substring(0, 50) + '...' : 'No imageBase64', 'and userPrompt:', userPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  userPrompt ||
                  'Recommend 1–2 books that match the mood or feeling of this image. Put the book title in double quotes, and make the full title and author bold like this: **"Charlotte\'s Web" by E.B. White**.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error status:', response.status);
      console.error('OpenAI API error response data:', data);
      return NextResponse.json(
        { result: 'OpenAI error occurred. Check server logs for details.', amazonUrl: '' },
        { status: response.status || 500 }
      );
    }

    const message = data.choices?.[0]?.message?.content || 'No result found.';
    console.log('OpenAI raw message content:', message);

    // --- CORRECTED REGEX ---
    const match = message.match(/"([^"]+)"/); // Look for "Title"
    console.log('Regex match result (match):', match);

    const searchTerm = match ? match[1] : ''; // match[1] will be the content inside the quotes
    console.log('Extracted searchTerm:', searchTerm);

    const amazonUrl = searchTerm
      ? `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`
      : '';
    console.log('Generated amazonUrl:', amazonUrl);

    return NextResponse.json({
      result: message,
      amazonUrl,
    });

  } catch (err) {
    console.error('Server-side catch error:', err);
    return NextResponse.json(
      { result: 'Server error. Check server logs for details.', amazonUrl: '' },
      { status: 500 }
    );
  }
}