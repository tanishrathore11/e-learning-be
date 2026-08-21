import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { Enrollment, Lesson } from "./index.js";

@Entity("progress")
@Unique("uq_progress_enrollment_lesson", ["enrollment", "lesson"])
export class Progress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress, { onDelete: "CASCADE" })
  @JoinColumn({ name: "enrollment_id" })
  enrollment!: Relation<Enrollment>;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress, { onDelete: "CASCADE" })
  @JoinColumn({ name: "lesson_id" })
  lesson!: Relation<Lesson>;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
