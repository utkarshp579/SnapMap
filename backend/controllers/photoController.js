import crypto from "crypto";
import path from "path";
import Photo from "../models/Photo.js";
import User from "../models/User.js";
import uploadToAzure from "../utils/azure.js";

const buildFileName = (originalName, clerkUserId) => {
  const ext = path.extname(originalName || "").toLowerCase();
  const safeExt = ext && ext.length <= 10 ? ext : ".jpg";
  const id = crypto.randomUUID();
  return `${clerkUserId}/${Date.now()}-${id}${safeExt}`;
};

export const uploadPhoto = async (req, res) => {
  try {
    console.log("📸 Upload photo endpoint hit");
    console.log("Request body:", req.body);
    console.log(
      "File info:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : "No file"
    );
    console.log("UserId:", req.userId);

    const { lat, lon } = req.body || {};
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: "Invalid or missing lat/lon" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Photo file is required" });
    }

    const user = await User.findOne({ clerkUserId: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }


    const fileName = buildFileName(req.file.originalname, req.userId);
    const imageUrl = await uploadToAzure(req.file.buffer, fileName);
    console.log("upload successful---URL:", imageUrl);

    const photo = await Photo.create({
      userId: user._id,
      clerkUserId: req.userId,
      imageUrl,
      location: { type: "Point", coordinates: [longitude, latitude] },
      timestamp: new Date(),
      eventId: null,
    });

    console.log("✅ Photo uploaded to MongoDB:", photo._id.toString());
    return res.status(201).json({
      status: "success",
      photoId: photo._id,
      eventId: null,
    });
  } catch (error) {
    console.error("error uploading photo", error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};
