function checkEnvFile(name: string) {
    if (process.env[name] === undefined) {
        console.error(`Error: ${name} is not set. Please set it in .env.`);
        process.exit(1);
    }
}
checkEnvFile("DATABASE_URL");
checkEnvFile("DIRECT_URL");
checkEnvFile("AUTH_SECRET");
