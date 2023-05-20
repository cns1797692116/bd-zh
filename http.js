let HTTP_STATUS_CONNECTED = 0;
let HTTP_STATUS_WAITRESPONSE = 1;
let HTTP_STATUS_FORWARDING = 2;
let httpStatus;

function tunnelDidConnect() {
  console.log($session);
  if ($session.proxy.isTLS) {
    // https
  } else {
    // http
    _writeHttpHeader();
    httpStatus = HTTP_STATUS_CONNECTED;
  }
  return true;
}

function tunnelTLSFinished() {
  _writeHttpHeader();
  httpStatus = HTTP_STATUS_CONNECTED;
  return true;
}

function tunnelDidRead(data) {
  if (httpStatus === HTTP_STATUS_WAITRESPONSE) {
    // 检查http响应代码== 200
    // 在这里假设成功
    console.log("http握手成功");
    httpStatus = HTTP_STATUS_FORWARDING;
    $tunnel.established($session); // 可以进行数据转发
    return null; // 不将读取到的数据转发到客户端
  } else if (httpStatus === HTTP_STATUS_FORWARDING) {
    return data;
  }
}

function tunnelDidWrite() {
  if (httpStatus === HTTP_STATUS_CONNECTED) {
    console.log("写http头成功");
    httpStatus = HTTP_STATUS_WAITRESPONSE;
    $tunnel.readTo($session, "\x0D\x0A\x0D\x0A"); // 读取远端数据直到出现\r\n\r\n
    return false; // 中断回调
  }
  return true;
}

function tunnelDidClose() {
  return true;
}

// 工具
function _writeHttpHeader() {
  let conHost = $session.conHost;
  let conPort = $session.conPort;

  var header = `CONNECT ${conHost}:${conPort} HTTP/1.1\r\nHost: ${conHost}:${conPort}\r\nConnection: keep-alive\r\nUser-Agent: Mozilla/5.0 (Linux; Android 12; RMX3300 Build/SKQ1.211019.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 T7/13.32 SP-engine/2.70.0 baiduboxapp/13.32.0.10 (Baidu; P1 12) NABar/1.0\r\nX-T5-Auth: 683556433\r\nProxy-Connection: keep-alive\r\n\r\n`;
  $tunnel.write($session, header);
}
