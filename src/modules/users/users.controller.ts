import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { RateLimit } from 'nestjs-rate-limiter';
import { Expose } from '../../providers/prisma/prisma.interface';
import { CursorPipe } from '../../pipes/cursor.pipe';
import { OptionalIntPipe } from '../../pipes/optional-int.pipe';
import { OrderByPipe } from '../../pipes/order-by.pipe';
import { WherePipe } from '../../pipes/where.pipe';
import { Scopes } from '../auth/scope.decorator';
import { UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Scopes('user-*:read-info')
  async getAll(
    @Query('skip', OptionalIntPipe) skip?: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: Record<string, number | string>,
    @Query('where', WherePipe) where?: Record<string, number | string>,
    @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<Expose<users>[]> {
    return this.usersService.getUsers({ skip, take, orderBy, cursor, where });
  }

  @Get(':id')
  @Scopes('user-{id}:read-info')
  async get(@Param('id', ParseIntPipe) id: number): Promise<Expose<users>> {
    return this.usersService.getUser(Number(id));
  }

  @Patch(':id')
  @Scopes('user-{id}:write-info')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ): Promise<Expose<users>> {
    return this.usersService.updateUser(Number(id), data);
  }

  @Delete(':id')
  @Scopes('user-{id}:deactivate')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Expose<users>> {
    return this.usersService.deactivateUser(Number(id));
  }

  @Post(':id/merge-request')
  @Scopes('user-{id}:merge')
  @RateLimit({
    points: 10,
    duration: 60,
    errorMessage: 'Wait for 60 seconds before trying to merge again',
  })
  async mergeRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body('email') email: string,
  ): Promise<void> {
    return this.usersService.requestMerge(Number(id), email);
  }

  @Post('merge')
  @Scopes('user-{id}:merge')
  @RateLimit({
    points: 10,
    duration: 60,
    errorMessage: 'Wait for 60 seconds before trying to merge again',
  })
  async merge(@Body('token') token: string): Promise<void> {
    return this.usersService.mergeUsers(token);
  }
}
