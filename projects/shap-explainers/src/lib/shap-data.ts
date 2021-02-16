export interface AdditiveForceData {
  baseValue: number;
  link: string;
  featureNames: {
    [key: string]: string;
  };
  outNames: string[];
  features: {
    [key: string]: { [key: string]: number };
  };
  hideBars?: boolean;
  labelMargin?: number;
  hideBaseValueLabel?: boolean;
}

export interface AdditiveForceArrayData {
  baseValue: number;
  link: string;
  featureNames: {
    [key: string]: string;
  };
  outNames: string[];
  explanations: {
    outValue: number;
    simIndex: number;
    features: {
      [key: string]: { value: number; effect: number; ind?: number };
    };
  }[];
  hideBars?: boolean;
  labelMargin?: number;
  hideBaseValueLabel?: boolean;
}
