import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected successful');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPage = await this.product.count({where:{available: true}});

    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {available:true}
      }),
      meta: {
        totalProducts: totalPage,
        totalPages: lastPage,
        page: page,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id: id,
        available: true
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found or disable`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id)
    return this.product.update({
      where: {
        id,
      },
      data: updateProductDto
    });
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.product.update({
      where:{id},
      data: {
       available:false
      }
    })
  }
}