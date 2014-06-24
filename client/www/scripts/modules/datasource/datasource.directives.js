// Copyright StrongLoop 2014
/*
 *
 * Datasource Editor Main
 *
 * */
Datasource.directive('slDatasourceEditorMain',[
  function() {
    return {
      replace: true,
      templateUrl: './scripts/modules/datasource/templates/datasource.editor.main.html',
      link: function(scope, element, attrs) {

        console.log('sl-datasource-editor-main');


      }
    }
  }
]);
/*
 *
 *
 *   DATASOURCE INSTANCE HEADER
 *
 * */
Datasource.directive('slDatasourceInstanceHeader', [
  function() {
    return {
      restrict: 'A',
      replace: true,
      link: function(scope, el, attrs) {
        scope.$watch('activeDatasourceInstance', function(newVal, oldVal) {
          React.renderComponent(DatasourceTitleHeader({scope: scope}), el[0]);
        });
      }
    }
  }
]);
/*
 *
 * Datasource Editor Tabs View
 *
 * */
Datasource.directive('slDatasourceEditorTabsView', [
  'IAService',
  function(IAService) {
    return {
      replace:true,
      link: function(scope, el, attrs) {

        function renderComp(){
          var tabItems = [];

          for (var i = 0;i < scope.currentOpenDatasourceNames.length;i++) {
            var isActive = false;
            if (scope.currentOpenDatasourceNames[i] === IAService.getActiveDatasourceInstance().name) {
              isActive = true;
            }
            tabItems.push({
              name:scope.currentOpenDatasourceNames[i],
              isActive:isActive
            });
          }

          React.renderComponent(DatasourceEditorTabsView({scope:scope, tabItems:tabItems}), el[0]);
        }

        scope.$watch('activeDatasourceInstance', function(newVal, oldVal) {
          renderComp();
        });
//        scope = scope.$parent;
        scope.$watch('currentOpenDatasourceNames', function(newNames, oldNames) {
          renderComp();
        });
      }
    }
  }
]);
/*
 *
 *   Datasource Discovery
 *
 * */
Datasource.directive('slDatasourceDiscovery', [
  'ModelService',
  function(ModelService) {
    return {
      replace:true,
      templateUrl: './scripts/modules/datasource/templates/datasource.discovery.html',
      controller:  function($scope, DatasourceService) {
        $scope.isDsTablesLoadingIndicatorVisible = true;
        $scope.currentDiscoveryStep = 'selectTables';
        $scope.loadSchema = function(dsName) {

          $scope.tables = DatasourceService.getDatasourceTables({'name':'mSql'});
          $scope.tables.$promise.
            then(function (result) {


              $scope.tables = result.schema;
              $scope.isDsTablesLoadingIndicatorVisible = false;
              $scope.isDsTableGridVisible = true;


            });
        };

        $scope.isSchemaModelComposerVisible = function(){
          return $scope.apiSourceTables.length > 0;
        };
        function ngGridFlexibleHeightPlugin (opts) {
          var self = this;
          self.grid = null;
          self.scope = null;
          self.init = function (scope, grid, services) {
            self.domUtilityService = services.DomUtilityService;
            self.grid = grid;
            self.scope = scope;
            var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); };
            var innerRecalcForData = function () {
              var gridId = self.grid.gridId;
              var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
              var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
              var naturalHeight = self.grid.$canvas.height() + 1;
              if (opts != null) {
                if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                  naturalHeight = opts.minHeight - extraHeight - 2;
                }
              }

              var newViewportHeight = naturalHeight + 3;
              if (!self.scope.baseViewportHeight || self.scope.baseViewportHeight !== newViewportHeight) {
                self.grid.$viewport.css('height', newViewportHeight + 'px');
                self.grid.$root.css('height', (newViewportHeight + extraHeight) + 'px');
                self.scope.baseViewportHeight = newViewportHeight;
                self.domUtilityService.RebuildGrid(self.scope, self.grid);
              }
            };
            self.scope.catHashKeys = function () {
              var hash = '',
                idx;
              for (idx in self.scope.renderedRows) {
                hash += self.scope.renderedRows[idx].$$hashKey;
              }
              return hash;
            };
            self.scope.$watch('catHashKeys()', innerRecalcForData);
            self.scope.$watch(self.grid.config.data, recalcHeightForData);
          };
        }

        $scope.dsTablesGridOptions = {
          data: 'tables',
          columnDefs: [
            {field:'name', displayName:'Table'},
            {field:'owner',displayName:'Owner'}
          ],
          selectedItems: [],
          multiSelect: true,
          filterOptions: $scope.filterOptions,
          plugins: [new ngGridFlexibleHeightPlugin()]
        };
        $scope.generateModels = function() {
          console.log('generate models' + $scope.dsTablesGridOptions.selectedItems);
          $scope.apiSourceTables = $scope.dsTablesGridOptions.selectedItems;
          $scope.isDsTableGridVisible = false;
          switch($scope.currentDiscoveryStep) {
            case 'initialize':
              $scope.currentDiscoveryStep = 'selectTables';
              break;

            case 'selectTables':
              $scope.currentDiscoveryStep = 'reviewModels';

              break;

            case 'reviewModels':
              $scope.currentDiscoveryStep = 'initialize';
              console.log('create the following models: '  );
              var newModels= ModelService.generateModelsFromSchema($scope.apiSourceTables);
              $scope.cancel();


              break;

            default:

          }


        };
        $scope.viewSchemaTables = function() {
          console.log('back to schema');
          $scope.apiSourceTables = [];
          $scope.isDsTableGridVisible = true;
          switch($scope.currentDiscoveryStep) {
            case 'initialize':

              break;

            case 'selectTables':
              $scope.currentDiscoveryStep = 'initialize';

              break;

            case 'reviewModels':
              $scope.currentDiscoveryStep = 'selectTables';

              break;

            default:

          }
        };
        $scope.$on('ngGridEventData', function(){
          //$scope.dsTablesGridOptions.selectRow(0, true);
        });

        /*
         *
         *   <button>Get Datasource Operations: dataSource.operations().</button>
         *               <li><a href="#">ACLSchemas</a></li>
         * */
        console.log('Datasource Main Controller: DISCOVER THIS: ' + $scope.targetDiscoveryDSName);

        if ($scope.targetDiscoveryDSName) {
          $scope.loadSchema($scope.targetDiscoveryDSName);
        }


        $scope.datasources = [];
        $scope.apiSourceTables = [];
        $scope.isDsTableGridVisible = false;
       // $scope.isDsTablesLoadingIndicatorVisible = false;

        $scope.filterOptions = {
          filterText: ''
        };

        $scope.openDatasourceForm = function() {
          $scope.isShowDatasourceForm = true;
        };
        $scope.saveDatasource = function(dsObj) {
          console.log('Save Datasource Object: ' + JSON.stringify(dsObj));
        };
        $scope.closeDatasourceForm = function() {
          $scope.isShowDatasourceForm = false;
        };
        $scope.isShowDatasourceForm = false;





        $scope.datasources = DatasourceService.getAllDatasources({});
        $scope.datasources.$promise.
          then(function (result) {

            var core = result.name[0];
//
            var log = [];
            var datasources = [];
            angular.forEach(core, function(value, key){
              //this.push(key + ': ' + value);
              datasources.push({name:key,props:value});
            }, log);
            $scope.datasources = datasources;


          });


      },
      link: function(scope, el, attrs) {

      }
    }
  }
]);
/*
 *
 *   Datasource Instance Editor
 *
 * */
Datasource.directive('slDatasourceInstanceEditor', [
  function() {
    return {
      replace:true,
      templateUrl: './scripts/modules/datasource/templates/datasource.instance.editor.html',
      link: function(scope, el, attrs) {

      }
    }
  }
]);
Datasource.directive('datasourceEditorForm', [
  'DatasourceService',
  function(DatasourceService) {
    return {
      replace:true,
      link: function(scope, el, attrs) {
        console.log('data source form');


        scope.cDatasource = {
          defaultForType: 'mysql',
          connector: 'loopback-connector-mysql',
          database: 'apm',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          debug: true
        };
        scope.saveDatasource = function() {
          console.log('try to save the data');
          if (scope.cDatasource && scope.cDatasource.id) {
            console.log('update datasource ');
          } else {
            console.log('create datasource');
            DatasourceService.createDatasourceDef(scope.cDatasource,
              function(response) {
                console.log('good datasource');

              },
              function(response) {
                console.log('bad datasource');
              }
            );
          }
        };
        scope.$watch('activeDatasourceInstance', function(instance) {
          React.renderComponent(DatasourceEditorView({scope:scope}), el[0]);
        })
      }
    }
  }
]);