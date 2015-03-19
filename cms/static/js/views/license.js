define(["js/views/baseview", "underscore"], function(BaseView, _) {
  var defaultLicenseInfo = {
    "all-rights-reserved": {
      "name": gettext("All Rights Reserved"),
      "tooltip": gettext("You reserve all rights for your work")
    },
    "creative-commons": {
      "name": gettext("Creative Commons"),
      "tooltip": gettext("You waive some rights for your work, such that others can use it too"),
      "url": "//creativecommons.org/about",
      "options": {
        "ver": {
          "name": gettext("Version"),
          "type": "string",
          "default": "4.0",
        },
        "BY": {
          "name": gettext("Attribution"),
          "type": "boolean",
          "default": true,
          "help": gettext("Allow others to copy, distribute, display and perform " +
            "your copyrighted work but only if they give credit the way you request."),
          "disabled": true,
        },
        "NC": {
          "name": gettext("Noncommercial"),
          "type": "boolean",
          "default": true,
          "help": gettext("Allow others to copy, distribute, display and perform " +
            "your work - and derivative works based upon it - but for noncommercial purposes only."),
        },
        "ND": {
          "name": gettext("No Derivatives"),
          "type": "boolean",
          "default": true,
          "help": gettext("Allow others to copy, distribute, display and perform " +
            "only verbatim copies of your work, not derivative works based upon it."),
          "conflictsWith": ["SA"]
        },
        "SA": {
          "name": gettext("Share Alike"),
          "type": "boolean",
          "default": false,
          "help": gettext("Allow others to distribute derivative works only under " +
            "a license identical to the license that governs your work."),
          "conflictsWith": ["ND"]
        }
      },
      "option_order": ["BY", "NC", "ND", "SA"]
    }
  }

  var LicenseView = BaseView.extend({
      events: {
          "click ul.license-types li button" : "onLicenseClick",
          "click ul.license-options li": "onOptionClick"
      },

      initialize: function(options) {
          this.licenseInfo = options.licenseInfo || defaultLicenseInfo;
          this.showPreview = !!options.showPreview; // coerce to boolean
          this.template = this.loadTemplate("license-selector");

          // Rerender when the model changes
          this.listenTo(this.model, 'change', this.render);
          this.render();
      },

      getDefaultOptionsForLicenseType: function(licenseType) {
        if (!this.licenseInfo[licenseType]) {
          // custom license type, no options
          return {};
        }
        if (!this.licenseInfo[licenseType].options) {
          // defined license type without options
          return {};
        }
        var defaults = {};
        _.each(this.licenseInfo[licenseType].options, function(value, key) {
          defaults[key] = value.default;
        })
        return defaults;
      },

      render: function() {
          this.$el.html(this.template({
              model: this.model.attributes,
              licenseString: this.model.toString() || "",
              licenseInfo: this.licenseInfo,
              showPreview: this.showPreview,
              previewButton: false,
          }));
          return this;
      },

      onLicenseClick: function(e) {
          var $li = $(e.srcElement || e.target).closest('li');
          var licenseType = $li.data("license");
          this.model.set({
            "type": licenseType,
            "options": this.getDefaultOptionsForLicenseType(licenseType)
          });
      },

      onOptionClick: function(e) {
        var licenseType = this.model.get("type"),
            licenseOptions = this.model.get("options"),
            $li = $(e.srcElement || e.target).closest('li');

        var optionKey = $li.data("option")
        var licenseInfo = this.licenseInfo[licenseType];
        var optionInfo = licenseInfo.options[optionKey];
        var currentOptionValue = licenseOptions[optionKey];
        if (optionInfo.type === "boolean") {
            // toggle current value
            currentOptionValue = !currentOptionValue;
            licenseOptions[optionKey] = currentOptionValue;
        }
        // check for conflicts
        if (currentOptionValue && optionInfo.conflictsWith &&
            _.any(optionInfo.conflictsWith, function (key) { return licenseOptions[key];})) {
          // conflict! don't set new options
          // need some feedback here
          return
        } else {
          this.model.set({"options": licenseOptions})
          // Backbone has trouble identifying when objects change, so we'll
          // fire the change event manually.
          this.model.trigger("change change:options")
        }
      }

  });
  return LicenseView;
});