import { CreateUserUseCase } from '@application/use-cases/users/create-user/create-user-use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user/delete-user-use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id/get-user-by-id-use-case';
import { ListUsersUseCase } from '@application/use-cases/users/list-users/list-users-use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user/update-user-use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalServerErrorException } from '@shared/exceptions/internal-server-error-exception';
import { ValidationException } from '@shared/exceptions/validation-exception';
import {
  CreateUserRequestDTO,
  CreateUserResponseDTO,
} from '../dtos/users/create-user-dto';
import {
  UpdateUserRequestDTO,
  UpdateUserResponseDTO,
} from '../dtos/users/update-user-dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: CreateUserResponseDTO })
  @ApiResponse({ status: 400, type: ValidationException })
  @ApiResponse({ status: 500, type: InternalServerErrorException })
  async create(
    @Body() body: CreateUserRequestDTO,
  ): Promise<CreateUserResponseDTO> {
    const result = await this.createUserUseCase.execute(body);

    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  async getById(@Param('id') id: string) {
    return this.getUserByIdUseCase.execute({ id });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UpdateUserResponseDTO })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserRequestDTO,
  ): Promise<UpdateUserResponseDTO> {
    return this.updateUserUseCase.execute({ id, ...body });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute({ id });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List users' })
  async list(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.listUsersUseCase.execute({ page, limit });
  }
}
