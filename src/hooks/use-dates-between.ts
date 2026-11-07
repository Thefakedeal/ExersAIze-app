import { addDays, startOfDay } from "date-fns";
import { useMemo } from "react";


type Props = {
    startDate: Date;
    endDate: Date;
}

export const useDatesBetween = ({ startDate, endDate }: Props): Date[] => {
  const dateArray = useMemo(() => {
          const dateArray = [];
          const start = startOfDay(startDate);
          const end = startOfDay(endDate);
          let currentDate = start;
          while (currentDate <= end) {
              dateArray.push(currentDate);
              currentDate = addDays(currentDate, 1);
          }
          return dateArray;
      }, [startDate, endDate]);
  return dateArray;
}