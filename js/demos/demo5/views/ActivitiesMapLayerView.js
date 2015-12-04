/**
 * The purpose of the ActivityMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'underscore',
    'backbone',
    'models/Activity',
    'leaflet_markercluster'
], function(_, Backbone, Activity) {

    var ActivityMapLayerView = Backbone.View.extend({

        initialize: function(args) {
            this.map = args.map;
            this.activitiesLayer = null;
            this.originalCenter = null;
            this.originalZoom = null;
            this.activityLayer = null;
            this.activityStart = null;
            this.activityEnd = null;
            this.collection = args.collection;
            var CustomIcon = L.Icon.extend({options: {
                iconSize: [33, 50],
                iconAnchor: [16, 49]
            }});
            this.startIcon = new CustomIcon({iconUrl: 'media/pin_start.png'});
            this.endIcon = new CustomIcon({iconUrl: 'media/pin_end.png'});

            this.activitySearch = args.activitySearch;
            this.activitySearch.on('change', this.render, this);
            this.render();
            var _this = this;
            $(window).resize (function() {
                if (_this.map && _this.activityLayer) {
                    _this.map.fitBounds(_this.activityLayer);
                }
            })
        },

        render: function() {
            if (this.activitiesLayer != null && this.map.hasLayer(this.activitiesLayer)) {
                this.map.removeLayer(this.activitiesLayer);
            }
            var _self = this;
            var geoJsonLayer = L.geoJson(this.collection.toJSON(),{
                filter: function(feature, layers) {
                    return _self.activitySearch.filterActivityJson(feature);
                },
                onEachFeature: _self.onEachFeature
            });
            // Do not create a markerClusterGroup if the geoJsonLayer map layer is empty.
            if (geoJsonLayer.getLayers().length > 0) {
               this.activitiesLayer = L.markerClusterGroup();
               this.activitiesLayer.addLayer(geoJsonLayer);
               this.map.addLayer(this.activitiesLayer);
               this.map.on('popupopen', function(event) {_self.onPopupOpen(event);});
               $('.returnToSearch').on('click', '.returnTrigger', function(event){_self.onReturnToSearch(event)});
               this.map.fitBounds(this.activitiesLayer.getBounds());
            }
        },

        onEachFeature: function(feature, layer) {
            var date = new Date(feature.properties.startTime);
            var triggerId = feature.properties.activityId;
            var msg = [];
            msg.push('<b>' + feature.properties.name + '</b><br/>');
            msg.push('Start: ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '<br/>');
            msg.push('Dist: ' + Math.round((feature.properties.totalMeters * 0.000621371)*100)/100 + ' mi<br/>');
            msg.push('<a id="' + triggerId + '" class="popupTrigger" href="javascript:void(0)" />Go to Activity</a>');
            layer.bindPopup(msg.join(''), {maxWidth: 200});
        },

        onPopupOpen: function(event) {
            var popup = event.popup;
            var _self = this;
            $(popup._container).on('click','.popupTrigger', function(event) {_self.onOpenActivity(event, popup);});

        },

        onOpenActivity: function(event, popup) {
            var location = popup._latlng;
            this.map.closePopup(popup);
            this.originalCenter = this.map.getCenter();
            this.originalZoom = this.map.getZoom();
            this.activity = new Activity({activityId: event.target.id});
            var _this = this;
            this.activity.fetch({
                success: function () {
                    _this.renderActivity();
                }
            });
        },

        renderActivity: function() {
            $('#searchBox').slideUp();
            $('.returnToSearch').show();
            if (this.map.hasLayer(this.activitiesLayer)) {
                this.map.removeLayer(this.activitiesLayer);
            }
            var props = this.activity.get('properties');
            // TODO - Find out how this can be undefined.
            if (props) {
                $('#container2').find('h1:first').html(props.get('name'));
                this.map.fitBounds([
                    [props.get('minLat'), props.get('minLon')],
                    [props.get('maxLat'), props.get('maxLon')]
                ]);
            }
            var style = {
                color: '#FF0000',
                weight: 3,
                opacity: 0.6
            };

            this.activityLayer = L.geoJson(this.activity.toJSON(), {style: style}).addTo(this.map);
            var polyline = this.activity.get('geometry').get('coordinates');
            var startPoint = polyline[0];
            var endPoint = polyline[polyline.length - 1];
            this.activityStart = L.marker([startPoint[1], startPoint[0]], {icon: this.startIcon}).addTo(this.map);
            this.activityEnd = L.marker([endPoint[1], endPoint[0]], {icon: this.endIcon}).addTo(this.map);
        },

        onReturnToSearch: function(event) {
            $('.returnToSearch').hide();
            $('#searchBox').slideDown();
            if (this.activitiesLayer != null) {
                if (this.activityLayer != null && this.map.hasLayer(this.activityLayer)) {
                    this.map.removeLayer(this.activityLayer);
                    this.activityLayer = null;
                }
                if (this.activityStart != null && this.map.hasLayer(this.activityStart)) {
                    this.map.removeLayer(this.activityStart);
                    this.activityStart = null;
                }
                if (this.activityEnd != null && this.map.hasLayer(this.activityEnd)) {
                    this.map.removeLayer(this.activityEnd);
                    this.activityEnd = null
                }
                this.map.addLayer(this.activitiesLayer);
                if (this.originalCenter != null && this.originalZoom != null) {
                    this.map.setView(this.originalCenter, this.originalZoom, {animate: true});
                    this.originalCenter = null;
                    this.originalZoom = null;
                }
                $('#container2').find('h1:first').html('My Activities Search Results');
            }
        }

    });

    return ActivityMapLayerView;
});