import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Media {

  @PrimaryGeneratedColumn()
  num: number;
  
  @Column()
  mediaName: string;

  @Column()
  userNum: number;
}