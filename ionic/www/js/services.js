angular.module('starter.services', [])
    .factory('Product', ['$resource','appConfig',function ($resource, appConfig) {
        return $resource(appConfig.baserUrl + '/api/client/products', {}, {
            query: {
                isArray: false
            }
        });
    }])
    .service('Cart', function () {
        this.items = [];
    })
    .factory('$localStorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
                return $window.localStorage[key];
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
                return this.getObject(key);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || null);
            }
        }
    }])
    .service('$cart', ['$localStorage', function ($localStorage) {
        var key = 'cart', cartAux = $localStorage.getObject(key);

        if(!cartAux){
            initCart();
        }

        this.clear = function () {
            initCart();
        };

        this.get = function () {
            return $localStorage.getObject(key);
        };

        this.getItem = function (i) {
            return this.get().items[i];
        };

        this.addItem = function (item) {
            var cart = this.get(), itemAux, exists = false;

            for(var index in cart.items){
                itemAux = cart.items[index];
                if(itemAux.id == item.id){
                    itemAux.qtd = item.qtd + itemAux.qtd;
                    itemAux.subtotal = calculateSubTotal(itemAux);
                    exists = true;
                    break;
                }
            }
            if(!exists){
                item.subtotal = calculateSubTotal(item);
                cart.items.push(item);
            }
            cart.total = getTotal(cart.items);
            $localStorage.setObject(key, cart);
        };

        this.removeItem = function (i) {
            var cart = this.get();
            cart.items.splice(i, 1);
            cart.total = getTotal(cart.items);
            $localStorage.setObject(key, cart);
        };

        this.updateQtd = function (i, qtd) {
            var cart = this.get(),
                itemAux = cart.items[i];
            itemAux.qtd = qtd;
            itemAux.subtotal = calculateSubTotal(itemAux);
            cart.total = getTotal(cart.items);
            $localStorage.setObject(key, cart);
        };

        this.setCupom = function (code, value) {
            var cart = this.get();

            cart.cupom = {
                code: code,
                value: value
            };

            $localStorage.setObject(key, cart);
        };

        this.removeCupom = function () {
            var cart = this.get();

            cart.cupom = {
                code: null,
                value: null
            };

            $localStorage.setObject(key, cart);
        };

        this.getTotalFinal = function () {
            var cart = this.get();

            return cart.total - (cart.cupom.value || 0);
        };

        function calculateSubTotal(item) {
            return item.preco * item.qtd;
        }

        function getTotal(items) {
            var sum = 0;

            angular.forEach(items, function (item) {
               sum += item.subtotal;
            });

            return sum;
        }

        function initCart() {
            $localStorage.setObject(key, {
                items: [],
                total: 0,
                cupom: {
                    code: null,
                    value: null
                }
            });
        }
    }])
    .factory('Order', ['$resource','appConfig',function ($resource, appConfig) {
        return $resource(appConfig.baserUrl + '/api/client/pedidos/:id', {id: '@id'}, {
            query: {
                isArray: false
            }
        });
    }])
    .factory('Orders', ['$resource', 'appConfig', function ($resource, appConfig) {
        return $resource(appConfig.baserUrl + '/api/client/pedidos?include=items',{}, {
            query:{
                isArray: false
            }
        });
    }])
    .factory('Cupom', ['$resource', 'appConfig', function ($resource, appConfig) {
        return $resource(appConfig.baserUrl + '/api/cupom/:code',{code: '@code'}, {
           query:{
               isArray: false
           }
        })
    }])
    .factory('User', ['$resource', 'appConfig', function ($resource, appConfig) {
        return $resource(appConfig.baserUrl + '/api/authenticated',{}, {
            query:{
                isArray: false
            },
            authenticated:{
                method: 'GET',
                url: appConfig.baserUrl + '/api/authenticated'
            }
        });
    }])
    .factory('UserData', ['$localStorage', function ($localStorage) {
            var key = 'user';
            return {
                set: function(value){
                    return $localStorage.setObject(key,value);
                },
                get: function(){
                    return $localStorage.getObject(key);
                }
            }
    }])
    .factory('DeliverymanOrder', ['$resource', 'appConfig', function ($resource, appConfig) {
        var url = appConfig.baserUrl + '/api/deliveryman/pedidos/:id';
        return $resource(url,{id: '@id'}, {
            query:{
                isArray: false
            },
            updateStatus: {
                method: 'PATCH',
                url: url + '/update-status'
            },
            geo:{
                method: 'POST',
                url: url + '/geo'
            }
        });
    }]);