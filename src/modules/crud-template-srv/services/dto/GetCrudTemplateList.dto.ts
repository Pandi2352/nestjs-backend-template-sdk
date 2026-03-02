import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetCrudTemplateListDto {
    @ApiProperty({
        description: "Number of records to skip for pagination",
        default: 0,
        example: 0,
        required: true,
    })
    @IsNumber()
    @IsOptional()
    skip?: number;

    @ApiProperty({
        description: "Limit number of records to fetch for pagination",
        default: 10,
        example: 10,
        required: true,
    })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty({
        description: "Name of the CRUD template to filter results",
        example: "Sample Template",
    })
    @IsOptional()
    @IsString()
    name?: string;
}