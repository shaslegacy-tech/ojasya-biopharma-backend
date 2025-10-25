// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { toJSONPlugin } from "./plugins/mongoose-plugins";
import { Roles } from "./enums";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: string;
  approved?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, index: true, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, index: true, unique: true, sparse: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Roles as unknown as string[], required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// plugins
UserSchema.plugin(toJSONPlugin);

// pre-save hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(8);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err as Error);
  }
});

// instance method to compare password
UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// convenience static finder
(UserSchema.statics as any).findByUsername = async function (username: string) {
  return this.findOne({
    $or: [{ email: username.toLowerCase?.() }, { phone: username }, { name: username }],
  });
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;