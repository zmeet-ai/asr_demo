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
客户首先需要与商务沟通，获得DevId和DevKey：

DevId

唯一的用户ID， 举例 "zmeet"；一般俗称为 application key

DevKey

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
| 2        | x-signature              | string   | 是           | 数字签名，HmacSHA256(x-dev-id + x-request-send-timestamp),用DevKey加密;32小写 |
| 3        | x-dev-id                 | string   | 是           | 由服务方为接入方提供的devId, 一般俗称为app key               |

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
| samples | 采样率 8000 或者 16000 可以不设置,默认 是 8000               | 否       |
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



## 长语音识别



## 实时语音识别



## 语音内容实时监管



## 文字识别





## 多国语言翻译




## 语音降噪

* 语音降噪有本地sdk和云端api实时处理和离线处理，本篇文档介绍了本地sdk的处理。语音输入格式是16KHz，32-bit float type，单声道。采用别的格式如48Khz等需要resample。
具体demo展示可下载jump windows端软件体验（jump windows处理单声道，立体声道，八通道都可以，16khz，48khz等也可以）。
* 语音降噪目前在cpu上运行（云端具备全格式cpu和gpu混合运算，全采用格式支持；支持实时处理和离线计算）。
* 语音降噪具体分类
  * 去除环境的各种噪声
  * 去除回声
  * 语音修复和语音增强


### 处理噪声的种类，下面列举部分处理的声音种类

* 金属声

* 婴儿啼哭

* 交流电噪声

* 电脑噪音

* 嘈杂声/人群噪音

* 背景的窃窃私语或喋喋不休噪声

* 键盘声音

* 鼠标点击的声音

* 风扇噪音

* 汽车喇叭声

* 鼓掌

* 出钢

* 家具移动的声音

* 玻璃破碎的声音

* 交通噪音

* 火车声音

* 吸尘器的声音

* 洗衣机发出的噪声

* 包装（塑料/非塑料沙沙声）

* 水龙头/自来水

* 烹饪声音（切割、烹饪等）

* 建筑工地的声音

* 雨

* 宠物的声音

* 鼓

* 关门

* 鸟鸣

* 电话铃声

* 手机铃声

### API

## 音频输入数据处理注意事项

* 输入16Khz，单声道，32-bit float type.

### 加载模型

void *create_audio_denoise_model();

参数

| 名称   | 描述                | 备注  |
|:---- |:----------------- |:--- |
| 入口参数 | 无                 |     |
| 返回参数 | 句柄，供处理语音数据和退出模型使用 |     |

### 退出模型

void destroy_audio_denoise_model(void *model);

参数

| 名称   | 描述                      | 备注  |
|:---- |:----------------------- |:--- |
| 入口参数 | 降噪句柄，create_audio_denoise_model返回                    |     |
| 返回参数 | bool，true销毁成功，false销毁失败 |     |

### 实时语音增强

void deep_process_audio_denoise_frame(void *model, bool *status, float **result, const float *audio);

* 说明
  语音16KHz采样频率，属于的sample数据是**300**个。
* 参数

| 名称   | 描述                                              | 备注  |
|:---- |:----------------------------------------------- |:--- |
| 入口参数 | model, 降噪句柄,create_audio_denoise_model函数返回                                     |     |
| 入口参数 | status，该段chunk数据处理结果，true表示该段数据处理成功，false表示处理失败 |     |
| 入口参数 | result，语音处理结果数据                                 |     |
| 入口参数 | audio，语音输入chunk数据                               |     |
| 返回参数 | 无                                               | 无   |


## 视频抠图
* 视频抠图涵盖图像抠图和针对视频帧的实时抠图，分远端抠图和本地sdk抠图。本地sdk抠图，根据机器配置的不同，引擎自动发现硬件能力，采用最适合的模型做运算。
要达到较好的效果，建议采用Nvidia显卡 Rtx 3050及以上配置运行sdk。当然，集成显卡也可以使用，但精度略微有所降低。处理速度上，在配置有显卡的机器，单帧
图像处理时间是10ms左右，在慢速机器（如intel i5 4760）一般在20ms。
* 视频实时抠图可在cpu，gpu或者混合运算。

### API

### 加载模型

void	*	create_video_mask_model(int nColorFmt, int type);
* 加载模型时，内部对机器环境做实时性能评估（分独立gpu和无独立gpu），最终自动选择适合该机运行的模型（针对gpu我们会warm gpu，这样在正式运行时会快）。

参数

| 名称   | 描述                | 备注  |
|:---- |:----------------- |:--- |
| 入口参数 | nColorFmt，24 or 32, 分别表示rgb或者rgba格式                 |     |
| 入口参数 | type, 选择模型类型，0：自动选择（优先选择gpu）；1：cpu，2：gpu，3：cpu和gpu并行计算                    |     |
| 返回参数 | 句柄，供处理视频数据和退出模型使用 |     |

### 退出模型

void		destroy_video_mask_model(void * model);

参数

| 名称   | 描述                      | 备注  |
|:---- |:----------------------- |:--- |
| 入口参数 | model：视频抠图句柄，create_video_mask_model返回                    |     |
| 返回参数 | bool，true销毁成功，false销毁失败 |     |

### 实时抠图

bool deep_process_video_mask_frame(void * model, void* pFrame, int nWidth, int nHeight, int nStride, void * pMask,int nMaskStride);

* 说明
  返回的是mask图像格式，客户端根据mask格式做重绘。
* 参数

| 名称   | 描述                                              | 备注  |
|:---- |:----------------------------------------------- |:--- |
| 入口参数 | model, create_video_mask_model返回的句柄                                     |     |
| 入口参数 | 要处理的视频帧，颜色格式符合create_videomask_model中传的格式 |     |
| 入口参数 | nWidth：该帧视频的宽度                                |     |
| 入口参数 | nHeight：该帧视频的高度                               |     |
| 入口参数 | nStride：该帧视频每行占用的内存byte数，为了内存对齐，可能会比nWidth要大                               |     |
| 入口参数 | pMask：抠图后的mask放到该内存中，宽高同视频宽高                               |     |
| 入口参数 | nMaskStride：该mask每行占用的内存byte数，为了内存对齐，可能会比nWidth要大                               |     |
| 返回参数 | true, 表示成功处理该帧，false，表示处理失败                                               | 无   |
