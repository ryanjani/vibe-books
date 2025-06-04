import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { imageBase64, userPrompt } = await req.json();

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
                  'Recommend 1–2 books that match the mood or feeling of this image. Format the title and author in **bold**, and use straight double quotes (") around the book title.',
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
      console.error('OpenAI error:', data);
      return NextResponse.json(
        { result: 'OpenAI error occurred.' },
        { status: 500 }
      );
    }

    const message = data.choices?.[0]?.message?.content || 'No result found.';

    // Extract book title from bolded markdown format: **"Title" by Author**
    const match = message.match(/\*\*"([^"]+)"/);
    const searchTerm = match ? match[1] : '';
    const amazonUrl = searchTerm
      ? `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`
      : '';

    // Try to get cover image from Google Books
    let coverUrl = '';
    if (searchTerm) {
      try {
        const bookRes = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(searchTerm)}`
        );
        const bookData = await bookRes.json();
        coverUrl =
          bookData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || '';
      } catch (err) {
        console.error('Cover fetch error:', err);
      }
    }

    return NextResponse.json({
      result: message,
      amazonUrl,
      coverUrl,
    });

  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ result: 'Server error.' }, { status: 500 });
  }
}