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

shap-additive-force component input parameters:

```
    data: AdditiveForceData;
```


shap-additive-force-array component input parameters:

```
    orderingKeys
    orderKeysTimeFormat;
    topOffset: number;
    leftOffset: number;
    rightOffset: number;
    height: number;
    link: 'identity' | 'logit';
    baseValue: number;
    data: AdditiveForceArrayData

```

## Interfaces

```
    AdditiveForceData {
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

    AdditiveForceArrayData {
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
```


## Repository

[Deeploy-ml/shap-explainers](https://github.com/deeploy-ml/shap-explainers)