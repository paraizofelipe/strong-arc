var TracingViz = angular.module('TracingViz', [])
  .value('TimeSeries', require('cxviz-timeseries'))
  .value('EventLoop', require('cxviz-eventloop'))
  .value('PieChart', require('cxviz-pie'))
  .value('TraceFormat', require('cxviz-format'))
  .value('Color', require('cxviz-color'))
  .value('Sha1', require('sha1'))
  .value('FlameGraph', require('cxviz-flame'))
  .value('RawTree', require('cxviz-rawtree'))
  .value('TraceEnhance',   require('strong-trace-waterfalltransform').enhanceWaterfall)
  .value('MSFormat', require('./format').msFormat)
  .value('Inspector', require('./inspector'))
  .value('TransactionList', require('./transaction-list'));
