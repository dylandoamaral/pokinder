import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 50000,
  headers: {
    "Content-type": "application/json",
  },
});

export async function drawFusions(accountId, limit) {
  const params = new URLSearchParams();

  params.set("account_id", accountId);
  params.set("limit", limit);

  const response = await api.get("/fusion/draw?" + params.toString());
  return response.data;
}

export async function getHistory(accountId, filters, limit, offset) {
  const params = new URLSearchParams();

  if (filters.downvoteEnabled) params.append("vote_types", 1);
  if (filters.favoriteEnabled) params.append("vote_types", 2);
  if (filters.upvoteEnabled) params.append("vote_types", 0);

  params.set("account_ids", accountId);
  params.set("head_name_or_category", filters.headNameOrCategory);
  params.set("body_name_or_category", filters.bodyNameOrCategory);
  params.set("limit", limit);
  params.set("offset", offset);

  const response = await api.get("/vote?" + params.toString());
  return { records: response.data, previousOffset: offset };
}

export async function addVote(accountId, fusionId, voteType) {
  const body = {
    account_id: accountId,
    fusion_id: fusionId,
    vote_type: voteType,
  };
  const response = await api.post("/vote/", body);
  return response.data;
}
