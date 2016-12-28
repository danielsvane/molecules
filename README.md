# Installation
Download and install [Meteor](https://www.meteor.com/). When Meteor is installed, run the following commands to start the project locally:
```
git clone git@github.com:danielsvane/molecules.git
cd molecules
meteor
```

# Dependencies
Besides Meteor, this project uses [three.js](https://threejs.org/) to render the particles, [KaTeX](https://khan.github.io/KaTeX/) to display the equations and [Algebrite](http://algebrite.org/) to do symbolic algebra. Algebrite is a great library, but does rather slow evaluation, so the output from Algebrite is parsed to a string which javascript can evaluate, using [nearley.js](http://nearley.js.org/).
