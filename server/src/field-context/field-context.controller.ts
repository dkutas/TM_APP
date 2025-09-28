import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FieldContextService } from './field-context.service';
import { CreateFieldContextDto } from './dto/create-field-context.dto';
import { UpdateFieldContextDto } from './dto/update-field-context.dto';

@Controller('field-context')
export class FieldContextController {
  constructor(private readonly fieldContextService: FieldContextService) {}

  @Post()
  create(@Body() createFieldContextDto: CreateFieldContextDto) {
    return this.fieldContextService.create(createFieldContextDto);
  }

  @Get()
  findAll() {
    return this.fieldContextService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldContextService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFieldContextDto: UpdateFieldContextDto,
  ) {
    return this.fieldContextService.update(id, updateFieldContextDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldContextService.remove(id);
  }
}
