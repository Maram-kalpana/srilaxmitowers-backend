import path from "path";
import uploadRepository from "../repositories/upload.repository.js";

const uploadService = {
  async saveFile(file, uploadType, userId) {
    const filePath = `/uploads/${uploadType === "image" ? "images" : uploadType === "pdf" ? "pdfs" : "documents"}/${file.filename}`;
    const record = await uploadRepository.create({
      original_name: file.originalname,
      stored_name: file.filename,
      mime_type: file.mimetype,
      file_size: file.size,
      file_path: filePath,
      upload_type: uploadType,
      uploaded_by: userId || null,
    });
    return {
      id: record.id,
      url: filePath,
      originalName: record.original_name,
      mimeType: record.mime_type,
      size: record.file_size,
    };
  },
};

export default uploadService;
