export default async function handler(req, res) {
  // 只允许 GET/POST 方法
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // 从请求路径提取目标路径
  const targetPath = req.url.replace('/api/proxy', '');
  const targetUrl = `https://api-inference.modelscope.cn${targetPath}`;

  try {
    // 转发请求到 ModelScope
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MODELSCOPE_API_KEY}`, // 从环境变量取 Key
        ...req.headers,
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    // 转发响应回浏览器
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

