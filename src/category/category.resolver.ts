import { Resolver, Query, Mutation, Args, Int, Info, Context } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { CategoryPipe } from './pipe/category.pipe';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) { }

  @UsePipes(CategoryPipe)
  @Mutation(() => Category)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  createCategory(@Args('createCategoryInput') createCategoryInput: CreateCategoryInput) {
    return this.categoryService.create(createCategoryInput);
  }

  @Query(() => [Category], { name: 'categories' })
  findAll(
    @Info() info: any,
  ) {
    const fields = Object.keys(fieldsProjection(info));
    return this.categoryService.findAll(  fields);
  }

  @Query(() => Category, { name: 'category' })
  findOne(@Args('id', { type: () => Int }) id: number , @Info() info: any) {
    const fields = Object.keys(fieldsProjection(info));
    return this.categoryService.findOne(id , fields);
  }

  @HasRoles(Roles.Controller , Roles.TeamManager)
  @UseGuards(RolesGuard)
  @Query(() => [Category], { name: 'categoriesByNames' })
  findByName( @Info() info: any , @Context('req') request: any) {
    const fields = Object.keys(fieldsProjection(info));
    const names = request.user.categories?.map((category : Category) => category.name);
    const team = request.user.team?.name;
    return this.categoryService.findManyByName(names , fields , team );
  }


  @UsePipes(CategoryPipe)
  @Mutation(() => Category)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  updateCategory(@Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput) {
    return this.categoryService.update(updateCategoryInput.id, updateCategoryInput);
  }

  @Mutation(() => Category)
  @HasRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  removeCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.remove(id);
  }
}
