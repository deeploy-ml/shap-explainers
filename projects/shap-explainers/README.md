# ShapExplainers

This project contains the Angular components for the SHAP visual explainers:
1. Shap Additive Force
2. Shap Additive Force Array

Original code by https://github.com/slundberg/shap

&nbsp;
## Installation instructions

1. Run `npm i shap-explainers` 
2. Add `ShapExplainersModule` to the imports array
3. Use the one of the following component selectors:
    - `<shap-additive-force>`
    - `<shap-additive-force-array>`
    - `<shap-influence>`

&nbsp;
## API - How to use the components
  
### shap-additive-force component input parameters:

Changing the colors of the plot. Requires an array of 2 colors.\
`plotColors: string[] = ['rgb(222, 53, 13)', 'rgb(111, 207, 151)'];`

Changing the x-axis type between log-odds (identity) or probabilities (logit).\
`link: 'logit' | 'identity' = 'identity';`

Setting the base value (middle point) for the plot:\
`baseValue: number = 0.0;`

Set the label(s) for the output variables\
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


&nbsp;
### shap-influence component input parameters:

Changing the colors of the signs (+/-). Requires an array of 2 colors.\
`influenceColors: string[] = ['rgb(222, 53, 13)', 'rgb(111, 207, 151)'];`

Set the prediction values\
`predictions: number[] = [1];`

Set the prediction label names\
`predictionNames: string[] = ['Income']`

Set the amount of influence labels that are being displayed\
`labelAmount: number = 7;`


&nbsp;
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

InfluenceData {
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
```


&nbsp;
## Repository

[Deeploy-ml/shap-explainers](https://github.com/deeploy-ml/shap-explainers)
