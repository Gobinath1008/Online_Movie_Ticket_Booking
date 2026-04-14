import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("image") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to prevent overriding existing images
    const uniqueFilename = `${Date.now()}-${file.name}`;
    
    // Define the path to the public/uploads directory
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, uniqueFilename);

    // Save the file to the public/uploads folder
    await writeFile(filepath, buffer);

    // Return the public URL of the uploaded image
    return NextResponse.json({ 
      message: "Success", 
      imageUrl: `/uploads/${uniqueFilename}` 
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}