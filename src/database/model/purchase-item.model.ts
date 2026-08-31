import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Purchases, Course } from "./index.js";

@Entity("purchase_items")
@Index("idx_purchase_items_purchase_id", ["purchase"])
@Index("idx_purchase_items_course_id", ["course"])
export class PurchaseItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Purchases, (purchases) => purchases.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "purchase_id" })
  purchase!: Purchases;

  @ManyToOne(() => Course, (course) => course.purchaseItems, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: number;
}
