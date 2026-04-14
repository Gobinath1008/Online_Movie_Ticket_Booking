import { NextResponse } from "next/server";
import { readdir, unlink } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const files = await readdir(uploadDir);
    const images = files.map((filename) => ({
      filename,
      url: `/uploads/${filename}`,
    }));
    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error reading uploads directory:", error);
    return NextResponse.json({ error: "Error reading uploads" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, filename);

    await unlink(filepath);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}