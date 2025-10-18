// src/common/dto/pagination.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
  /**
   * 1-alapú oldalindex (alapértelmezés: 1)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Oldalméret (alapértelmezés: 25)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 25;

  /**
   * Rendezés whitelistelt oszlopokra, pl. "createdAt:desc,status:asc"
   */
  @IsOptional()
  @IsString()
  sort?: string;
}
