import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { User, Course, Progress } from "./index.js";

@Entity("enrollments")
@Unique("uq_enrollments_user_course", ["user", "course"])
@Index("idx_enrollments_course_id", ["course"])
export class Enrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => Course, (course) => course.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course!: Relation<Course>;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @OneToMany(() => Progress, (progress) => progress.enrollment)
  progress!: Relation<Progress[]>;
}
