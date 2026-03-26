// Langen Lightspeed Configurator - Gemini API proxy
// GEMINI_API_KEY is set as an environment variable in Vercel - never in source code

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server' });

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json();
      return res.status(geminiRes.status).json({
        error: errData.error?.message || 'Gemini API error ' + geminiRes.status
      });
    }

    const data = await geminiRes.json();
    let imageData = null;
    let mimeType = 'image/png';

    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        const inline = part.inline_data || part.inlineData;
        if (inline) {
          imageData = inline.data;
          mimeType = inline.mime_type || inline.mimeType || 'image/png';
          break;
        }
      }
    }

    if (!imageData) return res.status(500).json({ error: 'No image returned from Gemini' });
    return res.status(200).json({ imageData, mimeType });

  } catch (err) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
