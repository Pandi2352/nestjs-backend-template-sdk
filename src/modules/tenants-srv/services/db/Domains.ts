import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import mongoos = require("mongoose");

export interface IDomains extends mongoos.Document{
    _id: string;
    id: string;

    web_api_domain: string;
    mobile_api_domain: string;
    admin_api_domain: string;
    web_ui_domain: string;
    admin_ui_domain: string;

    // defaults
    createdAt: Date;
    updatedAt: Date;
}

export var DomainsSchema = new mongoos.Schema({
    web_api_domain: { type: String },
    mobile_api_domain: { type: String },
    admin_api_domain: { type: String },
    web_ui_domain: { type: String },
    admin_ui_domain: { type: String },


    _id :{ type: String, default: RandomNumberGenerator.getUniqueId() }
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

DomainsSchema.pre('save', function(next){
    const now = new Date();

    const document = <IDomains>this;
    if(!document._id){
        document.id = document._id = RandomNumberGenerator.getUniqueId();
    }
    document.updatedAt = now;
    if(!document.createdAt){
        document.createdAt = now;
    }

    next();
})