import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMemeDto {
@IsNotEmpty()
@IsString()
title: string;
    
@IsArray()
@IsString({ each: true })
tags: string[];
    
}
