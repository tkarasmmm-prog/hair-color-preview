export default function handler(req, res) {
  res.status(200).json({
    success: true,
    tokenConfigured: Boolean(process.env.HUGGINGFACE_TOKEN)
  });
}
