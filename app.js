'use strict';

var width = 950
var height = 500


showMap('paris', [2.3508, 48.8567])
showMap('sydney', [151.076, -33.843])

function showMap(city, center) {
    var projection = d3.geo.mercator()
        .translate([width / 2, height / 2])
        .center(center)
        .scale(100000)

    var path = d3.geo.path()
        .projection(projection)
        .pointRadius(1.5)

    var g = d3.select('[data-map=' + city + ']')
        .attr('width', width)
        .attr('height', height)
        .append('g')

    queue()
        .defer(d3.json, 'data/' + city + '-geo.json')
        .defer(d3.json, 'data/' + city + '-stops.json')
        .await(ready)

    function ready(error, geo, data) {
        g.append('path')
            .datum(topojson.feature(geo, geo.objects[city]))
            .attr('class', 'city')
            .attr('d', path)


        var circles = g.append('g')
            .attr('class', 'circles')
        for (var d of data) {
            circles.append('path')
                .datum({
                    type: 'Point'
                  , coordinates: d
                })
                .attr('d', path)
        }

        g.append('path')
            .datum(d3.geom.voronoi(data.map(projection)))
            .attr('class', 'voronoi')
            .attr('d', function(d) {
                return 'M' + d.map(function(d) {
                    return d.join('L')
                }).join('ZM') + 'Z'
            })
    }
}