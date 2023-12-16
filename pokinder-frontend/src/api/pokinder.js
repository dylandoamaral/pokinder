import http from "./http";

export async function signup(accountId, username, email, password) {
  const body = {
    account_id: accountId,
    username: username,
    email: email,
    password: password,
  };

  const response = await http().post("/account/signup/", body);

  return response.data;
}

export async function login(username_or_email, password) {
  const body = {
    username_or_email: username_or_email,
    password: password,
  };

  const response = await http().post("/account/login/", body);

  return response.data;
}

export async function drawFusions(limit) {
  const params = new URLSearchParams();

  params.set("limit", limit);

  const response = await http().get("/fusion/draw?" + params.toString());

  return response.data;
}

export async function getHistory(filters, limit, offset) {
  const params = new URLSearchParams();

  if (filters.downvoteEnabled) params.append("vote_types", 1);
  if (filters.favoriteEnabled) params.append("vote_types", 2);
  if (filters.upvoteEnabled) params.append("vote_types", 0);

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http().get("/vote?" + params.toString());

  return { records: response.data, previousOffset: offset };
}

export async function addVote(fusionId, voteType) {
  const body = {
    fusion_id: fusionId,
    vote_type: voteType,
  };

  const response = await http().post("/vote/", body);

  return response.data;
}
