import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn} from "typeorm";

@Entity()
export class EmailCheck {

  @PrimaryColumn()
  email: string;

  @Column()
  check: boolean;

  @Column()
  userNum: number;
}