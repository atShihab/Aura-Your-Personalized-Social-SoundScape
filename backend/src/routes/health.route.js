import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Aura Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
