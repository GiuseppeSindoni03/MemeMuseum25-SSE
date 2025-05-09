import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get('/:id')
  getById(@Param('id') id: string) {
    console.log("TEST");
    return this.userService.getById(id);
  }

}
