import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean, IsArray, IsOptional } from "class-validator";

export class CreateCrudTemplateDto {
    @ApiProperty({
        example: "Sample Template",
        description: "The name of the CRUD template",
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: "Description of the CRUD template",
        description: "A brief description of the CRUD template",
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        example: "sample-template",
        description: "URL-friendly slug for the CRUD template",
    })
    @IsOptional()
    @IsString()
    slug: string;

    @ApiProperty({
        example: true,
        description: "Indicates whether the template is active",
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}