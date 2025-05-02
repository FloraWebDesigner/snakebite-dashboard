
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export const getDBConnection = async () => {
    if (pool) {
        try {
            await pool.getConnection();
            return pool;
        } catch (err) {
            console.warn("Connection expired, recreating pool...");
            pool = null; 
        }
    }

    console.log("Initializing new DB connection pool...");
    
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'myapp',
            port: parseInt(process.env.DB_PORT || '3306'), 
            waitForConnections: true,
            connectionLimit: 10, 
            queueLimit: 0
        });

        const conn = await pool.getConnection();
        conn.release();
        
        return pool;
    } catch (error) {
        console.error("DB connection failed:", error);
        throw new Error("Database connection error");
    }
};