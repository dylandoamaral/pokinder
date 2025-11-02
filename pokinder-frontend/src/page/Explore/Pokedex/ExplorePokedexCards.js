import { getExploreFusionCount, getExplorePokedex } from "../../../api/pokinder";

import { getName, getTypes } from "../../../utils/pokemon";

import ExploreCardLocked from "../ExploreCardLocked";
import ExploreCardsGrid from "../ExploreCardsGrid";
import ExplorePokedexCard from "./ExplorePokedexCard";

export default function ExplorePokedexCards({ filters }) {
  function renderCard(data) {
    const fusionId = data.fusion_id;

    if (data.has_voted === false) return <ExploreCardLocked key={fusionId} fusionId={fusionId} />;

    const fusionPath = data.fusion_information.fusion_path;
    const fusionIsRemoved = data.fusion_is_removed;

    const fusionName = getName(
      data.fusion_information.fusion_head_name,
      data.fusion_information.fusion_head_name_separator_index,
      data.fusion_information.fusion_body_name,
      data.fusion_information.fusion_body_name_separator_index,
    );
    const fusionReferences = data.fusion_references;

    const fusionTypes = getTypes(
      data.fusion_information.fusion_head_type_1,
      data.fusion_information.fusion_head_type_2,
      data.fusion_information.fusion_body_type_1,
      data.fusion_information.fusion_body_type_2,
    );
    const fusionType1 = fusionTypes[0];
    const fusionType2 = fusionTypes[1];
    const fusionWeight = (
      (data.fusion_information.fusion_head_weight + data.fusion_information.fusion_body_weight) /
      2 /
      10
    ).toFixed(1);
    const fusionHeight = data.fusion_information.fusion_body_height * 10;

    return (
      <ExplorePokedexCard
        key={fusionId}
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionIsRemoved={fusionIsRemoved}
        fusionName={fusionName}
        fusionReferences={fusionReferences}
        fusionType1={fusionType1}
        fusionType2={fusionType2}
        fusionWeight={fusionWeight}
        fusionHeight={fusionHeight}
      />
    );
  }

  async function loadItems(filters, limit, offset) {
    return await getExplorePokedex(filters, limit, offset);
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
