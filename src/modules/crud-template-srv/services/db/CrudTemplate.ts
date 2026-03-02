import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import mongoose = require("mongoose");

export interface ICrudTemplate extends mongoose.Document {
    _id: string;
    id: string;

    name: string;
    description: string;
    slug: string;
    
    is_active: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export var CrudTemplateSchema = new mongoose.Schema({

    _id: { type: String },

    name: { type: String, index: true, required: true },
    description: { type: String },
    slug: { type: String, unique: true },
    
    is_active: { type: Boolean, default: true },

}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

CrudTemplateSchema.pre('save', function (next) {
    const now = new Date();

    const document = <ICrudTemplate>this;
    if (!document._id) {
        document.id = document._id = RandomNumberGenerator.getUniqueId();
    }
    document.updatedAt = now;
    if (!document.createdAt) {
        document.createdAt = now;
    }

    next();
});

export const CollectionName = "CrudTemplate";