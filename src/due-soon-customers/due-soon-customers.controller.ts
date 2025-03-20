import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DueSoonCustomersService } from './due-soon-customers.service';
import { CreateDueSoonCustomerDto } from './dto/create-due-soon-customer.dto';
import { UpdateDueSoonCustomerDto } from './dto/update-due-soon-customer.dto';
import { FirebaseAuthGuard } from 'src/guards/firebase.guard';

@Controller('due-soon-customers')
export class DueSoonCustomersController {
  constructor(
    private readonly dueSoonCustomersService: DueSoonCustomersService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createDueSoonCustomerDto: CreateDueSoonCustomerDto) {
    return this.dueSoonCustomersService.create(createDueSoonCustomerDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  findAll() {
    return this.dueSoonCustomersService.findAll();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.dueSoonCustomersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDueSoonCustomerDto: UpdateDueSoonCustomerDto,
  ) {
    return this.dueSoonCustomersService.update(+id, updateDueSoonCustomerDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.dueSoonCustomersService.remove(id);
  }
}
