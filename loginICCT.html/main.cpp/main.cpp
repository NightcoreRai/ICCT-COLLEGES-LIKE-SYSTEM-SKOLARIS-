#include "database.h"
#include <iostream>
#include <openssl/sha.h>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <ctime>

Database::Database() {
    if (sqlite3_open("portal.db", &db)) {
        std::cerr << "Can't open database\n";
        throw std::runtime_error("DB open failed");
    }
    initTables();
}

Database::~Database() {
    sqlite3_close(db);
}

void Database::initTables() {
    const char* sql = R"(
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS user_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            data_key TEXT NOT NULL,
            data_value TEXT,
            UNIQUE(username, data_key)
        );
    )";
    
    char* err;
    if (sqlite3_exec(db, sql, nullptr, nullptr, &err) != SQLITE_OK) {
        std::cerr << "SQL Error: " << err << std::endl;
        sqlite3_free(err);
    }
}

std::string Database::hashPassword(const std::string& password) {
    // Simple SHA256 hash - in production use bcrypt
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char*)password.c_str(), password.length(), hash);
    
    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

bool Database::verifyPassword(const std::string& password, const std::string& hash) {
    return hashPassword(password) == hash;
}

bool Database::createUser(const std::string& username, const std::string& password) {
    std::string hash = hashPassword(password);
    
    std::string sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, hash.c_str(), -1, SQLITE_TRANSIENT);
    
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

bool Database::userExists(const std::string& username) {
    std::string sql = "SELECT COUNT(*) FROM users WHERE username = ?";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    
    int count = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        count = sqlite3_column_int(stmt, 0);
    }
    
    sqlite3_finalize(stmt);
    return count > 0;
}

bool Database::verifyUser(const std::string& username, const std::string& password) {
    std::string sql = "SELECT password_hash FROM users WHERE username = ?";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    
    std::string storedHash;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        storedHash = (char*)sqlite3_column_text(stmt, 0);
    }
    
    sqlite3_finalize(stmt);
    
    if (storedHash.empty()) return false;
    return verifyPassword(password, storedHash);
}

bool Database::saveData(const std::string& username, const std::string& key, const std::string& value) {
    std::string sql = "INSERT OR REPLACE INTO user_data (username, data_key, data_value) VALUES (?, ?, ?)";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, key.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, value.c_str(), -1, SQLITE_TRANSIENT);
    
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

std::string Database::getData(const std::string& username, const std::string& key) {
    std::string sql = "SELECT data_value FROM user_data WHERE username = ? AND data_key = ?";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return "";
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, key.c_str(), -1, SQLITE_TRANSIENT);
    
    std::string value;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        value = (char*)sqlite3_column_text(stmt, 0);
    }
    
    sqlite3_finalize(stmt);
    return value;
}

bool Database::backup(const std::string& backupPath) {
    // Simple file copy backup
    FILE* src = fopen("portal.db", "rb");
    FILE* dst = fopen(backupPath.c_str(), "wb");
    
    if (!src || !dst) {
        if (src) fclose(src);
        if (dst) fclose(dst);
        return false;
    }
    
    char buffer[8192];
    size_t bytes;
    while ((bytes = fread(buffer, 1, sizeof(buffer), src)) > 0) {
        fwrite(buffer, 1, bytes, dst);
    }
    
    fclose(src);
    fclose(dst);
    return true;
}
#include <iostream>
#include <openssl/sha.h>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <ctime>

Database::Database() {
    if (sqlite3_open("portal.db", &db)) {
        std::cerr << "Can't open database\n";
        throw std::runtime_error("DB open failed");
    }
    initTables();
}

Database::~Database() {
    sqlite3_close(db);
}

void Database::initTables() {
    const char* sql = R"(
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS user_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            data_key TEXT NOT NULL,
            data_value TEXT,
            UNIQUE(username, data_key)
        );
    )";
    
    char* err;
    if (sqlite3_exec(db, sql, nullptr, nullptr, &err) != SQLITE_OK) {
        std::cerr << "SQL Error: " << err << std::endl;
        sqlite3_free(err);
    }
}

std::string Database::hashPassword(const std::string& password) {
    // Simple SHA256 hash - in production use bcrypt
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char*)password.c_str(), password.length(), hash);
    
    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

bool Database::verifyPassword(const std::string& password, const std::string& hash) {
    return hashPassword(password) == hash;
}

bool Database::createUser(const std::string& username, const std::string& password) {
    std::string hash = hashPassword(password);
    
    std::string sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, hash.c_str(), -1, SQLITE_TRANSIENT);
    
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

bool Database::userExists(const std::string& username) {
    std::string sql = "SELECT COUNT(*) FROM users WHERE username = ?";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    
    int count = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        count = sqlite3_column_int(stmt, 0);
    }
    
    sqlite3_finalize(stmt);
    return count > 0;
}

bool Database::verifyUser(const std::string& username, const std::string& password) {
    std::string sql = "SELECT password_hash FROM users WHERE username = ?";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    
    std::string storedHash;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        storedHash = (char*)sqlite3_column_text(stmt, 0);
    }
    
    sqlite3_finalize(stmt);
    
    if (storedHash.empty()) return false;
    return verifyPassword(password, storedHash);
}

bool Database::saveData(const std::string& username, const std::string& key, const std::string& value) {
    std::string sql = "INSERT OR REPLACE INTO user_data (username, data_key, data_value) VALUES (?, ?, ?)";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, key.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, value.c_str(), -1, SQLITE_TRANSIENT);
    
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

std::string Database::getData(const std::string& username, const std::string& key) {
    std::string sql = "SELECT data_value FROM user_data WHERE username = ? AND data_key = ?";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return "";
    }
    
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, key.c_str(), -1, SQLITE_TRANSIENT);
    
    std::string value;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        value = (char*)sqlite3_column_text(stmt, 0);
    }
    
    sqlite3_finalize(stmt);
    return value;
}

bool Database::backup(const std::string& backupPath) {
    // Simple file copy backup
    FILE* src = fopen("portal.db", "rb");
    FILE* dst = fopen(backupPath.c_str(), "wb");
    
    if (!src || !dst) {
        if (src) fclose(src);
        if (dst) fclose(dst);
        return false;
    }
    
    char buffer[8192];
    size_t bytes;
    while ((bytes = fread(buffer, 1, sizeof(buffer), src)) > 0) {
        fwrite(buffer, 1, bytes, dst);
    }
    
    fclose(src);
    fclose(dst);
    return true;
}