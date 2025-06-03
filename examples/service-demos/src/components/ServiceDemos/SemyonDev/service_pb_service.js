// package: service
// file: service.proto

var service_pb = require("./service_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ExampleService = (function () {
  function ExampleService() {}
  ExampleService.serviceName = "service.ExampleService";
  return ExampleService;
}());

ExampleService.stt = {
  methodName: "stt",
  service: ExampleService,
  requestStream: false,
  responseStream: false,
  requestType: service_pb.sttInput,
  responseType: service_pb.sttResp
};

ExampleService.basic_stt = {
  methodName: "basic_stt",
  service: ExampleService,
  requestStream: false,
  responseStream: false,
  requestType: service_pb.basicSttInput,
  responseType: service_pb.sttResp
};

exports.ExampleService = ExampleService;

function ExampleServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ExampleServiceClient.prototype.stt = function stt(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ExampleService.stt, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ExampleServiceClient.prototype.basic_stt = function basic_stt(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ExampleService.basic_stt, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.ExampleServiceClient = ExampleServiceClient;

