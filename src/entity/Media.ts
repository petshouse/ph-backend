import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Media {

  @PrimaryGeneratedColumn()
  postNum: number;
  
  @Column()
  mediaName: string;

  @Column()
  userNum: number;
}