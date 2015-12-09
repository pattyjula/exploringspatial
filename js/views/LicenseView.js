define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/LicenseView.html'
], function ($, _, Backbone, templateHtml) {
    var LicenseView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
        }
    });
    return LicenseView;
});