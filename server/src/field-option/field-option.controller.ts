import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FieldOptionService } from './field-option.service';
import { CreateFieldOptionDto } from './dto/create-field-option.dto';
import { UpdateFieldOptionDto } from './dto/update-field-option.dto';

@Controller('field-option')
export class FieldOptionController {
  constructor(private readonly fieldOptionService: FieldOptionService) {}

  @Post()
  create(@Body() createFieldOptionDto: CreateFieldOptionDto) {
    return this.fieldOptionService.create(createFieldOptionDto);
  }

  @Get()
  findAll() {
    return this.fieldOptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldOptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFieldOptionDto: UpdateFieldOptionDto,
  ) {
    return this.fieldOptionService.update(id, updateFieldOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldOptionService.remove(id);
  }
}
