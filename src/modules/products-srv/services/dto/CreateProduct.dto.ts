import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        example: "Wireless Keyboard",
        description: "The name of the product",
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: "A high-quality wireless keyboard with RGB lighting",
        description: "A brief description of the product",
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        example: "wireless-keyboard",
        description: "URL-friendly slug for the product",
    })
    @IsOptional()
    @IsString()
    slug: string;

    @ApiProperty({
        example: 49.99,
        description: "Price of the product",
    })
    @IsOptional()
    @IsNumber()
    price: number;

    @ApiProperty({
        example: "Electronics",
        description: "Category the product belongs to",
    })
    @IsOptional()
    @IsString()
    category: string;

    @ApiProperty({
        example: true,
        description: "Indicates whether the product is active",
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
