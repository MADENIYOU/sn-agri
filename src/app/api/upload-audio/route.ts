import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'chat-audio');
    await mkdir(uploadDir, { recursive: true });

    // Save the file to the public/uploads/chat-audio directory
    const filename = `${Date.now()}-${file.name}`;
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    const fileUrl = `/uploads/chat-audio/${filename}`;

    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error('Error uploading audio file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save audio file.' });
  }
}
