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
    plotColors: string[] = ['rgb(222, 53, 13)', 'rgb(111, 207, 151)'];
    link: 'logit' | 'identity' = 'identity';
    baseValue: number = 0.0;
    outNames: string[] = ['Color rating'];
    hideBars: boolean = false;
    labelMargin: number = 0;
    hideBaseValueLabel: boolean = false;
    data: AdditiveForceData;
```


shap-additive-force-array component input parameters:

```
    topOffset: number = 28;
    leftOffset: number = 80;
    rightOffset: number = 10;
    height: number = 350;
    plotColors = ['rgb(222, 53, 13)', 'rgb(111, 207, 151)'];
    link: 'logit' | 'identity' = 'identity';
    baseValue: number = 0.0;
    outNames: string[] = ['Color rating'];
    data: AdditiveForceArrayData

```

## Interfaces

```
    AdditiveForceData {
        featureNames: {
            [key: string]: string;
        };
        features: {
            [key: string]: { [key: string]: number };
        };
    }

    AdditiveForceArrayData {
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
```


## Repository

[Deeploy-ml/shap-explainers](https://github.com/deeploy-ml/shap-explainers)