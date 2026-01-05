import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authentication.js";
import { uploadPhoto } from "../controllers/photoController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    return cb(null, true);
  },
});

router.post("/upload-photo", authMiddleware, upload.single("photo"), uploadPhoto);

export default router
