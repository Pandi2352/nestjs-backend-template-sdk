import mongoose = require("mongoose");
import { AuthConfigsDetailsSchema, IAuthConfigsDetails } from "./AuthConfigsDetails";
import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";

export interface IAuthConfigs extends mongoose.Document {
    _id: string;
    id: string;

    domain: string;
    base_url: string;
    internal_url: string;

    public_site: IAuthConfigsDetails;
    server_to_server: IAuthConfigsDetails;
    invite_user: IAuthConfigsDetails;

    // defaults
    createdAt: Date;
    updatedAt: Date;

}

export var AuthConfigsSchema = new mongoose.Schema({
    domain: { type: String },
    base_url: { type: String },
    internal_url: { type: String },
    public_site: { type: AuthConfigsDetailsSchema },
    server_to_server: { type: AuthConfigsDetailsSchema },
    invite_user: { type: AuthConfigsDetailsSchema },

    // db defaults
    _id: { type: String, default: RandomNumberGenerator.getUniqueId },

}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

AuthConfigsSchema.pre('save', function (next) {
    const now = new Date();
    const document = <IAuthConfigs><unknown>this;
    if (!document._id) {
        document.id = document._id = RandomNumberGenerator.getUniqueId();
    }
    document.updatedAt = now;
    if (!document.createdAt) {
        document.createdAt = now;
    }
    next();
});
