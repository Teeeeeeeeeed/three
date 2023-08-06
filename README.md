# A Three.JS Experiment

## Installing

This is app is using angular 15 which requires node version ^14.20.0 || ^16.13.0 || ^18.10.0 so please ensure that is installed before running npm install

## 3d Assets

The size of the assets were greater than 100 MB so needed to zip the files. So to run locally, you'll need to unzip the files.

Once you unzip the files, install dependencies and run ng serve you will be asked to login and then see the following:

![Pre Mining Stage](PreminingStage.png)

This loads the gltf and the textures of the premining stage site.

If you click the Post mining stage, another gltf is loaded along with its binaries.

![Mining Stage](MiningStage.png)

The pin's x,z coordinates are randomly within the extent of the map. The y axis is ray casted to sit on top of the surface of the model, and has an on click listener and opens a side panel with a video!