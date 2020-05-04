const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.cacheDuration = options.duration || 60;
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    // console.log('Serving from MongoDB...', this.mongooseCollection.name);
    return await exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  // Check redis cache
  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    // console.log('Serving from cache...', this.mongooseCollection.name);
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
    // return this.model.hydrate(doc);
  }

  // console.log('Serving from MongoDB...', this.mongooseCollection.name);
  // Run query on MongoDB
  const result = await exec.apply(this, arguments);
  client.hset(
    this.hashKey,
    key,
    JSON.stringify(result),
    'EX',
    this.cacheDuration
  );
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
