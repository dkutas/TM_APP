import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { IssueFieldValueService } from './issue-field-value.service';
import { CreateIssueFieldValueDto } from './dto/create-issue-field-value.dto';
import { UpdateIssueFieldValueDto } from './dto/update-issue-field-value.dto';

@Controller('issue-field-value')
export class IssueFieldValueController {
  constructor(
    private readonly issueFieldValueService: IssueFieldValueService,
  ) {}

  @Post()
  create(@Body() createIssueFieldValueDto: CreateIssueFieldValueDto) {
    return this.issueFieldValueService.create(createIssueFieldValueDto);
  }

  @Get()
  findAll() {
    return this.issueFieldValueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issueFieldValueService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIssueFieldValueDto: UpdateIssueFieldValueDto,
  ) {
    return this.issueFieldValueService.update(id, updateIssueFieldValueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issueFieldValueService.remove(id);
  }
}
