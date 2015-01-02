define([
    'models/MapProvider',
    'models/MapLayer',
    'collections/MapLayers',
    'leaflet_google'
], function (MapProvider, MapLayer, MapLayers) {
    var GoogleMapProvider = MapProvider.extend({
        defaults: {
            name: MapProvider.GOOGLE,
            currentProvider: false,
            mapLayers: new MapLayers()
        },
        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.on('change:currentProvider', this.onMapProviderChanged, this);
            var googleLayers = [];
            googleLayers[0] = new MapLayer({
                type: MapLayer.ROAD,
                leafletLayer: new L.Google('ROADMAP')
            });
            googleLayers[1]= new MapLayer({
                type: MapLayer.SATELLITE,
                leafletLayer: new L.Google('SATELLITE')
            });
            googleLayers[2]= new MapLayer({
                type: MapLayer.HYBRID,
                leafletLayer: new L.Google('HYBRID')
            });
            googleLayers[3]= new MapLayer({
                type: MapLayer.TERRAIN,
                leafletLayer: new L.Google('TERRAIN')
            });
            this.get('mapLayers').set(googleLayers);
        }
    });

    return GoogleMapProvider;
});
