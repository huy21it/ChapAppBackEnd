import { config } from 'dotenv';
import { join } from 'path';
import { NotFoundException } from 'src/exceptions';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EUserActiveStatus } from 'src/interfaces/user.interface';

config();

export default class Database {
  private static _instance: Database;

  public static get instance() {
    if (!this._instance) {
      this._instance = new Database();
    }

    return this._instance;
  }

  private databases: { name: string; dataSource: DataSource }[] = [
    {
      name: 'default',
      dataSource: new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        username: 'postgres',
        password: '12345',
        database: 'chat',
        entities: [join(__dirname, '../entities/*.entity.{ts,js}')],
        synchronize: true,
      }),
    },
  ];

  async initialize() {
    const initialDatabasePromises = this.databases.map(async (database) => {
      try {
        await database.dataSource.initialize();
        console.log(`Database ${database.name} initialized`);
      } catch (error) {
        console.log(error);
      }
    });

    await Promise.all(initialDatabasePromises);
  }

  async cleanDatabases() {
    const cleaningPromises = this.databases.map(async (database) => {
      const entities = database.dataSource.entityMetadatas;

      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');

      await database.dataSource.query(`TRUNCATE TABLE ${tableNames} CASCADE;`);
    });

    await Promise.all(cleaningPromises);
  }

  async close() {
    const destroyDatabasePromises = this.databases.map(async (database) =>
      database.dataSource.destroy()
    );

    await Promise.all(destroyDatabasePromises);
  }

  getDataSource(name: string) {
    const target = this.databases.find((item) => item.name === name);

    if (!target) {
      throw new NotFoundException('data_source');
    }

    return target.dataSource;
  }

  async seedUsers(
    data: {
      username: string;
      password: string;
      email: string;
      status?: EUserActiveStatus;
    }[]
  ) {
    const dataSource = this.getDataSource('default');

    const seedPromises = data.map(async (item) => {
      const password = await bcrypt.hash(item.password, await bcrypt.genSalt());

      return dataSource.query(
        `INSERT INTO users (username, password, email, user_active_status ) VALUES ('${
          item.username
        }', '${password}', '${item.email}', '${
          item.status || EUserActiveStatus.Active
        }')`
      );
    });

    await Promise.all(seedPromises);
  }
}
