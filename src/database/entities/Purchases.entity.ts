import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User, PurchaseItem } from "./index.js";

@Entity("purchases")
@Index("idx_purchases_user", ["user"])
export class Purchases {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.purchases, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: 'created_at' })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP", name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items!: PurchaseItem[];
}
