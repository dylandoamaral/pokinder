import { useState, useRef, useEffect } from "react";
import { useQuery } from "react-query";
import { drawFusions } from "../../../api/pokinder";
import Card from "../../molecule/Card/Card";
import styles from "./Deck.module.css";
import FakeCard from "../../molecule/FakeCard/FakeCard";
import useAccountId from "../../../hook/useAccountId";
import Button from "../../atom/Button/Button";

function Deck() {
  // Number of card in the deck before trigerring a new fetch.
  const THRESHOLD_FETCH_NEW_FUSIONS = 40;
  // Number of card fetch per refresh.
  const AMOUNT_FETCH_NEW_FUSIONS = 50;

  /**
  const fusions = [
    {
      pack_id: "f9e730c6-d4c6-4c37-94ec-c630cd3eac74",
      creator_id: "53cd79ab-6a54-4642-a9f3-46d3fd8c36e4",
      head_id: "f71bf148-35ff-487f-880f-3f74fbe6c237",
      body_id: "afce7674-d2f2-4f73-b891-aa81855105f6",
      created_at: "2023-10-02T06:14:51.674820Z",
      pack: {
        name: "2023-july",
        created_at: "2023-10-02T06:14:51.039903Z",
        id: "f9e730c6-d4c6-4c37-94ec-c630cd3eac74",
      },
      creator: {
        name: "afewgoodplants",
        created_at: "2023-10-02T06:14:50.963379Z",
        id: "53cd79ab-6a54-4642-a9f3-46d3fd8c36e4",
      },
      head: {
        name: "Honchkrow",
        created_at: "2023-10-02T06:14:51.045955Z",
        id: "f71bf148-35ff-487f-880f-3f74fbe6c237",
        pokedex_id: 256,
      },
      body: {
        name: "Tangrowth",
        created_at: "2023-10-02T06:14:51.045958Z",
        id: "afce7674-d2f2-4f73-b891-aa81855105f6",
        pokedex_id: 266,
      },
      id: "b257ae8e-a84e-490c-bfad-fdae8841f3ce",
      path: "256.266",
    },
    {
      pack_id: "f9e730c6-d4c6-4c37-94ec-c630cd3eac74",
      creator_id: "53cd79ab-6a54-4642-a9f3-46d3fd8c36e4",
      head_id: "f71bf148-35ff-487f-880f-3f74fbe6c237",
      body_id: "afce7674-d2f2-4f73-b891-aa81855105f6",
      created_at: "2023-10-02T06:14:51.674820Z",
      pack: {
        name: "2023-july",
        created_at: "2023-10-02T06:14:51.039903Z",
        id: "f9e730c6-d4c6-4c37-94ec-c630cd3eac74",
      },
      creator: {
        name: "afewgoodplants",
        created_at: "2023-10-02T06:14:50.963379Z",
        id: "53cd79ab-6a54-4642-a9f3-46d3fd8c36e4",
      },
      head: {
        name: "Honchkrow",
        created_at: "2023-10-02T06:14:51.045955Z",
        id: "f71bf148-35ff-487f-880f-3f74fbe6c237",
        pokedex_id: 256,
      },
      body: {
        name: "Tangrowth",
        created_at: "2023-10-02T06:14:51.045958Z",
        id: "afce7674-d2f2-4f73-b891-aa81855105f6",
        pokedex_id: 266,
      },
      id: "b257ae8e-a84e-490c-bfad-fdae8841f3ce",
      path: "256.266",
    },
  ];
  */

  const children = useRef([]);

  // Current children index.
  const currentChildrenIndex = useRef(0);
  // Used to give an unique identifier to a fusion.
  const totalSwipe = useRef(0);
  // Used to track the number of left current fusions.
  const totalLeftScreen = useRef(0);

  const [fusions, setFusions] = useState([]);
  const accountId = useAccountId();

  useEffect(() => {
    children.current = children.current.slice(0, fusions.length);
    currentChildrenIndex.current -= totalLeftScreen.current;
    totalLeftScreen.current = 0;
  }, [fusions]);

  // Refresh fusions adding new fetched fusions and removing the already swipped one.
  const refreshFusions = (newFusions) => {
    totalSwipe.current += totalLeftScreen.current;
    setFusions((fusions) =>
      fusions.slice(totalLeftScreen.current).concat(newFusions)
    );
  };

  const drawNewFusions = async () => {
    const newFusions = await drawFusions(accountId, AMOUNT_FETCH_NEW_FUSIONS);
    refreshFusions(newFusions);
  };

  const {
    refetch: refetchFusions,
    isLoading,
    isError,
  } = useQuery(["fusions"], drawNewFusions, {
    refetchOnWindowFocus: false,
  });

  // Triggered when card is swipped out.
  const onCardIsGone = () => {
    currentChildrenIndex.current += 1;

    if (
      children.current.length - currentChildrenIndex.current ===
      THRESHOLD_FETCH_NEW_FUSIONS
    ) {
      refetchFusions();
    }
  };

  // Triggered when card left the screen.
  const onCardLeftScreen = () => {
    totalLeftScreen.current += 1;
  };

  const dislike = () => {
    if (currentChildrenIndex.current < children.current.length) {
      children.current[currentChildrenIndex.current].dislike();
    }
  };

  const favorite = () => {
    if (currentChildrenIndex.current < children.current.length) {
      children.current[currentChildrenIndex.current].favorite();
    }
  };

  const like = () => {
    if (currentChildrenIndex.current < children.current.length) {
      children.current[currentChildrenIndex.current].like();
    }
  };

  const drawCards = () => {
    return (
      <div className={styles.display}>
        {fusions.map((fusion, index) => {
          const key = index + totalSwipe.current;

          return (
            <Card
              ref={(element) => (children.current[index] = element)}
              fusion={fusion}
              index={index}
              key={key}
              accountId={accountId}
              onCardIsGone={onCardIsGone}
              onCardLeftScreen={onCardLeftScreen}
            />
          );
        })}
      </div>
    );
  };

  const drawFakeCards = () => (
    <div className={styles.display}>
      <FakeCard></FakeCard>
    </div>
  );

  const drawAnyCards = () => {
    if (isLoading) return drawFakeCards();
    else if (isError)
      return (
        <p>The API is down for the moment, sorry for the inconvenience.</p>
      );
    else return drawCards();
  };

  return (
    <div className={styles.container}>
      {drawAnyCards()}
      <div className={styles.buttons}>
        <Button onClick={dislike} title="Downvote" />
        <Button onClick={favorite} title="Favorite" />
        <Button onClick={like} title="Like" />
      </div>
    </div>
  );
}

export default Deck;
