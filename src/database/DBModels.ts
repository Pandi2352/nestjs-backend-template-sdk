
import * as mongoose from "mongoose";

//#region start-db-import


//#region products-srv
import * as Product from "../modules/products-srv/services/db/Product";
//#endregion products-srv
//#endregion start-db-import

export class DBModels {
    //#region start-db-model-declaration    
    

    //#region products-srv
    public Product: mongoose.Model<Product.IProduct>;
    //#endregion products-srv

    //#endregion start-db-model-declaration    
     constructor(dbC: mongoose.Connection) {
        //#region start-db-model-init
        

        //#region products-srv
        this.Product = dbC.model<Product.IProduct>(Product.CollectionName, Product.ProductSchema, Product.CollectionName);
        //#endregion products-srv

        //#endregion start-db-model-init   
     }
     async getModel(modelName: string): Promise <(mongoose.Model<any>)> {
         if((this as any)[modelName]) {
            return (this as any)[modelName];
         } else {
             throw new Error(`Model ${modelName} not found!`);
         }
     }
}