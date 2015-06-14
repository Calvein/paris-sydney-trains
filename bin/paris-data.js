#!/bin/env node

var fs = require('fs')
var dsv = require('d3-dsv')
var uniq = require('lodash.uniq')

// From http://data.ratp.fr/fr/les-donnees/fiche-de-jeu-de-donnees/dataset/correspondances-stationslignes-sur-le-reseau-ratp.html
var parisStops = fs.readFileSync(__dirname + '/../data/ratp_arret_graphique_01.csv', 'utf8')
// Add header line
parisStops = 'id#lat#lng#title#city#type\n' + parisStops

var hashsv = dsv.dsv('#')
var data = hashsv.parse(parisStops)
data = data
    // We don't want bus
    .filter(function(d) {
        return ['metro', 'rer', 'tram'].indexOf(d.type) >= 0
    })
    .map(function(d) {
        return [+(+d.lat).toFixed(4), +(+d.lng).toFixed(4)]
    })
    // We check if the coords are valid
    .filter(function(d) {
        return -180 < d[0] && d[0] < 180 &&
                -90 < d[1] && d[1] < 90
    })
// Remove duplicates stops, they will break the voronoi
data = uniq(data, false, function(d) { return d.toString() })


// Geo
var topojson = require('topojson')
var within = require('turf-within')
var parisGeo = require('./../data/paris-geo.json')
parisGeo = topojson.feature(parisGeo, parisGeo.objects.paris)

var points = {
    type: 'FeatureCollection'
  , features: data.map(function(d) {
        return {
            type: 'Feature'
          , geometry: {
                type: 'Point'
              , coordinates: d
            }
        }
    })
}
// Get only the points in Paris
data = within(points, parisGeo).features.map(function(d) {
    return d.geometry.coordinates
})


fs.writeFileSync(__dirname + '/../data/paris-stops.json', JSON.stringify(data), 'utf8')