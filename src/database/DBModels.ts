
import * as mongoose from "mongoose";

//#region start-db-import


//#region crud-template-srv
import * as CrudTemplate from "../modules/crud-template-srv/services/db/CrudTemplate";
//#endregion crud-template-srv
//#region tenants-srv
import * as Tenants from "../modules/tenants-srv/services/db/Tenants";
//#endregion tenants-srv
//#endregion start-db-import

export class DBModels {
    //#region start-db-model-declaration    
    

    //#region crud-template-srv
    public CrudTemplate: mongoose.Model<CrudTemplate.ICrudTemplate>;
    //#endregion crud-template-srv
    //#region tenants-srv
    public Tenants: mongoose.Model<Tenants.ITenants>;
    //#endregion tenants-srv

    //#endregion start-db-model-declaration    
     constructor(dbC: mongoose.Connection) {
        //#region start-db-model-init
        

        //#region crud-template-srv
        this.CrudTemplate = dbC.model<CrudTemplate.ICrudTemplate>(CrudTemplate.CollectionName, CrudTemplate.CrudTemplateSchema, CrudTemplate.CollectionName);
        //#endregion crud-template-srv
        //#region tenants-srv
        this.Tenants = dbC.model<Tenants.ITenants>(Tenants.CollectionName, Tenants.TenantsSchema, Tenants.CollectionName);
        //#endregion tenants-srv

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