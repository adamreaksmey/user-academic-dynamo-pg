// import fetch from "node-fetch";

let refreshToken = ``;
const client_id = `security-admin-console`;
let accessToken = `eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJFM3cyN2x0MTNiRHZ1MkowdDlIbGxrT2ZRSC1ucUQ0d0Rtd012dE1IeklNIn0.eyJleHAiOjE3MTUzMjczMTQsImlhdCI6MTcxNTMyNzI1NCwiYXV0aF90aW1lIjoxNzE1MzIwODMwLCJqdGkiOiIwMGZkZWEyNC1jYThiLTRiMGItOTE0NS02ZTYwOWRkN2MyNmYiLCJpc3MiOiJodHRwczovL3NpZ25pbi5pYmZraC5vcmcvcmVhbG1zL21hc3RlciIsInN1YiI6IjMyZGE4ZDcwLTdkYjctNGIyMS04NzY1LTI4YTBlYzljNDVmOSIsInR5cCI6IkJlYXJlciIsImF6cCI6InNlY3VyaXR5LWFkbWluLWNvbnNvbGUiLCJub25jZSI6IjMyZTZiYzFjLTAzODctNDlhNy04MWNhLWJjODY4YmMxN2I3OCIsInNlc3Npb25fc3RhdGUiOiJiNTA2MGVmMi0zNzYzLTRhZGMtODhmNi1lODI3NzE5MGQwMDAiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vc2lnbmluLmliZmtoLm9yZyJdLCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiYjUwNjBlZjItMzc2My00YWRjLTg4ZjYtZTgyNzcxOTBkMDAwIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiJ9.Rgm2ZDK1mQr4WEawInbvzHPfCe-4IFSBZECFNrOiA3DVHktHnTr6NfJ-JsC070UQu3HodLSNmJX-0fa4GSsnxLNGxCbqTsEt0t9SjVUvUK3l7Uz9j9aZUm17hkBk06yHXHObLl-_dkwebtxGEomVHNRPuzVu6zokBOUzQj19C_RGmeC_shgBxGvZpaVqOBPZ_ZddEghOOdmbf8L0FUK_-L-Y-Mcxqwy1lOzmTvKAtnqPnaatD8BjFb7BOC7A5aVluKxRjB3udPR9icbIyKx9T1bbtznNVLrp3OOtzIORmcmIlRp9B1ztz7nUoc7lTof2tnQoeRpoS4cI76YZn1-16w`;

class UnauthorizedError extends Error {}

export const getUserInfoFromKeyCloak = async (
  userId = "9ca1ae93-7fc7-44ce-bb27-91bec68d3b7d"
) => {
  const realm = "Sala-prod";
  const url = `https://signin.ibfkh.org/admin/realms/${realm}/users/${userId}`;

  async function fetchDataWithRetry(currentToken, attempt = 1) {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    };

    try {
      const data = await safeFetch(url, options);
      return data?.username;
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      if (error instanceof UnauthorizedError && attempt < 2) {
        console.log("Attempting to refresh token and retry...");
        
        const newTokens = await refreshKeyCloakToken();
        if (newTokens) {
          return fetchDataWithRetry(accessToken, attempt + 1);
        } else {
          console.error("Failed to refresh token.");
          throw new Error("Token refresh failed.");
        }
      } else {
        throw error;
      }
    }
  }

  return fetchDataWithRetry(accessToken);
};

const refreshKeyCloakToken = async () => {
  const url = `https://signin.ibfkh.org/realms/master/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append("client_id", client_id);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await response.json();
    accessToken = data.access_token;
    refreshToken = data.refresh_token;

    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export const safeFetch = async (url, options, retries = 5) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.log(`HTTP ${response.status}: ${response.statusText} at ${url}`);
      if (response.status === 500) {
        console.error(
          "Internal Server Error: The server encountered an unexpected condition."
        );
      } else if (response.status === 404) {
        console.log("Not Found:", url);
        return null;
      } else if (response.status === 401) {
        throw new UnauthorizedError(
          "Unauthorized: Access Token may have expired."
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error.message);
    if (
      retries > 0 &&
      !(error instanceof UnauthorizedError) &&
      response.status !== 500
    ) {
      console.log(`Retrying... (${retries} retries left)`);
      await delay(1000); // Wait 1 second before retrying
      return await safeFetch(url, options, retries - 1);
    } else {
      throw error;
    }
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
