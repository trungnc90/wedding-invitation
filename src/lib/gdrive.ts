const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "";

interface GoogleDriveFile {
  id: string;
  name: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Drive auth failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export function getGoogleDriveUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export function getGoogleDriveThumbnailUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=s400`;
}

export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; url: string; thumbnailUrl: string }> {
  const accessToken = await getAccessToken();

  const metadata = JSON.stringify({
    name: fileName,
    parents: [GOOGLE_DRIVE_FOLDER_ID],
  });

  const boundary = "wedding_upload_boundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = Buffer.concat([
    Buffer.from(
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`
    ),
    Buffer.from(fileBuffer.toString("base64")),
    Buffer.from(closeDelimiter),
  ]);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed: ${response.status} ${errorText}`);
  }

  const file = (await response.json()) as GoogleDriveFile;

  // Make the file publicly readable
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  return {
    fileId: file.id,
    url: getGoogleDriveUrl(file.id),
    thumbnailUrl: getGoogleDriveThumbnailUrl(file.id),
  };
}

export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Google Drive delete failed: ${response.status}`);
  }
}
