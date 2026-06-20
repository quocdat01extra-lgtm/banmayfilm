import multer from 'multer';

// Use memory storage to temporarily hold files before uploading to Supabase
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit 10MB per file
  }
});
