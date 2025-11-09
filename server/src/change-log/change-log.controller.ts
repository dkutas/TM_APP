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
import { ChangeLogService } from './change-log.service';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';
import { AuthenticatedRequest } from '../auth/auth.controller';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user')
  getLastTenEntriesForUser(@Req() req: AuthenticatedRequest) {
    const { user } = req;
    return this.changeLogService.getLastTenEntriesForUser(user.id);
  }

  @Get('issue/:issueId')
  getChangeLogsForIssue(@Param('issueId') issueId: string) {
    return this.changeLogService.getChangeLogsForIssue(issueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.changeLogService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChangeLogDto: UpdateChangeLogDto,
  ) {
    return this.changeLogService.update(+id, updateChangeLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.changeLogService.remove(+id);
  }
}
