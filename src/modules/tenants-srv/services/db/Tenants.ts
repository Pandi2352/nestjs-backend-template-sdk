import mongoose = require("mongoose");
import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import { DomainsSchema, IDomains } from "./Domains";
import { IAuthConfigs } from "./AuthConfigs";
import { IS3Configs, S3ConfigsSchema } from "./S3Configs";
import { EmailConfigsSchema, IEmailConfigs } from "./EmailConfig";
export interface ITenants extends mongoose.Document {
    _id: string;
    id: string;

    //Tenant Name
    name: string;

    //Tenant Logo
    logo: string;

    tenant_key: string;
    tenant_code: string;

    //Domains-> api_domain, ui_domain
    domains: IDomains[];

    allowed_domains: string[];
    auth_config: IAuthConfigs | IAuthConfigs[];
    business_types: string[];

    //Email Config
    email_config: IEmailConfigs;

    //AWS S3 cofig
    s3_config: IS3Configs;

    // defaults
    createdAt: Date;
    updatedAt: Date;
    __ref: string;

}

export var TenantsSchema = new mongoose.Schema({
    name: { type: String },
    logo: { type: String },
    tenant_key: { type: String, index: true },
    tenant_code: { type: String, index: true },
    business_types: { type: [String] },
    allowed_domains: { type: [String] },
    auth_config: { type: mongoose.Schema.Types.Mixed},
    s3_config: { type: S3ConfigsSchema },
    domains: { type: [DomainsSchema] },
    email_config: { type: EmailConfigsSchema },

    // db defaults
    _id: { type: String, default: RandomNumberGenerator.getUniqueId },
    __ref: { type: String, index: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

TenantsSchema.pre('save', function (next) {
    const now = new Date();
    const document = this as any;
    if (!document._id) {
        document.id = document._id = RandomNumberGenerator.getUniqueId();
    }
    document.updatedAt = now;
    if (!document.createdAt) {
        document.createdAt = now;
    }
    next();
});


export const CollectionName = "Tenants";

