# ShapExplainers

This project contains the Angular components for the SHAP visual explainers:
1. Shap Additive Force
2. Shap Additive Force Array

Original code by https://github.com/slundberg/shap

## Installation instructions

1. Run `npm i shap-explainers` 
2. Add `ShapExplainersModule` to the imports array
3. Use the `shap-additive-force` or `shap-additive-force-array` component selectors

## API - How to use the components


**[data]**
```
    {
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
```