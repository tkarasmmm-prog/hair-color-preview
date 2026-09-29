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
      message: 'Method not allowed',
    });

  }


  try {

    const {
      imageBase64,
      color
    } = req.body || {};


    if (!imageBase64 || !color) {

      return res.status(400).json({
        success: false,
        message: 'Image and hair color are required',
      });

    }


    if (
      typeof imageBase64 !== 'string' ||
      !imageBase64.startsWith('data:image/')
    ) {

      return res.status(400).json({
        success: false,
        message: 'Invalid image data',
      });

    }


    const token =
      process.env.HUGGINGFACE_TOKEN;


    if (!token) {

      console.error(
        'HUGGINGFACE_TOKEN is missing'
      );


      return res.status(500).json({
        success: false,
        message: 'AI service is not configured',
      });

    }


    const safeColors = [
      'Brown',
      'Black',
      'Blonde',
      'Red',
      'Copper',
      'Silver',
      'Pink',
      'Blue'
    ];


    if (!safeColors.includes(color)) {

      return res.status(400).json({
        success: false,
        message: 'Unsupported hair color',
      });

    }


    const prompt =
      `Preserve the exact same person's identity, face, facial features, ` +
      `skin tone, expression, pose, hairstyle, hair length, bangs, clothing, ` +
      `background, camera angle and lighting. ` +

      `Change only the visible hair color to ${color}. ` +

      `Do not change the haircut, hairstyle, face, eyes, skin, body, clothing, ` +
      `background, accessories or composition. ` +

      `Keep realistic hair texture, shadows and highlights. ` +

      `The result must look like the original photograph with only the hair color changed. ` +

      `Photorealistic professional hair dye preview.`;


    const response =
      await fetch(
        'https://router.huggingface.co/fal-ai/fal-ai/flux-kontext/dev',
        {

          method: 'POST',

          headers: {

            Authorization:
              `Bearer ${token}`,

            'Content-Type':
              'application/json',

          },


          body: JSON.stringify({

            prompt: prompt,

            image_url:
              imageBase64,

            sync_mode:
              true,

            num_images:
              1,

            output_format:
              'jpeg',

          }),

        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();


      console.error(
        'Hugging Face API error:',
        response.status,
        errorText
      );


      /*
        詳細はフロント側で
        ユーザー向け文言へ変換するため返しています。

        本番公開時はさらに
        ログ管理・レート制御等を追加予定。
      */

      return res
        .status(response.status)
        .json({

          success: false,

          message:
            'AI generation failed',

          details:
            errorText,

        });

    }


    const data =
      await response.json();


    if (
      !data.images ||
      !Array.isArray(data.images) ||
      !data.images[0] ||
      !data.images[0].url
    ) {

      console.error(
        'Unexpected AI response:',
        JSON.stringify(data)
      );


      return res.status(500).json({

        success: false,

        message:
          'No generated image returned',

      });

    }


    return res.status(200).json({

      success: true,

      image:
        data.images[0].url,

      color:
        color,

    });


  } catch (error) {

    console.error(
      'Generate API exception:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Internal generation error',

    });

  }

}
