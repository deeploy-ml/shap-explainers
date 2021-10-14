export interface AdditiveForceData {
  featureNames: {
    [key: string]: string;
  };
  features: {
    [key: string]: { [key: string]: number };
  };
}

export interface AdditiveForceArrayData {
  featureNames: {
    [key: string]: string;
  };
  explanations: {
    outValue: number;
    simIndex: number;
    features: {
      [key: string]: { value: number; effect: number; ind?: number };
    };
  }[];
}

export interface InfluenceData {
  featureNames: {
    [key: string]: string;
  };
  valueNames: {
    [key: string]: string;
  };
  features: {
    [key: string]: { [key: string]: number };
  };
}
