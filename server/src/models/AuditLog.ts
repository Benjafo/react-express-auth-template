import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'audit_logs',
  timestamps: false,
})
export class AuditLog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId?: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
  })
  action!: string;

  @Column({
    type: DataType.STRING(50),
  })
  entityType?: string;

  @Column({
    type: DataType.INTEGER,
  })
  entityId?: number;

  @Column({
    type: DataType.JSONB,
  })
  oldValues?: Record<string, unknown>;

  @Column({
    type: DataType.JSONB,
  })
  newValues?: Record<string, unknown>;

  @Column({
    type: DataType.INET,
  })
  ipAddress?: string;

  @Column({
    type: DataType.TEXT,
  })
  userAgent?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  createdAt!: Date;

  @BelongsTo(() => User)
  user?: User;

  /**
   * Create an audit log entry
   */
  static async log(data: {
    userId?: number;
    action: string;
    entityType?: string;
    entityId?: number;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    return this.create(data);
  }
}