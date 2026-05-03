app.post("/api/notify", async (req, res) => {
  const { userId, title, message } = req.body;

  // Validasi input
  if (!userId || !title || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://api.shelby.com/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SHELBY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, title, message }),
    });

    // Cek response dari Shelby
    if (!response.ok) {
      const detail = await response.text().catch(() => "(unreadable)");
      return res.status(502).json({ success: false, error: `Shelby error ${response.status}: ${detail}` });
    }

    const data = await response.json();
    res.json({ success: true, provider: "Shelby", result: data });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});