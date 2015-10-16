(function () {

/*
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
	
	*///----------------------------------------------------------------------
    
    app.factory('HeaderService', ["$http", function($http){
    	var config = {    			
			server: "https://wwwagknow50.agknowledge.com/",
			getWebApiEndPoint: function (action) {
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
							success(config);
					})
					.error(function (data, status, headers, config) {
						if (typeof error == 'function')
							error();
					});
    		}
    		else {
    			if (typeof success == 'function') {
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
	
	/*------------------------------------------------------------------
    
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
                                
                                */
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
									/*
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
*/
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
/*
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
								 
								 *///--------------------------------------------------
								 
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
                                
								/*-------------------------------------------------------
								
                                $scope.copyPo = function () {  // Copied POs do not load back completely.
                                	$state.go("home.newPo", $stateParams);
                                };

                                $scope.init();
                            }
                        ]
                    }
                }
            });
			
			*///-------------------------------------------------------------------
			
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
			
			/*------------------------------------------------------------------------------------------------
			
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

                                $scope.detailsIfMobile = function(po){
                                    if($scope.displayMode==='xs'){
                                        $scope.viewPo(po);
                                    }
                                };
								
								*///----------------------------------------------------------------------------
                                
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
                                    
                                    $scope.selectedCompanies = {};
                                    $scope.selectedSuppliers = {};
                                    $scope.selectedStatuses = {};

                                    $scope.page = {};
                                    $scope.poData = {};
                                    $scope.companies = {};
                                    $scope.pos = {};
                                }
								
								/*//------------------------------------------------------------------------------------------

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
*/
                                $scope.PrintURL = "home/index.html#/printPo";//getInfo.company/getInfo.poNumber"
                                $scope.printSelected = function () {
								/*
                                	var printHeaders = HeaderService.getHeaders();
                                	printHeaders.headers["Content-Type"] = "application/pdf"; 
                                    $http.get(HeaderService.getHeaders().getWebApiEndPoint('po/get_po_pdf?filename=/AGKServer/PO/XX-6155.pdf'), printHeaders)
                                    .success(function (data, status, headers, config, PoService, $scope) {
                                        console.log("Render success", data);
                                    })
                                    .error(function (data, status, headers, config, PoService, $scope) {
                                        console.log("Render failure", data);
                                    });
									*/
                                    for (var i = 0; i < $scope.pos.length; i++) {
                                        if ($scope.poSelected[i] == true) {
                                            $scope.PrintURL += ("/" + $scope.pos[i].poNumber);
                                            $scope.PrintURL += ("/" + $scope.pos[i].company.code);
                                        }
                                    }
                                };
								/*
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
*/
                                $scope.poApprove = function (pos) {
                                    for (var i = 0; i < $scope.poSelected.length; i++) {
                                        if ($scope.poSelected[i]) {
/*
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
*/
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
/*
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
                                };

                                var DeleteModalCtl = function ($scope, $modalInstance, pos, poSelected) {
                                    $scope.ok = function () {
                                        $modalInstance.close();
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
*/