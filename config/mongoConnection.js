import { MongoClient } from "mongodb";
import { mongoConfig } from "./settings.js";

let _connection;
let _db;

export const dbConnection = async () => {
	if (!_connection) {
		_connection = await MongoClient.connect(mongoConfig.serverUrl);
		_db = _connection.db(mongoConfig.database);
	}

	return _db;
};

export const closeConnection = async () => {
	await _connection.close();
};
