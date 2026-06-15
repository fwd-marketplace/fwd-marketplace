export type StarState = "done" | "available" | "locked";
export type StarShape = "sixpoint" | "dot" | "diamond";
export type PathStyle = "auto" | "solid" | "dashed" | "dotted" | "none";
export type StateStyle = "multicolor" | "mono";
export type Density = "rich" | "minimal";

export interface Constellation {
  id: string;
  name: string;
  color: string;
  tagline: string;
  label: { x: number; y: number };
}

export interface Star {
  id: string;
  label: string;
  area: string;
  x: number;
  y: number;
  state: StarState;
  mastery: number;
  whatItIs: string;
  howToUnlock?: string;
  unlockedDate?: string;
  via?: string;
}

export type Edge = [string, string];

export interface BoardSize {
  w: number;
  h: number;
}

export interface Tweaks {
  starShape: StarShape;
  pathStyle: PathStyle;
  stateStyle: StateStyle;
  density: Density;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface Progress {
  lit: number;
  total: number;
}

export interface CelebrationData {
  star: Star;
  area: Constellation;
  xpGain: number;
}
