// server/routes/scoreResumeRoutes.js
import express from "express";
import fs from "fs";
import { promisify } from "util";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ works with pdf-parse@1.1.1
import axios from "axios";
import Application from "../models/Application.js";

const router = express.Router();
const readFile = promisify(fs.readFile);
// POST /api/score-resume/:applicationId
router.post("/:applicationId", async (req, res) => {
  const { applicationId } = req.params;
  console.log("=== SCORE RESUME REQUEST ===");
  console.log("Application ID:", applicationId);

  try {
    // 1️⃣ Find the application
    const application = await Application.findById(applicationId).populate(
      "job"
    );
    if (!application) {
      console.error("Application not found");
      return res.status(404).json({ error: "Application not found" });
    }

    // 2️⃣ Check resume file exists
    if (!application.resumeUrl) {
      console.error("Resume not found for this application");
      return res
        .status(400)
        .json({ error: "Resume not found for this application" });
    }

    const resumePath = `.${application.resumeUrl}`;
    console.log("Resume path:", resumePath);
    if (!fs.existsSync(resumePath)) {
      console.error("Resume file does not exist on server");
      return res
        .status(404)
        .json({ error: "Resume file does not exist on server" });
    }

    // 3️⃣ Parse PDF
    const dataBuffer = await readFile(resumePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text || "";
    if (!resumeText) {
      console.warn("Resume PDF is empty");
    }

    // 4️⃣ Check Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");
      return res
        .status(500)
        .json({ error: "Server misconfiguration: GEMINI_API_KEY missing" });
    }

    // 5️⃣ Build Gemini prompt
    const jobSkills = application.job.skillsRequired || [];
    console.log("Job skills:", jobSkills);
    const prompt = `
      You are an HR assistant. A job requires the following skills: ${jobSkills.join(
        ", "
      )}.
      Here is the applicant's resume content: ${resumeText}
      Give a score from 0 to 100 indicating how well the resume matches the required skills.
      The scoring should be strict and avoid giving 100 or 0.
      Only return the numeric score.
    `;

    // 6️⃣ Call Gemini API
    // 6️⃣ Call Gemini API
    let geminiResponse;
    try {
      const GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

      geminiResponse = await axios.post(
        `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (geminiErr) {
      console.error(
        "Error calling Gemini API:",
        geminiErr.response?.data || geminiErr.message
      );
      return res.status(500).json({ error: "Failed to call Gemini API" });
    }

    // 7️⃣ Extract score
    const scoreText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("Gemini raw score text:", scoreText);
    const score = parseInt(scoreText, 10);
    if (isNaN(score)) {
      console.warn("Gemini returned invalid score:", scoreText);
      return res
        .status(500)
        .json({ error: "Gemini API returned invalid score" });
    }

    // 8️⃣ Save score in DB
    application.score = score;
    await application.save();

    // console.log("Score saved successfully:", score);
    res.json({ message: "Score calculated successfully", score });
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Failed to calculate resume score" });
  }
});

export default router;
