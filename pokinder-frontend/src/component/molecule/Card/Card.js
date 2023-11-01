import Sprite from "../../atom/Sprite/Sprite";

import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useMutation } from "react-query";
import { addVote } from "../../../api/pokinder";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated, to } from "@react-spring/web";
import { pythagoras, normalize } from "../../../utils/math";
import styles from "./Card.module.css";
import Type from "../../atom/Type/Type";
import { getTypes, getName } from "../../../utils/pokemon";

const Card = forwardRef(function Card(
  { fusion, index, accountId, onCardIsGone, onCardLeftScreen },
  ref
) {
  const isGone = useRef(false);
  const swipeDirection = useRef(undefined);
  const [isHidden, setIsHidden] = useState(false);

  const getSwipeDirection = (direction) => {
    console.log(direction);
    if (direction[1] < -0.5) return "up";
    else if (direction[0] > 0.5 && direction[1] < 0.2) return "right";
    else if (direction[0] < -0.5 && direction[1] < 0.2) return "left";
    else return undefined;
  };

  const onRest = () => {
    if (!isGone.current) return;
    onCardLeftScreen();
    setIsHidden(true);
  };

  const validateSwipe = (direction) => {
    if (direction == null) return;
    console.log(direction);

    isGone.current = true;
    swipeDirection.current = direction;
    vote();
    onCardIsGone();
  };

  const { mutate: vote } = useMutation(async () => {
    if (swipeDirection.current === "right") {
      addVote(accountId, fusion.id, 0);
    } else if (swipeDirection.current === "left") {
      addVote(accountId, fusion.id, 1);
    } else if (swipeDirection.current === "up") {
      addVote(accountId, fusion.id, 2);
    } else return;
  });

  const [{ x, y, rotation, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    onRest: onRest,
  }));

  const transform = (rotation, scale) =>
    `perspective(1500px) rotateX(0deg) rotateY(${
      rotation / 10
    }deg) rotateZ(${rotation}deg) scale(${scale})`;

  // Set the drag hook and define component movement based on gesture data
  const bind = useDrag(
    ({ down, movement, velocity: [velocityX, velocityY] }) => {
      const trigger = pythagoras(velocityX, velocityY) > 0.45;

      if (trigger && !down) {
        validateSwipe(getSwipeDirection(normalize(movement)));
      }

      api.start(() => {
        const direction = normalize(movement);
        const screenDiameter = window.innerHeight + window.innerWidth;
        const offset = screenDiameter < 2500 ? 450 : 300;
        const xOffScreen = (offset + window.innerWidth) * direction[0];
        const yOffScreen = (offset + window.innerHeight) * direction[1];
        const x = isGone.current ? xOffScreen : down ? movement[0] : 0;
        const y = isGone.current ? yOffScreen : down ? movement[1] : 0;
        const rotation = down ? movement[0] * 0.05 : 0;
        const scale = down ? 1.1 : 1;

        return {
          x,
          y,
          scale,
          rotation,
          delay: undefined,
          config: {
            friction: 70,
            tension: down ? 800 : isGone.current ? 200 : 500,
          },
        };
      });
    }
  );

  const autoSwipeX = (direction) => {
    if (direction === "left") return -window.innerWidth - 200;
    else if (direction === "right") return window.innerWidth + 200;
    else return 0;
  };

  const autoSwipeY = (direction) => {
    if (direction === "up") return -window.innerHeight - 200;
    else return 100;
  };

  const autoSwipeRotation = (direction) => {
    if (direction === "left") return -20;
    else if (direction === "right") return 20;
    else return 0;
  };

  const autoSwipe = (direction) => {
    validateSwipe(direction);

    api.start(() => {
      return {
        x: autoSwipeX(direction),
        y: autoSwipeY(direction),
        scale: 1,
        rotation: autoSwipeRotation(direction),
        delay: undefined,
        config: {
          friction: 50,
          tension: 200,
        },
      };
    });
  };

  useImperativeHandle(ref, () => {
    return {
      favorite() {
        autoSwipe("up");
      },
      dislike() {
        autoSwipe("left");
      },
      like() {
        autoSwipe("right");
      },
    };
  });

  return isHidden ? null : (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        touchAction: "none",
        transform: to([rotation, scale], transform),
        zIndex: 100 - index,
      }}
      className={styles.container}
    >
      <Sprite
        className={styles.sprite}
        type="fusion"
        path={fusion.path}
        size={260}
        key={index}
      />
      <div>
        <div className={styles.header}>
          <span>
            {getName(
              fusion.head.name,
              fusion.head.name_separator_index,
              fusion.body.name,
              fusion.body.name_separator_index
            )}
          </span>
          <span className={styles.path}>#{fusion.path}</span>
        </div>
        <div className={styles.types}>
          {getTypes(
            fusion.head.type_1,
            fusion.head.type_2,
            fusion.body.type_1,
            fusion.body.type_2
          ).map((type, index) => (
            <Type type={type} key={index} />
          ))}
        </div>
        <div className={styles.body}>
          <div className={styles.parent}>
            <span className={styles.parentName}>body</span>
            <Sprite
              className={styles.parentSprite}
              type="pokemon"
              path={fusion.body.pokedex_id}
              size={100}
              key={index}
            />
          </div>
          <div className={styles.parent}>
            <span className={styles.parentName}>head</span>
            <Sprite
              className={styles.parentSprite}
              type="pokemon"
              path={fusion.head.pokedex_id}
              size={100}
              key={index}
            />
          </div>
        </div>
        <p className={styles.credit}>Art by {fusion.creator.name}</p>
      </div>
    </animated.div>
  );
});

export default Card;
