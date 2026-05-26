import * as process from "node:process";

export default () => ({
    sql: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '3306', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME,
      },
    port: 3000,
    jwtSecret: process.env.JWT_SECRET
})