import {
  Model,
  Table,
  Column,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  IsEmail,
  Length,
  IsUrl,
  IsDate,
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import Preset from "./Preset";
import UserPreset from "./UserPreset";
import ShoppingList from "./ShoppingList";

@Table
class User extends Model<User> {
  @IsEmail
  @PrimaryKey
  @Column
  email!: string;

  @Length({ min: 8, max: 30 })
  @Column
  password!: string;

  @Length({ min: 2, max: 30 })
  @Column
  name!: string;

  @IsUrl
  @Column
  logo!: string;

  @IsDate
  @CreatedAt
  createdAt!: Date;

  @IsDate
  @UpdatedAt
  updatedAt!: Date;

  @IsDate
  @DeletedAt
  deletedAt?: Date;

  @HasMany(() => ShoppingList)
  shoppingLists!: ShoppingList[];

  @BelongsToMany(() => Preset, () => UserPreset)
  presets!: Preset[];
}

export default User;
