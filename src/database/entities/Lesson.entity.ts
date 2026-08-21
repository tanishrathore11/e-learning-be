import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Course, Progress } from "./index.js";

@Entity("lessons")
@Index("idx_lessons_course_position", ["course", "position"])
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course!: Relation<Course>;

  @Column({type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: "varchar", default: "NOTES" })
  type!: "VIDEO" | "NOTES";

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "text", nullable: true })
  videoUrl!: string | null;

  @Column({ type: "integer", nullable: true })
  position!: number | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @OneToMany(() => Progress, (progress) => progress.lesson)
  progress!: Relation<Progress[]>;
}
