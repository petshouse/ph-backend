import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {

  @PrimaryGeneratedColumn()
  num: number;
  
  @Column()
  userNum: number;

  @Column()
  description: string;

  @Column()
  title: string;

  @Column()
  mediaName: string;
  
  @Column()
  area: string;
  
  @Column()
  process: string;

  @Column()
  totalJoin: number;
  
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"} )
  date: string;
}