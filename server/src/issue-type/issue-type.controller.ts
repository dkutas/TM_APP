import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { IssueTypeService } from './issue-type.service';
import { CreateIssueTypeDto } from './dto/create-issue-type.dto';
import { UpdateIssueTypeDto } from './dto/update-issue-type.dto';

@Controller('issue-type')
export class IssueTypeController {
  constructor(private readonly issueTypeService: IssueTypeService) {}

  @Post()
  create(@Body() createIssueTypeDto: CreateIssueTypeDto) {
    return this.issueTypeService.create(createIssueTypeDto);
  }

  @Get()
  findAll() {
    return this.issueTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issueTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIssueTypeDto: UpdateIssueTypeDto,
  ) {
    return this.issueTypeService.update(id, updateIssueTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issueTypeService.remove(id);
  }
}
