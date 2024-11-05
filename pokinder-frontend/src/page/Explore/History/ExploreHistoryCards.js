import { getExploreHistory, getExploreHistoryCount } from "../../../api/pokinder";

import { getName } from "../../../utils/pokemon";

import ExploreCardsGrid from "../ExploreCardsGrid";
import ExploreHistoryCard from "./ExploreHistoryCard";

export default function ExploreHistoryCards({ filters }) {
  function renderCard(data) {
    const fusionId = data.fusion_id;
    const fusionPath = data.fusion_path;
    const fusionName = getName(
      data.fusion_head_name,
      data.fusion_head_name_separator_index,
      data.fusion_body_name,
      data.fusion_body_name_separator_index,
    );
    const fusionVoteType = data.vote_type;
    const fusionVoteAt = data.vote_created_at;

    return (
      <ExploreHistoryCard
        key={fusionId}
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionVoteType={fusionVoteType}
        fusionVoteAt={fusionVoteAt}
      />
    );
  }

  async function loadItems(filters, limit, offset) {
    return await getExploreHistory(filters, limit, offset);
  }

  async function loadItemsCount(filters) {
    return await getExploreHistoryCount(filters);
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
