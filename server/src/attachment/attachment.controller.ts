import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  create(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentService.create(createAttachmentDto);
  }

  @Get()
  findAll() {
    return this.attachmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentService.remove(id);
  }
}
