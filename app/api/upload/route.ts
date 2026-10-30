import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle JSON payload for base64 captured frame thumbnails
    if (contentType.includes('application/json')) {
      const { base64Data, type = 'thumbnail', filename } = await request.json();

      if (!base64Data || typeof base64Data !== 'string') {
        return NextResponse.json({ error: 'Missing base64 data' }, { status: 400 });
      }

      // Extract raw base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = Buffer.from(matches ? matches[2] : base64Data, 'base64');

      const targetFolder = type === 'video' ? 'videos' : 'thumbnails';
      const ext = matches && matches[1].includes('png') ? 'png' : 'jpg';
      const cleanName = filename
        ? filename.replace(/[^a-zA-Z0-9_-]/g, '_')
        : `frame_${Date.now()}`;
      const finalName = `upload_${Date.now()}_${cleanName}.${ext}`;

      const targetDir = path.join(process.cwd(), 'public', targetFolder);
      await fs.mkdir(targetDir, { recursive: true });

      const filePath = path.join(targetDir, finalName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/${targetFolder}/${finalName}`,
        filename: finalName,
        size: buffer.length,
      });
    }

    // Handle multipart/form-data for direct file uploads
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const specifiedType = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    const mime = file.type || '';
    const isVideo = specifiedType === 'video' || mime.startsWith('video/');
    const targetFolder = isVideo ? 'videos' : 'thumbnails';

    // Extract file extension and sanitize name
    const originalName = file.name || (isVideo ? 'video.mp4' : 'thumbnail.jpg');
    const ext = path.extname(originalName) || (isVideo ? '.mp4' : '.jpg');
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFilename = `upload_${Date.now()}_${baseName}${ext}`;

    const targetDir = path.join(process.cwd(), 'public', targetFolder);
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, finalFilename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/${targetFolder}/${finalFilename}`,
      filename: finalFilename,
      size: buffer.length,
      mimeType: mime,
    });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
