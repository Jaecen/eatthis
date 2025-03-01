import { injectable, inject } from 'inversify';

import DepartmentRepository from '../repositories/departmentRepository';
import dependencyIdentifiers from '../dependencyIdentifiers';
import GroceryItem from '../models/groceryItem';
import Ingredient from '../models/ingredient';

@injectable()
export default class GroceryListBuilder {

    private departmentRepository: DepartmentRepository;

    public constructor(
        @inject(dependencyIdentifiers.DepartmentRepository) departmentRepository: DepartmentRepository
    ) {
        this.departmentRepository = departmentRepository;
    }

    public async combineIngredients(userId: string, ingredients: Ingredient[]) {
        const groceryItems: Map<string, GroceryItem> = new Map<string, GroceryItem>();

        for (const ingredient of ingredients) {
            if (!groceryItems.has(ingredient.name)) {
                groceryItems.set(ingredient.name, {
                    id: '',
                    department: this.departmentRepository.getDepartment(ingredient.name),
                    ingredient: ingredient.name,
                    unit: ingredient.unitOfMeasure,
                    quantity: ingredient.quantity,
                    picked: false
                });
            } else {
                groceryItems.get(ingredient.name).quantity += ingredient.quantity;
            }
        }

        return Array.from(groceryItems.values());
    }

    public combineGroceryItems(groceryItems: GroceryItem[]) {
        const retVal: Map<string, GroceryItem> = new Map<string, GroceryItem>();
        for (const groceryItem of groceryItems) {
            if (!retVal.has(groceryItem.ingredient)) {
                retVal.set(groceryItem.ingredient, groceryItem);
            } else {
                retVal.get(groceryItem.ingredient).quantity += groceryItem.quantity;
            }
        }
        return Array.from(retVal.values());
    }
}
