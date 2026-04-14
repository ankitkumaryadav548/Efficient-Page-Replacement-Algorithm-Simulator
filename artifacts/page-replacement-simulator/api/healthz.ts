import { HealthCheckResponse } from "@workspace/api-zod";

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.status(200).json(data);
}