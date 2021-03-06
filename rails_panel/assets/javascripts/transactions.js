function TransactionsCtrl($scope) {

  $scope.transactionKeys     = [];
  $scope.requestsMap         = {}; // {transactionKey: {...}, ... }
  $scope.exceptionCallsMap   = {}; // {transactionKey: {...}, ... }
  $scope.consoleMessagesMap  = {}; // {transactionKey: {...}, ... }
  $scope.logsMap             = {}; // {transactionKey: [{...}, {...}], ... }
  $scope.viewsMap            = {}; // {transactionKey: [{...}, {...}], ... }
  $scope.paramsMap           = {}; // {transactionKey: [{...}, {...}], ... }
  $scope.sqlsMap             = {}; // {transactionKey: [{...}, {...}], ... }
  $scope.sqlsCachedCountMap  = {}; // {transactionKey: count, ...}
  $scope.showCachedSqls      = true;
  $scope.showDebugInConsole  = false;
  $scope.payloadParamsMap    = {}; // {transactionKey: params, ...}

  $scope.expectedMetaRequestVersion = '0.4.0'
  $scope.metaRequestVersion  = $scope.expectedMetaRequestVersion;

  $scope.outdatedMetaRequest = function() {
    return $scope.metaRequestVersion < $scope.expectedMetaRequestVersion;
  }

  $scope.requests = function() {
    return $scope.transactionKeys.map(function(n) {
      request = $scope.requestsMap[n];
      request.key = n;
      return request;
    });
  }

  $scope.activeKey = null;

  $scope.clear = function() {
    $scope.transactionKeys = [];
    $scope.requestsMap = {};
    $scope.logsMap = {};
    $scope.exceptionCallsMap = {};
    $scope.consoleMessagesMap = {};
    $scope.viewsMap = {};
    $scope.paramsMap = {};
    $scope.sqlsMap = {};
    $scope.activeKey = null;
    $scope.payloadParamsMap = {};
  }

  $scope.activeRequest = function() {
    return $scope.requestsMap[$scope.activeKey];
  }

  $scope.activeExecutedSqlsCount = function() {
    if (typeof $scope.activeSqls() !== 'undefined') {
      return $scope.activeSqls().length - $scope.activeCachedSqlsCount();
    } else {
      return 0;
    }
  }

  $scope.activeCachedSqlsCount = function() {
    count = $scope.sqlsCachedCountMap[$scope.activeKey];
    if (count == undefined) {
      return 0;
    } else {
      return count;
    }
  }

  $scope.activeViews = function() {
    return $scope.viewsMap[$scope.activeKey];
  }

  $scope.activeSqls = function() {
    return $scope.sqlsMap[$scope.activeKey];
  }

  $scope.showQuery = function(type) {
    return $scope.showCachedSqls || type !== "CACHE";
  }

  $scope.showConsoleMessage = function(type) {
    return $scope.showDebugInConsole || type !== "debug";
  }

  $scope.notEmpty = function(col) {
    if (col == undefined) {
      return false;
    } else {
      return col.length > 0;
    }
  }

  $scope.activeParams = function() {
    return $scope.paramsMap[$scope.activeKey];
  }

  $scope.activePayloadParams = function() {
    return $scope.payloadParamsMap[$scope.activeKey];
  }

  $scope.activeLog = function() {
    return $scope.logsMap[$scope.activeKey];
  }

  $scope.activeExceptionCalls = function() {
    return $scope.exceptionCallsMap[$scope.activeKey];
  }

  $scope.activeConsoleMessages = function() {
    // FIXME UGLY HACK, BUT WHY ON THE EARTH THERE ARE PAIRS OF THEM?!
    var result = $scope.consoleMessagesMap[$scope.activeKey];
    return result ? result.filter(function(element, index, array) {
      return index == 0 || element.payload.message != array[index - 1].payload.message
    }) : result;
  }

  $scope.setActive = function(transactionId) {
    $scope.activeKey = transactionId;
  }

  $scope.getClass = function(transactionId) {
    if (transactionId == $scope.activeKey) {
      return 'selected';
    } else {
      return '';
    }
  }

  $scope.parseNotification = function(key, data) {
    switch(data.name) {
    case "process_action.action_controller":
      data.durationRounded = function() {
        return data.duration ? data.duration.round() : 0;
      }();
      data.payload.dbRuntimeRounded = function() {
        return data.payload.db_runtime ? data.payload.db_runtime.round() : 0;
      }();
      data.payload.viewRuntimeRounded = function() {
        return data.payload.view_runtime ? data.payload.view_runtime.round() : 0;
      }();
      data.payload.otherRuntimeRounded = function() {
        return data.durationRounded - data.payload.dbRuntimeRounded - data.payload.viewRuntimeRounded;
      }();
      $scope.requestsMap[key] = data;
      Object.keys(data.payload.params).each(function(n) {
        $scope.pushToMap($scope.paramsMap, key, {name:n, value:data.payload.params[n]});
      });
      $scope.payloadParamsMap[key] = JSON.stringify(data.payload.params);
      $scope.transactionKeys.push(key);
      $scope.setActive(key);
      break;
    case "process_action.action_controller.exception":
      $scope.pushToMap($scope.exceptionCallsMap, key, data);
      break;
    case "console_logger.message":
      $scope.pushToMap($scope.consoleMessagesMap, key, data);
      break;
    case "render_template.action_view":
      $scope.pushToMap($scope.viewsMap, key, data);
      break;
    case "render_partial.action_view":
      $scope.pushToMap($scope.viewsMap, key, data);
      break;
    case "meta_request.log":
      $scope.pushToMap($scope.logsMap, key, data);
      break;
    case "sql.active_record":
      ignoredTypes = ["SCHEMA", "EXPLAIN"];
      if (ignoredTypes.indexOf(data.payload.name)==-1) {
        $scope.pushToMap($scope.sqlsMap, key, data);
      }
      if (data.payload.name == "CACHE") {
        val = $scope.sqlsCachedCountMap[key];
        if (val == undefined) {
          val = 1;
        } else {
          val += 1;
        }
        $scope.sqlsCachedCountMap[key] = val;
      }
      break;
    default:
      console.log('Notification not supported:' + data.name);
    }
  }

  $scope.pushToMap = function(map, key, data) {
    var value = map[key];
    if (typeof value == 'undefined') {
      map[key] = [data];
    } else {
      value.push(data)
    }
  }

}
