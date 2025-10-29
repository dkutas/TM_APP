import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Get('with-contexts')
  findAllWithContexts() {
    return this.fieldDefinitionService.findAllWithContexts();
  }

  @Get(':id/with-contexts/')
  findOneWithContexts(@Param('id') id: string) {
    return this.fieldDefinitionService.findOneWithContexts(id);
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
}
