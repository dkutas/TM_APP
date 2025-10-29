import { Controller, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { AttachmentService } from './attachment.service';

@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attachmentService.remove(id);
  }
}
