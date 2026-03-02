import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import mongoose = require("mongoose");

export interface IAuthConfigsDetails extends mongoose.Document {
    _id: string;
    id: string;

    client_id: string;
    client_secret: string;
    scopes: string[];
    redirect_uri: string;
    response_type: string;
    extra_authz_config: any;

    // defaults
    createdAt: Date;
    updatedAt: Date;

}

export var AuthConfigsDetailsSchema = new mongoose.Schema({
    client_id: { type: String },
    client_secret: { type: String },
    scopes: { type: [String] },
    redirect_uri: { type: String },
    response_type: { type: String },
    extra_authz_config: {},

    // db defaults
    _id: { type: String, default: RandomNumberGenerator.getUniqueId }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

AuthConfigsDetailsSchema.pre('save', function (next) {
    const now = new Date();
    const document = <IAuthConfigsDetails>this;
    if (!document._id) {
        document.id = document._id = RandomNumberGenerator.getUniqueId();
    }
    document.updatedAt = now;
    if (!document.createdAt) {
        document.createdAt = now;
    }
    next();
});
