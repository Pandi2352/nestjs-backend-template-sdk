import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join as joinPath, resolve as resolvePath } from "path";
class GenerateCollectionRef {
  run() {
    const collection_name_delimiter = "export const CollectionName =";
    const collection_path = "../../src/modules";
    const contection_template_path = "./db-context-template";

    const contection_context_file_path = "../../src/database/DBModels.ts";
    const contection_context_file_module_ref_path = "../modules";

    let contection_template = readFileSync(
      resolvePath(contection_template_path),
      "utf8"
    );

    const services = readdirSync(resolvePath(collection_path)).filter(
      (c) => c != ".DS_Store"
    );
    const services_template:any = {};

    for (const servicename of services) {
      const service_ref_path = joinPath(servicename, "services", "db");
      const db_folder_name = joinPath(collection_path, service_ref_path);
      if (!existsSync(db_folder_name)) {
        console.log("skipping... no collections in " + servicename);
        continue;
      }
      const collection_names = readdirSync(resolvePath(db_folder_name)).filter((c) => c != ".DS_Store");

      for (const collection_filename of collection_names) {
        console.log(collection_filename);
        const collection_path = joinPath(db_folder_name, collection_filename);


        const file_content = readFileSync(resolvePath(collection_path), "utf8");

        if (file_content.includes(collection_name_delimiter)) {
          let file_content_split = file_content
            .split("\n")
            .find((c) => c.trim().startsWith(collection_name_delimiter));
          if (file_content_split) {
            file_content_split = file_content_split
              .replace(collection_name_delimiter, "")
              .trim();
            file_content_split = file_content_split.replace(";", "");
            const collection_name = file_content_split.split('"').join("");

            const collection_ref_path = joinPath(service_ref_path, collection_name);

            if (!services_template[servicename]) {
              services_template[servicename] = [];
            }

            const tem: any = {
              collection_name: collection_name,
              collection_path: joinPath(contection_context_file_module_ref_path, collection_ref_path),
            };

            services_template[servicename].push(tem);
          }
        }


      }
    }

    let import_statement = "\n";
    let initiate_statement = "\n";
    let declaration_statement = "\n";

    for (const services_template_obj_key of Object.keys(services_template)) {

      const srv_objs = services_template[services_template_obj_key];
      import_statement =
        import_statement +
        "\n" +
        "//#region " +
        services_template_obj_key;

      initiate_statement =
        initiate_statement +
        "\n" +
        "        //#region " +
        services_template_obj_key;
      declaration_statement =
        declaration_statement +
        "\n" +
        "    //#region " +
        services_template_obj_key;
      for (const srv_obj of srv_objs) {
        import_statement =
          import_statement +
          "\n" +
          "import * as " +
          srv_obj.collection_name +
          ' from "' +
          srv_obj.collection_path +
          '";';

        initiate_statement =
          initiate_statement +
          "\n" +
          "        this." +
          srv_obj.collection_name +
          " = dbC.model<" +
          srv_obj.collection_name +
          ".I" +
          srv_obj.collection_name +
          ">(" +
          srv_obj.collection_name +
          ".CollectionName, " +
          srv_obj.collection_name +
          "." +
          srv_obj.collection_name +
          "Schema, " +
          srv_obj.collection_name +
          ".CollectionName);";

        declaration_statement =
          declaration_statement +
          "\n" +
          "    public " +
          srv_obj.collection_name +
          ": mongoose.Model<" +
          srv_obj.collection_name +
          ".I" +
          srv_obj.collection_name +
          ">;";
      }
      import_statement =
        import_statement + "\n" + "//#endregion " + services_template_obj_key;
      initiate_statement =
        initiate_statement +
        "\n" +
        "        //#endregion " +
        services_template_obj_key;
      declaration_statement =
        declaration_statement +
        "\n" +
        "    //#endregion " +
        services_template_obj_key;
    }

    import_statement = import_statement;
    initiate_statement = initiate_statement + "\n";
    declaration_statement = declaration_statement + "\n";

    // console.log("", import_statement);
    // console.log("", initiate_statement);
    // console.log("", declaration_statement);

    contection_template = contection_template.replace(
      "{{import-statement}}",
      import_statement
    );
    contection_template = contection_template.replace(
      "{{initiate-statement}}",
      initiate_statement
    );
    contection_template = contection_template.replace(
      "{{declation-statement}}",
      declaration_statement
    );
    writeFileSync(contection_context_file_path, contection_template);
  }
}

new GenerateCollectionRef().run();
