import { RandomNumberGenerator } from "../../../../utils/core/CodeUtils";
import mongoose = require("mongoose");

export interface IS3Configs extends mongoose.Document{
    _id: string;
    id: string;
    
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;

    // defaults
    createdAt: Date;
    updatedAt: Date;
}

export var S3ConfigsSchema = new mongoose.Schema({
    accessKeyId :{ type: String },
    secretAccessKey: { type: String },
    endpoint: { type: String },

    // db defaults
    _id: { type: String, default: RandomNumberGenerator.getUniqueId }
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

S3ConfigsSchema.pre('save', function(next){
    const now = new Date();
    const document = <IS3Configs>this;
    if(!document._id){
        document.id =  document._id = RandomNumberGenerator.getUniqueId(); 
    }
    document.updatedAt = now;
    if(!document.createdAt){
        document.createdAt = now;
    }

    next();
});