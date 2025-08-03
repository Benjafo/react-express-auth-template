import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
} from 'sequelize-typescript';

@Table({
  tableName: 'login_attempts',
  timestamps: false,
})
export class LoginAttempt extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
  })
  email!: string;

  @Column({
    type: DataType.INET,
  })
  ipAddress?: string;

  @Column({
    type: DataType.TEXT,
  })
  userAgent?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  success!: boolean;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
  })
  attemptedAt!: Date;

  /**
   * Create a login attempt record
   */
  static async recordAttempt(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = false
  ): Promise<LoginAttempt> {
    return this.create({
      email,
      ipAddress,
      userAgent,
      success,
    });
  }

  /**
   * Get recent failed attempts for an email
   */
  static async getRecentFailedAttempts(
    email: string,
    minutes: number = 15
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return this.count({
      where: {
        email,
        success: false,
        attemptedAt: {
          [Symbol.for('gt')]: cutoffTime,
        },
      },
    });
  }
}