// backend/services/authService.ts
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "secret";

class AuthService {
    static async register({ name, email, password, role }: { name: string; email: string; password: string; role: string }) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    return user; // return raw user, controller can handle token
  }

  static async login({ email, password }: { email: string; password: string }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return { token, user: { id: user._id, email: user.email, role: user.role, name: user.name } };
  }

  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }

  static async getUserById(id: string) {
    return User.findById(id).select('-password');
  }
}

export default AuthService;