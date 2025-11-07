import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinkTypeService } from './link-type.service';
import { CreateLinkTypeDto } from './dto/create-link-type.dto';
import { UpdateLinkTypeDto } from './dto/update-link-type.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedRequest } from '../auth/auth.controller';

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

  @UseGuards(JwtAuthGuard)
  @Post('issue-link')
  linkIssues(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      srcIssueId: string;
      dstIssueId: string;
      linkTypeId: string;
    },
  ) {
    const { user } = req;
    const { srcIssueId, dstIssueId, linkTypeId } = body;
    return this.linkTypeService.linkIssues(
      srcIssueId,
      dstIssueId,
      linkTypeId,
      user?.id || '',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('issue-link/:id')
  deleteIssueLink(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { user } = req;
    console.log(user);
    return this.linkTypeService.deleteIssueLink(id, user.id);
  }
}
