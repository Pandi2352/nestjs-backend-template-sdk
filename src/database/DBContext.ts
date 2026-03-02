import { ConfigPathResolver, ConfigResolver, ErrorEntity, HttpStatus, LoggerHelper } from "../utils/core/CodeUtils";
import * as mongoose from "mongoose";
 import { DBModels } from "../database/DBModels";
import { ConfigSource } from "./Enums/ConfigSource";
const mongooseCon = require("mongoose");

export class DbContext {
  static connections: Map<string, DBModels> = new Map<string, DBModels>();
    static ServiceConfig: any;
  static reload(tenantKey: string) {
    this.clear(tenantKey);
    this.getContextByConfig(tenantKey);
  }

  static clear(tenantKey: string) {
    this.connections.delete(tenantKey);
  }

  static getConnectionString(tenantKey: string) {
    var connectionString = "";
    let config_source = <ConfigSource>(process.env.CONFIG_SOURCE || ConfigSource.ENV);
    if (config_source == ConfigSource.FILE) {
      let mongo_config_file_path = process.env.MONGO_CONFIG_FILE_PATH || "/configs/dbconfig/mongo.json";
      let db_config = ConfigResolver.Instance.readAsJSON(ConfigPathResolver.Instance.resolveResourcePath(mongo_config_file_path));
      //console.log("db config path", db_config.connection_string);
      LoggerHelper.Instance.info("", "db config path", {connection_string: db_config.connection_string});
      connectionString = db_config.connection_string;
    } else if (config_source == ConfigSource.ENV) {
      connectionString = process.env.mongo_connection_string || process.env.MONGO_CONNECTION_STRING || "";
    } else {
      throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "no_db_found", });
    }
    if (!connectionString) {
      throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error: "no_connection_string", });
    }
    if (connectionString.includes("{{db_name}}")) {
      connectionString = connectionString.replace("{{db_name}}", tenantKey);
    }
    if (connectionString.includes("{{ca_cert_path}}")) {
      connectionString = connectionString.replace("{{ca_cert_path}}", ConfigPathResolver.Instance.resolveResourcePath(process.env.MONGO_CONFIG_CA_CERT_PATH || "/configs/dbconfig/ca.crt"));
    }
    return connectionString;
  }

  static async getContextByConfig(tenantKey: string): Promise<DBModels> {
    if (this.connections.has(tenantKey)) {
      //database connection already exist. Return connection object
      return Promise.resolve(this.connections.get(tenantKey)!);
    } else {
      var connectionString = this.getConnectionString(tenantKey);
      try {
        let dbmodels = this.setupModels(connectionString, tenantKey);
        this.connections.set(tenantKey, dbmodels);
        return Promise.resolve(dbmodels);
      } catch (error) {
        const error_obj: any = error;
        return Promise.reject(
          new ErrorEntity({
            http_code: HttpStatus.INTERNAL_SERVER_ERROR,
            error: "error_init_db",
            internal_error: error_obj,
          })
        );
      }
    }
  }

  private static setupModels(
    connectionString: string,
    tenantKey: string
  ): DBModels {
    (mongoose as any).Promise = global.Promise;

    var dbC: mongoose.Connection = mongooseCon.createConnection(
      connectionString,
      { useNewUrlParser: true, autoIndex: true, useUnifiedTopology: true }
    );
    dbC.on("connected", function () {
      console.info("Mongoose " + tenantKey + " connection is open");
    });

    dbC.on("error", function (err: any) {
      console.info(
        "Mongoose " + tenantKey + " connection has occured " + err + " error"
      );
    });

    dbC.on("disconnected", function () {
      console.info("Mongoose " + tenantKey + " connection is disconnected");
    });

    process.on("SIGINT", function () {
      dbC.close() 
        console.info(
          "Mongoose " +
          tenantKey +
          " connection is disconnected due to application termination"
        );
        // process.exit(0)
      });

    return new DBModels(dbC);
  }
}
