export const compactFormat = (value: number) => {
    return new Intl.NumberFormat('en-US',
         { notation: 'compact',
            maximumFractionDigits: 1,
            minimumFractionDigits: 0,
         }).format(value);
}