;(function (define, undefined) {
    'use strict';
    define([
        'gettext', 'jquery', 'underscore', 'backbone', 'js/student_account/views/account_settings_fields'
    ], function (gettext, $, _, Backbone, AccountSettingsFieldViews) {

        var LearnerProfileView = Backbone.View.extend({

            events: {
                'change .profile-visibility-select': 'setProfileVisibility'
            },

            initialize: function (options) {
                this.template = _.template($('#learner_profile-tpl').text());
            },

            render: function () {
                this.$el.html(this.template({
                    info: this.options.info,
                    accountSettingsPageUrl: this.options.accountSettingsPageUrl,
                    username: this.options.model.get('username'),
                    profileVisibility: this.getProfileVisibility(),
                    showBirthYearMessage: _.isNull(this.options.model.get('year_of_birth'))
                }));
                this.renderFields();
                return this;
            },

            renderFields: function() {
                var countryView = new AccountSettingsFieldViews.DropdownFieldView({
                    model: this.options.model,
                    valueAttribute: "country",
                    required: true,
                    helpMessage: '',
                    options: this.options.info['country_options'],
                    showElement: false
                });
                this.$('.profile-data-userinfo-country').append(countryView.render().el);

                var languageView = new AccountSettingsFieldViews.DropdownFieldView({
                    model: this.options.model,
                    valueAttribute: "language",
                    required: true,
                    helpMessage: '',
                    options: this.options.info['language_options'],
                    showElement: false
                });
                this.$('.profile-data-userinfo-language').append(languageView.render().el);

                //var bioView = new AccountSettingsFieldViews.TextareaView({
                //    model: this.options.model,
                //    valueAttribute: "bio",
                //    helpMessage: '',
                //    options: this.options.info['bio'],
                //    showElement: false
                //});
                //this.$('.profile-data-aboutme-detail').append(bioView.render().el);
            },

            getProfileVisibility: function () {
                return this.options.preferencesModel.get('account_privacy');
            },

            setProfileVisibility: function (event) {
                var self = this;
                var options = {
                    contentType: 'application/merge-patch+json',
                    patch: true,
                    wait: true
                };
                this.options.preferencesModel.save(
                    {account_privacy: this.getSelectedVisibilityValue()},
                    options
                ).done( function () {
                    self.render();
                });
            },

            getSelectedVisibilityValue: function () {
                return this.$('.profile-visibility-select').val();
            }
        });

        return LearnerProfileView;
    })
}).call(this, define || RequireJS.define);