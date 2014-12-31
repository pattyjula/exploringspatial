define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/Demo1RightSideView.html',
    'leaflet_google',
    'leaflet_bing',
    'leaflet_osm'
], function ($, _, Backbone, templateHtml) {
    var Demo1RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
            var cmAttr = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';
            var cmUrl = 'http://{s}.tile.cloudmade.com/e122354b91604c13a92a6df2ffb57016/{styleId}/256/{z}/{x}/{y}.png';
            var osmLayer = new L.OSM.TileLayer();
            var cloudmadeLayer = L.tileLayer(cmUrl, {styleId: 998, attribution: cmAttr});
            var googleLayer = new L.Google('ROADMAP');
            //var bingLayer = new L.TileLayer.Bing('AlRrhXJslATe2Aa0C37wvqJcbtMNthKFTaOiYWys3hBhw-4lfMsIUnFRVGLgmfEY','Road', {subdomains: ['0', '1', '2', '3', '4']});
            var map = L.map('map', {
                center: [51.505, -0.09],
                zoom: 13,
                layers: [googleLayer]
            });
            var baseLayers = {
                'Google': googleLayer,
                'OSM': osmLayer,
                'Cloudmade': cloudmadeLayer
            };
            L.control.layers(baseLayers).addTo(map);
            L.marker([51.5, -0.09]).addTo(map)
                .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
            L.circle([51.508, -0.11], 500, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5
            }).addTo(map).bindPopup("I am a circle.");
            L.polygon([
                [51.509, -0.08],
                [51.503, -0.06],
                [51.51, -0.047]
            ]).addTo(map).bindPopup("I am a polygon.");
            this.popup = L.popup();
            map.on('click', this.onMapClick);
            this.map = map;
        },
        onMapClick: function(e) {
            this.popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(this.map);
        }
    });
    return Demo1RightSideView;
});
