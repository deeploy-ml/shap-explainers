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
  
&nbsp;
&nbsp;
### shap-additive-force component input parameters:

Changing the colors of the plot. Requires an array of 2 colors.\
`plotColors: string[] = ['rgb(222, 53, 13)', 'rgb(111, 207, 151)'];`

Changing the x-axis type between log-odds (identity) or probabilities (logit).\
`link: 'logit' | 'identity' = 'identity';`

Setting the base value (middle point) for the plot:\
`baseValue: number = 0.0;`

Set the label(s) for the output variables 
`outNames: string[] = ['Color rating'];`

Hide the plot bars:\
`hideBars: boolean = false;`

Set the margin for the labels (labels show up when hovering the bars when not enough space to display the labels)\
`labelMargin: number = 0;`

Hide the label attached to the base value\
`hideBaseValueLabel: boolean = false;`

The data with the feature names and feature values\
`data: AdditiveForceData;`



&nbsp;
&nbsp;
### shap-additive-force-array component input parameters:

Set the offset from the top\
`topOffset: number = 28;`

Set the offset from the left\
`leftOffset: number = 80;`

Set the offset from the right\
`rightOffset: number = 10;`

Set the height of the graph\
`height: number = 350;`

Changing the colors of the plot. Requires an array of 2 colors.\
`plotColors: string[] = ['rgb(222, 53, 13)', 'rgb(111, 207, 151)'];`

Changing the x-axis type between log-odds (identity) or probabilities (logit).\
`link: 'logit' | 'identity' = 'identity';`

Setting the base value (middle point) for the plot:\
`baseValue: number = 0.0;`

Set the label(s) for the output variables\
`outNames: string[] = ['Color rating'];`

The data with the feature names and feature values\
`data: AdditiveForceArrayData`

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