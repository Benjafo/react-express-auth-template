'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable UUID extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_verification_token: {
        type: Sequelize.STRING(255)
      },
      email_verification_expires: {
        type: Sequelize.DATE
      },
      password_reset_token: {
        type: Sequelize.STRING(255)
      },
      password_reset_expires: {
        type: Sequelize.DATE
      },
      role: {
        type: Sequelize.STRING(50),
        defaultValue: 'user',
        validate: {
          isIn: [['user', 'admin']]
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lock_until: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_login_at: {
        type: Sequelize.DATE
      }
    });

    // Create indexes for users table
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['email_verification_token']);
    await queryInterface.addIndex('users', ['password_reset_token']);

    // Create refresh_tokens table
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      device_info: {
        type: Sequelize.JSONB
      },
      is_valid: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      last_used_at: {
        type: Sequelize.DATE
      }
    });

    // Create indexes for refresh_tokens table
    await queryInterface.addIndex('refresh_tokens', ['token']);
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
    await queryInterface.addIndex('refresh_tokens', ['expires_at']);

    // Create login_attempts table
    await queryInterface.createTable('login_attempts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ip_address: {
        type: Sequelize.INET
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      success: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      attempted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for login_attempts table
    await queryInterface.addIndex('login_attempts', ['email']);
    await queryInterface.addIndex('login_attempts', ['ip_address']);
    await queryInterface.addIndex('login_attempts', ['attempted_at']);

    // Create sessions table
    await queryInterface.createTable('sessions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      session_id: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      data: {
        type: Sequelize.JSONB
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for sessions table
    await queryInterface.addIndex('sessions', ['session_id']);
    await queryInterface.addIndex('sessions', ['user_id']);
    await queryInterface.addIndex('sessions', ['expires_at']);

    // Create audit_logs table
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(50)
      },
      entity_id: {
        type: Sequelize.INTEGER
      },
      old_values: {
        type: Sequelize.JSONB
      },
      new_values: {
        type: Sequelize.JSONB
      },
      ip_address: {
        type: Sequelize.INET
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for audit_logs table
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['created_at']);

    // Create update_updated_at_column function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop triggers
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users;');
    
    // Drop function
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_updated_at_column();');
    
    // Drop tables in reverse order
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('sessions');
    await queryInterface.dropTable('login_attempts');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('users');
  }
};