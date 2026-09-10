import { getStore } from "@netlify/blobs";

import { getAuth0, isAuth0Configured } from "@/lib/auth0";

const MAX_FILES_PER_DAY = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function responseError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload";
}

function getDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(request: Request) {
  if (!isAuth0Configured()) {
    return responseError("Sign-in is required for file uploads.", 401);
  }

  const session = await getAuth0().getSession();
  const userId = session?.user?.sub;

  if (!userId) {
    return responseError("Sign-in is required for file uploads.", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return responseError("Choose a file to upload.", 400);
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return responseError("Files must be larger than 0 bytes and no bigger than 10 MB.", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return responseError("This file type is not supported. Upload an image, PDF, text, CSV, JSON, Word, or Excel file.", 415);
  }

  const dateKey = getDateKey();
  const userKey = encodeURIComponent(userId);
  const store = getStore("alvionbot-uploads");
  const prefix = `${dateKey}/${userKey}/`;
  const { blobs } = await store.list({ prefix });

  if (blobs.length >= MAX_FILES_PER_DAY) {
    return responseError("Daily upload limit reached. You can upload up to 5 files per day.", 429);
  }

  const key = `${prefix}${crypto.randomUUID()}-${safeFileName(file.name)}`;
  await store.set(key, file, {
    metadata: {
      userId,
      fileName: file.name,
      contentType: file.type,
      size: String(file.size),
      uploadedAt: new Date().toISOString(),
    },
  });

  return Response.json({
    success: true,
    fileName: file.name,
    remaining: MAX_FILES_PER_DAY - blobs.length - 1,
  });
}
