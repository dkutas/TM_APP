import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChangeLogService } from './change-log.service';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';

@Controller('change-log')
export class ChangeLogController {
  constructor(private readonly changeLogService: ChangeLogService) {}

  @Post()
  create(@Body() createChangeLogDto: CreateChangeLogDto) {
    return this.changeLogService.create(createChangeLogDto);
  }

  @Get()
  findAll() {
    return this.changeLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.changeLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChangeLogDto: UpdateChangeLogDto) {
    return this.changeLogService.update(+id, updateChangeLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.changeLogService.remove(+id);
  }
}
