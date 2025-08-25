# Shared File Storage (Cloudinary Integration)

The API now supports optional Cloudinary storage for recipe PDFs and images.

## Enable Cloudinary
Set these environment variables (Render dashboard -> Environment):

```
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=yyy
```

No code change required after setting vars; the server auto-detects and uploads new files to Cloudinary.

- PDFs uploaded with field `file` are stored as `resource_type=raw` (folder `recipes`).
- Images (recipe or category) go to folder `recipes` or `recipes/categories`.
- Stored fields:
  - `pdfPath`: local filename or Cloudinary public_id.
  - `pdfUrl`: only set when using Cloudinary (secure_url). Frontend should prefer `pdfUrl` when present.

Existing local files remain served from `/uploads/...` until replaced.

## Frontend Handling
When a recipe has `pdfUrl`, you can load it directly. Current code still calls `/api/recipe/:id` which will 302 redirect to Cloudinary for Cloud versions.

## Free Tier Notes
Cloudinary free tier should be sufficient for modest usage (check their limits). For purely free/open alternative consider:
- GitHub Releases (manual, not great for dynamic uploads)
- Supabase Storage Free Tier (requires signing up, API S3-like)
- Backblaze B2 (cost after small allowance)

Cloudinary kept for simplicity (single SDK, handles images + raw files, fast CDN).

## Local Fallback
If env vars missing, disk storage used (as before). No migration needed.
