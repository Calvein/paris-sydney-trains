#!/bin/env node

var fs = require('fs')
var dsv = require('d3-dsv')
var uniq = require('lodash.uniq')

// From http://data.ratp.fr/fr/les-donnees/fiche-de-jeu-de-donnees/dataset/correspondances-stationslignes-sur-le-reseau-ratp.html
var sydneyStops = fs.readFileSync(__dirname + '/../data/stops.csv', 'utf8')

var csv = dsv.dsv(',')
var data = csv.parse(sydneyStops)
data = data
    // We don't want bus
    .filter(function(d) {
        return d.wheelchair_boarding !== '0'
    })
    .map(function(d) {
        return [+(+d.stop_lon).toFixed(4), +(+d.stop_lat).toFixed(4)]
    })
// Remove duplicates stops, they will break the voronoi
data = uniq(data, false, function(d) { return d.toString() })


// Geo
var topojson = require('topojson')
var within = require('turf-within')
var sydneyGeo = require('./../data/sydney-geo.json')
sydneyGeo = topojson.feature(sydneyGeo, sydneyGeo.objects.sydney)

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
// Get only the points in Sydney
data = within(points, sydneyGeo).features.map(function(d) {
    return d.geometry.coordinates
})


fs.writeFileSync(__dirname + '/../data/sydney-stops.json', JSON.stringify(data), 'utf8')