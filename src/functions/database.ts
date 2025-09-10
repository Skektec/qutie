import { Pool, QueryResult, QueryResultRow } from 'pg';
import { db_password } from '../data/config.json';

const pool = new Pool({
	user: 'bot',
	host: '192.168.1.247',
	database: 'qutie_db',
	password: db_password,
	port: 5432
});

pool
	.connect()
	.then((client: any) => {
		console.log('Postgres connection successful!');
		client.release();
	})
	.catch((err: any) => {
		console.error('Postgres connection failed:', err.message);
		process.exit(1);
	});

export const database = {
	query: <T extends QueryResultRow = any>(
		text: string,
		params?: any[]
	): Promise<QueryResult<T>> => {
		return pool.query(text, params);
	},
	pool
};
