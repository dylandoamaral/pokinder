import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

import { useAfterEffect } from "../../hook/useAfterEffect";
import { useAuthentication } from "../../hook/useAuthentication";

import { getAnalytics } from "../../api/pokinder";

import Page from "../../component/organism/Page/Page";

import styles from "./Analytics.module.css";
import FavoritePanel from "./FavoritePanel";
import InformationPanel from "./InformationPanel";

function Analytics() {
  const { t, i18n } = useTranslation();
  const { token } = useAuthentication();

  const { refetch, data, isLoading, isError } = useQuery(["anyltics"], getAnalytics, {
    staleTime: 60 * 60 * 1000,
    cacheTime: 0,
  });

  useAfterEffect(() => {
    refetch();
  }, [token, refetch]);

  if (isError) return <p>{t("The API is down for the moment, sorry for the inconvenience.")}</p>;

  function getPercentage(current, total) {
    if (current === 0) return "0.00%";
    const percentage = (current / total) * 100;
    return percentage.toFixed(2) + "%";
  }

  function getGridStyle(suffix) {
    return `${styles.grid} ${styles["grid" + suffix]}`;
  }

  function getDate() {
    if (data?.user?.created_at === null) {
      return "Not registered";
    } else {
      const date = new Date(data?.user?.created_at);
      const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      return date.toLocaleDateString(i18n.language, options);
    }
  }

  return (
    <Page
      name={t("Analytics")}
      description="Gain insights into user and community dynamics."
      overflow={"scroll"}
    >
      <h2 className={styles.title}>{t("Community statistics")}</h2>
      <div className={styles.grids}>
        <div className={getGridStyle(3)}>
          <InformationPanel
            title="Number of votes"
            value={data?.community?.vote_count}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Number of fusions"
            value={data?.community?.fusion_count}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Number of artists"
            value={data?.community?.creator_count}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of dislikes"
            value={getPercentage(data?.community?.dislike_count, data?.community?.vote_count)}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of favorites"
            value={getPercentage(data?.community?.favorite_count, data?.community?.vote_count)}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of likes"
            value={getPercentage(data?.community?.like_count, data?.community?.vote_count)}
            isLoading={isLoading}
          />
        </div>
        <div className={getGridStyle("3favorite")}>
          <FavoritePanel
            title="Favorite pokemon head"
            data={data?.community?.favorite_pokemon_head}
            type="pokemon"
            isUser={false}
            isHead={true}
            isLoading={isLoading}
          />
          <FavoritePanel
            title="Favorite pokemon body"
            data={data?.community?.favorite_pokemon_body}
            type="pokemon"
            isUser={false}
            isHead={false}
            isLoading={isLoading}
          />
          <FavoritePanel
            title="Favorite artist"
            data={data?.community?.favorite_creator}
            type="fusion"
            isUser={false}
            isLoading={isLoading}
          />
        </div>
      </div>
      <h2 className={styles.title}>{t("User statistics")}</h2>
      <div className={styles.grids}>
        <div className={getGridStyle(4)}>
          <InformationPanel
            title="Rank"
            value={`${data?.user?.rank} / ${data?.community?.account_count}`}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of contribution"
            value={getPercentage(data?.user?.vote_count, data?.community?.vote_count)}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Collection"
            value={getPercentage(data?.user?.vote_count, data?.community?.fusion_count)}
            isLoading={isLoading}
          />
          <InformationPanel title="Date of inscription" value={getDate()} isLoading={isLoading} />
          <InformationPanel
            title="Number of votes"
            value={data?.user?.vote_count}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of dislikes"
            value={getPercentage(data?.user?.dislike_count, data?.user?.vote_count)}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of favorites"
            value={getPercentage(data?.user?.favorite_count, data?.user?.vote_count)}
            isLoading={isLoading}
          />
          <InformationPanel
            title="Percentage of likes"
            value={getPercentage(data?.user?.like_count, data?.user?.vote_count)}
            isLoading={isLoading}
          />
        </div>
        <div className={getGridStyle("3favorite")}>
          <FavoritePanel
            title="Favorite pokemon head"
            data={data?.user?.favorite_pokemon_head}
            type="pokemon"
            isUser={true}
            isHead={true}
            isLoading={isLoading}
          />
          <FavoritePanel
            title="Favorite pokemon body"
            data={data?.user?.favorite_pokemon_body}
            type="pokemon"
            isUser={true}
            isHead={false}
            isLoading={isLoading}
          />
          <FavoritePanel
            title="Favorite artist"
            data={data?.user?.favorite_creator}
            type="fusion"
            isUser={true}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Page>
  );
}

export default Analytics;
