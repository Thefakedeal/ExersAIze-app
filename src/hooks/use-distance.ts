import { useDistanceCount } from "./use-distance-count";

type DayDistanceProps = {
    dateStart: Date;
    dateEnd: Date;
};

export const useDistance = ({ dateStart, dateEnd }: DayDistanceProps) => {
    const {
        distance,
        loading,
        error,
        isAvailable,
    } = useDistanceCount(dateStart, dateEnd);

    return {
        distance,
        loading,
        error,
        isAvailable,
    };
};
