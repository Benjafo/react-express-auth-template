import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'sessions',
  timestamps: true,
  underscored: true,
})
export class Session extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
  })
  sessionId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId?: number;

  @Column({
    type: DataType.JSONB,
  })
  data?: any;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  expiresAt!: Date;

  @BelongsTo(() => User)
  user?: User;

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  /**
   * Extend session expiration
   */
  async extend(minutes: number = 30): Promise<void> {
    this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    await this.save();
  }
}