import {Account, Client, Databases, Storage} from "appwrite";

let client: Client | null = null;
let account: Account | null = null;
let database: Databases | null = null;
let storage: Storage | null = null;

function getRequiredEnv(name: string): string {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function initAppwrite() {
    if (client) return;

    const endpointUrl = getRequiredEnv('VITE_APPWRITE_ENDPOINT');
    const projectId = getRequiredEnv('VITE_APPWRITE_PROJECT_ID');

    client = new Client()
        .setEndpoint(endpointUrl)
        .setProject(projectId);

    account = new Account(client);
    database = new Databases(client);
    storage = new Storage(client);
}

export const appwriteConfig = {
    get endpointUrl() { return import.meta.env.VITE_APPWRITE_ENDPOINT; },
    get projectId() { return import.meta.env.VITE_APPWRITE_PROJECT_ID; },
    get apiKey() { return import.meta.env.VITE_APPWRITE_API_KEY; },
    get databaseId() { return import.meta.env.VITE_APPWRITE_DATABASE_ID; },
    get userCollectionId() { return import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID; },
    get tripCollectionId() { return import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID; },
};

export function getClient() {
    initAppwrite();
    return client!;
}

export function getAccount() {
    initAppwrite();
    return account!;
}

export function getDatabase() {
    initAppwrite();
    return database!;
}

export function getStorage() {
    initAppwrite();
    return storage!;
}