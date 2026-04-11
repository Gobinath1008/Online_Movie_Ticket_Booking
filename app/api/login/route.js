import { promises as fs } from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();

    const filePath = path.join(process.cwd(), "db.json");
    const fileData = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileData);

    const user = data.users.find(
      (u) =>
        (u.email === identifier || u.username === identifier) &&
        u.password === password,
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return Response.json({ success: true, user: userWithoutPassword });
    } else {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
