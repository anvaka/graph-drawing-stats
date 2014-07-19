var Promise = require("bluebird");
var moment = require("moment");
var request = Promise.promisifyAll(require("request"));
var libraries = require('./libraries');

var cachedStats;
var CACHE_EXPIRE = 20 * 60 * 1000; // in milliseconds

module.exports = getLatestStats;

function getLatestStats() {
  if (cachedStats) return new Promise(giveCache);

  return getGithubStats();
}

function giveCache(resolve) {
  resolve(cachedStats);
}

function getGithubStats() {
  console.log(new Date(), 'Refreshing cache');
  var requests = libraries.map(getLibrary);
  return Promise.all(requests).then(cacheIt).then(repeat);
}

function repeat() {
  setTimeout(getGithubStats, CACHE_EXPIRE);
  return cachedStats;
}

function cacheIt(repositories) {
  cachedStats = {
    timestamp: new Date(),
    repositories: repositories
  };
  return cachedStats;
}

function getLibrary(name) {
  var suffix = '?access_token=' + process.env.GH_TOKEN;
  var url = 'https://api.github.com/repos/' + name + suffix;

  var requestParams = {url: url, headers: { 'User-Agent': 'anvaka/graph-drawing-stats' }};
  return request.getAsync(requestParams)
    .spread(function(response, body) {
      return extractFields(JSON.parse(body));
    });
}

function extractFields(repoInfo) {
  return {
    name: repoInfo.full_name,
    description: repoInfo.description,
    forks: repoInfo.forks,
    watchers: repoInfo.watchers,
    url: repoInfo.html_url,
    issues: repoInfo.open_issues,
    createdTime: new Date(Date.parse(repoInfo.created_at)),
    created: moment(repoInfo.created_at).fromNow(),
    createdTooltip: repoInfo.created_at,
    updatedTime: new Date(Date.parse(repoInfo.pushed_at)),
    updated: moment(repoInfo.pushed_at).fromNow(),
    updatedTooltip: repoInfo.pushed_at,
    commits: 'tbd'
  };
}
