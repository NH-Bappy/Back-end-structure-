const crypto = require('crypto')





exports.fetchTransactionId = () => {
    const value = crypto.randomUUID();//crypto.randomUUID() → creates a universally unique identifier (UUID) like 550e8400-e29b-41d4-a716-446655440000.
    // console.log(value);
    const parts = value.split("-");
    return parts[parts.length - 1]
}