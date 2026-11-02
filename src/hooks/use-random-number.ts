import { useEffect, useRef, useState } from "react";

type Props = {
  lower_bound?: number;
  upper_bound?: number;
  change?: number;
};

export const useRandomNumber = ({
  lower_bound = 0,
  upper_bound = 100,
  change = 1,
}: Props) => {
  const [number, setNumber] = useState(lower_bound);
  const target = useRef(lower_bound);

  useEffect(() => {
    if (
      change <= 0 ||
      lower_bound > upper_bound ||
      !Number.isFinite(change)
    ) {
      return;
    }

    const precision = (change.toString().split(".")[1] || "").length;

    const randomNumberGenerator = () => {
      const steps = Math.floor((upper_bound - lower_bound) / change);
      const randomSteps = Math.floor(Math.random() * (steps + 1));

      return Number(
        (lower_bound + randomSteps * change).toFixed(precision)
      );
    };


    const interval = setInterval(() => {
      setNumber((prev) => {
        const difference = target.current - prev;

        if (difference === 0) {
          target.current = randomNumberGenerator();
          return prev;
        }

        const next = prev + Math.sign(difference) * change;

        if (
          (difference > 0 && next >= target.current) ||
          (difference < 0 && next <= target.current)
        ) {
          target.current = randomNumberGenerator();
          return prev;
        }

        return Number(next.toFixed(precision));
      });
    }, 100);


    return () => clearInterval(interval);
  }, [lower_bound, upper_bound, change]);

  

  return { number };
};