import { ErrorEntity, HttpStatus, RequestContext } from "../../../../utils/core/CodeUtils";
import { TenantConstants } from "../entity/TenantConstants";
import { TenantEntity } from "../entity/TenantEntity";
import { DbContext } from "../../../../database/DBContext";
import { IAuthConfigs } from "../db/AuthConfigs";
import { ITenants } from "../db/Tenants";


export class TenantService {
    private static _instance: TenantService;
    static get Instance() {
        if (!this._instance) {
            this._instance = new TenantService();
        }
        return this._instance;
    }

    getManagementKey() {
        const management_key = process.env.MANAGEMENT_KEY_NAME || "fcs-srv"
        return management_key;
    }

    isManagementKey(tenant_key: string): boolean {
        if (this.getManagementKey() == tenant_key) {
            return true;
        } else {
            return false
        }
    }

    //TODO need to clear the cache from event
    private tenant_cache: Map<string, TenantEntity> = new Map<string, TenantEntity>();
    async getTenantInfoByBaseURL(base_url: string): Promise<TenantEntity> {
        try {


            if (this.tenant_cache.has(base_url)) {
                return this.tenant_cache.get(base_url)!;
            } else {

                //Backup-V1-Module - Before Automation Pls comment this function
                const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
                const availabel_tenants: TenantEntity[] = (await dbContext.Tenants.find({})).map(c => c.toObject());

                const matched_tenant = availabel_tenants.find(c => {
                    let matched_tenant: TenantEntity | undefined = undefined;
                    for (const allowed_domain of c.allowed_domains) {
                        if (allowed_domain == base_url) {
                            matched_tenant = c;
                            break;
                        } else {
                            let allowed_domain_modified: string = "";
                            if (allowed_domain.startsWith("*.")) {
                                allowed_domain_modified = allowed_domain.replace("*.", "");
                                if (allowed_domain_modified == base_url) {
                                    matched_tenant = c;
                                    break;
                                }
                            }
                            else if (allowed_domain.startsWith("http://*.")) {
                                allowed_domain_modified = allowed_domain.replace("http://*.", "");
                                if (base_url.startsWith("http://") && base_url.endsWith(allowed_domain_modified)) {
                                    matched_tenant = c;
                                    break;
                                }
                            }
                            else if (allowed_domain.startsWith("https://*.")) {
                                allowed_domain_modified = allowed_domain.replace("https://*.", "");
                                if (base_url.startsWith("https://") && base_url.endsWith(allowed_domain_modified)) {
                                    matched_tenant = c;
                                    break;
                                }
                            }
                        }
                    }

                    if (matched_tenant && matched_tenant.auth_config) {
                        if (Array.isArray(matched_tenant.auth_config)) {
                            const auth_config = matched_tenant.auth_config.find((auth_config: IAuthConfigs) => auth_config.domain === base_url);

                            if (auth_config) {
                                matched_tenant.auth_config = auth_config;
                            } else {
                                matched_tenant.auth_config = matched_tenant.auth_config[0];
                            }
                        }
                    }
                    
                    return matched_tenant;
                });
               
                if (matched_tenant) {
                    this.tenant_cache.set(base_url, matched_tenant);
                    return Promise.resolve(matched_tenant);
                } else {
                    throw new ErrorEntity({ http_code: HttpStatus.EXPECTATION_FAILED, error_code: TenantConstants.invalid_request, error_description: TenantConstants.error_url });
                }
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

     /**
     * Create Tanant
     * @param currentContext 
     * @param tenant_info 
     * @returns 
     */
     async createTenant(currentContext: RequestContext, tenant_info: ITenants): Promise<TenantEntity> {
        try {
            if (currentContext.tenant_key != this.getManagementKey()) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: TenantConstants.error_access });
            }

            //Checking
            if (!tenant_info.name) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: "name cannot be empty" });
            }

            if (!tenant_info.logo) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: "logo cannot be empty" });
            }

            if (!tenant_info.tenant_key) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: "tenant_key cannot be empty" });
            }

            if (!tenant_info.auth_config) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: "auth_config cannot be empty" });
            }

            if (!tenant_info.domains) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: "domains cannot be empty" });
            }

            const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
            const tenant_key_taken = await dbContext.Tenants.exists({ tenant_key: tenant_info.tenant_key });
            if (tenant_key_taken) {
                throw new ErrorEntity({ http_code: HttpStatus.CONFLICT, error: TenantConstants.invalid_request, error_description: TenantConstants.error_description });
            }

            const newTenant = new dbContext.Tenants();
            Object.assign(newTenant, <ITenants>tenant_info);
            newTenant.__ref = currentContext.x_request_id;
            let saved_tenant = await newTenant.save();

            // let es_tenant: any = {
            //     id: RandomNumberGenerator.getUniqueId(), tenant_id: saved_tenant.id, incoming_data: tenant_info,
            //     tenant_key: tenant_info.tenant_key, reference_id: currentContext.x_request_id, event_type: KafkaTopics.tenant_create
            // }
            // // send create standard
            // KafkaUtils.Instance.sendMessage(currentContext, KafkaTopics.tenant_create, es_tenant)

            //return Promise.resolve(tenant_info);
            return Promise.resolve(saved_tenant);

        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Tanant Info By Tenant Code
     * @param tenant_code 
     * @returns 
     */
    async getTenantInfoByTenantCode(tenant_code: string): Promise<TenantEntity | undefined> {
        try {
            const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
            const saved_tenant = await dbContext.Tenants.findOne({ tenant_code: tenant_code })
            if (saved_tenant) {
                return saved_tenant.toObject();
            } else {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error_code: TenantConstants.invalid_request, error_description: TenantConstants.error_code });
            }

        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Update Tenant
     * @param currentContext 
     * @param tenant_info 
     * @param tenant_key 
     * @returns 
     */
    async updateTenant(currentContext: RequestContext, tenant_info: ITenants, tenant_key: string): Promise<ITenants | boolean> {
        try {
            if (currentContext.tenant_key != this.getManagementKey()) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: TenantConstants.error_access });
            }
            const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
            const saved_tenant = await dbContext.Tenants.findOne({ "_id": tenant_info._id });
            if (!saved_tenant) {
                throw new ErrorEntity({
                    http_code: HttpStatus.CONFLICT, error: TenantConstants.invalid_request, error_description: TenantConstants.invalid_tenant_id
                })
            }

            let isDirty = false;
            if (tenant_info.tenant_key && saved_tenant.tenant_key != tenant_info.tenant_key) {
                const is_taken = await dbContext.Tenants.exists({ "tenant_key": tenant_info.tenant_key });
                if (is_taken) {
                    throw new ErrorEntity({ http_code: HttpStatus.CONFLICT, error: TenantConstants.invalid_request, error_description: "This tenant_key already taken" })
                }
                saved_tenant.tenant_key = tenant_info.tenant_key;
                isDirty = true;
            }

            if (tenant_info.tenant_code && saved_tenant.tenant_code != tenant_info.tenant_code) {
                saved_tenant.tenant_code = tenant_info.tenant_code;
                isDirty = true;
            }

            if (tenant_info.name && saved_tenant.name != tenant_info.name) {
                saved_tenant.name = tenant_info.name;
                isDirty = true;
            }

            if (tenant_info.logo && saved_tenant.logo != tenant_info.logo) {
                saved_tenant.logo = tenant_info.logo
                isDirty = true;
            }

            if (tenant_info.allowed_domains && saved_tenant.allowed_domains != tenant_info.allowed_domains) {
                saved_tenant.allowed_domains = tenant_info.allowed_domains;
                isDirty = true;
            }

            if (tenant_info.domains && saved_tenant.domains != tenant_info.domains) {
                saved_tenant.domains = tenant_info.domains;
                isDirty = true;
            }

            if (tenant_info.auth_config && saved_tenant.auth_config != tenant_info.auth_config) {
                saved_tenant.auth_config = tenant_info.auth_config;
                isDirty = true;
            }

            if (tenant_info.business_types && saved_tenant.business_types != tenant_info.business_types) {
                saved_tenant.business_types = tenant_info.business_types;
                isDirty = true;
            }

            if (isDirty) {
                await saved_tenant.save();
            }

            return Promise.resolve(saved_tenant);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Get Tenant By Tenant key
     * @param currentContext 
     * @param tenant_key 
     * @returns 
     */
    async getTenantDomainFromContext(currentContext: RequestContext): Promise<string | null> {
        try {
            const api_domain: string = currentContext.base_url;

            const domains = currentContext.tenant_config.domains;

            for (const domainPair of domains) {
                if (domainPair[api_domain]) {
                    return Promise.resolve(domainPair[api_domain]);
                }
            }

            return Promise.resolve(null);

        } catch (error) {
            return Promise.reject(error);
        }
    }
    async getTenantInfoByTenantKey(currentContext: RequestContext, tenant_key: string): Promise<ITenants> {
        try {
            if (currentContext.tenant_key != this.getManagementKey()) {
                throw new ErrorEntity({ http_code: HttpStatus.CONFLICT, error: TenantConstants.invalid_request, error_description: TenantConstants.error__invalid_tenant });
            }
            const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
            const saved_tenant = await dbContext.Tenants.findOne({ "tenant_key": tenant_key })
            if (saved_tenant) {
                return Promise.resolve(saved_tenant);
            } else {
                throw new ErrorEntity({ http_code: HttpStatus.BAD_REQUEST, error_code: TenantConstants.invalid_request, error_description: TenantConstants.error_code });
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    //Delete Tenant
    async deleteTenantInfoByTenantKey(currentContext: RequestContext, tenant_key: string): Promise<boolean> {
        try {
            if (currentContext.tenant_key != this.getManagementKey()) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: TenantConstants.error_access });
            }

            const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
            const saved_tenant = await dbContext.Tenants.exists({ "tenant_key": tenant_key });
            if (saved_tenant) {
                var delete_Tenant = await dbContext.Tenants.deleteOne({ "tenant_key": tenant_key });
                return Promise.resolve(true);
            }
            else {
                throw new ErrorEntity({ http_code: HttpStatus.CONFLICT, error: TenantConstants.invalid_request, error_description: TenantConstants.error_description });
            }
        }
        catch (error) {
            return Promise.reject(false);
        }
    }

    /**
     * Get All Tenant List
     * @param currentContext 
     * @returns 
     */
    async getAllTenantsInfo(currentContext: RequestContext): Promise<ITenants[]> {
        try {
            if (currentContext.tenant_key != this.getManagementKey()) {
                throw new ErrorEntity({ http_code: HttpStatus.UNAUTHORIZED, error: TenantConstants.invalid_request, error_description: TenantConstants.error_access });
            }

            const dbContext = await DbContext.getContextByConfig(this.getManagementKey());
            const saved_Tenants = await dbContext.Tenants.find(
                { tenant_key: { $in: ["demo_complyment", "ummeedhfc_poc_complyment"] } }
            ).sort({ "createdAt": -1 });

            return Promise.resolve(saved_Tenants);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    async cleanCacheTenantInfoByBaseURL(base_url: string): Promise<Boolean> {
        try {
            if (this.tenant_cache.get(base_url)) {
                await this.tenant_cache.delete(base_url);
            }
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}