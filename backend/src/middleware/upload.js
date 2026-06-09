import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "uploads");

["images", "documents", "pdfs"].forEach((dir) => {
  const full = path.join(uploadsRoot, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const maxMb = Number(process.env.UPLOAD_MAX_MB) || 5;

function storage(subfolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadsRoot, subfolder)),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

function fileFilter(allowedMimes) {
  return (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest(`File type ${file.mimetype} not allowed`));
  };
}

export const uploadImage = multer({
  storage: storage("images"),
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp", "image/gif"]),
});

export const uploadPdf = multer({
  storage: storage("pdfs"),
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: fileFilter(["application/pdf"]),
});

export const uploadDocument = multer({
  storage: storage("documents"),
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]),
});

export { uploadsRoot };
