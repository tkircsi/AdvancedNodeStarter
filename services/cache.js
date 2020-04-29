const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (duration = 5) {
  this.cacheDuration = duration;
  this.useCache = true;
  return this;
};

mongoose.Query.prototype.exec = async function () {
  console.log(this.getQuery());
  if (!this.useCache) {
    console.log('Serving from MongoDB...', this.mongooseCollection.name);
    return await exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  // Check redis cache
  const cacheValue = await client.get(key);
  if (cacheValue) {
    console.log('Serving from cache...', this.mongooseCollection.name);
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
    // return this.model.hydrate(doc);
  }

  console.log('Serving from MongoDB...', this.mongooseCollection.name);
  // Run query on MongoDB
  const result = await exec.apply(this, arguments);
  client.set(key, JSON.stringify(result), 'EX', this.cacheDuration);
  return result;
};
