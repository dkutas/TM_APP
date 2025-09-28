import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FieldDefinitionService } from './field-definition.service';
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import { UpdateFieldDefinitionDto } from './dto/update-field-definition.dto';

@Controller('field-definition')
export class FieldDefinitionController {
  constructor(
    private readonly fieldDefinitionService: FieldDefinitionService,
  ) {}

  @Post()
  create(@Body() createFieldDefinitionDto: CreateFieldDefinitionDto) {
    return this.fieldDefinitionService.create(createFieldDefinitionDto);
  }

  @Get()
  findAll() {
    return this.fieldDefinitionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldDefinitionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFieldDefinitionDto: UpdateFieldDefinitionDto,
  ) {
    return this.fieldDefinitionService.update(id, updateFieldDefinitionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldDefinitionService.remove(id);
  }
}
