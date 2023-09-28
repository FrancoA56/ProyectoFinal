import {
  Model,
  Table,
  Column,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Length,
  IsDate,
  AutoIncrement,
  BelongsToMany,
  HasMany,
  DataType
} from "sequelize-typescript";
import User from "./User";
import UserPreset from "./UserPreset";
import ShoppingListItem from "./ShoppingListItem";

enum PresetTypes {
  ABOUT = "about",
  HOME = "home",
  FORM = "form",
  CARD = "card",
}

const presetTypes = Object.values(PresetTypes);

@Table
class Preset extends Model<Preset> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Length({ min: 2, max: 15 })
  @Column
  name!: string;

  @Column
  price!: number;

  @Column({
     type: DataType.ENUM(...presetTypes),
  })
  type!: PresetTypes;

  @Column
  isDisabled!: boolean;

  @IsDate
  @Column
  releasedAt!: Date;

  @IsDate
  @CreatedAt
  @Column
  createdAt!: Date;

  @IsDate
  @UpdatedAt
  @Column
  updatedAt!: Date;

  @IsDate
  @DeletedAt
  @Column
  deletedAt?: Date;

  @HasMany(() => ShoppingListItem)
  shoppingListItems!: ShoppingListItem[];

  @BelongsToMany(() => User, () => UserPreset)
  users!: User[];
}

export default Preset;
