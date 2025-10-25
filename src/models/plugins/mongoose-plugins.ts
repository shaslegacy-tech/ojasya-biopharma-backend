// src/models/plugins/mongoose-plugins.ts
import { Schema } from "mongoose";

export const toJSONPlugin = (schema: Schema) => {
  // convert _id to id, remove __v and password, remove deletedAt if soft deleted
  if (!schema.options.toJSON) schema.options.toJSON = {};
  const orig = schema.options.toJSON.transform;
  schema.options.toJSON.transform = function (doc: any, ret: any, options: any) {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    if (ret.password) delete ret.password;
    if (ret.deletedAt) delete ret.deletedAt;
    if (typeof orig === "function") return orig(doc, ret, options);
    return ret;
  };
};

export const softDeletePlugin = (schema: Schema) => {
  schema.add({ deletedAt: { type: Date, default: null } });
  schema.methods.softDelete = async function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).deletedAt = new Date();
    return this.save();
  };
  schema.statics.findActive = function (filter: any = {}) {
    return this.find({ deletedAt: null, ...filter });
  };
};