import http from "./http";

export async function signup(accountId, username, email, password) {
  const body = {
    account_id: accountId,
    username: username,
    email: email,
    password: password,
  };

  const response = await http.post("/account/signup/", body);

  return response.data;
}

export async function login(username_or_email, password) {
  const body = {
    username_or_email: username_or_email,
    password: password,
  };

  const response = await http.post("/account/login/", body);

  return response.data;
}

export async function refresh(refreshToken) {
  const params = new URLSearchParams();

  params.set("refresh_token", refreshToken);

  const response = await http.post("/account/refresh?" + params.toString());

  return response.data;
}

export async function listCreators() {
  const response = await http.get("/creator");

  return response.data;
}

export async function drawFusions(limit) {
  const params = new URLSearchParams();

  params.set("limit", limit);

  const response = await http.get("/fusion/draw?" + params.toString());

  return response.data;
}

export async function getHistory(filters, limit, offset) {
  const params = new URLSearchParams();

  if (filters.downvoteEnabled) params.append("vote_types", 1);
  if (filters.favoriteEnabled) params.append("vote_types", 2);
  if (filters.upvoteEnabled) params.append("vote_types", 0);

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/vote?" + params.toString());

  return { records: response.data, previousOffset: offset };
}

export async function getRanking(filters, limit, offset) {
  const params = new URLSearchParams();

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/fusion/ranking?" + params.toString());

  return { records: response.data, previousOffset: offset };
}

export async function getAnalytics() {
  const response = await http.get("/analytics");

  return response.data;
}

export async function addVote(fusionId, voteType) {
  const body = {
    fusion_id: fusionId,
    vote_type: voteType,
  };

  const response = await http.post("/vote/", body);

  return response.data;
}

export async function listReferenceProposal(limit, offset) {
  const params = new URLSearchParams();

  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/reference_proposal?" + params.toString());

  return { records: response.data, previousOffset: offset };
}

export async function addReferenceProposal(fusionId, referenceName, referenceFamilyName) {
  const body = {
    fusions_id: fusionId,
    reference_name: referenceName,
    reference_family_name: referenceFamilyName,
  };

  const response = await http.post("/reference_proposal/", body);

  return response.data;
}

export async function refuseReferenceProposal(proposalId, reason) {
  const body = {
    proposal_id: proposalId,
    reason: reason,
  };

  const response = await http.post("/reference_proposal/refuse", body);

  return response.data;
}