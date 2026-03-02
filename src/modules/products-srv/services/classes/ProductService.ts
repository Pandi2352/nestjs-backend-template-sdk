import { ErrorEntity, HttpStatus, LoggerHelper, RequestContext } from "../../../../utils/core/CodeUtils";
import { DbContext } from "../../../../database/DBContext";
import { ObjectUtil } from "../../../../utils/ObjectUtil/ObjectUtil";
import { CreateProductDto } from "../dto/CreateProduct.dto";
import { UpdateProductDto } from "../dto/UpdateProduct.dto";
import { GetProductListDto } from "../dto/GetProductList.dto";

export class ProductService {

    private static _instance: ProductService;

    static get Instance() {
        if (!this._instance) {
            this._instance = new ProductService();
        }
        return this._instance;
    }

    /**
     * Create a new Product
     */
    async createProduct(currentContext: RequestContext, productData: CreateProductDto) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "createProduct fn", { productData });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);

            const isExists = await this.isProductNameExists(currentContext, productData.name);
            if (isExists) {
                throw new ErrorEntity({
                    http_code: HttpStatus.CONFLICT,
                    error_code: "invalid_request",
                    error_description: `Product name ${productData.name} already exists.`
                });
            }

            if (!productData?.slug) {
                productData.slug = ObjectUtil.getSlug(productData.name);
            }

            const newProduct = new dbContext.Product();
            Object.assign(newProduct, productData);
            await newProduct.save();

            return Promise.resolve(newProduct);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in createProduct fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Check if Product name already exists
     */
    async isProductNameExists(currentContext: RequestContext, name: string) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "isProductNameExists fn", { name });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);
            const exists = await dbContext.Product.exists({ name: { $regex: `^${name}$`, $options: "i" } });
            return Promise.resolve(exists);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in isProductNameExists fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get Product by ID
     */
    async getProductById(currentContext: RequestContext, productId: string) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "getProductById fn", { productId });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);

            const product = await dbContext.Product.findOne({ _id: productId, is_active: { $ne: false } });

            if (!product) {
                throw new ErrorEntity({
                    http_code: HttpStatus.NOT_FOUND,
                    error_code: "invalid_request",
                    error_description: `Product with ID ${productId} not found.`
                });
            }

            return Promise.resolve(product);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in getProductById fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get list of Products with pagination and filters
     */
    async getProductList(currentContext: RequestContext, filters: GetProductListDto) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "getProductList fn", { filters });
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);

            const query: any = { is_active: { $ne: false } };

            if (filters?.name) {
                const trimmed_search = filters.name.trim();
                query['name'] = { $regex: trimmed_search, $options: "i" };
            }

            if (filters?.category) {
                const trimmed_category = filters.category.trim();
                query['category'] = { $regex: `^${trimmed_category}$`, $options: "i" };
            }

            const totalCount = await dbContext.Product.countDocuments(query);

            const entities = await dbContext.Product.find(query)
                .skip(filters?.skip || 0)
                .limit(filters?.limit || 10)
                .sort({ createdAt: -1 });

            return Promise.resolve({ total_count: totalCount, entities });
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in getProductList fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Update a Product by ID
     */
    async updateProductById(currentContext: RequestContext, productId: string, updateData: UpdateProductDto) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "updateProductById fn", { productId, updateData });

            const existingProduct = await this.getProductById(currentContext, productId);
            let isValueChanged = false;

            if (!ObjectUtil.isNullOrUndefined(updateData.name) && updateData.name !== existingProduct.name) {
                const isNameExists = await this.isProductNameExists(currentContext, updateData.name!);
                if (isNameExists) {
                    throw new ErrorEntity({
                        http_code: HttpStatus.CONFLICT,
                        error_code: "invalid_request",
                        error_description: `Product name ${updateData.name} already exists.`
                    });
                }
                existingProduct.name = updateData.name!;
                isValueChanged = true;
            }

            if (!ObjectUtil.isNullOrUndefined(updateData.slug) && updateData.slug !== existingProduct.slug) {
                existingProduct.slug = updateData.slug!;
                isValueChanged = true;
            }

            if (!ObjectUtil.isNullOrUndefined(updateData.description) && updateData.description !== existingProduct.description) {
                existingProduct.description = updateData.description!;
                isValueChanged = true;
            }

            if (!ObjectUtil.isNullOrUndefined(updateData.price) && updateData.price !== existingProduct.price) {
                existingProduct.price = updateData.price!;
                isValueChanged = true;
            }

            if (!ObjectUtil.isNullOrUndefined(updateData.category) && updateData.category !== existingProduct.category) {
                existingProduct.category = updateData.category!;
                isValueChanged = true;
            }

            if (isValueChanged) {
                await existingProduct.save();
            }

            return Promise.resolve(existingProduct);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in updateProductById fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Soft delete a Product by ID
     */
    async deleteProductById(currentContext: RequestContext, productId: string) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "deleteProductById fn", { productId });

            const existingProduct = await this.getProductById(currentContext, productId);

            existingProduct.is_active = false;
            await existingProduct.save();

            return Promise.resolve(true);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in deleteProductById fn", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get dropdown list of products
     */
    async getDropDownListForProduct(currentContext: RequestContext) {
        try {
            LoggerHelper.Instance.info(currentContext.x_request_id, "getDropDownListForProduct fn", {});
            const dbContext = await DbContext.getContextByConfig(currentContext.tenant_key);
            const entities = await dbContext.Product.find({ is_active: { $ne: false } }, { name: 1 }).sort({ createdAt: -1 });
            return Promise.resolve(entities);
        } catch (error) {
            LoggerHelper.Instance.error(currentContext.x_request_id, "Error in getDropDownListForProduct fn", error);
            return Promise.reject(error);
        }
    }
}
