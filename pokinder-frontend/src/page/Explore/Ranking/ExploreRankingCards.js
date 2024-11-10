import { getExploreFusionCount, getExploreRanking } from "../../../api/pokinder";

import { getName, getScore } from "../../../utils/pokemon";

import ExploreCardsGrid from "../ExploreCardsGrid";
import ExploreRankingCard from "./ExploreRankingCard";

export default function ExploreRankingCards({ filters }) {
  function renderCard(data) {
    const fusionId = data.fusion_id;
    const fusionPath = data.fusion_path;
    const fusionName = getName(
      data.fusion_head_name,
      data.fusion_head_name_separator_index,
      data.fusion_body_name,
      data.fusion_body_name_separator_index,
    );
    const fusionRank = data.fusion_rank;
    const fusionScore = getScore(data.fusion_score);
    const fusionVoteCount = data.fusion_vote_count;

    return (
      <ExploreRankingCard
        key={fusionId}
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionRank={fusionRank}
        fusionScore={fusionScore}
        fusionVoteCount={fusionVoteCount}
      />
    );
  }

  async function loadItems(filters, limit, offset) {
    return await getExploreRanking(filters, limit, offset);
  }

  async function loadItemsCount(filters) {
    return await getExploreFusionCount(filters);
  }

  return (
    <ExploreCardsGrid
      filters={filters}
      loadItems={loadItems}
      loadItemsCount={loadItemsCount}
      renderCard={renderCard}
    />
  );
}
