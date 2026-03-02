import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetProductListDto {
    @ApiProperty({
        description: "Number of records to skip for pagination",
        default: 0,
        example: 0,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    skip?: number;

    @ApiProperty({
        description: "Limit number of records to fetch for pagination",
        default: 10,
        example: 10,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty({
        description: "Filter by product name (case-insensitive partial match)",
        example: "Keyboard",
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: "Filter by category",
        example: "Electronics",
        required: false,
    })
    @IsOptional()
    @IsString()
    category?: string;
}
