'use strict';
const app = angular.module('app', ['ngRoute', 'ui.bootstrap']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider

        .when('/home/:userId', {
            templateUrl: '/views/pages/home.html',
            controller: 'homeController'
        });

    $locationProvider.html5Mode(true);
});

app.factory('appService', ($http) => {
    return new AppService($http)
});
