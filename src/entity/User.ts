import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  num: number;
  
  @Column()
  nickName: string;

  @Column()
  email: string;

  @Column()
  password: string;
}