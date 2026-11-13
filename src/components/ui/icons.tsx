import React from 'react';
import Svg, { Path, Polyline, Line, Circle } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color: string;
}

export function ChevronLeftIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20 6 9 17 4 12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SearchIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
      <Line x1="16" y1="16" x2="21" y2="21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronUpIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 15L12 9L6 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrashIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ReplaceIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MinusIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function PlayIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3l14 9-14 9V3z" fill={color} />
    </Svg>
  );
}

export function ClockIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function EditIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Polyline points="8 12 11 15 16 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function DumbbellIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="7" y1="9" x2="7" y2="15" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="17" y1="9" x2="17" y2="15" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="4" y1="7" x2="4" y2="17" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="20" y1="7" x2="20" y2="17" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export function ListCheckIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3 7 4.5 8.5 7 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="10" y1="7" x2="21" y2="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline
        points="3 12 4.5 13.5 7 11.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="10" y1="12" x2="21" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline
        points="3 17 4.5 18.5 7 16.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="10" y1="17" x2="21" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function NoteIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

