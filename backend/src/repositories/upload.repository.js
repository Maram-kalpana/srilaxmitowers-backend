import { query, queryOne } from "../config/db.js";

const uploadRepository = {
  async create(data) {
    const result = await query(
      `INSERT INTO uploads (original_name, stored_name, mime_type, file_size, file_path, upload_type, uploaded_by)
       VALUES (:original_name, :stored_name, :mime_type, :file_size, :file_path, :upload_type, :uploaded_by)`,
      data
    );
    return queryOne(`SELECT * FROM uploads WHERE id = :id`, { id: result.insertId });
  },

  async findById(id) {
    return queryOne(`SELECT * FROM uploads WHERE id = :id`, { id });
  },
};

export default uploadRepository;
