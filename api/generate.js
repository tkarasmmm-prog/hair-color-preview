export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'POST only',
    });
  }

  try {
    const { imageBase64, color } = req.body;

    if (!imageBase64 || !color) {
      return res.status(400).json({
        success: false,
        message: 'imageBase64 and color are required',
      });
    }

    const token = process.env.HUGGINGFACE_TOKEN;

    if (!token) {
      return res.status(500).json({
        success: false,
        message: 'Hugging Face token is not configured',
      });
    }

    const prompt =
      `Keep the same person, face, facial features, skin tone, hairstyle, hair length, background, clothing and lighting. ` +
      `Change only the hair color to ${color}. ` +
      `Make the result photorealistic and natural. ` +
      `Do not change the person's identity or hairstyle.`;

    const response = await fetch(
  'https://router.huggingface.co/fal-ai/fal-ai/flux-kontext/dev',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      image_url: imageBase64,
      sync_mode: true,
      num_images: 1,
      output_format: 'jpeg'
    }),
  }
);

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        success: false,
        message: 'Hugging Face API error',
        details: errorText,
      });
    }

    const data = await response.json();

if (
  !data.images ||
  !data.images[0] ||
  !data.images[0].url
) {
  return res.status(500).json({
    success: false,
    message: 'No generated image returned',
    details: JSON.stringify(data),
  });
}

return res.status(200).json({
  success: true,
  image: data.images[0].url,
});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
