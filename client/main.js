import Simulation from "/imports/client/simulation";
import $ from "jquery";
import _ from "lodash";
import "/node_modules/bootstrap/dist/css/bootstrap.css"
import './main.html';
import "/imports/client/analytics";

let simulation = new Simulation();
let ns = [1, 2, 3, 4];
let ls = [0];
let ms = [0];

$(window).on("resize", () => {
  simulation.camera.aspect = $(".simulation").width() / $(".simulation").height();
  simulation.camera.updateProjectionMatrix();
  simulation.renderer.setSize( $(".simulation").width(), $(".simulation").height() );
});

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
    simulation.drawCoordinateSystem();
    simulation.addCloud(eq);
  },
  "click .increase-select": function(event){
    let el = $(event.target).parent().prev();
    el.find("option:selected").next().prop("selected",true);
    el.trigger("change");
  },
  "click .decrease-select": function(event){
    let el = $(event.target).parent().next();
    el.find("option:selected").prev().prop("selected",true);
    el.trigger("change");
  },
  "click .increase-input": function(event){
    let el = $(event.target).parent().prev();
    let incr = parseInt(el.data("increment"));
    el.val((i, prev) => {
      return parseInt(prev)+incr;
    });
  },
  "click .decrease-input": function(event){
    let el = $(event.target).parent().next();
    let incr = parseInt(el.data("increment"));
    el.val((i, prev) => {
      let next = parseInt(prev)-incr;
      if(next <= 0) return 0;
      else return next;
    });
  }
})

Meteor.startup(() => {
  simulation.init();
  simulation.drawCoordinateSystem();
  let eq = simulation.getWaveFunction(0, 0, 1);
  simulation.addCloud(eq);
  simulation.render();
});
