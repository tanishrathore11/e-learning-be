import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Topic, User, Lesson, Enrollment, PurchaseItem } from "./index.js";

@Entity("courses")
@Index("idx_courses_topic_id", ["topic"])
@Index("idx_courses_instructor_id", ["instructor"])
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @ManyToOne(() => Topic, (topic: Topic) => topic.courses, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "topic_id" })
  topic!: Topic;

  @ManyToOne(() => User, (user: User) => user.courses, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "instructor_id" })
  instructor!: User;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.course)
  lessons!: Relation<Lesson[]>;

  @OneToMany(() => Enrollment, (enrollment: Enrollment) => enrollment.course)
  enrollments!: Relation<Enrollment[]>;

  @OneToMany(() => PurchaseItem, (item: PurchaseItem) => item.course)
  purchaseItems!: Relation<PurchaseItem[]>;
}
