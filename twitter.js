const request = require('request');

// Replace these with your Twitter API credentials
const TWITTER_API_KEY = 'HnZYMEiRoyOJ9NtCSvKgokrVx';
const TWITTER_API_SECRET_KEY = 'T11tcFthrV2Ja0hz5pdQ5OHeqGXrLxdNMCuQQ3S5ro5qEvwR9H';
const encode_secret = Buffer.from(TWITTER_API_KEY + ':' + TWITTER_API_SECRET_KEY).toString('base64');

// Ethereum address

// Function to encode a string to Base64
function encodeToBase64(input) {
  const buffer = Buffer.from(input, 'utf8');
  return buffer.toString('base64');
}

// Function to get the Twitter bearer token
async function getTwitterBearerToken() {
  return new Promise((resolve, reject) => {
    const encode_secret = encodeToBase64(TWITTER_API_KEY + ':' + TWITTER_API_SECRET_KEY);
    const options = {
      url: 'https://api.twitter.com/oauth2/token',
      headers: {
        'Authorization': 'Basic ' + encode_secret,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: 'grant_type=client_credentials'
    };

    request.post(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const bearerToken = JSON.parse(body).access_token;
        resolve(bearerToken);
      } else {
        reject(error || `Failed to obtain bearer token. Status code: ${response.statusCode}`);
      }
    });
  });
}

// Function to get the Twitter user ID by username
async function getTwitterUsername(ethereumAddress) {
  const apiUrl = `https://prod-api.kosetto.com/users/${ethereumAddress}`;

  return new Promise((resolve, reject) => {
    request.get(apiUrl, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const userData = JSON.parse(body);
        if (userData && userData.twitterUsername) {
          resolve(userData.twitterUsername);
        } else {
          reject("Twitter username not found in the response.");
        }
      } else {
        reject(error || `Failed to retrieve data. Status code: ${response.statusCode}`);
      }
    });
  });
}

// Function to get the number of Twitter followers
async function getFollowersCount(username, bearerToken) {
  const apiUrl = `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics;`

  const options = {
    method: 'GET',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${bearerToken}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) { 
        const data = JSON.parse(body);
        
       if (data.data && data.data.public_metrics && typeof data.data.public_metrics.followers_count !== 'undefined') {
        resolve(data.data.public_metrics.followers_count);
          console.log(data.data.public_metrics.followers_count);
        } else {
          resolve(false);
        }
      } else {
        reject(error || `Failed to retrieve followers count. Status code: ${response.statusCode}`);
      }
    });
  });
}

// Function to check Twitter followers count and return true if above 2000, otherwise false
async function checkTwitterFollowers(ethereumAddress) {
  try {
    const bearerToken = await getTwitterBearerToken();
    console.log('Bearer Token:', bearerToken);

    const twitterUsername = await getTwitterUsername(ethereumAddress);
    console.log(`Twitter Username: @${twitterUsername}`);


    const followersCount = await getFollowersCount(twitterUsername, bearerToken);
    console.log(`Followers count for @${twitterUsername}: ${followersCount}`);

   
  if (typeof followersCount !== 'undefined' && followersCount > 2000) {
      return true;
    } else {
      return false;
    }



  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

// Example usage:
//checkTwitterFollowers(ethereumAddress)
  //.then((result) => {
   // console.log('Result:', result);
  //})
  //.catch((error) => {
   // console.error('Error:', error.message);
  //});
module.exports = {
  checkTwitterFollowers
};
