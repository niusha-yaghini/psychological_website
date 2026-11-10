import { Router } from "express";
import { getLandingData } from "../services/landing.service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const data = await getLandingData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Landing API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load landing page data",
    });
  }
});

export default router;
