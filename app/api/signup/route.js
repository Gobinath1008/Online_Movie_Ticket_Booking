import fs from "fs";
import path from "path";

export async function POST(req) {
  const { username, name, email, password } = await req.json();

  const filePath = path.join(process.cwd(), "db.json");
  const fileData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(fileData);

  // ✅ Check duplicate email or username
  const existingUser = data.users.find(
    (u) => u.email === email || u.username === username
  );

  if (existingUser) {
    return Response.json(
      { success: false, message: "User already exists" },
      { status: 400 }
    );
  }

  // ✅ Create new user
  const newUser = {
    id: Date.now(),
    username,
    name,
    email,
    password,
    role: "customer", // default
  };

  data.users.push(newUser);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return Response.json({ success: true, user: newUser });
}