import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {

  @PrimaryGeneratedColumn()
  num: number;
  
  @Column()
  user: string;

  @Column()
  description: string;

  @Column()
  title: string;

  @Column()
  mediaName: string;
  
  @Column()
  area: string;
  
  @Column({ default : "Receipt" })
  process: string;

  @Column({ default: 0 })
  totalJoin: number;
  
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"} )
  date: string;
}