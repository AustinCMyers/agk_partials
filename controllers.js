(function () {

    /*
     A lot is going on here in this API. Assume that all batteries are included.
     If the aren't now, they will be later and the API will not change.

     We'll be using the new-state machine api. It's a bit of a learning curve, but
     it beats the shit out of having to role you own. Doing this a lot in
     angular 1.1, I know your pain.
     http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$state

     Your'll notice a function in here called bootstrap_ttp.
     This stands for Bootstrap TTemplateProvider, this is donated code from
     my transliteration.io application. Pretty much it just wraps the
     ng-$templateCache api with a http request that looks at /tmpl/*.html. No,
     it doesn't support slashes, but it dose support dashes and underscores.

     You'll notice a function call 'extend'. Check out the js/app.js to see what it does.

     There isn't much else here. Just be closure aware and it'll all be awesome. I've
     found that this layout is the best at deployments. If you want to see how that
     works out, take a look at the Gruntfile.js. It's all there.
     */

    var app = angular.module('agk');
    
    app.directive('companySelectOpen', function() {
	    return {
	        link: function(scope, element) {
	            element.on('select2-open', function() {
	                scope.getCompanies();
	            });
                element.on('select2-close', function() {
                    // console.log(element);
                    if (!scope.isOpenFlags.companies) {
                        var select2 = $(element).data('select2');
                        select2.open();
                        scope.isOpenFlags.companies = true;
                    }
                });
	        }
	    }
	});
	app.directive('customerSelectOpen', function() {
	    return {
	        link: function(scope, element) {
	            element.on('select2-open', function() {
	                scope.getCustomers();
	            });
                element.on('select2-close', function() {
                    // console.log(element);
                    if (!scope.isOpenFlags.customers) {
                        var select2 = $(element).data('select2');
                        select2.open();
                        scope.isOpenFlags.customers = true;
                    }
                });
	        }
	    }
	});
	
	app.directive('supplierSelectOpen', function() {
	    return {
	        link: function(scope, element) {
	            element.on('select2-open', function() {
	                scope.getSuppliers();
	            });
                element.on('select2-close', function() {
                    // console.log(element);
                    if (!scope.isOpenFlags.suppliers) {
                        var select2 = $(element).data('select2');
                        select2.open();
                        scope.isOpenFlags.suppliers = true;
                    }
                });
	        }
	    }
	});
	app.directive('salesOrderSelectOpen', function() {
	    return {
	        link: function(scope, element, attrs) {
	            element.on('select2-open', function() {
	                scope.getSalesOrderLines(attrs.productRowIndex);
	            });
                element.on('select2-close', function() {
                    // console.log(element);
                    if (scope.salesOrderFlags[attrs.productRowIndex] != true) {
                        var select2 = $(element).data('select2');
                        select2.open();
                        scope.salesOrderFlags[attrs.productRowIndex] = true;
                    }
                });
	        }
	    }
	});
    app.directive('productSelectOpen', function() {
        return {
            link: function(scope, element, attrs) {
                element.on('select2-open', function() {
                	if (scope.products[attrs.productRowIndex].length > 1) return;
                    if (scope.productFlags[attrs.productRowIndex] != true) {
                        scope.getProducts(attrs.productRowIndex);
                    }                    
                    $("<div id='select-loader'></div>").appendTo($("#select2-drop"));
                });
                element.on('select2-close', function() {
                    // console.log(element);
                    console.log("product select close");
                    if (scope.productFlags[attrs.productRowIndex] != true) {
                        var select2 = $(element).data('select2');
                        // console.log(select2);
                        select2.open();
                        scope.productFlags[attrs.productRowIndex] = true;
                    }
                });
            }
        }
    });

    app.config(function (datepickerConfig, datepickerPopupConfig) {
        datepickerConfig.showWeeks = false;
        datepickerPopupConfig.showButtonBar = false;
    });
    
    app.controller('HeaderCtl', ['$scope', function ($scope) {

    }]);
	
	//----------------------------------------------------------------------
    
    app.factory('HeaderService', ["$http", function($http){
    	var config = {    			
			server: "https://wwwagknow50.agknowledge.com/",
			getWebApiEndPoint: function (action) {
				//return this.server + 'AgKnowledgeREST/rest/' + action;
				return this.server + 'AgKnowledgeREST/rest/' + action;
			},
			headers: { //Blanked out hard-coded values for servlet on Kevin's side to set.
				'sessionKey': '0AobLX4SUTW5yxipcEf3AGf40',
				'clientID': 'AGK'
			}    			
    	};
    	HeaderService = {};
    	HeaderService.getHeaders = function(success, error){
    		if (config.headers.sessionKey == '' || config.headers.clientID == ''){
    			//get id and key
    			$http.get('/AgKnowledgeWA/GetSessionInfo')
					.success(function (data, status, headers, configs) {
						HeaderService.setHeaders(data);
						if (typeof success == 'function')
                            // console.log("get session info called");
							success(config);
					    //console.log("Render data", data);
					})
					.error(function (data, status, headers, config) {
						//console.log("Render failure", data);
						if (typeof error == 'function')
							error();
					});
    		}
    		else {
    			if (typeof success == 'function') {
                    // console.log(config);
					success(config);
                }
    			
    			return config;
    		}
    	};
    	HeaderService.setHeaders = function(data){
    		//set headers here
    		config.headers.sessionKey = data.sessionKey;
    		config.headers.clientID = data.clientId;
    		
    		if (typeof data.server != 'undefined' && data.server != null) {
    			config.url = 'https://' + data.server;
    			if (typeof data.port != 'undefined' && data.port != null) {
    				config.url += ':' + data.port;
    			}
    			
    			config.url += '/';
    		}
    	};
    	
    	return HeaderService;
    }]);
	
	//------------------------------------------------------------------
    
    app.config([
        '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/listAllPo');
            
            $stateProvider.state("home", {
                abstract: true,
                views: {
                    "splash@": {
                        'templateUrl': "partials/splash.html?v=1",
                        'controller': [
                            "$scope", "$state", function ($scope, $state) {
                                //console.log("Landing");
                                return $scope.view_po = function (scope) {
                                    return $state.go("home.viewPo", scope.po.code);
                                };
                            }
                        ]
                    }
                }
            });
            
            $stateProvider.state("home.editPo", {
                url: "/editPo/:company/:id",
                views: {
                    "upper": {
                        'controller': 'HeaderCtl',
                        'templateUrl': 'partials/header.html?v=1'
                    },
                    "middle": {
                        'templateUrl': 'partials/po_edit.html?v=1',
                        'controller': [
                            "$http", "$scope", "$rootScope", "PoService", "$stateParams", "$state", "$filter", "HeaderService", "$modal", "$sce", function ($http, $scope, $rootScope, PoService, $stateParams, $state, $filter, HeaderService, $modal, $sce) {
                                if ($stateParams.id === "") {
                                    $state.go("home.newPo");
                                }
                                $scope.productsLoaded = false;
                                $scope.suppliersLoaded = false;
                                $scope.companiesLoaded = false;
                                $scope.customersLoaded = false;

                                $scope.isOpenFlags = {
                                    companies: false,
                                    suppliers: false,
                                    customers: false
                                };
                                $scope.salesOrderFlags = [];
                                $scope.productFlags = [];
                                $scope.productsBAK = [];
                                $scope.title = "Purchase Order: " + $stateParams.id;
                                $scope.btnName = "Approve";
                                $scope.showViewPo = true;
                                $scope.salesOrders = [];
                                $scope.getInfo = { company: $stateParams.company, poNumber: $stateParams.id, action: "C", format: "PO0120" };
                                $scope.selectedOrderLines = [];
                                $scope.companies = [];
                                $scope.suppliers = [];
                                $scope.customers = [];
                                $scope.products = [];
                                $scope.poWasEdited = false;
                                $scope.masterProductsList = [];
                                /*var config = {
                                    headers: Util.getHeaders()
                                };*/
                                
                                
                                $scope.totalForRow = function () {
                                    angular.forEach($scope.data.details, function (row) {
                                        row.getTotal = function () {
                                            if (row.priceType == "U") {
                                                return row.price * row.quantity;
                                            }
                                            else if (row.priceType == "F") {
                                                return row.price;
                                            }
                                            else if (row.priceType == "O") {
                                                return 0;
                                            }
                                        }
                                    });
                                };
                                $scope.clearPoInUse = function () {
                                    if ($scope.poWasEdited == true) {
                                        getPoEdited("PO was edited. Continuing will lose any changes you've made.");
                                    }
                                	else {
                                        $state.go("home.listAllPo");
                                    }
                                };

                                if($rootScope.flaggedPo) {
                                	var flagParam = {
                                			company: $rootScope.flaggedPo.companyCode, 
                                			poNumber: $rootScope.flaggedPo.poNumber,
                                			clearInUse: 'Y',
                                	}
                                	$http.post(HeaderService.getHeaders().getWebApiEndPoint('po/update_po_in_use?') 
                                			+ $.param(flagParam), flagParam, flagParam, HeaderService.getHeaders())
                                			.then(function(res) {
                                				$rootScope.flaggedPo = {};
                                	});
                                	
                                }

                                $scope.getCompanies = function() {
                                    Util.showLoader(true);
	                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('company/get_authorized_companies?') + $.param({ app: "PU" }), HeaderService.getHeaders())
	                                    .then(function (response) {
	                                        $scope.companies = response.data;
                                            Util.showLoader(false);
	                                    }
	                                );
                                        
	                                };
	                            $scope.getSalesOrderLines = function(index) {
                                    Util.showLoader(true);
	                            	index = parseInt(index);
	                            	$scope.getSalesOrderParams = { 
	                                		company: $scope.data.company.code, 
	                                		compositeOrderNumber: $scope.data.details[index].compositeOrderNumber,
	                                		subSupplier: $scope.data.supplier.subSupplier,
	                                		supplierType: $scope.data.supplier.supplierType,
	                                		supplier: $scope.data.supplier.supplierCode,
	                                		product: $scope.data.details[index].product.code,
	                                	};
  										$http.get(HeaderService.getHeaders().getWebApiEndPoint('order/get_po_detail_order_lines?')
                                        	+ $.param($scope.getSalesOrderParams), HeaderService.getHeaders())
                                        	.then(function (response) {

                                           		$scope.salesOrders[index] = response.data;
                                                if (response.data.length > 0) {
                                                    $scope.data.details[index].poDetailOrderLine = response.data[0];
                                                }
                                            	Util.showLoader(false);
                                        	}
                                    	);
                                            
	                            };

                                $scope.init = function (config) {
                                	Util.showLoader(true);
                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param($scope.getInfo), HeaderService.getHeaders())
	                                    .success(function (res) {
	                                    	$scope.data = res;
	                                    	companies = [];
	                                    	companies.push($scope.data.company);
	                                    	$scope.companies = companies;

	                                    	customers = [];
	                                    	customers.push($scope.data.customer);
	                                    	$scope.customerIdentifier = $scope.data.customer.name + "-" + $scope.data.customer.code + "-" + $scope.data.customer.shipTo;
	                                    	$scope.customers = customers;
	                                    	$scope.customer = $scope.data.customer;

	                                    	suppliers = [];
	                                    	suppliers.push($scope.data.supplier);
	                                    	$scope.supplierCompCode = $scope.data.supplier.supplierType + '-' + $scope.data.supplier.supplierCode + '-' + $scope.data.supplier.subSupplier;
	                                    	$scope.suppliers = suppliers;

	                                    	products = [];


	                                    	// angular.forEach($scope.data.details, function(productLine, index) {
	                                    	// 	products.push(productLine.product);

	                                    	// });
	                                    	// $scope.products = products;


	                                    	salesOrderLines = [];
	                                    	angular.forEach($scope.data.details, function(productLine, index) {
                                                $scope.salesOrderFlags[index] = false;
	                                    		salesOrder = [];
                                                products.push(productLine.product);
	                                    		if (productLine.compositeOrderNumber.length > 0) {
		                                    		salesOrder.push({
		                                    			invoicePrice: productLine.poDetailOrderLine.invoicePrice,
		                                    			invoicePriceType: productLine.poDetailOrderLine.invoicePriceType,
		                                    			orderLine: productLine.poDetailOrderLine.orderLine,
		                                    			orderLineSequence: productLine.poDetailOrderLine.orderLineSequence,
		                                    			product: productLine.poDetailOrderLine.product,
		                                    			qtyOrdered: productLine.poDetailOrderLine.qtyOrdered
		                                    		});
		                                    		$scope.salesOrders[index] = salesOrder;
		                                    		productLine.salesOrderLine = productLine.poDetailOrderLine.orderLine + '-' + productLine.poDetailOrderLine.orderLineSequence;
	                                    		}
                                                $scope.data.details[index].pc = productLine.product.code;
                                                // products.delete($$hashKey);
                                                $scope.products[index] = products;
                                                products = [];
                                                // angular.copy(products, $scope.products[index]);
	                                    		// salesOrderLines.push(salesOrder.orderLine + '-' salesOrder.orderLineSequence);
	                                    	});
                                            

	                                    	$rootScope.flaggedPo = {
	                                    			companyCode: $scope.data.company.code, 
	                                    			poNumber: $scope.data.poNumber
	                                    	};
	                                    	//console.log($rootScope.flaggedPo);
	                                        //$scope.data = res.data;
	                                        var sum = 0.0;
	                                        $scope.purchaseTotal = function () {
	                                            sum = 0.0;
	                                            angular.forEach($scope.data.details, function (detail) {
	                                                if (detail.priceType == "U") {
	                                                    sum = sum + (detail.quantity * detail.price);
	                                                }
	                                                else if (detail.priceType == "F") {
	                                                    sum = sum + (detail.price);
	                                                }
	                                                else if (detail.priceType == "O") {
	                                                    //sum = sum + 0;
	                                                }
	                                            });
	                                            return sum;
	                                        };
	                                        //$scope.purchaseTotal = sum;
	
	
	                                        //These will likely need some reformatting before saving to the database.
	                                        $scope.poDate = $scope.data.poDate;
	                                        $scope.expectedDeliveryDate = $scope.data.expectedDeliveryDate;
	                                        
	                                        $scope.totalForRow();
                                            Util.showLoader(false);

	                                        $scope.getSuppliers = function() {
                                                if ($scope.suppliersLoaded == false) {
                                                Util.showLoader(true);
		                                        $scope.getSuppliersParams = { company: $scope.data.company.code, status: "A", supplier_type: "*ALL", format: "SUP0100" };
		                                        $http.get(HeaderService.getHeaders().getWebApiEndPoint('supplier/get_suppliers_list?') + $.param($scope.getSuppliersParams), HeaderService.getHeaders())
		                                            .then(function (response) {
		                                                $scope.suppliers = response.data;
                                                        $scope.suppliersLoaded = true;
                                                        Util.showLoader(false);
		                                            }
		                                        );
                                                }

	                                    	};
	                                    	$scope.getCustomers = function() {
                                                if ($scope.customersLoaded == false) {
                                                Util.showLoader(true);
	                                    		var customerParam = {
		                                    			company: $rootScope.flaggedPo.companyCode, 
		                                    			status: "A",
		                                    			app: "PU"
		                                    	};
	                                    		$http.get(HeaderService.getHeaders().getWebApiEndPoint('customer/get_customer_list?') + $.param(customerParam), HeaderService.getHeaders())
	                                        .then(function (response) {
	                                            	$scope.customers = response.data;
	                                            	$scope.customer = $scope.data.customer;
                                                    $scope.customersLoaded = true;
	                                            	Util.showLoader(false);
	                                        	}
	                                        );

                                            }
	                                    	};
	                                    	

	                                    }
	                                )
	                                .error(function(res) {
	                                	if(res.err == "err") {
	                                    	getPoError(res.errMsg);
	                                    }
	                                    else {
	                                    	getPoError("Err status set to " + res.err);
	                                    }
	                                });
	                                
	                                $scope.getCompanies = function() {
                                        if ($scope.companiesLoaded == false) {
                                        Util.showLoader(true);
	                                	console.log($scope.companies);
	                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('company/get_authorized_companies?') + $.param({ app: "PU" }), HeaderService.getHeaders())
	                                    .then(function (response) {
	                                        $scope.companies = response.data;
                                            $scope.companiesLoaded = true;
                                            Util.showLoader(false);
	                                    }
	                                );
                                        }
	                                };
	                                
                                    getPoEdited = function(message, size) {
                                        $scope.message = message;

                                        var modalInstance = $modal.open({
                                            templateUrl: 'poEditedModal.html',
                                            controller: POEditedModal,
                                            size: size,
                                            resolve: {
                                                message: function () {
                                                    return $scope.message;
                                                },
                                            },
                                        });

                                    };

                                    var POEditedModal = function ($scope, $modalInstance, message) {
                                        $scope.message = message;
                                        $scope.ok = function() {
                                            var flagParam = {
                                            company: $rootScope.flaggedPo.companyCode, 
                                            poNumber: $rootScope.flaggedPo.poNumber,
                                            clearInUse: 'Y',
                                    }
                                    $http.post(HeaderService.getHeaders().getWebApiEndPoint('po/update_po_in_use?') 
                                            + $.param(flagParam), flagParam, flagParam, HeaderService.getHeaders())
                                            .then(function(res) {
                                                $rootScope.flaggedPo = {};
                                            });

                                            $state.go("home.listAllPo");
                                            $modalInstance.close();
                                        };
                                        $scope.cancel = function() {
                                            $modalInstance.close();
                                        };
                                    };
	                                
	                                
	                                getPoError = function (message, size) {
	                                	$scope.message = message;
	                                	
	                                	var modalInstance = $modal.open({
	                                		templateUrl: 'errorModal.html',
	                                		controller: ErrorModalCtl,
	                                		size: size,
	                                		resolve: {
	                                			message: function () {
	                                                return $scope.message;
	                                            },
	                                		}
	                                	});

	                                	modalInstance.result.then(function (data) {
	                                		$state.go("home.listAllPo");
	                                	}, function () {
	                                		$state.go("home.listAllPo");
	                                	});

	                                };
	                                
	                                var ErrorModalCtl = function ($scope, $modalInstance, message) {
	                                	$scope.errMsg = message;
	                                	$scope.list = function () {
	                                		$modalInstance.close();
	                                	};
	                                };
	                                
                                };
                                    
                                $scope.$on('ngGridEventData', function() {
                                    scrollToBottom();
                                });

                                $scope.$on('ngGridEventEndCellEdit', function(event) {
                                	field = event.targetScope.col.field;
                                	cellData = event.targetScope.row.entity[event.targetScope.col.field];
                                    if (field == "compositeOrderNumber" && cellData.length >= 1 && cellData.length <= 6) {
                                        //$scope.data.details[i].compositeOrderNumber = cellData;
                                        $scope.poWasEdited = true;
                                        $scope.$apply();
                                    }
                                	if (field == "compositeOrderNumber" && (cellData.length == 12)) {
                                        $scope.poWasEdited = true;
                                		var year = cellData.substring(0,2);
                                		var orderNum = cellData.substring(2,8);
                                		var line = cellData.substring(8,10);
                                		var seq = cellData.substring(10,12);
                                		row = event.targetScope.row;
  										var i = row.rowIndex;
  										cellData = year + '-' + orderNum + '-' + line + '-' + seq;
  										$scope.data.details[i].compositeOrderNumber = year + '-' + orderNum + '-' + line + '-' + seq;
                                		$scope.$apply();
                                	}
                                	if (field == "compositeOrderNumber" && (cellData.length == 15 || (cellData.length >= 1 && cellData.length <= 6))) {
                                        $scope.poWasEdited = true;
  										Util.showLoader(true);
  										row = event.targetScope.row;
  										var i = row.rowIndex;
	                                	$scope.getSalesOrderParams = { 
	                                		company: $scope.data.company.code, 
	                                		compositeOrderNumber: cellData,
	                                		subSupplier: $scope.data.supplier.subSupplier,
	                                		supplierType: $scope.data.supplier.supplierType,
	                                		supplier: $scope.data.supplier.supplierCode,
	                                		product: $scope.data.details[i].product.code,
	                                	};
	                                	//$scope.getSalesOrderParams = JSON.stringify($scope.getSalesOrderParams);
	                                	/*console.log("product: " + $scope.getSalesOrderParams.product);
	                                	console.log("subSupplier: " + $scope.data.supplier.subSupplier);
	                                	console.log("supplier: " + $scope.data.supplier);
	                                	console.log("supplierType: " + $scope.data.supplier.supplierType);
	                                	console.log("compositeOrderNumber: " + cellData);
	                                	console.log("company: " + $scope.data.company.code);
	                                	*/
	                                	console.log("grid event ngGridEventEndCellEdit");
  										$http.get(HeaderService.getHeaders().getWebApiEndPoint('order/get_po_detail_order_lines?')
                                        	+ $.param($scope.getSalesOrderParams), HeaderService.getHeaders())
                                        	.then(function (response) {

                                           		$scope.salesOrders[i] = response.data;

                                            	Util.showLoader(false);
                                            	console.log(response);
                                        	}
                                    	);
  									}
  									else {
  										console.log("not compositeOrderNumber");
  									}
								});
                                $scope.getSelectedOrderLineForRow = function (row) {
                                	console.log($scope.selectedOrderLines);
                                	console.log($scope.selectedOrderLines[row]);
                                	return $scope.selectedOrderLines[row];
                                };

                                $scope.gridOptions = {
                                    data: 'data.details',
                                    enableCellSelection: true,
                                    enableRowSelection: false,
                                    enableCellEditOnFocus: true,
                                    //enablePinning: true,
                                    //enableColumnResize: true,
                                    columnDefs: [
                                    	{ field: 'orderLine', displayName: 'line', width: 50},
                                    	{ field: 'orderLineSeq', displayName: 'line seq', width: 70},
                                        { field: 'pc', displayName: 'Product', cellTemplate: "<div><select product-select-open product-row-index='{{row.rowIndex}}' class='product-select wrapword' ui-select2=\"{ 'dropdownAutoWidth': true }\" ng-model='COL_FIELD' ng-change='productChange(row, COL_FIELD)' style='width: 100%' product-select-open ><option value='{{ listProduct.code }}' ng-repeat='listProduct in products[row.rowIndex]'>{{ listProduct.code }} - {{ listProduct.description }}</option></select></div>", width: 175, },
                                        { field: 'overrideDescription', displayName: 'Description', width: 160 },
                                        { field: 'compositeOrderNumber', displayName: 'Sales Order #', width: 115 },
                                        { field: 'salesOrderLine', displayName: 'Sales Order Line', cellTemplate: "<div><select sales-order-select-open product-row-index='{{row.rowIndex}}' class='salesOrder-select' ui-select2=\"{ 'dropdownAutoWidth': true }\" ng-model='COL_FIELD' ng-change='salesOrderChange(row)' style='width: 100%'><option value='{{ salesOrder.orderLine }}-{{ salesOrder.orderLineSequence }}' ng-repeat='salesOrder in salesOrders[row.rowIndex]'>{{ salesOrder.product.description }} - {{ salesOrder.qtyOrdered }} - ${{ salesOrder.invoicePrice | number:4 }}</option></select></div>", width: 180 },
                                        { field: 'poDetailOrderLine.orderStatus.statusShortName', enableCellEdit: false, displayName: 'Status', width: 83 },
                                        { field: 'poDetailOrderLine.orderShipDate', enableCellEdit: false, cellTemplate: "<div class='ngCellText'>{{toDesiredDateFormat(row.getProperty(col.field))}}</div>",displayName: 'Ship Date', width: 83 },
                                        { field: 'quantity', displayName: 'Qty', cellTemplate: "<div class='ngCellText' style='text-align:right;'>{{row.getProperty(col.field)}}</div>", enableCellEdit: true, width: 40 },
                                        { field: 'uom.shortName', displayName: 'UoM', enableCellEdit: false, width: 68 },
                                        { field: 'price', displayName: 'Price', cellTemplate: "<div class='ngCellText' style='text-align:right;'>${{row.getProperty(col.field) | number:2}}</div>", enableCellEdit: true, width: 65 },
                                        { field: 'priceType', displayName: 'Price Type', cellTemplate: "<div><select ui-select2 ng-model='COL_FIELD' style='width: 100%'><option value='U'>Per Unit</option><option value='F'>Flat Price</option><option value='O'>Open Price</option></select></div>", width: 83 },
                                        { field: 'getTotal()', displayName: 'Line Total', cellTemplate: "<div class='ngCellText' style='text-align:right;'>${{row.getProperty(col.field) | number:2}}</div>", enableCellEdit: false, width: 80 },
                                        { field: '', displayName: '', cellTemplate: "<div><div type='button' class='btn btn-delete' ng-click='removeProduct()' ><i class='glyphicon glyphicon-remove' style='color:red;'></i></div></div>", enableCellEdit: false, width:37}
                                    ]
                                };
                                $scope.toDesiredDateFormat = function(date) {
                                if (date != "" && date != null) {
                                    var splitString = date.split("-");
                                    return splitString[1] + "-" + splitString[2] + "-" + splitString[0];
                                }
                            }
                                $scope.gridOptions.columnDefs[0].visible = false;
                                $scope.gridOptions.columnDefs[1].visible = false;
                                $scope.isOrderLineSelected = function (compareVar, row) {
                                	angular.forEach($scope.selectedOrderLines, function(value,index){
                                		if (compareVar == value) {
                                			return true;
                                		}
                                	});
                                	return false;
                                };
                                $scope.moveProdUp = function () {

                                };

                                $scope.moveProdDown = function () {

                                };

                                $scope.open = function ($event) {
                                    $event.preventDefault();
                                    $event.stopPropagation();

                                };

                                $scope.addProduct = function () {
                                    $scope.poWasEdited = true;
                                    $scope.data.details.push({
                                        price: 0,
                                        priceType: "U",
                                        quantity: 0,
                                        line: 0,
                                        company: $scope.data.company,
                                        poNumber: $scope.data.poNumber,
                                        uom: {},
                                        compositeOrderNumber: "",
                                        orderLine: 0,
                                        orderLineSeq: 0,
                                        dispSeq: 0,
                                        orderNumber: 0,
                                        orderPrefix: "",
                                        orderPrice: 0,
                                        orderPriceType: "",
                                        orderProductDescription: "",
                                        orderQty: 0,
                                        orderShipDate: "",
                                        orderSuffix: "",
                                        orderStatus: "",
                                        orderStatusShortName: "",
                                        poDetailOrderLine: {},
                                        pc: "",
                                        lot: {
                                            lot: "",
                                            company: {
                                                code: $scope.data.company.code
                                            },
                                            shortName: $scope.data.supplier.shortName,
                                            status: ""
                                        },
                                        overrideDescription: "",
                                        product: {
                                            company: $scope.data.company.code,
                                            shortName: $scope.data.supplier.shortName,
                                            status: "",
                                            code: "",
                                            description: ""
                                        },
                                        dispSeq: 0  //What is this? It was in the sample object
                                    });
                                    $scope.totalForRow();
                                };

                                $scope.removeProduct = function () {
                                    $scope.poWasEdited = true;
                                    $scope.data.details.splice(this.row.rowIndex, 1);
                                };

                                $scope.removeLineItem = function (index) {
                                    $scope.poWasEdited = true;
                                    $scope.data.details.splice(index, 1);
                                };

                                $scope.viewPo = function (companyCode, poNumber) {
                                	if($rootScope.flaggedPo) {
	                                	var flagParam = {
	                                			company: companyCode, 
	                                			poNumber: poNumber,
	                                			clearInUse: 'Y',
	                                	}
	                                	$http.post(HeaderService.getHeaders().getWebApiEndPoint('po/update_po_in_use?') 
	                                			+ $.param(flagParam), flagParam, HeaderService.getHeaders())
	                                			.then(function(res) {
	                                				$rootScope.flaggedPo = {};
	                                			});
                                	}
                                	
                                    $state.go("home.viewPo", {company: companyCode, id: poNumber});
                                    //console.log(poNumber);
                                };

                                $scope.changeCompany = function (index) {
                                    $scope.poWasEdited = true;
                                    $scope.getSuppliersParams = { company: $scope.data.company.code, status: "A", supplier_type: "*ALL", format: "SUP0110" };
                                    Util.showLoader(true);
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('supplier/get_suppliers_list?')
                                        + $.param($scope.getSuppliersParams), HeaderService.getHeaders())
                                        .then(function (response) {
                                            $scope.suppliers = response.data;
                                            $scope.supplierCompCode = "";
                                            var tempCode;
                                            var oldCode = $scope.data.supplier.supplierType + '-' + $scope.data.supplier.supplierCode + '-' + $scope.data.supplier.subSupplier;
                                            for (var i = 0; i < $scope.suppliers.length; i++) {
                                                tempCode = $scope.suppliers[i].supplierType + '-' + $scope.suppliers[i].supplierCode + '-' + $scope.suppliers[i].subSupplier;
                                                if (oldCode === tempCode) {
                                                    $scope.supplierCompCode = oldCode;
                                                }
                                            }
                                            Util.showLoader(false);
                                            //Util.showLoader(false);
                                        }
                                    );									

                                    $scope.selectedCompany = $scope.companies[index];
                                    /*
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('whs/get_whs_list?')+ $.param({ company: $scope.data.company.code }), HeaderService.getHeaders())
                                    	.then(function(res) {
                                    		$scope.whsList = res.data;
                                    	});*/
                                    $scope.setCustomers("A", $scope.data.company.code );
                                    
                                };
                                
                                $scope.getProducts = function (row) {
                                    Util.showLoader(true);
                                	if (!$scope.productFlags[row]) {
	                                    $scope.getProductsParams = { company: $scope.data.company.code, status: "A"};
	                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('product/get_products_list?')
	                                        + $.param($scope.getProductsParams), HeaderService.getHeaders())
	                                        .then(function (response) {
                                                var products = [];
                                                $scope.products[row] = response.data;
	                                            // $scope.masterProductsList = response.data;
                                                // $scope.productsBAK = response.data;
	                                            //Util.showLoader(false);
                                                // angular.copy($scope.masterProductsList, products);
                                                // $scope.products[row] = products;
                                                // $scope.masterProductsList.forEach(function(product) {
                                                //     delete(product.$$hashKey);
                                                // });
                                                Util.showLoader(false);
                                                $('#select-loader').remove();
	                                        }
	                                    );
                                    }
                                    else {
                                        Util.showLoader(false);
                                    }
                                    // else {
                                    //     var products = [];
                                    //     angular.copy($scope.masterProductsList, products);
                                    //     $scope.products[row] = products;
                                    //     Util.showLoader(false);
                                    // }
                                };
                                $scope.populateProductIndex = function (row) {
                                    Util.showLoader(true);
                                    console.log("populateProductIndex");
                                    var products = $scope.masterProductsList;
                                    $scope.products[row] = products;
                                    Util.showLoader(false);
                                };
                                $scope.salesOrderChange = function (row) {
                                    $scope.poWasEdited = true;
                                	Util.showLoader(true);
                                	var i = row.rowIndex;
                                	/*
                                	$scope.getSalesOrderParams = { 
                                		company: $scope.data.company.code, 
                                		compositeOrderNumber: "",

                                	};
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('order/get_po_detail_order_lines?')
                                        + $.param($scope.getSalesOrderParams), HeaderService.getHeaders())
                                        .then(function (response) {
                                            $scope.salesOrders = response.data;
                                            Util.showLoader(false);
                                        }
                                    );

                                	var salesOrder;
                                	var i = row.rowIndex;

                                	for (var j = 0; j < $scope.salesOrders[i].length; j++) {

                                	}*/
                                	if ($scope.data.details[i].salesOrderLine != null) {
	                                	var resultSalesOrder = $scope.data.details[i].salesOrderLine.split("-");
	                                	//console.log($scope.data.details[i].salesOrderLine);
	                                	//console.log(resultSalesOrder);
	                                	if (resultSalesOrder.length == 2) {
		                                	// $scope.data.details[i].poDetailOrderLine.orderLine = parseInt(resultSalesOrder[0]);
		                                	// $scope.data.details[i].poDetailOrderLine.orderLineSequence = parseInt(resultSalesOrder[1]);
		                                	//console.log("result sales order: " + resultSalesOrder);
                                            var tempOrderLine = $scope.salesOrders[i][parseInt(resultSalesOrder[1])-1]
                                           $scope.data.details[i].poDetailOrderLine = tempOrderLine;
                                           $scope.data.details[i].poDetailOrderLine.orderShipDate = tempOrderLine.orderShipDate;
                                           $scope.data.details[i].poDetailOrderLine.orderStatus.statusShortName = tempOrderLine.orderStatus.statusShortName;
	                            		}
	                            		
                            		}
                                    else {
                                        $scope.data.details[i].salesOrderLine = "0-0";
                                        $scope.data.details[i].poDetailOrderLine.orderLine = 0;
                                        $scope.data.details[i].poDetailOrderLine.orderLineSequence = 0;
                                    }
                            		Util.showLoader(false);
                                };
								
                                $scope.productChange = function (row, newPC) {
                                    $scope.poWasEdited = true;
                                    var tempDetail;
                                    var i = row.rowIndex;
                                    Util.showLoader(true);
                                    for (var j = 0; j < $scope.products[row.rowIndex].length; j++) {
                                        // if ($scope.data.details[i].pc === $scope.products[j].code) {
                                        if (newPC == $scope.products[row.rowIndex][j].code) {
                                            $scope.data.details[i].product = $scope.products[row.rowIndex][j];
                                            $scope.data.details[i].uom = $scope.products[row.rowIndex][j].uomP;
                                            $scope.data.details[i].price = $scope.products[row.rowIndex][j].price1;
                                            $scope.data.details[i].overrideDescription = $scope.products[row.rowIndex][j].description;
                                            //$scope.data.details[i].salesOrderLine = $scope.products[j].orderLine + "-" + $scope.products[j].orderLineSeq;
                                            //$scope.data.details[i].compositeOrderNumber = $scope.products[j].compositeOrderNumber;
                                            //$scope.data.details[i].orderLine = $scope.salesOrders[i].orderLine;
                                            //$scope.data.details[i].orderLineSeq = $scope.salesOrders[i].orderLineSequence;
                                            break;
                                        }
                                        $scope.data.details[i].salesOrderLine = $scope.data.details[i].poDetailOrderLine.orderLine + '-' + $scope.data.details[i].poDetailOrderLine.orderLineSequence;
                                    }
                                    // $scope.data.details[i].product = $scope.products[row.rowIndex];
                                    // $scope.data.details[i].uom = $scope.products[row.rowIndex].uomP;
                                    // $scope.data.details[i].price = $scope.products[row.rowIndex].price1;
                                    // $scope.data.details[i].overrideDescription = $scope.products[row.rowIndex].description;

                                    Util.showLoader(false);
                                    // $scope.data.details[i].salesOrderLine = $scope.data.details[i].poDetailOrderLine.orderLine + '-' + $scope.data.details[i].poDetailOrderLine.orderLineSequence;
                                };

                                $scope.setCustomers = function (statusCode, companyCode) {
                                	var customerParam = {
                                			company: companyCode, 
                                			status: statusCode,
                                			app: "PU"
                                	};
                                	
                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('customer/get_customer_list?') + $.param(customerParam), HeaderService.getHeaders())
                                    .then(function (response) {
                                        	$scope.customers = response.data;
                                    	}
                                    );
                                };

                                $scope.changeCustomer = function (index) {
                                    $scope.poWasEdited = true;
                                	for (var i = 0; i < $scope.customers.length; i++) {
                                        if (angular.equals($scope.customerIdentifier, ($scope.customers[i].name + "-" + $scope.customers[i].code + "-" + $scope.customers[i].shipTo))) {
                                        	$scope.customer = $scope.customers[i];
                                            break;
                                        }
                                    }
                                };
                                $scope.changeSupplier = function (index) {
                                    $scope.poWasEdited = true;
                                    for (var i = 0; i < $scope.suppliers.length; i++) {
                                        if (angular.equals($scope.supplierCompCode, ($scope.suppliers[i].supplierType + '-' + $scope.suppliers[i].supplierCode + '-' + $scope.suppliers[i].subSupplier))) {
                                        	console.log("old sub-supplier: " + $scope.data.supplier.subSupplier);
                                            $scope.data.supplier = $scope.suppliers[i];
                                            console.log("new sub-supplier: " + $scope.data.supplier.subSupplier);
                                            break;
                                        }
                                    }
                                };
                                $scope.updatePO = function () {
                                    

                                    var PO = {};
                                    angular.copy($scope.data, PO);
                                    PO.customer = $scope.customer;
                                    PO.details.forEach(function(x){
                                        if (x.poDetailOrderLine.orderLine) {
                                        	x.orderLine = x.poDetailOrderLine.orderLine;
                                        }
                                        if (x.poDetailOrderLine.orderLineSequence) {
                                    	   x.orderLineSeq = x.poDetailOrderLine.orderLineSequence;
                                        }
                                        if (x.poDetailOrderLine.odOrd && x.poDetailOrderLine.odOpfx && x.poDetailOrderLine.invoicePrice && x.poDetailOrderLine.invoicePriceType && x.poDetailOrderLine.product && x.poDetailOrderLine.qtyOrdered && x.poDetailOrderLine.orderShipDate && x.poDetailOrderLine.statusCode && x.poDetailOrderLine.orderStatus && x.poDetailOrderLine.odOsfx) {

                                        	x.orderNumber = x.poDetailOrderLine.odOrd;
                                        	x.orderPrefix = x.poDetailOrderLine.odOpfx;
                                        	x.orderPrice = x.poDetailOrderLine.invoicePrice;
                                        	x.orderPriceType = x.poDetailOrderLine.invoicePriceType;
                                        	x.orderProductDescription = x.poDetailOrderLine.product.description;
                                        	x.orderQty = x.poDetailOrderLine.qtyOrdered;
                                        	x.orderShipDate = x.poDetailOrderLine.orderShipDate;
                                        	x.orderStatus = x.poDetailOrderLine.orderStatus.statusCode;
                                        	x.orderStatusShortName = x.poDetailOrderLine.orderStatus.statusShortName;
                                        	x.orderSuffix = x.poDetailOrderLine.odOsfx;
                                        }
                                    });
                                    PO.details.forEach(function(x){delete x.pc; });
                                    PO.details.forEach(function(x){delete x.salesOrderLine; });
                                    PO.details.forEach(function(x){delete x.getTotal; delete x.poDetailOrderLine});
                                    /*
                                    $scope.salesOrders.forEach(function(value, key) {
                                    	PO.details[key] = value;
                                    });
									*/
                                    PO.poDate = $filter('date')($scope.poDate, "MM/dd/yyyy");
                                    PO.expectedDeliveryDate = $filter('date')($scope.expectedDeliveryDate, "MM/dd/yyyy");
                                    //$scope.suppliers = response.data;
                                    //$scope.supplierCompCode = "";
                                    var tempCode;
                                    var supplierCode = $scope.supplierCompCode;
                                    for (var i = 0; i < $scope.suppliers.length; i++) {
                                        tempCode = $scope.suppliers[i].supplierType + '-' + $scope.suppliers[i].supplierCode + '-' + $scope.suppliers[i].subSupplier;
                                        if (supplierCode === tempCode) {
                                            PO.supplier = $scope.suppliers[i];
                                        }
                                    }
                                    //PO.sessionKey = config.headers.sessionKey;
                                    var updateParams = { company: PO.company.code, poNumber: PO.poNumber, action: "C", format: "PO0120" };
                                    
                                    Util.showLoader(true);
                                    $http.post(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param(updateParams), PO, HeaderService.getHeaders())
                                        .success(function (data, status, headers, config) {
                                            //console.log("Render success", data);
                                        	if($rootScope.flaggedPo) {
	                                        	var flagParam = {
	                                        			company: $scope.data.company.code, 
	                                        			poNumber: $scope.data.poNumber,
	                                        			clearInUse: 'Y',
	                                        	}
	                                        	$http.post(HeaderService.getHeaders().getWebApiEndPoint('po/update_po_in_use?') 
	                                        			+ $.param(flagParam), flagParam, HeaderService.getHeaders())
	                                        			.then(function(res) {
	                                        				$rootScope.flaggedPo = {};
	                                        			});
                                        	}
                                            $state.go("home.viewPo", {company: data.company.code, id: data.poNumber})
                                            Util.showLoader(false);
                                        })
                                        .error(function (data, status, headers, config) {
                                            console.log("Render failure", data);
                                            Util.showLoader(false);
                                            getPoError("Saving PO failed.  Status: " + status);

                                        });
                                };

                                $scope.approvePO = function () {
                                	Util.showLoader(true);
                                    var PO = $scope.data;
                                    PO.poDate = $filter('date')($scope.poDate, "MM/dd/yyyy");
                                    PO.expectedDeliveryDate = $filter('date')($scope.expectedDeliveryDate, "MM/dd/yyyy");
                                    //$scope.suppliers = response.data;
                                    //$scope.supplierCompCode = "";
                                    var tempCode;
                                    var supplierCode = $scope.supplierCompCode;
                                    for (var i = 0; i < $scope.suppliers.length; i++) {
                                        tempCode = $scope.suppliers[i].supplierType + '-' + $scope.suppliers[i].supplierCode + '-' + $scope.suppliers[i].subSupplier;
                                        if (supplierCode === tempCode) {
                                            PO.supplier = $scope.suppliers[i];
                                        }
                                    }
                                    PO.status = {
                                        "status": "IS",
                                        "statusDesc50": "Issued ",
                                        "statusDesc10": "Issued ",
                                        "statusDesc05": "Issd",
                                        "dispSeq": PO.status.dispSeq
                                    };

                                    PO.statusCode = "IS";
                                    PO.statusDesc05 = "Issd";
                                    PO.statusDesc10 = "Issued";
                                    PO.statusDesc50 = "Issued";

                                    var updateParams = { company: PO.company.code, poNumber: PO.poNumber, action: "C", format: "PO0120" };

                                    $http.post(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param(updateParams), PO, HeaderService.getHeaders())
                                        .success(function (data, status, headers, config) {
                                        	alert('PO Approved');
                                        	Util.showLoader(false);
                                        })
                                        .error(function (data, status, headers, config) {
                                            console.log("Render failure", data);
                                            Util.showLoader(false);
                                        });
                                };

                                $scope.newPo = function () {
                                    $state.go("home.newPo");
                                };
                                
                                HeaderService.getHeaders(function (config) {
                                	Util.showLoader(true);
                                	$scope.init(config);
                                },
                                function () {
                                	alert('Unable to get credentials.')
                                })

                                return $scope.data;
                            }
                        ]
                    }

                }
            });
            
            $stateProvider.state("home.newPo", {
                url: "/newPo/:company/:id",
                templateUrl: "/partials/po_edit.html",
                views: {
                    "upper": {
                        'controller': 'HeaderCtl',
                        'templateUrl': 'partials/header.html?v=1'
                    },
                    "middle": {
                        'templateUrl': 'partials/po_edit.html?v=1',
                        'controller': [
                            "$http", "$scope", "$rootScope", "PoService", "$stateParams", "$state", "$filter", "HeaderService", function ($http, $scope, $rootScope, PoService, $stateParams, $state, $filter, HeaderService) {
                                //var config = HeaderService.getHeaders();
                                $scope.title = "New Purchase Order";
                                $scope.editPoNum = false;
                                $scope.btnName = "Create Po";
                                $scope.showViewPo = false;
                                $scope.addedProducts = [];
                                $scope.aNewPo = {};
                                $scope.salesOrders = [];
                                $scope.customerIdentifier = "";
                                var currentDate = new Date();
                                $scope.poDate = $filter('date')(currentDate, "MM/dd/yyyy");
                                $scope.customers = [];
                                $scope.salesOrderFlags = [];
                                $scope.productFlags = [];
                                $scope.productsLoaded = false;
                                $scope.suppliersLoaded = false;
                                $scope.companiesLoaded = false;
                                $scope.customersLoaded = false;
                                $scope.companies = [];
                                $scope.suppliers = [];
                                $scope.customers = [];
                                $scope.products = [];
                                $scope.isOpenFlags = {
                                    companies: false,
                                    suppliers: false,
                                    customers: false
                                };
                                $scope.masterProductsList = [];

                                var isCopy = ($stateParams.company != null && $stateParams.id != null);
                                
                                Util.showLoader(true);
                                
                                $scope.setHeaders = function () {
                                	HeaderService.setHeaders("", "");
                                };
                                $scope.clearPoInUse = function () {
                                    $state.go("home.listAllPo");
                                };
                                $scope.getCompanies = function() {
                                    if ($scope.companiesLoaded == false) {
                                    Util.showLoader(true);
                                        $http.get(HeaderService.getHeaders().getWebApiEndPoint('company/get_authorized_companies?') + $.param({ app: "PU" }), HeaderService.getHeaders())
                                        .then(function (response) {
                                            $scope.companiesLoaded = true;
                                            $scope.companies = response.data;
                                            Util.showLoader(false);
                                        }
                                    );
                                    }
                                };
                                $scope.getCustomers = function() {
                                                if ($scope.customersLoaded == false) {
                                                Util.showLoader(true);
                                                var customerParam = {
                                                        company: $scope.data.company.code, 
                                                        status: "A",
                                                        app: "PU"
                                                };
                                                $http.get(HeaderService.getHeaders().getWebApiEndPoint('customer/get_customer_list?') + $.param(customerParam), HeaderService.getHeaders())
                                            .then(function (response) {
                                                    $scope.customers = response.data;
                                                    $scope.customersLoaded = true;
                                                    Util.showLoader(false);
                                                }
                                            );

                                            }
                                            };
                                $scope.getSuppliers = function() {

                                };
                                $scope.getProducts = function() {

                                };
                                $scope.getSalesOrderLines = function(index) {
                                    Util.showLoader(true);
                                    index = parseInt(index);
                                    $scope.getSalesOrderParams = { 
                                            company: $scope.data.company.code, 
                                            compositeOrderNumber: $scope.data.details[index].compositeOrderNumber,
                                            subSupplier: $scope.data.supplier.subSupplier,
                                            supplierType: $scope.data.supplier.supplierType,
                                            supplier: $scope.data.supplier.supplierCode,
                                            product: $scope.data.details[index].product.code,
                                        };
                                        $http.get(HeaderService.getHeaders().getWebApiEndPoint('order/get_po_detail_order_lines?')
                                            + $.param($scope.getSalesOrderParams), HeaderService.getHeaders())
                                            .then(function (response) {

                                                $scope.salesOrders[index] = response.data;
                                                if (response.data.length > 0) {
                                                    $scope.data.details[index].poDetailOrderLine = response.data[0];
                                                }
                                                Util.showLoader(false);
                                            }
                                        );
                                            
                                };

                                $scope.init = function (config) {
                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('company/get_authorized_companies?') + $.param({format: "CMP0110", app: "PU" }), HeaderService.getHeaders())
	                                    .then(function (response) {
	                                        $scope.companies = response.data;
	                                        if (!isCopy) {
	                                        	Util.showLoader(false);
	                                        }                                        
	                                    }
	                                );
                                	
                                	//intent to copy
                                    if (isCopy) {         

                                    Util.showLoader(true);                       	
                                        //var config = HeaderService.getHeaders()
                                        var getParams = {
                                            company: $stateParams.company,
                                            poNumber: $stateParams.id,
                                            action: "V",
                                            format: "PO0120"
                                        };
                                        var createParams = {
                                            company: $stateParams.company,
                                            poNumber: 0,
                                            action: "A",
                                            format: "PO0120"
                                        };
                                        
                                        $http.get(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param(getParams), HeaderService.getHeaders())
                                            .then(function (res) {
                                                Util.showLoader(true);
                                                $scope.data = res.data;
                                                var sum = 0.0;
                                                $scope.purchaseTotal = function () {
                                                    sum = 0.0;
                                                    angular.forEach($scope.data.details, function (detail) {
                                                        if (detail.priceType == "U") {
                                                            sum = sum + (detail.quantity * detail.price);
                                                        }
                                                        else if (detail.priceType == "F") {
                                                            sum = sum + (detail.price);
                                                        }
                                                        else if (detail.priceType == "O") {
                                                            //sum = sum + 0;
                                                        }
                                                    });
                                                    return sum;
                                                };
                                                //$scope.purchaseTotal = sum;
                                                $scope.aNewPo = $scope.data

                                                //These will likely need some reformatting before saving to the database.
                                                $scope.poDate = $scope.data.poDate;
                                                $scope.expectedDeliveryDate = $scope.data.expectedDeliveryDate;
                                                
                                                $scope.totalForRow();
                                                Util.showLoader(true);
                                                $scope.getSuppliersParams = { company: $scope.data.company.code, status: "A", supplier_type: "*ALL", format: "SUP0100" };
                                                $http.get(HeaderService.getHeaders().getWebApiEndPoint('supplier/get_suppliers_list?') + $.param($scope.getSuppliersParams), HeaderService.getHeaders())
                                                    .then(function (response) {
                                                        $scope.suppliers = response.data;
                                                        $scope.supplierCompCode = $scope.data.supplier.supplierType + '-' + $scope.data.supplier.supplierCode + '-' + $scope.data.supplier.subSupplier;
                                                    }
                                                );
                                                    Util.showLoader(true);
                                                $scope.getProductsParams = { company: $scope.data.company.code, status: "A"};
                                                $http.get(HeaderService.getHeaders().getWebApiEndPoint('product/get_products_list?') +
                                                    $.param($scope.getProductsParams), HeaderService.getHeaders())
                                                    .then(function (response) {
                                                        $scope.products = response.data;
                                                        Util.showLoader(true);
                                                        //reloading data to protect from race condition
                                                        $http.get(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param(getParams), HeaderService.getHeaders())
                                                            .then(function (res) {
                                                                //$scope.data = res.data;
                                                                Util.showLoader(true);
                                                                var tempDetail;
                                                                //console.log("data", res.data.details);//log details
                                                                for (var i = 0; i < res.data.details.length; i++) {
                                                                	//$scope.addedProducts.push({ 'product': { 'code': "" } });
                                                                	res.data.details[i].lot = {};
                                                                	delete res.data.details[i].dispSeq;
                                                                	res.data.details[i].line = 0;
                                                                	$scope.addedProducts.push(res.data.details[i]);

                                                                    $scope.customerIdentifier = res.data.customer.name + '-' + res.data.customer.code + '-' + res.data.customer.shipTo;
                                                                    var tempCustomer = [];
                                                                    tempCustomer.push(res.data.customer);
                                                                    $scope.customers = tempCustomer;
                                                                    for (var j = 0; j < $scope.addedProducts.length; j++) {
                                                                        $scope.addedProducts[j].pc = $scope.addedProducts[j].product.code;

                                                                        salesOrder = [];
                                                                        if ($scope.addedProducts[j].compositeOrderNumber.length > 0) {
                                                                            salesOrder.push({
                                                                                invoicePrice: $scope.addedProducts[j].poDetailOrderLine.invoicePrice,
                                                                                invoicePriceType: $scope.addedProducts[j].poDetailOrderLine.invoicePriceType,
                                                                                orderLine: $scope.addedProducts[j].poDetailOrderLine.orderLine,
                                                                                orderLineSequence: $scope.addedProducts[j].poDetailOrderLine.orderLineSequence,
                                                                                product: $scope.addedProducts[j].poDetailOrderLine.product,
                                                                                qtyOrdered: $scope.addedProducts[j].poDetailOrderLine.qtyOrdered
                                                                            });
                                                                            $scope.salesOrders[j] = salesOrder;
                                                                            $scope.addedProducts[j].salesOrderLine = $scope.addedProducts[j].poDetailOrderLine.orderLine + '-' + $scope.addedProducts[j].poDetailOrderLine.orderLineSequence;
                                                                        }


                                                                    }
                                                                }
                                                                $scope.totalForRow();
                                                                Util.showLoader(false);
                                                                
                                                            });
                                                    }
                                                );
                                            });                                        
                                    }
                                    else {
                                    	$scope.aNewPo = {
                                                "company": "",//changes when new company is selected
                                                "customer": "",//changes when new customer is selected
                                                "dateCreated": "",
                                                "deliverToWhs": "01",
                                                "details": [],
                                                "expectedDeliveryDate": "",// MM/dd/yyyy
                                                "inUseBy": "",
                                                "orderNumber": 0,
                                                "orderPrefix": "",
                                                "orderSuffix": 0,
                                                "dispSeq": 0,
                                                "line": 0,
                                                "orderLine": 0,
                                                "orderLineSeq": 0,
                                                "orderPrice": 0,
                                               	"orderPriceType": "",
                                               	"orderProductDescription": "",
                                               	"orderQty": "",
                                               	"orderShipDate": "",
                                               	"orderStatus": "",
                                               	"orderStatusShortName": "",

                                                "poDate": "",
                                                "poNumber": "",
                                                "privateNote": "",
                                                "salesTicket": 0,
                                                "status": "",//object
                                                "statusCode": "",
                                                "statusDesc05": "",
                                                "statusDesc10": "",
                                                "statusDesc50": "",
                                                "supplier": "",//changes when new supplier is selected
                                                "supplierNote": "",
                                                "supplierPickUpNumber": "",
                                                "timeCreated": "",
                                                "userCreated": "KEVIN2",
                                                "userLastMaintained": ""
                                            };
                                    }
                                };
                                
                                $scope.updatePO = function () {
                                	Util.showLoader(true);
                                    var currentDate = new Date();
                                    $scope.aNewPo.details = [];
                                    angular.copy( $scope.addedProducts, $scope.aNewPo.details);
                                    $scope.aNewPo.details.forEach(function(x){
                                        if (x.poDetailOrderLine.orderLine) {
                                            x.orderLine = x.poDetailOrderLine.orderLine;
                                        }
                                        if (x.poDetailOrderLine.orderLineSequence) {
                                           x.orderLineSeq = x.poDetailOrderLine.orderLineSequence;
                                        }
                                        if (x.poDetailOrderLine.odOrd && x.poDetailOrderLine.odOpfx && x.poDetailOrderLine.invoicePrice && x.poDetailOrderLine.invoicePriceType && x.poDetailOrderLine.product && x.poDetailOrderLine.qtyOrdered && x.poDetailOrderLine.orderShipDate && x.poDetailOrderLine.statusCode && x.poDetailOrderLine.orderStatus && x.poDetailOrderLine.odOsfx) {

                                            x.orderNumber = x.poDetailOrderLine.odOrd;
                                            x.orderPrefix = x.poDetailOrderLine.odOpfx;
                                            x.orderPrice = x.poDetailOrderLine.invoicePrice;
                                            x.orderPriceType = x.poDetailOrderLine.invoicePriceType;
                                            x.orderProductDescription = x.poDetailOrderLine.product.description;
                                            x.orderQty = x.poDetailOrderLine.qtyOrdered;
                                            x.orderShipDate = x.poDetailOrderLine.orderShipDate;
                                            x.orderStatus = x.poDetailOrderLine.orderStatus.statusCode;
                                            x.orderStatusShortName = x.poDetailOrderLine.orderStatus.statusShortName;
                                            x.orderSuffix = x.poDetailOrderLine.odOsfx;
                                        }
                                    });
                                    $scope.aNewPo.details.forEach(function(x){delete x.pc;});
                                    $scope.aNewPo.details.forEach(function(x){delete x.poDetailOrderLine;});
                                    $scope.aNewPo.details.forEach(function(x){delete x.salesOrderLine;});
                                    //aNewPo.poNumber = $scope.data.poNumber;
                                    $scope.aNewPo.poDate = $filter('date')($scope.poDate, "MM/dd/yyyy");
                                    $scope.aNewPo.expectedDeliveryDate = $filter('date')($scope.expectedDeliveryDate, "MM/dd/yyyy");
                                    $scope.aNewPo.dateCreated = $filter('date')(currentDate, "MM/dd/yyyy");
                                    $scope.aNewPo.timeCreated = $filter('date')(currentDate, "hh:mm:ss");
                                    $scope.aNewPo.poNumber = "";
                                    $scope.aNewPo.supplierPickUpNumber = $scope.data.supplierPickUpNumber;
                                    
                                    for (var i = 0; i < $scope.aNewPo.details.length; i++) {
                                    	$scope.aNewPo.details[i].poNumber = "";
                                    	//$scope.aNewPo.details[i].product.company = $scope.aNewPo.company.code;
                                    }

                                    $scope.aNewPo.status = {
                                        "status": "DR",
                                        "statusDesc50": "Draft",
                                        "statusDesc10": "Draft",
                                        "statusDesc05": "Draft",
                                        "dispSeq": 10
                                    };

                                    $scope.aNewPo.statusCode = "DR";
                                    $scope.aNewPo.statusDesc05 = "Draft";
                                    $scope.aNewPo.statusDesc10 = "Draft";
                                    $scope.aNewPo.statusDesc50 = "Draft";

                                    $scope.aNewPo.privateNote = $scope.data.privateNote;
                                    $scope.aNewPo.supplierNote = $scope.data.supplierNote;

                                    var updateParams = { company: $scope.aNewPo.company.code, poNumber: $scope.aNewPo.poNumber, action: "A", format: "PO0120" };
                                    	
                                    //var j = JSON.stringify($scope.aNewPo);
                                    //alert(j);
                                    $http.post(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param(updateParams), $scope.aNewPo, HeaderService.getHeaders())
                                        .success(function (data, status, headers, config) {
                                        	Util.showLoader(false);
                                            $state.go("home.viewPo", {company: data.company.code, id: data.poNumber})
                                        })
                                        .error(function (data, status, headers, config) {
                                            console.log("Render failure", data);
                                            Util.showLoader(false);

                                        });
                                };

                                $scope.$on('ngGridEventEndCellEdit', function(event) {
                                	field = event.targetScope.col.field;
                                	cellData = event.targetScope.row.entity[event.targetScope.col.field];
                                    if (field == "compositeOrderNumber" && cellData.length >= 1 && cellData.length <= 6) {
                                        //$scope.data.details[i].compositeOrderNumber = cellData;
                                        $scope.poWasEdited = true;
                                        $scope.$apply();
                                    }
                                	if (field == "compositeOrderNumber" && cellData.length == 12) {
                                		var year = cellData.substring(0,2);
                                		var orderNum = cellData.substring(2,8);
                                		var line = cellData.substring(8,10);
                                		var seq = cellData.substring(10,12);
                                		row = event.targetScope.row;
  										var i = row.rowIndex;
  										cellData = year + '-' + orderNum + '-' + line + '-' + seq;
  										$scope.addedProducts[i].compositeOrderNumber = year + '-' + orderNum + '-' + line + '-' + seq;
                                		$scope.$apply();
                                	}
                                	if (field == "compositeOrderNumber" && (cellData.length == 15 || (cellData.length >= 1 && cellData.length <= 6))) {
  										Util.showLoader(true);
  										row = event.targetScope.row;
  										var i = row.rowIndex;
	                                	$scope.getSalesOrderParams = { 
	                                		company: $scope.aNewPo.company.code, 
	                                		compositeOrderNumber: cellData,
	                                		subSupplier: $scope.aNewPo.supplier.subSupplier,
	                                		supplierType: $scope.aNewPo.supplier.supplierType,
	                                		supplier: $scope.aNewPo.supplier.supplierCode,
	                                		product: $scope.addedProducts[i].product.code,
	                                	};
  										$http.get(HeaderService.getHeaders().getWebApiEndPoint('order/get_po_detail_order_lines?')
                                        	+ $.param($scope.getSalesOrderParams), HeaderService.getHeaders())
                                        	.then(function (response) {

                                           		$scope.salesOrders[i] = response.data;
                                            	Util.showLoader(false);
                                            	console.log(response);
                                        	}
                                    	);
  									}
  									else {
  										console.log("not compositeOrderNumber");
  									}
								});
                                
                                $scope.changeCompany = function (index) {
                                	Util.showLoader(true);
                                    //sets company object
                                    if ($scope.data.company.code != null) {
                                        for (var i = 0; i < $scope.companies.length; i++) {
                                            if ($scope.companies[i].code == $scope.data.company.code) {
                                                $scope.aNewPo.company = $scope.companies[i];
                                                break;
                                            }
                                        }
                                    }
                                    $scope.getSuppliersParams = { company: $scope.data.company.code, status: "A", supplier_type: "*ALL", format: "SUP0110"};
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('supplier/get_suppliers_list?')
                                        + $.param($scope.getSuppliersParams), HeaderService.getHeaders())
                                        .then(function (response) {
                                            $scope.suppliers = response.data;
                                            $scope.supplierCompCode = "";
                                            var tempCode;
                                            if ($scope.data.supplier != null) {
                                                var oldCode = $scope.data.supplier.supplierType + '-' + $scope.data.supplier.supplierCode + '-' + $scope.data.supplier.subSupplier;
                                                for (var i = 0; i < $scope.suppliers.length; i++) {
                                                    tempCode = $scope.suppliers[i].supplierType + '-' + $scope.suppliers[i].supplierCode + '-' + $scope.suppliers[i].subSupplier;
                                                    if (oldCode === tempCode) {
                                                        $scope.supplierCompCode = oldCode;
                                                    }
                                                }
                                            }
                                            
                                            Util.showLoader(false);
                                        }
                                    );
                                    $scope.getProductsParams = { company: $scope.data.company.code, status: "A"};
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('product/get_products_list?')
                                        + $.param($scope.getProductsParams), HeaderService.getHeaders())
                                        .then(function (response) {
                                            $scope.products = response.data;
                                        }
                                    );
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('whs/get_whs_list?')+ $.param({ company: $scope.data.company.code }), HeaderService.getHeaders())
                                        .then(function(res) {
                                            $scope.whsList = res.data;
                                        });
                                    $scope.setCustomers("A", $scope.data.company.code );
                                	

                                    $scope.selectedCompany = $scope.companies[index];
                                };
                                
                                $scope.setCustomers = function (statusCode, companyCode) {
                                	var customerParam = {
                                			company: companyCode, 
                                			status: statusCode,
                                			app: "PU"
                                	};
                                	
                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('customer/get_customer_list?') + $.param(customerParam), HeaderService.getHeaders())
                                    .then(function (response) {
                                        	$scope.customers = response.data;
                                    	}
                                    );
                                };
                                
                                $scope.changeCustomer = function (index) {
                                	//valid customer is made up of company code/customer code/customer shipto
                                	for (var i = 0; i < $scope.customers.length; i++) {
                                        if (angular.equals($scope.customerIdentifier, ($scope.customers[i].name + "-" + $scope.customers[i].code + "-" + $scope.customers[i].shipTo))) {
                                        	$scope.customer = $scope.customers[i];
                                        	$scope.aNewPo.customer = $scope.customers[i];
                                            break;
                                        }
                                    }
                                	
                                };

                                $scope.changeSupplier = function (index) {
                                    //sets supplier object
                                    for (var i = 0; i < $scope.suppliers.length; i++) {
                                        if (angular.equals($scope.supplierCompCode, ($scope.suppliers[i].supplierType + '-' + $scope.suppliers[i].supplierCode + '-' + $scope.suppliers[i].subSupplier))) {
                                            $scope.aNewPo.supplier = $scope.suppliers[i];
                                            $scope.data.supplier = $scope.suppliers[i];
                                            break;
                                        }
                                    }
                                };

                                $scope.totalForRow = function () {
                                    angular.forEach($scope.data.details, function (row) {
                                        row.getTotal = function () {
                                        	Util.showLoader(false);
                                            if (row.priceType == "U") {
                                                return row.price * row.quantity;
                                            }
                                            else if (row.priceType == "F") {
                                                return row.price;
                                            }
                                            else if (row.priceType == "O") {
                                                return 0;
                                            }

                                        }

                                    });
                                };

                                $scope.purchaseTotal = function () {
                                    sum = 0.0;
                                    angular.forEach($scope.addedProducts, function (detail) {
                                        if (detail.priceType == "U") {
                                            sum = sum + (detail.quantity * detail.price);
                                        }
                                        else if (detail.priceType == "F") {
                                            sum = sum + (detail.price);
                                        }
                                        else if (detail.priceType == "O") {
                                            //sum = sum + 0;
                                        }
                                    });
                                    return sum;
                                };


                                // $scope.gridOptions = {
                                //     data: 'addedProducts',
                                //     enableCellSelection: true,
                                //     enableRowSelection: false,
                                //     enableCellEditOnFocus: true,
                                //     columnDefs: [
                                //         { field: 'pc', displayName: 'Product', cellTemplate: "<div><select class='product-select' ui-select2=\"{ 'dropdownAutoWidth': true }\" ng-model='COL_FIELD' ng-change='productChange(row)' style='width: 100%'><option value='{{ listProduct.code }}' ng-repeat='listProduct in products'>{{ listProduct.code }} - {{ listProduct.description }}</option></select></div>", width: 200 },
                                //         { field: 'overrideDescription', displayName: 'Description', width: 155 },
                                //         { field: 'compositeOrderNumber', displayName: 'Sales Order #', width: 115 },
                                //         { field: 'salesOrderLine', displayName: 'Sales Order Line', cellTemplate: "<div><select class='salesOrder-select' ui-select2=\"{ 'dropdownAutoWidth': true }\" ng-model='COL_FIELD' ng-change='salesOrderChange(row)' style='width: 100%'><option value='{{ salesOrder.orderLine }}-{{ salesOrder.orderLineSequence }}' ng-repeat='salesOrder in salesOrders[row.rowIndex]'>{{ salesOrder.product.description }} - {{ salesOrder.qtyOrdered }} - ${{ salesOrder.invoicePrice | number:2 }}</option></select></div>", width: 180 },
                                //         { field: 'orderStatusShortName', enableCellEdit: false, displayName: 'Order Status' },
                                //         { field: 'orderShipDate', enableCellEdit: false, displayName: 'Order Ship Date' },
                                //         { field: 'quantity', displayName: 'Qty', enableCellEdit: true, width: 40 },
                                //         { field: 'uom.shortName', displayName: 'UoM', enableCellEdit: false },
                                //         { field: 'price', displayName: 'Price', cellTemplate: "<div class='ngCellText'>${{row.getProperty(col.field) | number:4}}</div>", enableCellEdit: true },
                                //         { field: 'priceType', displayName: 'Price Type', cellTemplate: "<div><select ui-select2 ng-model='COL_FIELD' style='width: 100%'><option value='U'>Per Unit</option><option value='F'>Flat Price</option><option value='O'>Open Price</option></select></div>" },
                                //         { field: 'getTotal()', displayName: 'Line Total', cellTemplate: "<div class='ngCellText'>${{row.getProperty(col.field) | number:2}}</div>", enableCellEdit: false},
                                //         { field: '', displayName: '', cellTemplate: "<div><div type='button' class='btn btn-delete' ng-click='removeProduct()' ><i class='glyphicon glyphicon-remove' style='color:red;'></i></div></div>", enableCellEdit: false, width:37}
                                //     ]
                                // };

                                $scope.gridOptions = {
                                    data: 'addedProducts',
                                    enableCellSelection: true,
                                    enableRowSelection: false,
                                    enableCellEditOnFocus: true,
                                    //enablePinning: true,
                                    //enableColumnResize: true,
                                    columnDefs: [
                                        { field: 'orderLine', displayName: 'line', width: 50},
                                        { field: 'orderLineSeq', displayName: 'line seq', width: 70},
                                        { field: 'pc', displayName: 'Product', cellTemplate: "<div><select class='product-select wrapword' ui-select2=\"{ 'dropdownAutoWidth': true }\" ng-model='COL_FIELD' ng-change='productChange(row)' style='width: 100%' product-select-open product-row-index='{{row.rowIndex}}'><option value='{{ listProduct.code }}' ng-repeat='listProduct in products'>{{ listProduct.code }} - {{ listProduct.description }}</option></select></div>", width: 175, },
                                        { field: 'overrideDescription', displayName: 'Description', width: 160 },
                                        { field: 'compositeOrderNumber', displayName: 'Sales Order #', width: 115 },
                                        { field: 'salesOrderLine', displayName: 'Sales Order Line', cellTemplate: "<div><select sales-order-select-open product-row-index='{{row.rowIndex}}' class='salesOrder-select' ui-select2=\"{ 'dropdownAutoWidth': true }\" ng-model='COL_FIELD' ng-change='salesOrderChange(row)' style='width: 100%'><option value='{{ salesOrder.orderLine }}-{{ salesOrder.orderLineSequence }}' ng-repeat='salesOrder in salesOrders[row.rowIndex]'>{{ salesOrder.product.description }} - {{ salesOrder.qtyOrdered }} - ${{ salesOrder.invoicePrice | number:4 }}</option></select></div>", width: 180 },
                                        { field: 'poDetailOrderLine.orderStatus.statusShortName', enableCellEdit: false, displayName: 'Status', width: 83 },
                                        { field: 'poDetailOrderLine.orderShipDate', enableCellEdit: false, cellTemplate: "<div class='ngCellText'>{{toDesiredDateFormat(row.getProperty(col.field))}}</div>",displayName: 'Ship Date', width: 83 },
                                        { field: 'quantity', displayName: 'Qty', cellTemplate: "<div class='ngCellText' style='text-align:right;'>{{row.getProperty(col.field)}}</div>", enableCellEdit: true, width: 40 },
                                        { field: 'uom.shortName', displayName: 'UoM', enableCellEdit: false, width: 68 },
                                        { field: 'price', displayName: 'Price', cellTemplate: "<div class='ngCellText' style='text-align:right;'>${{row.getProperty(col.field) | number:2}}</div>", enableCellEdit: true, width: 65 },
                                        { field: 'priceType', displayName: 'Price Type', cellTemplate: "<div><select ui-select2 ng-model='COL_FIELD' style='width: 100%'><option value='U'>Per Unit</option><option value='F'>Flat Price</option><option value='O'>Open Price</option></select></div>", width: 83 },
                                        { field: 'getTotal()', displayName: 'Line Total', cellTemplate: "<div class='ngCellText' style='text-align:right;'>${{row.getProperty(col.field) | number:2}}</div>", enableCellEdit: false, width: 80 },
                                        { field: '', displayName: '', cellTemplate: "<div><div type='button' class='btn btn-3delete' ng-click='removeProduct()' ><i class='glyphicon glyphicon-remove' style='color:red;'></i></div></div>", enableCellEdit: false, width:37}
                                    ]
                                };
                                $scope.toDesiredDateFormat = function(date) {
                                if (date != "" && date != null) {
                                    var splitString = date.split("-");
                                    return splitString[1] + "-" + splitString[2] + "-" + splitString[0];
                                }
                                }
                                $scope.gridOptions.columnDefs[0].visible = false;
                                $scope.gridOptions.columnDefs[1].visible = false;
                                
                                $scope.removeProduct = function () {
                                	$scope.addedProducts.splice(this.row.rowIndex, 1);
                                };

                                $scope.removeLineItem = function (index) {
                                    $scope.addedProducts.splice(index, 1);
                                };

                                $scope.addProduct = function () {
                                	$scope.addedProducts.push({
                                            orderLine: 0,
                                            orderLineSeq: 0,
                                            orderNumber: "",
                                            orderPrefix: "",
                                            orderPrice: 0,
                                            orderPriceType: "",
                                            orderProductDescription: "",
                                            orderQty: 0,
                                            orderShipDate: "",
                                            orderStatus: "",
                                            orderStatusShortName: "",
                                            orderSuffix: "",

                                            price: 0,
                                            priceType: "U",
                                            quantity: 0,
                                            line: 0,
                                            compositeOrderNumber: "",
                                            company: $scope.data.company,
                                            poNumber: $scope.data.poNumber,
                                            poDetailOrderLine: {},
                                            uom: {},
                                            lot: {},
                                            overrideDescription: "",
                                            pc:"",
                                            product: {}
                                            //dispSeq: 0,  //What is this? It was in the sample object
                                    });
                                	
                                    $scope.totalForRow();
                                };
                                
                                
                                $scope.totalForRow = function () {
                                	angular.forEach($scope.addedProducts, function (row) {
                                        row.getTotal = function () {
                                            if (row.priceType == "U") {
                                                return row.price * row.quantity;
                                            }
                                            else if (row.priceType == "F") {
                                                return row.price;
                                            }
                                            else if (row.priceType == "O") {
                                                return 0;
                                            }
                                        }
                                    });                                	
                                };

                                $scope.productChange = function (row) {
                                    var tempDetail;
                                    var i = row.rowIndex;
                                    
                                    for (var j = 0; j < $scope.products.length; j++) {
                                        if ($scope.addedProducts[i].pc === $scope.products[j].code) {
                                            $scope.addedProducts[i].product = $scope.products[j];
                                            $scope.addedProducts[i].uom = $scope.products[j].uomP;
                                            $scope.addedProducts[i].price = $scope.products[j].price1;
                                            $scope.addedProducts[i].overrideDescription = $scope.products[j].description;
                                            $scope.addedProducts[i].compositeOrderNumber = $scope.products[j].compositeOrderNumber;
                                            break;
                                        }
                                    }                                                                       
                                };

                                $scope.salesOrderChange = function (row) {
                                	Util.showLoader(true);
                                	var i = row.rowIndex;
                                	if ($scope.addedProducts[i].salesOrderLine != null) {
	                                	var resultSalesOrder = $scope.addedProducts[i].salesOrderLine.split("-");
	                                	if (resultSalesOrder.length == 2) {
		                                	// $scope.addedProducts[i].orderLine = parseInt(resultSalesOrder[0]);
		                                	// $scope.addedProducts[i].orderLineSeq = parseInt(resultSalesOrder[1]);
                                            $scope.addedProducts[i].poDetailOrderLine = $scope.salesOrders[i][parseInt(resultSalesOrder[1])-1];
	                            		}
	                            		
                            		}
                            		Util.showLoader(false);
                                };

                                $scope.open = function ($event) {
                                    $event.preventDefault();
                                    $event.stopPropagation();
                                };
                                
                                HeaderService.getHeaders(function (config) {
                                	$scope.init(config);
                                },
                                function () {
                                	alert('Unable to authenticate request.');
                                })
                                return $scope.data = {};
                            }
                        ]
                    }
                }
            });
            $stateProvider.state("home.viewPo", {
                url: "/viewPo/:company/:id",
                views: {
                    "upper": {
                        'controller': 'HeaderCtl',
                        'templateUrl': 'partials/header.html?v=1'
                    },
                    "middle": {
                        'templateUrl': "partials/po_detail.html?v=1",
                        'controller': [
                            "$http", "$scope", "$rootScope", "PoService", "$stateParams", "$state", "$modal","HeaderService", "$filter", function ($http, $scope, $rootScope, PoService, $stateParams, $state, $modal, HeaderService, $filter) {
                                var error_handler, success_handler;
                                /*if ($stateParams.id === "") {
                                 $state.go("home.listAllPo");
                                 }*/
                                $scope.editPoNum = false;
                                //var config = HeaderService.getHeaders()
                                //console.log($rootScope.flaggedPo);
                                if($rootScope.flaggedPo) {
                                	var flagParam = {
                                			company: $rootScope.flaggedPo.companyCode, 
                                			poNumber: $rootScope.flaggedPo.poNumber,
                                			clearInUse: 'Y',
                                	};
                                	$http.post(HeaderService.getHeaders().getWebApiEndPoint('po/update_po_in_use?') 
                                			+ $.param(flagParam), flagParam, HeaderService.getHeaders())
                                			.then(function(res) {
                                				$rootScope.flaggedPo = {};
                                	});
                                	
                                }
                                $scope.data = {};
                                $scope.aPo = {};
                                $scope.companies = {};
                                $scope.poCompany = {};
                                $scope.suppliers = {};
                                $scope.poSupplier = {};
                                $scope.getInfo = { company: "", poNumber: "", action: "V", format: "PO0120" };
                                $scope.getInfo.poNumber = $stateParams.id;
                                $scope.getInfo.company = $stateParams.company;

                                $scope.toDesiredDateFormat = function(date) {
                                if (date != "" && date != null) {
                                    var splitString = date.split("-");
                                    return splitString[1] + "-" + splitString[2] + "-" + splitString[0];
                                }
                            	}
                                $scope.init = function (config) {
                                	Util.showLoader(true);
                                	PoService.obtain_data(HeaderService.getHeaders(), 'po', false, $scope.getInfo)
                                		.then(obtain_po_success_handler($scope), obtain_data_error_handler($scope));
                                	
                                	PoService.obtain_data(HeaderService.getHeaders(), 'company/get_authorized_companies?' + $.param({ app: "PU" }), false)
                            			.then(obtain_companies_success_handler($scope), obtain_data_error_handler($scope));
                                };


                                $scope.statusImageUrl = function(){
                                    if($scope.aPo===undefined || $scope.aPo.statusCode === undefined){
                                        return '';
                                    }
                                    switch($scope.aPo.statusCode){
                                        case 'CL':
                                            return 'img/closed.png';
                                        case 'IS':
                                            return 'img/issued.png';
                                        case 'DR':
                                            return 'img/draft.png';
                                        default:
                                            $scope.statusImage = '';
                                    }

                                };

                                obtain_po_success_handler = function ($scope) {
                                	return function (resp) {
                                        if (resp.status === 200) {
                                        	$scope.aPo = resp.data;
                                        	$scope.whsDesc = "";
                                        	$http.get(HeaderService.getHeaders().getWebApiEndPoint('whs/get_whs_list?')+ $.param({ company: $scope.aPo.company.code }), HeaderService.getHeaders())
	                                    	.then(function(res) {
	                                    		for(var i = 0; i < res.data.length; i++) {
	                                    			//console.log(res.data[i]);
	                                    			if($scope.aPo.deliverToWhs == res.data[i].code) {
	                                    				$scope.whsDesc = res.data[i].description;
	                                    				break;
	                                    			}
	                                    		}
	                                    	});
                                            //calculates order total
                                            $scope.aPo["poTotal"] = 0;
                                            for (var i = 0; i < $scope.aPo.details.length; i++) {
                                                if ($scope.aPo.details[i].priceType == "U") {
                                                    $scope.aPo.details[i].lineTotal = ($scope.aPo.details[i].price * $scope.aPo.details[i].quantity);
                                                }
                                                else if ($scope.aPo.details[i].priceType == "F") {
                                                    $scope.aPo.details[i].lineTotal = $scope.aPo.details[i].price;
                                                }
                                                else if ($scope.aPo.details[i].priceType == "O") {
                                                    $scope.aPo.details[i].lineTotal = 0;
                                                }
                                                //$scope.aPo.details[i].salesOrderLine = "Order Line: " + $scope.aPo.details[i].orderLine + " Order Line Seq: " + $scope.aPo.details[i].orderLineSeq;
                                                $scope.aPo.poTotal += $scope.aPo.details[i].lineTotal;
                                                //$scope.aPo["poTotal"] += $scope.aPo.details[i].price * $scope.aPo.details[i].quantity;
                                                
                                                //dependent on a po
                                                PoService.obtain_data(HeaderService.getHeaders(), 'supplier/get_suppliers_list', false, {company: $scope.getInfo.company, status: "A", supplier_type: "*ALL"})
                                    				.then(obtain_suppliers_success_handler($scope), obtain_data_error_handler($scope));
                                            }
                                            
                                            $http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_logs?')+ $.param({ company: $scope.aPo.company.code, poNumber: $scope.aPo.poNumber, displayOption: "S" }), HeaderService.getHeaders())
                                            .then(function(res) {
                                            	$scope.poLogs = res.data;
                                            	for(var i = 0; i < $scope.poLogs.length; i++ ) {
                                            		$scope.poLogs[i].easyTime = $scope.poLogs[i].dateCreated + "T" + $scope.poLogs[i].timeCreated;
                                            	}
                                            	
                                            });
                                        }
                                    }
                                };
                                
                                obtain_suppliers_success_handler = function ($scope) {
                                	return function (resp) {
                                		if (resp.status === 200) {
                                			$scope.suppliers = resp.data;
                                            //find supplier related to po by supplier code
                                            for (var i = 0; i < $scope.suppliers.length; i++) {
                                                if ($scope.suppliers[i].supplierCode == $scope.aPo.supplier.supplierCode) {
                                                    $scope.poSupplier = $scope.suppliers[i];
                                                    break;
                                                }
                                            }
                                            Util.showLoader(false);
                                		}
                                	}
                                };
                                
                                obtain_companies_success_handler = function ($scope) {
                                	return function (resp) {
                                		if (resp.status === 200) {
                                			$scope.companies = resp.data;

                                            //finds company related to po by company name
                                            for (var i = 0; i < $scope.companies.length; i++) {
                                                if ($scope.companies[i].code == $scope.getInfo.company) {
                                                    $scope.poCompany = $scope.companies[i];
                                                    break;
                                                }
                                            }
                                		}
                                	}
                                };
                                
                                obtain_data_error_handler = function ($scope) {
                                	return function (resp) {
                                        alert(resp.statusText);
                                    }
                                };
                                
                                $scope.errorModal = function (errorList, size) {
                                	$scope.errorList = errorList;
                                    var modalInstance = $modal.open({
                                        templateUrl: 'errorModalContent.html',
                                        controller: ErrorModalCtl,
                                        size: size,
                                        resolve: {
                                            errorList: function () {
                                                return $scope.errorList;
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                    	
                                    }, function () {
                                        //$log.info('Modal dismissed at: ' + new Date());
                                    });

                                };
                                
                                var ErrorModalCtl = function ($scope, $modalInstance, errorList) {
                                	$scope.errors = errorList;
                                    $scope.ok = function () {
                                        $modalInstance.close();
                                    };
                                    /*
                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                    */
                                };
                                
                                $scope.deletePoModal = function (size) {

                                    var modalInstance = $modal.open({
                                        templateUrl: 'deleteModalContent.html',
                                        controller: DeleteSinglePoModalCtl,
                                        size: size,
                                        resolve: {
                                            po: function () {
                                                return $scope.aPo;
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                    	$scope.deletePo();
                                    	$state.go("home.listAllPo");
                                    	
                                    }, function () {
                                        //$log.info('Modal dismissed at: ' + new Date());
                                    });

                                };

                                var DeleteSinglePoModalCtl = function ($scope, $modalInstance, po) {
                                    $scope.ok = function () {
                                        $modalInstance.close();
                                    };

                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                };

                                $scope.poSend = function () {

                                    var modalInstance = $modal.open({
                                        templateUrl: 'sendModalContent.html',
                                        controller: SendModalCtl,
                                        resolve: {
                                            poSelected: function () {
                                                return $scope.aPo;
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function (poSend) {
                                    	
                                    	var config = {
                                                headers: Util.getHeaders()
                                        };
                                        Util.showLoader(true);
                                        $http.post(HeaderService.getHeaders().getWebApiEndPoint('po/send_po'), poSend, HeaderService.getHeaders())
                                    	.then(function(res) {
                                    		if(res.data.FILENAME != "") {
                                    			$scope.getPdf(res.data.FILENAME);
                                    		}
                                    		var errorList = [];
                                    		if(res.data.errorSendPO != "") {
                                    			errorList.push("Send error: " + res.errorSendPO);
                                    		}
                                    		if(res.data.errorIssuedPO != "") {
                                    			errorList.push("Issued error: " + res.data.errorIssuedPO);
                                    		}
                                    		if(res.data.errorPrintPO != "") {
                                    			errorList.push("Print error: " + res.data.errorPrintPO);
                                    		}
                                    		if (errorList.length > 0) {
                                    			$scope.errorModal(errorList);
                                    		}
                                            Util.showLoader(true);
                                            PoService.obtain_data(HeaderService.getHeaders(), 'po', false, $scope.getInfo)
                                                .then(obtain_po_success_handler($scope), obtain_data_error_handler($scope));
                                    	});
                                    }, function () {
                                        //$log.info('Modal dismissed at: ' + new Date());
                                        Util.showLoader(false);

                                    });
                                };

                                var SendModalCtl = function ($scope, $modalInstance, poSelected) {
                                	Util.showModalLoader(true);
                                    var po = poSelected;
                                    /*var config = {
                                            headers: Util.getHeaders()
                                    };*/
                                    
                                    var poSendGetParams = {
                                        company: po.company.code,
                                        poNumber: po.poNumber,
                                        supplier_type: po.supplier.supplierType,
                                        supplier: po.supplier.supplierCode,
                                        sub_supplier: po.supplier.subSupplier
                                    };
                                    
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_send?') + $.param(poSendGetParams), HeaderService.getHeaders())
                                        .then(function (res) {
                                            $scope.poSend = res.data;
                                            Util.showModalLoader(false);
                                        });

                                    $scope.ok = function () {
                                    	if ($scope.poSend.sendEmail == true && $scope.poSend.emailAddress.length == 0) {
                                    		alert("Email Address input required.");
                                    	}
                                    	else if ($scope.poSend.sendFax == true && $scope.poSend.faxNumber.length == 0) {
                                    		alert("Fax Number input required.");
                                    	}
                                    	else {
                                        	$modalInstance.close($scope.poSend);
                                    	}
                                    };

                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                };
                                
                                $scope.getPdf = function(pdfFilename) {
                                	var tempConfig = {
                                			responseType: 'arraybuffer',
                                			headers: {
                                				'sessionKey': HeaderService.getHeaders().headers.sessionKey,
                                				'clientID': HeaderService.getHeaders().headers.clientID,
                                			}
                                	}
                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_pdf?filename=' + pdfFilename), tempConfig)
                                	.success(function (response) {
                                		 var file = new Blob([response], {type: 'application/pdf'});
                                		 var fileURL = URL.createObjectURL(file);
                                		 window.open(fileURL);
                                	});
                                };

                                $scope.deletePo = function () {
                                	Util.showLoader(true);
                                    var headers = {};
                                    angular.copy(HeaderService.getHeaders(), headers);
                                	headers.headers["Content-Type"] = "application/x-www-form-urlencoded"; 
                                    var deleteConfig = {
                                        method: "DELETE",
                                        url: HeaderService.getHeaders().getWebApiEndPoint('po?')
                                            + $.param({company: $scope.aPo.company.code, poNumber: $scope.aPo.poNumber}),
                                        data: "companyCode=" + $scope.aPo.company.code + "&poNumber=" + $scope.aPo.poNumber,
                                        headers: headers.headers
                                        /*headers: {"Content-Type": "application/x-www-form-urlencoded",
                                            'sessionKey': '0AobLX4SUTW5yxipcEf3AGf40',
                                            'clientID': 'AGK'}*/
                                    };

                                    $http(deleteConfig)
                                        .success(function (data, status, headers, config) {
                                        	Util.showLoader(false);
                                            $state.go("home.listAllPo");
                                        })
                                        .error(function (data, status, headers, config) {
                                        	Util.showLoader(false);
                                            $scope.errorModal([data.errMsg]);
                                            // alert('Delete failed: ' + data.errMsg);
                                        });
                                };

                                /* $scope.printPo = function (aPo, poCompany){
                                 $state.go("home.printPo", {company: poCompany.company, id: aPo.poNumber}); // may need to be poCompany.code instead.
                                 }*/
								 
								 //--------------------------------------------------
								 
                                $scope.approvePo = function (aPo) {
                                	Util.showLoader(true);
                                    aPo.status.status = "A";
                                    var poString = JSON.stringify(aPo);

                                    $http.post(HeaderService.getHeaders().getWebApiEndPoint('po?')
                                            + $.param({company: aPo.company.code, poNumber: aPo.poNumber, action: "C", format: "PO0120 "}),
                                        poString, { headers: HeaderService.getHeaders() })
                                        .success(function (data, status, headers, config) {
                                        	Util.showLoader(false);
                                        })
                                        .error(function (data, status, headers, config) {
                                            console.log("Render failure", data);
                                        });
                                }
                                
								-------------------------------------------------------
								
                                $scope.copyPo = function () {  // Copied POs do not load back completely.
                                	$state.go("home.newPo", $stateParams);
                                };

                                $scope.init();
                            }
                        ]
                    }
                }
            });
			
			//-------------------------------------------------------------------
			
            $stateProvider.state("home.printPo", {
                url: "/printPo/:company/:id",
                views: {
                    "upper": {
                        'controller': 'HeaderCtl',
                        'templateUrl': 'partials/header.html?v=1'
                    },
                    "middle": {
                        'templateUrl': "partials/print_po_detail.html?v=1",
                        'controller': [
                            "$http", "$scope", "$rootScope", "PoService", "$stateParams", "$state", function ($http, $scope, $rootScope, PoService, $stateParams, $state) {
                                var error_handler, success_handler;
                                /*if ($stateParams.id === "") {
                                 $state.go("home.listAllPo");
                                 }*/

                                var config = {
                                    headers: Util.getHeaders()
                                };

                                $scope.data = {};
                                $scope.aPo = {};
                                $scope.companies = {};
                                $scope.poCompany = {};
                                $scope.suppliers = {};
                                $scope.poSupplier = {};
                                $scope.getInfo = { company: "", poNumber: "", action: "V", format: "PO0120" };
                                $scope.getInfo.poNumber = $stateParams.id;
                                $scope.getInfo.company = $stateParams.company;

                                $scope.statusImage = function(){
                                    switch($scope.aPo){
                                        case 'CL':
                                            return 'img/closed.png';
                                        case 'IS':
                                            return 'img/issued.png';
                                        default:
                                            return 'img/draft.png';
                                    }
                                };
                                
                                Util.showLoader(true);
                                $http.get(HeaderService.getHeaders().getWebApiEndPoint('po?') + $.param($scope.getInfo), HeaderService.getHeaders())
                                    .then(function (res) {
                                        $scope.aPo = res.data;
                                        //calculates order total
                                        $scope.aPo["poTotal"] = 0;
                                        for (var i = 0; i < $scope.aPo.details.length; i++) { // Not used, because we stopped using client side print po
                                            if ($scope.aPo.details[i].priceType == "U") {
                                                $scope.aPo.details[i].lineTotal = ($scope.aPo.details[i].price * $scope.aPo.details[i].quantity);
                                            }
                                            else if ($scope.aPo.details[i].priceType == "F") {
                                                $scope.aPo.details[i].lineTotal = $scope.aPo.details[i].price;
                                            }
                                            else if ($scope.aPo.details[i].priceType == "O") {
                                                $scope.aPo.details[i].lineTotal = 0;
                                            }

                                            $scope.aPo.poTotal += $scope.aPo.details[i].lineTotal;
                                        }

                                        //dependent on aPo
                                        $http.get(HeaderService.getHeaders().getWebApiEndPoint('supplier/get_suppliers_list?')
                                            + $.param({company: $scope.getInfo.company, status: "A", supplier_type: "*ALL"}), HeaderService.getHeaders())
                                            .then(function (res) {
                                                $scope.suppliers = res.data;
                                                //find supplier related to po by supplier code
                                                for (var i = 0; i < $scope.suppliers.length; i++) {
                                                    if ($scope.suppliers[i].supplierCode == $scope.aPo.supplier.supplierCode) {
                                                        $scope.poSupplier = $scope.suppliers[i];
                                                        break;
                                                    }
                                                }
                                                
                                                Util.showLoader(false);
                                            });
                                    });

                                $http.get(HeaderService.getHeaders().getWebApiEndPoint('company/get_authorized_companies?') + $.param({ app: "PU" }), HeaderService.getHeaders())
                                    .then(function (res) {
                                        $scope.companies = res.data;
                                        //finds company related to po by company name
                                        for (var i = 0; i < $scope.companies.length; i++) {
                                            if ($scope.companies[i].company == $scope.getInfo.company) {
                                                $scope.poCompany = $scope.companies[i];
                                                break;
                                            }
                                        }
                                    });
                            }
                        ]
                    }
                }
            });
			
			//------------------------------------------------------------------------------------------------
			
            return $stateProvider.state("home.listAllPo", {
                url: "/listAllPo",
                onExit: function () {
                	Util.putFilterInPlace(false);
                },
                views: {
                    "upper": {
                        'controller': 'HeaderCtl',
                        'templateUrl': 'partials/header.html?v=1'
                    },
                    "middle": {
                        'templateUrl': 'partials/list_all_po.html?v=1',
                        'controller': [
                            "$http", "$scope", "$rootScope", "PoService", "$state", "$filter", "$modal", "HeaderService", function ($http, $scope, $rootScope, PoService, $state, $filter, $modal, HeaderService) {



                                var error_handler, success_handler;
                                $scope.showFilter = false;
                                $scope.allSelected = false;
                                if($rootScope.pageSize) {
                                	$scope.pageSize = $rootScope.pageSize;
                                }
                                else {
                                	$scope.pageSize = 10;  // number of items on the page
                                }
                                $scope.sortDetails = 
                                	[
                                	 	{ "col": "PO_NUMBER", "dir": "DESC", "style": "glyphicon glyphicon-chevron-down" },
                                	 	{ "col": "supplierName", "dir": "", "style": "" },
                                	 	{ "col": "COSNAM", "dir": "", "style": "" },
                                	 	{ "col": "USER_CREATED", "dir": "", "style": "" },
                                	 	{ "col": "PO_DATE", "dir": "", "style": "" },
                                	 	{ "col": "TOTAL_PRICE", "dir": "", "style": "" },
                                	 	{ "col": "STATUS_DESC50", "dir": "", "style": "" }
                                    ];
                                var getSuppliersParam = { company: "**", status: "A", supplier_type: "*ALL", format: "SUP0110"};
                                if($rootScope.flaggedPo) {
                                	var flagParam = {
                                			company: $rootScope.flaggedPo.companyCode, 
                                			poNumber: $rootScope.flaggedPo.poNumber,
                                			clearInUse: 'Y',
                                	}
                                	$http.post(HeaderService.getHeaders().getWebApiEndPoint('po/update_po_in_use?') 
                                			+ $.param(flagParam), flagParam, HeaderService.getHeaders())
                                			.then(function(res) {
                                				$rootScope.flaggedPo = {};
                                	});
                                	
                                }
                                
                                $scope.maxSize = 5;
                                
                                clearSort = function () {
                                	for (var i = 0; i < $scope.sortDetails.length; i++) {
                                		$scope.sortDetails[i].dir = "";
                                		$scope.sortDetails[i].style = "";
                                	}
                                }
                                
                                getSortColIndex = function (col) {
                                	for (var i = 0; i < $scope.sortDetails.length; i++) {
                                		if ($scope.sortDetails[i].col == col) {
                                			return i;
                                		}
                                	}
                                	
                                	return -1;
                                }
                                
                                $scope.sort = function (col) {
                                	index = getSortColIndex(col);
                                	if (index != -1) {
                                		if ($scope.sortDetails[index].dir.length > 0) {
                                			if ($scope.sortDetails[index].dir == "DESC") {
                                				$scope.sortDetails[index].dir = "ASC";
                                				$scope.sortDetails[index].style = "glyphicon glyphicon-chevron-up"
                                			}
                                			else {
                                				$scope.sortDetails[index].dir = "DESC";
                                				$scope.sortDetails[index].style = "glyphicon glyphicon-chevron-down"
                                			}
                                		}
                                		else {
                                			clearSort();
                                			$scope.sortDetails[index].dir = "ASC";
                                			$scope.sortDetails[index].style = "glyphicon glyphicon-chevron-up"
                                		}
                                		
                                		$scope.filterParams.orderBy = col;
                                		$scope.filterParams.orderDir = $scope.sortDetails[index].dir;
                                		$rootScope.orderBy = $scope.filterParams.orderBy;
                                		$rootScope.orderDir = $scope.filterParams.orderDir;
                                		$scope.filterPo();
                                	}
                                };
                                
                                $scope.updateSuppliers = function(onDone) {
                                	Util.showLoader(true);
                                	if($scope.selectedCompanies.length == 0) {
                                		$scope.selectedSuppliers = {};
                                		getSuppliersParam = { company: "**", status: "A", supplier_type: "*ALL", format: "SUP0110"};
                                    	PoService.obtain_data(HeaderService.getHeaders(), 'supplier/get_suppliers_list', false, getSuppliersParam)
                                    	.then(function (response) {
                                    		$scope.suppliers = response.data;
                                    		if (typeof onDone == 'function') {
                                    			onDone();
                                    		}
                                    		Util.showLoader(false);
                                        });
                                	}
                                	else {
                                		$scope.suppliers = [];
                                		for(var i = 0; i < $scope.selectedCompanies.length; i++) {
                                			getSuppliersParam = { company: $scope.selectedCompanies[i], status: "A", supplier_type: "*ALL", format: "SUP0110"};
                                        	PoService.obtain_data(HeaderService.getHeaders(), 'supplier/get_suppliers_list', false, getSuppliersParam)
                                        	.then(function (response) {
                                        		for(var j = 0; j < response.data.length; j++) {
                                        			$scope.suppliers.push(response.data[j]);
                                        		}
                                        		if (typeof onDone == 'function') {
                                        			onDone();
                                        		}
                                        		Util.showLoader(false);
                                            });
                                		}
                                	}
                                };

                                $scope.detailsIfMobile = function(po){
                                    if($scope.displayMode==='xs'){
                                        $scope.viewPo(po);
                                    }
                                };
								
								//----------------------------------------------------------------------------
                                
                                if ($rootScope.filterParams){
                                    $scope.filterParams.poDateFrom = $rootScope.filterParams.poDateFrom;
                                    $scope.filterParams.poDateTo = $rootScope.filterParams.poDateTo;
                                    $scope.filterParams.expDelivDateFrom = $rootScope.filterParams.expDelivDateFrom;
                                    $scope.filterParams.expDelivDateTo = $rootScope.filterParams.expDelivDateTo;
                                    $scope.filterParams.companies = $rootScope.filterParams.companies;
                                    $scope.filterParams.suppliers = $rootScope.filterParams.suppliers;
                                    $scope.filterParams.recStart = $rootScope.filterParams.recStart;
                                    $scope.filterParams.recEnd = $rootScope.filterParams.recEnd;
                                    $scope.poDateFrom = $rootScope.filterParams.poDateFrom;
                                    $scope.poDateTo = $rootScope.filterParams.poDateTo;
                                    $scope.expDelivDateFrom = $rootScope.filterParams.expDelivDateFrom;
                                    $scope.expDelivDateTo = $rootScope.filterParams.expDelivDateTo;
                                    $scope.selectedStatuses = $rootScope.selectedStatuses;
                                    $scope.selectedCompanies = $rootScope.selectedCompanies;
                                    $scope.selectedSuppliers = $rootScope.selectedSuppliers;
                                    /*if ($scope.selectedCompanies) {
                                    	$scope.updateSuppliers(function ()
                            			{
                            				$scope.selectedSuppliers = $rootScope.selectedSuppliers;
                            			});                                    	
                                    }*/
                                }
                                else{
                                    $scope.filterParams = {
                                            status: "",
                                            companies: "",
                                            suppliers: "",
                                            format: "PO0110",
                                            poDateFrom: "",
                                            poDateTo: "",
                                            expDelivDateFrom: "",
                                            expDelivDateTo: "",
                                            recStart: 0,
                                            recEnd: $scope.pageSize - 1,
                                            orderBy: "PO_NUMBER",
                                            orderDir: "DESC"
                                        };
                                    
                                    //$scope.poDateFrom = {};
                                    //$scope.poDateTo = {};
                                    //$scope.expDelivDateFrom = {};
                                    //$scope.expDelivDateTo = {};
                                    $scope.selectedCompanies = {};
                                    $scope.selectedSuppliers = {};
                                    $scope.selectedStatuses = {};

                                    $scope.page = {};
                                    //$scope.data = {};
                                    $scope.poData = {};
                                    $scope.companies = {};
                                    $scope.pos = {};
                                    //$scope.bigCurrentPage = 1;
                                }
								
								//------------------------------------------------------------------------------------------
								
                                if($rootScope.bigCurrentPage) {
                                	$scope.bigCurrentPage =  $rootScope.bigCurrentPage;
                                }
                                else {
                                	 $scope.bigCurrentPage = 1;
                                }
                                
                                transferSortInfoToFilter = function () {
                                	if ((typeof $rootScope.orderBy != 'undefined' && $rootScope.orderBy.length > 0) && 
                                		(typeof $rootScope.orderDir != 'undefined' && $rootScope.orderDir.length > 0)) {
                                		clearSort();
                                		var index = getSortColIndex($scope.filterParams.orderBy);
                                		$scope.sortDetails[index].dir = $rootScope.orderDir;
                                		$scope.sortDetails[index].style = 
                                			($rootScope.orderDir == "DESC" ? "glyphicon glyphicon-chevron-down" : "glyphicon glyphicon-chevron-up")
                                		$scope.filterParams.orderBy = $rootScope.orderBy;
                                		$scope.filterParams.orderDir = $rootScope.orderDir;
                                	}
                                }      
                                // $scope.$watch('selectedStatuses', function(newValue, oldValue) {
                                // 	console.log("old selected statuses: " + oldValue);
                                // 	console.log("new selected statuses: " + newValue);
                                // });
                                $scope.getLastFilteredParams = function() {
                                    Util.showLoader(true);

                                    var poGetLastFilteredParams = {
                                        company: "**",
                                        lastRequestId: "PO_LIST",
                                        format: "LRQ0100",
                                    };
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('last_request/get_last_requests?') + $.param(poGetLastFilteredParams), HeaderService.getHeaders())
                                        .then(function (res) {
                                            var lastFilteredList = res.data;
                                            var filterObject = {
                                                companyList: [],
                                                supplierList: [],
                                                statusList: [],
                                                dateFrom: "",
                                                dateTo: "",
                                                expectFrom: "",
                                                expectTo: "",
                                                sortBy: "",
                                                sortVal: ""
                                            };
                                            console.log(lastFilteredList);
                                            lastFilteredList.forEach(function(filter) {
                                                if (filter.keyword02 == "COMPANY") {
                                                    filterObject.companyList.push(filter.value01);
                                                }
                                                else if (filter.keyword02 == "SUPPLIER") {
                                                    filterObject.supplierList.push(filter.value01);
                                                }
                                                else if (filter.keyword02 == "STATUS") {
                                                    filterObject.statusList.push(filter.value01);
                                                }
                                                else if (filter.keyword02 == "PO_DATE") {
                                                    filterObject.dateFrom = filter.value01;
                                                    filterObject.dateTo = filter.value02;
                                                }
                                                else if (filter.keyword02 == "EXPECT_DELV") {
                                                    filterObject.expectFrom = filter.value01;
                                                    filterObject.expectTo = filter.value02;
                                                }
                                                else if (filter.keyword02 == "SORT") {
                                                    filterObject.sortBy = filter.value01;
                                                    filterObject.sortVal = filter.value02;
                                                }
                                            });
                                            
                                            $scope.filterPoForLast(filterObject);
                                            
                                            Util.showLoader(false);
                                        });
                                };

                                $scope.init = function (config) { // can remove config param
                                	Util.showLoader(true);
                                	transferSortInfoToFilter();
                                    PoService.obtain_data(HeaderService.getHeaders(), 'po/get_po_list', false, $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                    
                                	PoService.obtain_data(HeaderService.getHeaders(), 'company/get_authorized_companies?' + $.param({ app: "PU" }), false).then(function (response) {
                                        $scope.companies = response.data;
                                        if($rootScope.selectedSuppliers) {
                                			$scope.selectedCompanies = $rootScope.selectedCompanies;
                                		}
                                    });
                                	
                                	PoService.obtain_data(HeaderService.getHeaders(), 'supplier/get_suppliers_list', false, getSuppliersParam).then(function (response) {
                                		$scope.suppliers = response.data;
                                		if($rootScope.selectedSuppliers) {
                                			$scope.selectedSuppliers = $rootScope.selectedSuppliers;
                                		}
                                    });

                                    // console.log($scope.filterParams);
                                    $scope.getLastFilteredParams();
                                }

                                $scope.filterPoForLast = function (filterObject) {
                                    Util.showLoader(true);
                                    var dateSplitter = [];

                                    dateSplitter = filterObject.dateFrom.split("-");
                                    if (dateSplitter.length > 1) {
                                        $scope.poDateFrom = dateSplitter[1] + "/" + dateSplitter[2] + "/" + dateSplitter[0];
                                        $scope.filterParams.poDateFrom = $scope.poDateFrom;
                                    }
                                    
                                    dateSplitter = filterObject.dateTo.split("-");
                                    if (dateSplitter.length > 1) {
                                        $scope.poDateTo = dateSplitter[1] + "/" + dateSplitter[2] + "/" + dateSplitter[0];
                                        $scope.filterParams.poDateTo = $scope.poDateTo;
                                    }
                                    
                                    dateSplitter = filterObject.expectFrom.split("-");
                                    if (dateSplitter.length > 1) {
                                        $scope.expDelivDateFrom = dateSplitter[1] + "/" + dateSplitter[2] + "/" + dateSplitter[0];
                                        $scope.filterParams.expDelivDateFrom = $scope.expDelivDateFrom;
                                    }
                                    
                                    dateSplitter = filterObject.expectTo.split("-");
                                    if (dateSplitter.length > 1) {
                                        console.log(dateSplitter);
                                        $scope.expDelivDateTo = dateSplitter[1] + "/" + dateSplitter[2] + "/" + dateSplitter[0];
                                        $scope.filterParams.expDelivDateTo = $scope.expDelivDateTo;
                                    }

                                    $scope.filterParams.companies = "";
                                    $scope.filterParams.suppliers = "";
                                    $scope.filterParams.status = "";
                                    $scope.filterParams.recStart = 0;
                                    $scope.filterParams.recEnd = $scope.pageSize - 1;
                                    $scope.bigCurrentPage = 1;
                                    $scope.selectedSuppliers = filterObject.supplierList;
                                    $scope.selectedCompanies = filterObject.companyList;
                                    // console.log($scope.selectedSuppliers);
                                    $scope.selectedStatuses = filterObject.statusList;

                                    for (var i = 0; i < $scope.selectedCompanies.length; i++) {
                                        $scope.filterParams.companies += $scope.selectedCompanies[i] + ",";
                                    }
                                    
                                    for (var i = 0; i < $scope.selectedSuppliers.length; i++) {
                                        $scope.filterParams.suppliers += $scope.selectedSuppliers[i] + ",";
                                    }
                                    
                                    for (var i = 0; i < $scope.selectedStatuses.length; i++) {
                                        $scope.filterParams.status += $scope.selectedStatuses[i] + ",";
                                    }

                                    $scope.pos = [];

                                    PoService.obtain_filtered_po(HeaderService.getHeaders(), $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                    $rootScope.filterParams = $scope.filterParams;
                                    $rootScope.selectedStatuses = $scope.selectedStatuses;
                                    $rootScope.selectedCompanies = $scope.selectedCompanies;
                                    $rootScope.selectedSuppliers = $scope.selectedSuppliers;
                                    $rootScope.bigCurrentPage = $scope.bigCurrentPage;
                                    $rootScope.orderBy = $scope.orderBy;
                                    $rootScope.orderDir = $scope.orderDir;
                                    // console.log($scope.filterParams);
                                };
                                
                                $scope.filterPo = function () {
                                	Util.showLoader(true);
                                    $scope.filterParams.poDateFrom = $filter('date')($scope.poDateFrom, "MM/dd/yyyy");
                                    $scope.filterParams.poDateTo = $filter('date')($scope.poDateTo, "MM/dd/yyyy");
                                    $scope.filterParams.expDelivDateFrom = $filter('date')($scope.expDelivDateFrom, "MM/dd/yyyy");
                                    $scope.filterParams.expDelivDateTo = $filter('date')($scope.expDelivDateTo, "MM/dd/yyyy");
                                    $scope.filterParams.companies = "";
                                    $scope.filterParams.suppliers = "";
                                    $scope.filterParams.status = "";
                                    $scope.filterParams.recStart = 0;
                                    $scope.filterParams.recEnd = $scope.pageSize - 1;
                                    $scope.bigCurrentPage = 1;
                                    
                                    for (var i = 0; i < $scope.selectedCompanies.length; i++) {
                                        $scope.filterParams.companies += $scope.selectedCompanies[i] + ",";
                                    }
                                    
                                    for (var i = 0; i < $scope.selectedSuppliers.length; i++) {
                                        $scope.filterParams.suppliers += $scope.selectedSuppliers[i] + ",";
                                    }
                                    
                                    for (var i = 0; i < $scope.selectedStatuses.length; i++) {
                                        $scope.filterParams.status += $scope.selectedStatuses[i] + ",";
                                    }

                                    // console.log($scope.filterParams);

                                    $scope.pos = [];
                                    // console.log($scope.filterParams);
                                    // console.log(angular.toJson($scope.filterParams));
                                    PoService.obtain_filtered_po(HeaderService.getHeaders(), $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                    $rootScope.filterParams = $scope.filterParams;
                                    $rootScope.selectedStatuses = $scope.selectedStatuses;
                                    $rootScope.selectedCompanies = $scope.selectedCompanies;
                                    $rootScope.selectedSuppliers = $scope.selectedSuppliers;
                                    $rootScope.bigCurrentPage = $scope.bigCurrentPage;
                                    $rootScope.orderBy = $scope.orderBy;
                                    $rootScope.orderDir = $scope.orderDir;
                                    // console.log($scope.filterParams);
                                };

                                $scope.resetFilter = function () {
                                    $scope.filterParams = {
                                        status: "",
                                        companies: "",
                                        suppliers: "",
                                        format: "PO0110",
                                        poDateFrom: "",
                                        poDateTo: "",
                                        expDelivDateFrom: "",
                                        expDelivDateTo: "",
                                        recStart: 0,
                                        recEnd: $scope.pageSize - 1,
                                        orderBy: "PO_NUMBER",
                                        orderDir: "DESC"
                                    };
                                    $scope.bigCurrentPage = 1;
                                    $scope.poDateFrom = "";
                                    $scope.poDateTo = "";
                                    $scope.expDelivDateFrom = "";
                                    $scope.expDelivDateTo = "";
                                    $scope.selectedCompanies = {};
                                    $scope.selectedSuppliers = {};
                                    $scope.selectedStatuses = {};
                                    $scope.pos = [];
                                    
                                    $rootScope.filterParams = $scope.filterParams;
                                    $rootScope.selectedStatuses = $scope.selectedStatuses;
                                    $rootScope.selectedCompanies = $scope.selectedCompanies;
                                    $rootScope.selectedSuppliers = $scope.selectedSuppliers;
                                    $rootScope.bigCurrentPage = $scope.bigCurrentPage;
                                    $rootScope.pageSize = $scope.pageSize;
                                    $rootScope.orderBy = $scope.orderBy;
                                    $rootScope.orderDir = $scope.orderDir;

                                    PoService.obtain_filtered_po(HeaderService.getHeaders(), $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                };

                                $scope.open = function ($event) {
                                    $event.preventDefault();
                                    $event.stopPropagation();
                                };

                                $scope.editPo = function (po) {
                                    $state.go("home.editPo", {id: po.poNumber, company: po.company.code })

                                };
                                
                                $scope.viewPo = function (po) {
                                    $state.go("home.viewPo", {company: po.company.code, id: po.poNumber})
                                };
                                
                                $scope.onSelectAll = function () {
                                    console.log($scope.allSelected);
                                    if ($scope.poSelected !== undefined) {
                                        for (var i = 0; i < $scope.poSelected.length; i++) {
                                            $scope.poSelected[i] = !$scope.allSelected;
                                        }
                                    }
                                };

                                $scope.isDisabled = function () {
                                    if ($scope.poSelected === undefined) return "disabled";
                                    for (var i = 0; i < $scope.poSelected.length; i++) {
                                        if ($scope.poSelected[i])
                                            return "";
                                    }
                                    return "disabled";
                                };

                                $scope.isDisabledSingle = function () {
                                    if ($scope.poSelected === undefined) return "disabled";
                                    var singleCheck = false;
                                    for (var i = 0; i < $scope.poSelected.length; i++) {
                                        if (!singleCheck) {
                                            if ($scope.poSelected[i]) {
                                                singleCheck = true;
                                            }
                                        }
                                        else if ($scope.poSelected[i]) {
                                            return "disabled";
                                        }
                                    }
                                    if (singleCheck) {
                                        return "";
                                    }
                                    else {
                                        return "disabled";
                                    }
                                };

                                $scope.PrintURL = "home/index.html#/printPo";//getInfo.company/getInfo.poNumber"
                                $scope.printSelected = function () {
                                	var printHeaders = HeaderService.getHeaders();
                                	printHeaders.headers["Content-Type"] = "application/pdf"; 
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_pdf?filename=/AGKServer/PO/XX-6155.pdf'), printHeaders)
                                    .success(function (data, status, headers, config, PoService, $scope) {
                                        console.log("Render success", data);
                                    })
                                    .error(function (data, status, headers, config, PoService, $scope) {
                                        console.log("Render failure", data);
                                    });
                                    for (var i = 0; i < $scope.pos.length; i++) {
                                        if ($scope.poSelected[i] == true) {
                                            $scope.PrintURL += ("/" + $scope.pos[i].poNumber);
                                            $scope.PrintURL += ("/" + $scope.pos[i].company.code);
                                        }
                                    }
                                };

                                error_handler = function ($scope) {
                                    return function (resp) {
                                        $scope.$emit('service-error', 'PoService Error');
                                        Util.showLoader(false);
                                        console.error('service-error', 'PoService Error');
                                        return $scope.page = {};
                                    };
                                };
                                
                                success_handler = function ($scope) {
                                    return function (resp) {
                                        if (resp.status === 200) {
                                        	if($rootScope.bigCurrentPage) {
                                            	$scope.bigCurrentPage =  $rootScope.bigCurrentPage;
                                            }
                                            
                                            $scope.pos = resp.data.poList;
                                            $scope.bigTotalItems = resp.data.totalPOs;

                                            $scope.pageChange = function () {
                                            	Util.showLoader(true);
                                            	$rootScope.bigCurrentPage =  $scope.bigCurrentPage;
                                                $scope.filterParams.recStart = ($scope.pageSize) * ($scope.bigCurrentPage - 1);
                                                $scope.filterParams.recEnd = Math.min($scope.bigTotalItems - 1, (($scope.pageSize) * ($scope.bigCurrentPage) - 1));
                                                $scope.pos = [];
                                                PoService.obtain_filtered_po(HeaderService.getHeaders(), $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                                
                                            };
                                            $scope.pageSizeChange = function () {
                                            	Util.showLoader(true);
                                            	$rootScope.pageSize = $scope.pageSize;
                                                $scope.bigCurrentPage = 1;
                                                $rootScope.bigCurrentPage =  $scope.bigCurrentPage;
                                                $scope.filterParams.recStart = ($scope.pageSize) * ($scope.bigCurrentPage - 1);
                                                $scope.filterParams.recEnd = Math.min($scope.bigTotalItems - 1, (($scope.pageSize) * ($scope.bigCurrentPage) - 1));
                                                $scope.pos = [];
                                                PoService.obtain_filtered_po(HeaderService.getHeaders(), $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                               
                                            };

                                            $scope.poSelected = [];
                                            $scope.pos.forEach(function () {
                                                $scope.poSelected.push(false);
                                            });
                                            Util.showLoader(false);
                                            return $scope.page = resp.data.meta;
                                        } else {
                                        	Util.showLoader(false);
                                            return error_handler($scope)(resp);
                                        }
                                    };
                                };

                                $scope.poApprove = function (pos) {
                                    for (var i = 0; i < $scope.poSelected.length; i++) {
                                        if ($scope.poSelected[i]) {
                                            pos[i].$$hashKey = "";
                                            pos[i].status = {
                                                "status": "IS",
                                                "statusDesc50": "Issued ",
                                                "statusDesc10": "Issued ",
                                                "statusDesc05": "Issd",
                                                "dispSeq": 10
                                            };
                                            pos[i].statusCode = "IS";
                                            pos[i].statusDesc05 = "Issd";
                                            pos[i].statusDesc10 = "Issued";
                                            pos[i].statusDesc50 = "Issued";
                                            var poString = JSON.stringify(pos[i]);

                                            $http.post(HeaderService.getHeaders().getWebApiEndPoint('po?')
                                                    + $.param({company: pos[i].company.code, poNumber: pos[i].poNumber, action: "C", format: "PO0110"}),
                                                poString, HeaderService.getHeaders())
                                                .success(function (data, status, headers, config, PoService, $scope) {
                                                    console.log("Render success", data);
                                                })
                                                .error(function (data, status, headers, config, PoService, $scope) {
                                                    console.log("Render failure", data);
                                                });
                                        }

                                    }
                                };
                                
                                $scope.errorModal = function (errorList, size) {
                                	$scope.errorList = errorList;
                                    var modalInstance = $modal.open({
                                        templateUrl: 'errorModalContent.html',
                                        controller: ErrorModalCtl,
                                        size: size,
                                        resolve: {
                                            errorList: function () {
                                                return $scope.errorList;
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                    	
                                    }, function () {
                                        //$log.info('Modal dismissed at: ' + new Date());
                                    });

                                };
                                
                                var ErrorModalCtl = function ($scope, $modalInstance, errorList) {
                                	$scope.errors = errorList;
                                    $scope.ok = function () {
                                        $modalInstance.close();
                                    };
                                    /*
                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                    */
                                };
                                
                                
                                $scope.deletePos = function (pos) {
                                    Util.showLoader(true);
                                    for (var i = $scope.poSelected.length; i > -1; i--) {//goes through array backwards
                                        if ($scope.poSelected[i]) {
                                        	var headers = {};
                                            angular.copy(HeaderService.getHeaders(), headers);
                                        	headers.headers["Content-Type"] = "application/x-www-form-urlencoded"
                                            /*$http.delete("https://wwwagknow50.agknowledge.com/AgKnowledgeREST/rest/po?"
                                             + $.param({company: pos[i].company.code, poNumber: pos[i].poNumber}),
                                             {headers: {'clientId': 'AGK', 'sessionKey': '0AobLX4SUTW5yxipcEf3AGf40'}})*/
                                            var deleteConfig = {
                                                method: "DELETE",
                                                url: HeaderService.getHeaders().getWebApiEndPoint('po?')
                                                    + $.param({company: pos[i].company.code, poNumber: pos[i].poNumber}),
                                                data: "companyCode=" + pos[i].company.code + "&poNumber=" + pos[i].poNumber,
                                                //headers: HeaderService.getHeaders(),
	                                            headers: {"Content-Type": "application/x-www-form-urlencoded",
	                                            'sessionKey': HeaderService.getHeaders().headers.sessionKey,
	                                            'clientID': HeaderService.getHeaders().headers.clientID}
                                            };
                                            $http(deleteConfig)
                                                .success(function (data, status, headers, config) {
                                                    console.log("Render success", data);
                                                    PoService.obtain_filtered_po(HeaderService.getHeaders(), $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                                    Util.showLoader(false);
                                                })
                                                .error(function (data, status, headers, config) {
                                                    console.log("Render failure", data);
                                                    $scope.errorModal([data.errMsg]);
                                                    Util.showLoader(false);
                                                });
                                        }

                                    }
                                };

                                $scope.deletePoModal = function (pos, size) {

                                    var modalInstance = $modal.open({
                                        templateUrl: 'deleteModalContent.html',
                                        controller: DeleteModalCtl,
                                        size: size,
                                        resolve: {
                                            pos: function () {
                                                return $scope.pos;
                                            },
                                            poSelected: function () {
                                                return $scope.poSelected;
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        $scope.deletePos($scope.pos);
                                    }, function () {
                                        //$log.info('Modal dismissed at: ' + new Date());
                                    });
                                };

                                var DeleteModalCtl = function ($scope, $modalInstance, pos, poSelected) {
                                    $scope.ok = function () {
                                        $modalInstance.close();
                                    };

                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                };

                                $scope.poSend = function (pos, size) {
                                    var modalInstance = $modal.open({
                                        templateUrl: 'sendModalContent.html',
                                        controller: SendModalCtl,
                                        size: size,
                                        resolve: {
                                            pos: function () {
                                                return $scope.pos;
                                            },
                                            poSelected: function () {
                                                return $scope.poSelected;
                                            }
                                        }
                                    });

                                    Util.showLoader(true);
                                    modalInstance.result.then(function (poSend) {
                                    	$http.post(HeaderService.getHeaders().getWebApiEndPoint('po/send_po'), poSend, HeaderService.getHeaders())
                                    	.then(function(res) {
                                    		if(res.data.FILENAME != "") {
                                    			$scope.getPdf(res.data.FILENAME);
                                    		}
                                    		var errorList = [];
                                    		if(res.data.errorSendPO != "") {
                                    			errorList.push("Send error: " + res.errorSendPO);
                                    		}
                                    		if(res.data.errorIssuedPO != "") {
                                    			errorList.push("Issued error: " + res.data.errorIssuedPO);
                                    		}
                                    		if(res.data.errorPrintPO != "") {
                                    			errorList.push("Print error: " + res.data.errorPrintPO);
                                    		}
                                    		if (errorList.length > 0) {
                                    			$scope.errorModal(errorList);
                                    		}
                                            Util.showLoader(true);
                                            PoService.obtain_data(HeaderService.getHeaders(), 'po/get_po_list', false, $scope.filterParams).then(success_handler($scope), error_handler($scope));
                                    	});
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                        Util.showLoader(false);

                                    });

                                };

                                var SendModalCtl = function ($scope, $modalInstance, $filter, pos, poSelected) {
                                	Util.showModalLoader(true);
                                    for (var i = 0; i < poSelected.length; i++) {
                                        if (poSelected[i]) {
                                            var po = pos[i];
                                            break;
                                        }
                                    }
                                    /*var config = {
                                            headers: Util.getHeaders()
                                    };*/
                                    var poSendGetParams = {
                                        company: po.company.code,
                                        poNumber: po.poNumber,
                                        supplier_type: po.supplier.supplierType,
                                        supplier: po.supplier.supplierCode,
                                        sub_supplier: po.supplier.subSupplier
                                    };
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_send?') + $.param(poSendGetParams), HeaderService.getHeaders())
                                        .then(function (res) {
                                            $scope.poSend = res.data;
                                            Util.showModalLoader(false);
                                        });

                                    $scope.ok = function () {
                                    	if ($scope.poSend.sendEmail == true && $scope.poSend.emailAddress.length == 0) {
                                    		alert("Email Address input required.");
                                    	}
                                    	else if ($scope.poSend.sendFax == true && $scope.poSend.faxNumber.length == 0) {
                                    		alert("Fax Number input required.");
                                    	}
                                    	else {
                                        	$modalInstance.close($scope.poSend);
                                    	}
                                    };

                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                };
                                
                                $scope.getPdf = function(pdfFilename) {
                                	var tempConfig = {
                                			responseType: 'arraybuffer',
                                			headers: {
                                				'sessionKey': HeaderService.getHeaders().headers.sessionKey,
                                				'clientID': HeaderService.getHeaders().headers.clientID,
                                			}
                                	}
                                	$http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_pdf?filename=' + pdfFilename), tempConfig)
                                	.success(function (response) {
                                		 var file = new Blob([response], {type: 'application/pdf'});
                                		 var fileURL = URL.createObjectURL(file);
                                		 window.open(fileURL);
                                	});
                                };
								
                                $scope.copyPos = function () {  // Copied POs do not load back completely.
                                	//send to create a new po here
                                	var selectedPoIndex = -1;
                                	for (var i = 0; i < $scope.poSelected.length; i++) {
                                		if ($scope.poSelected[i]) {
                                			selectedPoIndex = i;
                                			break;
                                		}
                                	}
                                	if (selectedPoIndex != -1) {
                                		var poNumber = $scope.pos[selectedPoIndex].poNumber;
                                		var companyCode = $scope.pos[selectedPoIndex].company.code;
                                		$state.go("home.newPo", {company: companyCode, id: poNumber});
                                	}
                                	else {
                                		alert('No po selected to copy.');
                                	}
                                	
                                	return;
                                };
                                
                                HeaderService.getHeaders(function (config) {
                                	$scope.init(config);
                                },
                                function () {
                                	alert('Unable to authenticate request');
                                });
                                
                                return $scope.$watch('pos', function (n, o) {
                                    if (!(n === void 0)) {
                                        //console.log("update $scope.page");
                                        return n;
                                    }
                                });

                            }
                        ]
                    },
                    "lower": {}
                }
            });
        }
    ]);

}).call(this);
