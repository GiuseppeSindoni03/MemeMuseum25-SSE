import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMemeDto {
@IsNotEmpty()
@IsString()
title: string;
    
@IsArray()
@IsOptional()
@IsString({ each: true })
tags: string[];
}
