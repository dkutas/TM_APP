import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LinkTypeService } from './link-type.service';
import { CreateLinkTypeDto } from './dto/create-link-type.dto';
import { UpdateLinkTypeDto } from './dto/update-link-type.dto';

@Controller('link-type')
export class LinkTypeController {
  constructor(private readonly linkTypeService: LinkTypeService) {}

  @Post()
  create(@Body() createLinkTypeDto: CreateLinkTypeDto) {
    return this.linkTypeService.create(createLinkTypeDto);
  }

  @Get()
  findAll() {
    return this.linkTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linkTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLinkTypeDto: UpdateLinkTypeDto,
  ) {
    return this.linkTypeService.update(id, updateLinkTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linkTypeService.remove(id);
  }
}
