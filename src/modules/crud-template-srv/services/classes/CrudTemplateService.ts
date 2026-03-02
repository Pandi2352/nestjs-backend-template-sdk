import { ErrorEntity, HttpStatus, LoggerHelper, RequestContext } from "../../../../utils/core/CodeUtils";
import { DbContext } from "../../../../database/DBContext";
import { ObjectUtil } from "../../../../utils/ObjectUtil/ObjectUtil";
import { CreateCrudTemplateDto } from "../dto/CreateCrudTemplate.dto";
import { GetCrudTemplateListDto } from "../dto/GetCrudTemplateList.dto";
import { TenantService } from "../../../tenants-srv/services/classes/TenantsService";

export class CrudTemplateService {

    private static _instance: CrudTemplateService;

    static get Instance() {
        if (!this._instance) {
            this._instance = new CrudTemplateService();
        }
        return this._instance;
    }

    /**
     * Create a new CrudTemplate
     */
    async createCrudTemplate(currentContext: RequestContext, crudTemplateData: CreateCrudTemplateDto) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "createCrudTemplate fn", { crudTemplateData });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);
            // const dbContext = await DbContext.getContextByConfig(TenantService.Instance.getManagementKey());

            const isExists = await this.isCrudTemplateNameExists(currentContext, crudTemplateData.name);
            if (isExists) {
                throw new ErrorEntity({
                    http_code: HttpStatus.CONFLICT,
                    error_code: "invalid_request",
                    error_description: `crudTemplate name ${crudTemplateData.name} already exists.`
                });
            }

            if (!crudTemplateData?.slug) {
                crudTemplateData.slug = ObjectUtil.getSlug(crudTemplateData.name);
            }

            const newCrudTemplate = new dbContext.CrudTemplate();
            Object.assign(newCrudTemplate, crudTemplateData);
            await newCrudTemplate.save();

            return Promise.resolve(newCrudTemplate);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in createCrudTemplate fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Check if CrudTemplate name already exists
     */
    async isCrudTemplateNameExists(currentContext: RequestContext, name: string) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "isCrudTemplateNameExists fn", { name });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);
            // const dbContext = await DbContext.getContextByConfig(TenantService.Instance.getManagementKey());
            const exists = await dbContext.CrudTemplate.exists({ name: { $regex: `^${name}$`, $options: "i" } });
            return Promise.resolve(exists);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in isCrudTemplateNameExists fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get CrudTemplate by ID
     */
    async getCrudTemplateById(currentContext: RequestContext, crudTemplateId: string) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "getCrudTemplateById fn", { crudTemplateId });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);

            const crudTemplate = await dbContext.CrudTemplate.findOne({ _id: crudTemplateId, is_active: { $ne: false } });

            if (!crudTemplate) {
                throw new ErrorEntity({
                    http_code: HttpStatus.NOT_FOUND,
                    error_code: "invalid_request",
                    error_description: `CrudTemplate with ID ${crudTemplateId} not found.`
                });
            }

            return Promise.resolve(crudTemplate);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in getCrudTemplateById fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get list of CrudTemplates with pagination
     */
    async getCrudTemplateList(currentContext: RequestContext, filters: GetCrudTemplateListDto) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "getCrudTemplateList fn", { filters });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);

            const query = { is_active: { $ne: false } };

            if (filters?.name) {
                const trimmed_search = filters.name.trim();
                query['name'] = { $regex: trimmed_search, $options: "i" };
            }

            const totalCount = await dbContext.CrudTemplate.countDocuments(query);

            const entities = await dbContext.CrudTemplate.find(query)
                .skip(filters?.skip || 0)
                .limit(filters?.limit || 10)
                .sort({ createdAt: -1 });

            return Promise.resolve({ total_count: totalCount, entities });
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in getCrudTemplateList fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Update an CrudTemplate by ID
     */
    async updateCrudTemplateById(currentContext: RequestContext, crudTemplateId: string, updateData: CreateCrudTemplateDto) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "updateCrudTemplateById fn", { crudTemplateId, updateData });

            const existingCrudTemplate = await this.getCrudTemplateById(currentContext, crudTemplateId);
            let isValueChanged = false;

            if (!ObjectUtil.isNullOrUndefined(updateData.name) && updateData.name !== existingCrudTemplate.name) {
                const isNameExists = await this.isCrudTemplateNameExists(currentContext, updateData.name);
                if (isNameExists) {
                    throw new ErrorEntity({
                        http_code: HttpStatus.CONFLICT,
                        error_code: "invalid_request",
                        error_description: `CrudTemplate name ${updateData.name} already exists.`
                    });
                }
                existingCrudTemplate.name = updateData.name;
                isValueChanged = true;
            }

            if (!ObjectUtil.isNullOrUndefined(updateData.slug) && updateData.slug !== existingCrudTemplate.slug) {
                existingCrudTemplate.slug = updateData.slug;
                isValueChanged = true;
            }

            if (!ObjectUtil.isNullOrUndefined(updateData.description) && updateData.description !== existingCrudTemplate.description) {
                existingCrudTemplate.description = updateData.description;
                isValueChanged = true;
            }

            if (isValueChanged) {
                await existingCrudTemplate.save();
            }

            return Promise.resolve(existingCrudTemplate);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in updateCrudTemplateById fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Soft delete an crudTemplate by ID
     */
    async deleteCrudTemplateById(currentContext: RequestContext, crudTemplateId: string) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "deleteCrudTemplateById fn", { crudTemplateId });

            const existingCrudTemplate = await this.getCrudTemplateById(currentContext, crudTemplateId);

            existingCrudTemplate.is_active = false;
            await existingCrudTemplate.save();

            return Promise.resolve(true);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in deleteCrudTemplateById fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get dropdown list of entities
     */
    async getDropDownListForCrudTemplate(currentContext: RequestContext) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "getDropDownListForCrudTemplate fn", {});
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);
            const entities = await dbContext.CrudTemplate.find({ is_active: { $ne: false } }, { name: 1 }).sort({ createdAt: -1 });
            return Promise.resolve(entities);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in getDropDownListForCrudTemplate fn", error);
            return Promise.reject(error);
        }
    }
}