import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsNumber, IsOptional } from "class-validator";

export class UpdateProductDto {
    @ApiProperty({
        example: "Wireless Keyboard",
        description: "The name of the product",
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        example: "A high-quality wireless keyboard with RGB lighting",
        description: "A brief description of the product",
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: "wireless-keyboard",
        description: "URL-friendly slug for the product",
    })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({
        example: 49.99,
        description: "Price of the product",
    })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({
        example: "Electronics",
        description: "Category the product belongs to",
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({
        example: true,
        description: "Indicates whether the product is active",
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
