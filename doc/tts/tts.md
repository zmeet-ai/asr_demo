# **笔声智能AI开发能力**

[TOC]



| 版本历史 | 作者 | 备注                  | 时间 |
| -------- | ---- | --------------------- | -------- |
| v1.0     | ming | 语音合成，语音降噪，视频抠图 | 2022/06/22 |
| v1.1 | ming | sign验证规则从MD5修改为HmacSHA256 | 2022/06/26 |
|          |      |                       |  |
## 授权和接入

### 数据协议总则
* 通讯协议：平台向外开放的通讯协议采用HTTPS协议
* 编码：默认使用UTF-8，否则中文字符可能为乱码
* 接口权限：每个接入方需要登记访问IP，只对授权的IP地址开通访问权限

### 签名key
客户首先需要与商务沟通，获得appId和appSecret：

appId

唯一的用户ID， 举例 "zmeet"；一般俗称为 application key

appSecret

用户密匙， 举例 "^#BDYDEYE#", 一般俗称为 application secret.

### 请求数据格式
JSON

### 响应数据格式
JSON

### 请求参数说明

在调用任何业务接口前，必须先取得授权，通过认证。取得授权的方式为在HTTP的请求体中输入正确的账号、时间戳及签名（x-dev-id、x-signature、x-request-send-timestamp）。说明如下：

| **序号** | **参数名**               | **类型** | **是否必填** | **说明**                                                     |
| -------- | ------------------------ | -------- | ------------ | ------------------------------------------------------------ |
| 1        | x-request-send-timestamp | string   | 是           | 请求发送时间戳                                               |
| 2        | x-signature              | string   | 是           | 数字签名，HmacSHA256(x-dev-id + x-request-send-timestamp),用appSecret加密;32小写 |
| 3        | x-dev-id                 | string   | 是           | 由服务方为接入方提供的appId, 一般俗称为app key               |

### **响应参数说明**

| **序号** | **元素名称** | **父元素** | **类型** | **描述**   |
| -------- | ------------ | ---------- | -------- | ---------- |
| 1        | code         | --         | string   | 响应状态码 |
| 2        | msg          | --         | string   | 响应说明   |
| 3        | result       | --         | string   | 响应结果   |

## 语音合成



### 简介

* zmeet语音合成通过 REST API 的方式给开发者提供一个通用的 HTTP接口
* **语音格式**：wav（不压缩，pcm 编码）格式，采样率 16000，16bit 采样精度的单声道语音
* 语音合成支持自定义词组；词组的定义跟随客户，针对该特定客户是特定的语音片段
* 支持自定义域名请求（自定义域名需要提供**子域名**和域名对应的**ssl证书**）

### 参数指标

#### 发音准确度大于95%

* 发音准确度=正确发音用例数/总用例数 X 100%

####  清晰度

* 单字清晰度大于99%

* 清晰发音率=字表中可接受发音个数/ 字表总字数 X 100% 。

* 句中清晰度大于95%

* 清晰发音率=句中可接受发音字数/ 总字数 X 100% 。

#### 整体听感

* 平均主观得分（MOS）大于4.0

* 综合评测拟人性、连贯性、韵律感、保真度等。

### API

#### url

**`https://ai.abcpen.com/api/tts`**

**域名支持自定义绑定，以替换"ai.abcpen.com" ; 支持自定义绑定时，需要提供该域名的ssl证书。**

#### key

* 使用之前，请向商务申请appKey和appSecret, 以正常服务请求。

#### 参数说明：

以HTTPS POST(x-www-form-urlencoded)请求发送

|  参数   | 说明                                                         | 是否必须 |
| :-----: | :----------------------------------------------------------- | -------- |
|  spkid  | TTS 发音人标识音源 id 0-6,实际可用范围根据情况, 可以不设置,默认是 0; 其中0：女声（柔和）；1，女声（正式）；2，女生（柔和带正式）；3：男声（柔和），4：男声（柔和带正式）；5：男声（闽南话）；6：女生（闽南话）。 | 否       |
| samples | 采样率 8000 ,16000, 22000, 480000, 可以不设置,默认 是 8000   | 否       |
| is_mp3  | 1, 表示是MP3文件； 0表示是wav文件                            | 否       |
|  speed  | 语速 0.75-1.25 可以不设置,默认是 1.0                         | 否       |
| volume  | 音量 0.75-1.25 可以不设置,默认是 1.0                         | 否       |
| content | UTF8 编码的文本内容                                          | 是       |

#### 返回参数说明

```javascript
{ "message":"xxx",	
"code":"0",
“result": {”audioUrl":"https://ai.abcpen.com/xxx" 
         }
}
```

* 其中**audioUrl**是合成后的声音文件，自定义域名时返回的url链接包含自定义域名

### 示例代码

####  NodeJs版本

```javascript
let rp = require('request-promise');
const crypto = require('crypto');

function verifySha256Sign(appKey, timestamp, appSecret) {
    let combined = appKey + timestamp;
    let hashStr = crypto.createHmac('sha256', appSecret).update(combined).digest("hex");
    
    return hashStr.toLowerCase();
};

async function ttsZmeet(content, spkid, appKey, timestamp, sign) {
    let resTts = {
        message: "",
        code: "",
        urlTts: ""
    };

    let bodyRes, jsonData;
    let options;
    {
        jsonData = {
            spkid: spkid,
            content: content
        };
        options = {
            method: 'POST',
            uri: 'https://ai.abcpen.com/api/tts',
            form: jsonData,
            headers:{
                "x-dev-id": appKey,
                "x-signature": sign,
                "x-request-send-timestamp": timestamp
            },
            timeout: 5000,
            forever: true
        }
    }
    try {
        let ts = Date.now();
        bodyRes = await rp(options);
        console.info("tts --------------------------------->", content, bodyRes, typeof bodyRes, ", Duration: ", (Date.now() - ts) + "ms");
        if (typeof bodyRes != 'object') {
            console.log("not object, use JSON.parse", bodyRes);
            bodyRes = JSON.parse(bodyRes);
            console.log("after parse: ", bodyRes);

        }
    } catch (err) {
        console.log("tts request error: ", err);
        return resTts;
    }
    return bodyRes;
};

(async () => {
    let appKey = "xxxxx"; //请向商务申请
    let appSecret = "xxxxx";

    let timestamp = Date.now()/1000 + "";
    let sign = verifySha256Sign(appKey, timestamp, appSecret);
    console.log("sign sha256 is: ", sign);
    let tts2 = await ttsZmeet("2022年海南省普通高考普通类考生成绩分布表显示，900分的考生全海南省一共3名。25日，男孩母亲回应称，得知成绩时自己很开心，清华北大两所高校都已取得联系，孩子目前有些迷茫，暂未作出决定，打算先选好专业",
        0, appKey, timestamp, sign);
    console.log("tts2: ", tts2);

})();
```



*Java, C++, Rust, c#等示例代码即将提供*



## 语音合成多音字自定义

### 简介

汉字的多音字，每个客户根据自己的appKey可实现自定义增删查改；增加进去的词库，下次遇到同样的词组或句子，可以发自己定义的音调。具体文档如下

### 增加多音字API

#### url

**`https://ai.abcpen.com/api/ttspoly/create`**

**域名支持自定义绑定，以替换"ai.abcpen.com" ; 支持自定义绑定时，需要提供该域名的ssl证书。**

#### key

* 使用之前，请向商务申请appKey和appSecret, 以正常服务请求。

#### 参数说明

以HTTPS POST(x-www-form-urlencoded)请求发送

POST的body为类似如下的内容（下面是创建2个词组，分别是“还钱”和“还款”）

```
INSERT|还钱|huan2 qian2
INSERT|还款|huan2 kuan3
```



#### 返回参数说明

返回参数实例：

```javascript
{"result":"INSERT|干垃圾|gan4 la1 ji1","errCode":"0","wavfile":""}
```


### 更新多音字
#### url

**`https://ai.abcpen.com/api/ttspoly/update`**

**域名支持自定义绑定，以替换"ai.abcpen.com" ; 支持自定义绑定时，需要提供该域名的ssl证书。**

#### key

* 使用之前，请向商务申请appKey和appSecret, 以正常服务请求。

#### 参数说明

以HTTPS POST(x-www-form-urlencoded)请求发送

POST的body为类似如下的内容（下面是创建2个词组，分别是“还钱”和“还款”）

```
UPDATE|还钱|huan2 qian2
UPDATE|服务器|fu2 wu3 qi2
```

#### 返回参数

返回参数实际举例

```
{"result":"UPDATE|干垃圾|gan4 la1 jiX","errCode":"0","wavfile":""}
```



### 查询多音字

#### url

**`https://ai.abcpen.com/api/ttspoly/get`**

**域名支持自定义绑定，以替换"ai.abcpen.com" ; 支持自定义绑定时，需要提供该域名的ssl证书。**

#### key

* 使用之前，请向商务申请appKey和appSecret, 以正常服务请求。

#### 参数说明：

以HTTPS POST(x-www-form-urlencoded)请求发送

POST的body为类似如下的内容（下面是创建2个词组，分别是“还钱”和“还款”）

```
CHECK|干垃圾
UPDATE|服务器|fu2 wu3 qi2
```

### 返回参数

返回参数实例

```
{"result":"CHECK|干垃圾|gan4 la1 ji1","errCode":"0","wavfile":""}
```



### 删除多音字

#### url

**`https://ai.abcpen.com/api/ttspoly/delete`**

**域名支持自定义绑定，以替换"ai.abcpen.com" ; 支持自定义绑定时，需要提供该域名的ssl证书。**

#### key

* 使用之前，请向商务申请appKey和appSecret, 以正常服务请求。

#### 参数说明

以HTTPS POST(x-www-form-urlencoded)请求发送

POST的body为类似如下的内容（下面是创建2个词组，分别是“还钱”和“还款”）

```
DELETE|还钱|huan2 qian2
```

 返回参数

返回参数实际举例

```
{"result":"DELETE|干垃圾","errCode":"0","wavfile":""}
```

