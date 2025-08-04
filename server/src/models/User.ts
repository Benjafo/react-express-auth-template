import {
    Table,
    Column,
    Model,
    DataType,
    Default,
    AllowNull,
    Unique,
    HasMany,
    BeforeCreate,
    BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { RefreshToken } from './RefreshToken';
import { Session } from './Session';
import { AuditLog } from './AuditLog';

@Table({
    tableName: 'users',
    timestamps: true,
    underscored: true,
})
export class User extends Model {
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
    email!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(255),
    })
    password!: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
    })
    isEmailVerified!: boolean;

    @Column({
        type: DataType.STRING(255),
    })
    emailVerificationToken?: string;

    @Column({
        type: DataType.DATE,
    })
    emailVerificationExpires?: Date;

    @Column({
        type: DataType.STRING(255),
    })
    passwordResetToken?: string;

    @Column({
        type: DataType.DATE,
    })
    passwordResetExpires?: Date;

    @Default('user')
    @Column({
        type: DataType.ENUM('user', 'admin'),
    })
    role!: string;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
    })
    isActive!: boolean;

    @Default(0)
    @Column({
        type: DataType.INTEGER,
    })
    loginAttempts!: number;

    @Column({
        type: DataType.DATE,
    })
    lockUntil?: Date;

    @Column({
        type: DataType.DATE,
    })
    lastLoginAt?: Date;

    @HasMany(() => RefreshToken)
    refreshTokens!: RefreshToken[];

    @HasMany(() => Session)
    sessions!: Session[];

    @HasMany(() => AuditLog)
    auditLogs!: AuditLog[];

    /**
     * Hash password before creating user
     */
    @BeforeCreate
    static async hashPasswordBeforeCreate(user: User): Promise<void> {
        if (user.password) {
            const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            user.password = await bcrypt.hash(user.password, rounds);
        }
    }

    /**
     * Hash password before updating if changed
     */
    @BeforeUpdate
    static async hashPasswordBeforeUpdate(user: User): Promise<void> {
        if (user.changed('password') && user.password) {
            const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            user.password = await bcrypt.hash(user.password, rounds);
        }
    }

    /**
     * Compare password with hashed password
     */
    async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    /**
     * Check if account is locked
     */
    isLocked(): boolean {
        return !!(this.lockUntil && this.lockUntil > new Date());
    }

    /**
     * Increment login attempts and lock account if necessary
     */
    async incrementLoginAttempts(): Promise<void> {
        this.loginAttempts += 1;

        if (this.loginAttempts >= 5 && !this.lockUntil) {
            // Lock account for 2 hours
            this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
        }

        await this.save();
    }

    /**
     * Reset login attempts
     */
    async resetLoginAttempts(): Promise<void> {
        this.loginAttempts = 0;
        this.lockUntil = undefined;
        this.lastLoginAt = new Date();
        await this.save();
    }

    /**
     * Get safe user data (without sensitive fields)
     */
    toSafeObject(): Partial<User> {
        const {
            password: _password,
            passwordResetToken: _passwordResetToken,
            emailVerificationToken: _emailVerificationToken,
            ...safeUser
        } = this.toJSON();
        return safeUser;
    }
}
