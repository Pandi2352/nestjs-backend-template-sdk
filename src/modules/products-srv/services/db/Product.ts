import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import mongoose = require("mongoose");

export interface IProduct extends mongoose.Document {
    _id: string;
    id: string;

    name: string;
    description: string;
    slug: string;
    price: number;
    category: string;

    is_active: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export var ProductSchema = new mongoose.Schema({

    _id: { type: String },

    name: { type: String, index: true, required: true },
    description: { type: String },
    slug: { type: String, unique: true },
    price: { type: Number, default: 0 },
    category: { type: String, index: true },

    is_active: { type: Boolean, default: true },

}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

ProductSchema.pre('save', function (next) {
    const now = new Date();

    const document = <IProduct>this;
    if (!document._id) {
        document.id = document._id = RandomNumberGenerator.getUniqueId();
    }
    document.updatedAt = now;
    if (!document.createdAt) {
        document.createdAt = now;
    }

    next();
});

export const CollectionName = "Product";
