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

export async function resetPassword(email) {
  const body = {
    email: email,
  };

  await http.post("/account/reset_password/", body);
}

export async function changePassword(token, password) {
  const body = {
    token: token,
    password: password,
  };

  await http.post("/account/change_password/", body);
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
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
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
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/fusion/ranking?" + params.toString());

  return { records: response.data, previousOffset: offset };
}

export async function getExploreHistoryCount(filters) {
  const params = new URLSearchParams();

  if (filters.downvoteEnabled) params.append("vote_types", 1);
  if (filters.favoriteEnabled) params.append("vote_types", 2);
  if (filters.upvoteEnabled) params.append("vote_types", 0);

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);

  const response = await http.get("/explore/history/count?" + params.toString());

  return response.data;
}

export async function getExploreHistory(filters, limit, offset) {
  const params = new URLSearchParams();

  if (filters.downvoteEnabled) params.append("vote_types", 1);
  if (filters.favoriteEnabled) params.append("vote_types", 2);
  if (filters.upvoteEnabled) params.append("vote_types", 0);

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/explore/history?" + params.toString());

  return response.data;
}

export async function getExploreFusionCount(filters) {
  const params = new URLSearchParams();

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);

  const response = await http.get("/explore/fusion/count?" + params.toString());

  return response.data;
}

export async function getExplorePokedex(filters, limit, offset) {
  const params = new URLSearchParams();

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/explore/pokedex?" + params.toString());

  return response.data;
}

export async function getExploreRanking(filters, limit, offset) {
  const params = new URLSearchParams();

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/explore/ranking?" + params.toString());

  return response.data;
}

export async function getExploreReferenceCount(filters) {
  const params = new URLSearchParams();

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);

  const response = await http.get("/explore/reference/count?" + params.toString());

  return response.data;
}

export async function getExploreReference(filters, limit, offset) {
  const params = new URLSearchParams();

  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("reference_family_name", filters.referenceFamilyName);
  params.set("reference_name", filters.referenceName);
  params.set("creator_name", filters.creatorName);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await http.get("/explore/reference?" + params.toString());

  return response.data;
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

export async function listReferenceFamilies() {
  const response = await http.get("/reference_family");

  return response.data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listReferences(referenceFamilyId, referenceFamilyName) {
  if (referenceFamilyId === undefined && referenceFamilyName === undefined)
    return Promise.resolve([]);

  const params = new URLSearchParams();

  if (referenceFamilyId !== undefined) params.set("reference_family_id", referenceFamilyId);
  if (referenceFamilyName !== undefined) params.set("reference_family_name", referenceFamilyName);

  const response = await http.get("/reference?" + params.toString());

  return response.data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listReferenceProposals(
  limit,
  offset,
  proposerId = undefined,
  statuses = undefined,
  isDesc = false,
) {
  const params = new URLSearchParams();

  params.set("limit", limit);
  params.set("offset", offset);
  params.set("is_desc", isDesc);

  if (proposerId !== undefined) params.set("proposer_id", proposerId);
  if (statuses !== undefined) params.set("statuses", statuses);

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

export async function refuseReferenceProposal(referenceProposalId, reason) {
  const body = {
    reference_proposal_id: referenceProposalId,
    reason: reason,
  };

  const response = await http.post("/reference_proposal/refuse", body);

  return response.data;
}

export async function acceptReferenceProposalAndCreateReferenceAndFamily(
  fusionId,
  referenceFamilyName,
  referenceName,
  referenceSource,
  referenceProposalId,
) {
  const body = {
    fusion_id: fusionId,
    reference_family_name: referenceFamilyName,
    reference_name: referenceName,
    reference_source: referenceSource,
    reference_proposal_id: referenceProposalId,
  };

  const response = await http.post("/reference_proposal/accept_reference_family", body);

  return response.data;
}

export async function acceptReferenceProposalAndCreateReference(
  fusionId,
  referenceFamilyId,
  referenceName,
  referenceSource,
  referenceProposalId,
) {
  const body = {
    fusion_id: fusionId,
    reference_family_id: referenceFamilyId,
    reference_name: referenceName,
    reference_source: referenceSource,
    reference_proposal_id: referenceProposalId,
  };

  const response = await http.post("/reference_proposal/accept_reference", body);

  return response.data;
}

export async function acceptReferenceProposal(fusionId, referenceId, referenceProposalId) {
  const body = {
    fusion_id: fusionId,
    reference_id: referenceId,
    reference_proposal_id: referenceProposalId,
  };

  const response = await http.post("/reference_proposal/accept", body);

  return response.data;
}
