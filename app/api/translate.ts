import type { NextApiRequest, NextApiResponse } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, source, target } = req.body;

  try {
    const response = await fetch('https://translate.argosopentech.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
