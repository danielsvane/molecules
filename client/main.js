import Simulation from "/imports/client/simulation";
import $ from "jquery";
import _ from "lodash";
import "/node_modules/bootstrap/dist/css/bootstrap.css"
import "/node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css"
import './main.html';
import "/imports/client/analytics";
import Slider from "bootstrap-slider";
import "/imports/client/main.css"

// Default quantum numbers
let n = 3;
let l = 1;
let m = 0;

let simulation = new Simulation(n, l, m, 20, 150000);
let ns = [1, 2, 3, 4, 5];
let ls = [0];
let ms = [0];

let needsUpdate = false;

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

let generateOptions = function(input, selectedIndex = 0){
  let html = "";
  for(let i of input){
    if(i === selectedIndex) html += "<option selected>"+i+"</option>";
    else html += "<option>"+i+"</option>";
  }
  return html;
}

Template.menu.events({
  "change #n": function(){
    let n = parseInt($("#n").val());
    $("#l").html(generateOptions(simulation.getls(n)));
    $("#m").html(generateOptions([0]));
    needsUpdate = true;

  },
  "change #l": function(){
    let l = parseInt($("#l").val());
    $("#m").html(generateOptions(simulation.getms(l)));
    needsUpdate = true;
  },
  "change #m": function(){
    needsUpdate = true;
  },
  "click #update": function(event){
    event.preventDefault();
    let n = parseInt($("#n").val());
    let l = parseInt($("#l").val());
    let m = parseInt($("#m").val());

    simulation.getWaveFunction(l, m, n);
    simulation.update();
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
  },
  "slideStop #bounds": function(event){
    simulation.bounds = event.value;
    simulation.update();
  },
  "change #bounds": function(event){
    simulation.bounds = event.value.newValue;
    simulation.updateCoordinateSystem();
  },
  "slideStop #particleCount": function(event){
    simulation.particleCount = event.value;
    simulation.update();
  }
})

Meteor.startup(() => {
  $("#n").html(generateOptions(ns, n));
  $("#l").html(generateOptions(simulation.getls(n), l));
  $("#m").html(generateOptions(simulation.getms(l), m));

  $("#bounds").slider();
  $("#particleCount").slider();
  $(".tooltip", $(".slider")).css('pointer-events','none');

  simulation.init();
  simulation.getWaveFunction(l, m, n);
  simulation.update();
  simulation.render();
});
