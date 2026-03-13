// api/proxy.js
export default async function handler(req, res) {
  // 只允许 POST/GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从请求路径中提取 ModelScope 真实路径
  // 例如 /api/proxy/v1/images/generations → /v1/images/generations
  const targetPath = req.url.replace(/^\/api\/proxy/, '');
  const targetUrl = `https://api-inference.modelscope.cn${targetPath}`;

  try {
    // 转发请求到 ModelScope
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MODELSCOPE_API_KEY}`,
      },
    };

    // 如果是 POST，带上 body
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // 把 ModelScope 的响应原样返回给前端
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 告诉 Vercel 这是一个 Edge Function（可选，更稳定）
export const config = {
  runtime: 'edge',
};

