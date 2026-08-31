import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "./index.js";

@Entity("topics")
export class Topic {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: "text" , nullable: true })
  description!: string | null;

  @OneToMany(() => Course, (course) => course.topic)
  courses!: Course[];
}
