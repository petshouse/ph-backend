import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity()
export class Token {

  @PrimaryColumn()
  email: string;
  
  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;
}