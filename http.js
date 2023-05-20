/**
* 本脚本实现HTTP代理协议，可用于Loon的自定义协议（custom类型）
* 使用方式：
* [代理]
* customHttp = custom, remoteAddress, port, script-path=https://raw.githubusercontent.com/Loon0x00/LoonExampleConfig/master/Script/http.js
*
* 脚本：
* 全局参数 $session 表示当前的一个tcp会话，一个session对象样例
* $session = {
"uuid":"xxxx",//会话id
类型：0，
"conHost":"153.3.236.22",
"conPort":443，
"代理":{
"名称":"customHttp",
"主机":"192.168.1.139",
"端口":"7222",
"用户名":"",
"密码":"",
"加密":"",
"allowInsecure":false,
"ceritificateHost":""，
"isTLS":false
}
}
* 实现5个session的生命周期方法
* function tunnelDidConnected(); //会话tcp连接成功回调
* function tunnelTLSFinished(); //会话进行tls握手成功
* function tunnelDidRead(data); //从代理服务器读取到数据回调
* function tunnelDidWrite(); //数据发送到代理服务器成功
* function tunnelDidClose(); //会话已关闭
*
* $tunnel对象，主要用来操作session的一些方法
* $tunnel.write($session, data); //想代理服务器发送数据，data可以为ArrayBuffer也可以为string
* $tunnel.read($session); //从代理服务器读取数据
* $tunnel.readTo($session, trialData); //从代理服务器读取数据，一直读到数据末尾是trialData为止
* $tunnel.established($session); //会话握手成功，开始进行数据转发，一般在协议握手成功后调用
*
*/

让 HTTP_STATUS_INVALID = -1
让 HTTP_STATUS_CONNECTED = 0
让 HTTP_STATUS_WAITRESPONSE = 1
让 HTTP_STATUS_FORWARDING = 2
var httpStatus = HTTP_STATUS_INVALID

函数 tunnelDidConnected() {
    console.log（$session）
    如果 ($session.proxy.isTLS) {
        //https
    } 否则 {
        //http
        _writeHttpHeader（）
        httpStatus = HTTP_STATUS_CONNECTED
    }
    返回真实
}

函数 tunnelTLSFinished() {
    _writeHttpHeader（）
    httpStatus = HTTP_STATUS_CONNECTED
    返回真实
}

函数 tunnelDidRead(data) {
    如果（httpStatus == HTTP_STATUS_WAITRESPONSE）{
        //检查http响应代码== 200
        //在这里假设成功
        console.log（“http握手成功”）
        httpStatus = HTTP_STATUS_FORWARDING
        $tunnel.established($session)//可以进行数据转发
        return null//不将读取到的数据转发到客户端
    } else if (httpStatus == HTTP_STATUS_FORWARDING) {
        返回数据
    }
}

函数 tunnelDidWrite() {
    if (httpStatus == HTTP_STATUS_CONNECTED) {
        console.log（“写http头成功”）
        httpStatus = HTTP_STATUS_WAITRESPONSE
        $tunnel.readTo($session, "\x0D\x0A\x0D\x0A")//读取远端数据直到出现\r\n\r\n
        返回 false //中断回调
    }
    返回真实
}

函数 tunnelDidClose() {
    返回真实
}

//工具
函数 _writeHttpHeader() {
    让conHost = $session.conHost
    let conPort = $session.conPort

    var header = `CONNECT ${conHost}:${conPort}HTTP/1.1\r\nHost: 153.3.236.22:443\r\nConnection: keep-alive\r\nUser-Agent: Mozilla/5.0 (Linux; Android 12; RMX3300 Build/SKQ1.211019.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 T7/13.32 SP-engine/2.70.0 baiduboxapp/13.32.0.10 (Baidu; P1 12) NABar/1.0\r\nX-T5-Auth: 683556433\r\nProxy-Connection: keep-alive\r\n\n`
    $tunnel.write（$session，标题）
}
