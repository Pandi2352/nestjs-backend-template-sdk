import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import mongoose = require("mongoose");

export interface IEmailConfigs extends mongoose.Document{
    _id: string;
    id: string;
    
    client_id: string ;
    client_secret:string ;
    from: string ;
    host_name: string ;
    host_port: number ;
    provider: string ;

    // defaults
    createdAt: Date;
    updatedAt: Date;
}

export var EmailConfigsSchema = new mongoose.Schema({
    
    client_id: { type: String },
    client_secret:{ type: String },
    from: { type: String },
    host_name: { type: String },
    host_port: { type: Number },
    provider:{ type: String },

    // db defaults
    _id: { type: String, default: RandomNumberGenerator.getUniqueId }
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

EmailConfigsSchema.pre('save', function(next){
    const now = new Date();
    const document = <IEmailConfigs>this;
    if(!document._id){
        document.id =  document._id = RandomNumberGenerator.getUniqueId(); 
    }
    document.updatedAt = now;
    if(!document.createdAt){
        document.createdAt = now;
    }

    next();
});