import { Col } from "sequelize/types/lib/utils";
import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn} from "typeorm";

@Entity()
export class EmailCheck {

  @PrimaryColumn()
  email: string;

  @Column()
  code: number;

  @Column({ type: 'boolean',  default : false })
  isCheck: boolean;
}