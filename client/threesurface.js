import Simulation from "/imports/client/simulation";
import $ from "jquery";
import _ from "lodash";
import "/node_modules/bootstrap/dist/css/bootstrap.css"
import './main.html';

let simulation = new Simulation();
let ns = [1, 2, 3, 4];
let ls = [0];
let ms = [0];

Template.menu.helpers({
  bounds: function(){
    return simulation.bounds;
  },
  particleCount: function(){
    return simulation.particleCount;
  }
})

let generateOptions = function(input){
  let html = "";
  for(let i of input){
    if(i === 0) html += "<option selected>"+i+"</option>";
    else html += "<option>"+i+"</option>";
  }
  return html;
}

Template.menu.events({
  "change #n": function(){
    let n = parseInt($("#n").val());
    $("#l").html(generateOptions(simulation.getls(n)));
    $("#m").html(generateOptions([0]));
  },
  "change #l": function(){
    let l = parseInt($("#l").val());
    $("#m").html(generateOptions(simulation.getms(l)));
  },
  "click #update": function(event){
    event.preventDefault();
    let n = parseInt($("#n").val());
    let l = parseInt($("#l").val());
    let m = parseInt($("#m").val());
    let bounds = parseInt($("#bounds").val());
    let particleCount = parseInt($("#particleCount").val());
    let eq = simulation.getWaveFunction(l, m, n);

    simulation.removeAllObjects();
    simulation.bounds = bounds;
    simulation.particleCount = particleCount;
    simulation.addCloud(eq);
  }
})

Meteor.startup(() => {
  simulation.init();
  let eq = simulation.getWaveFunction(0, 0, 1);
  simulation.addCloud(eq);
  simulation.render();
});
