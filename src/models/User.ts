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
  HasMany,
  HasOne
} from "sequelize-typescript";

import Invoice from "./Invoice";
import Order from "./Order";
import Review from "./Review";

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

  @Column
  isDisabled!:boolean;

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

  @HasMany(() => Invoice)
  invoices!: Invoice[];

  @HasOne(() => Order)
  order!: Order;

  @HasMany(() => Review)
  reviews!: Review[];
}

export default User;
