import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    Default,
    AllowNull,
    Unique,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'refresh_tokens',
    timestamps: false,
})
export class RefreshToken extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id!: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
    })
    userId!: number;

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.STRING(255),
    })
    token!: string;

    @Column({
        type: DataType.JSONB,
    })
    deviceInfo?: Record<string, unknown>;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
    })
    isValid!: boolean;

    @Default(DataType.NOW)
    @Column({
        type: DataType.DATE,
    })
    createdAt!: Date;

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
    })
    expiresAt!: Date;

    @Column({
        type: DataType.DATE,
    })
    lastUsedAt?: Date;

    @BelongsTo(() => User)
    user!: User;

    /**
     * Check if token is expired
     */
    isExpired(): boolean {
        return this.expiresAt < new Date();
    }

    /**
     * Invalidate token
     */
    async invalidate(): Promise<void> {
        this.isValid = false;
        await this.save();
    }

    /**
     * Update last used timestamp
     */
    async updateLastUsed(): Promise<void> {
        this.lastUsedAt = new Date();
        await this.save();
    }
}
