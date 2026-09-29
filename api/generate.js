export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "Hair Color Preview API is working!"
  });
}
