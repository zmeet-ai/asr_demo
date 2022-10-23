
---
title: 长语音或离线语音文件语音识别
---

转写的是已录制音频（非实时），音频文件上传成功后进入等待队列，待转写成功后用户即可获取结果，返回结果时间受音频时长以及排队任务量的影响。 **如遇转写耗时比平时延长，大概率表示当前时间段出现转写高峰，请耐心等待即可**，我们承诺有效任务耗时最大不超过5小时。
另外，为使转写服务更加通畅，**请尽量转写5分钟以上的音频文件**，上传大量的短音频易引起网络和服务器资源紧张，从而导致任务排队积压。

该接口是通过REST API的方式给开发者提供一个通用的HTTP接口，基于该接口，开发者可以获取开放平台的语音转写能力，方便开发者使用自己熟悉的编程语言快速集成。

**音频时长与理论返回时间可以参考下表（请注意，实际返回时长受上传的音频时长和任务总量影响，忙时会出现任务排队情况）：**

| 音频时长X（分钟） | 参考返回时间Y（分钟） |
| ----------------- | --------------------- |
| X<10              | Y<3                   |
| 10<=X<30          | 3<=Y<6                |
| 30<=X<60          | 6<=Y<10               |
| 60<=X             | 10<=Y<20              |

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#接口demo)接口Demo

**示例demo**请点击 **[这里](https://api.abcpen.com/doc/asr/lfasr/API.html#调用示例)** 下载。
目前仅提供部分开发语言的demo，其他语言请参照下方接口文档进行开发。


## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#接口要求)接口要求

集成语音转写API时，需按照以下要求。

| 内容             | 说明                                                         |
| :--------------- | :----------------------------------------------------------- |
| 请求协议         | http[s]（为提高安全性，强烈推荐https）                       |
| 请求地址         | http[s]: //ai.abcpen.com/v1/asr/long *注：服务器IP不固定，为保证您的接口稳定，请勿通过指定IP的方式调用接口，使用域名方式调用* |
| 请求方式         | POST                                                         |
| 接口鉴权         | 签名机制，详见下方                                           |
| 字符编码         | UTF-8                                                        |
| 响应格式         | 统一采用JSON格式                                             |
| 开发语言         | 任意，只要可以向笔声云服务发起HTTP请求的均可                 |
| 音频属性         | 采样率16k或8k、位长8bit或16bit、单声道&多声道                |
| 音频格式         | wav/flac/opus/m4a/mp3                                        |
| 音频大小         | 不超过500M                                                   |
| 音频时长         | 不超过5小时，建议5分钟以上                                   |
| 语言种类         | 中文普通话、英文，小语种以及中文方言可以到控制台-语音转写-方言/语种处添加试用或购买 |
| 转写结果保存时长 | 30天                                                         |
| 获取结果次数     | 不得超过100次                                                |

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#接口调用流程)接口调用流程

#### 转写 API 包括以下接口

- 提交离线语音文件 **/v1/asr/long**, POST提交
- 获取结果 **/v1/asr/long**， GET请求

#### 通用返回说明：

| 参数    | 类型   | 说明                                                         |
| :------ | :----- | :----------------------------------------------------------- |
| code    | string | 调用成功标志（'0'：成功，'-1'：失败）                        |
| desc    | string | 错误描述，详见附录[错误码](https://api.abcpen.com/doc/asr/lfasr/API.html#错误码) |
| data    | string | 数据，具体含义见各接口返回说明或返回实例（null：无返回值）   |
| task_id | string | 任务id，此字段只在主动回调的结果中存在                       |

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#signa生成)signa生成

① 获取baseString

```txt
	baseString由appid和当前时间戳ts拼接而成；
	假如appid = 595f23df，ts = 1512041814，则baseString = 595f23df1512041814
```

② 对baseString进行MD5

```txt
	假如baseString为上一步生成的595f23df1512041814，MD5之后则为 0829d4012497c14a30e7e72aeebe565e
```

③ 以secret key为key对MD5之后的baseString进行HmacSHA1加密，然后再对加密后的字符串进行base64编码。

```txt
	假如secretkey = d9f4aa7ea6d94faca62cd88a28fd5234，
	MD5之后的baseString为上一步生成的0829d4012497c14a30e7e72aeebe565e，
	则HmacSHA1加密之后再进行base64编码得到的signa为： IrrzsJeOFk1NGfJHW6SkHUoN9CU=
```

备注：

- secretkey：接口密钥，在应用中添加语音转写服务后，显示在服务管理页面，请调用方注意保管；
- signa的生成公式：HmacSHA1(MD5(appid + ts)，secretkey)，具体的生成方法详见【[调用示例](https://api.abcpen.com/doc/asr/lfasr/API.html#调用示例)】；



### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_1、预处理接口)1、提交离线语音文件

```http
https://ai.abcpen.com/v1/asr/long
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#请求头)请求头

```http
	Content-Type: application/x-www-form-urlencoded; charset=UTF-8
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#参数说明)参数说明

| 参数             | 类型   | 必须 | 说明                                                         | 示例                                                         |
| :--------------- | :----- | :--- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| app_id           | string | 是   | 笔声开放平台应用ID                                           | 595f23df                                                     |
| signa            | string | 是   | 加密数字签名（基于HMACSHA1算法，可参考实时转写生成方式或页面下方demo） | BFQEcN3SgZNC4eECvq0LFUPVHvI=                                 |
| ts               | string | 是   | 当前时间戳，从1970年1月1日0点0分0秒开始到现在的秒数          | 1512041814                                                   |
| audio_url        | string | 是   | 要识别的离线语音文件Url                                      | http://125.77.202.194:53398/tts/202208/07/21/zmeet_475191860.wav |
| has_participle   | string | 否   | 转写结果是否包含分词信息                                     | false或true， 默认false                                      |
| max_alternatives | string | 否   | 转写结果中最大的候选词个数                                   | 默认：0，最大不超过5                                         |
| has_smooth       | string | 否   | 开启或关闭顺滑词（目前只有中文、英文支持顺滑词，其他方言和小语种暂不支持顺滑词，也不支持顺滑词的关闭） 开启：true 关闭：false | 默认：true（开启顺滑词）                                     |
| speaker_number   | string | 否   | 发音人个数，可选值：0-10，0表示盲分 *注*：发音人分离目前还是测试效果达不到商用标准，如测试无法满足您的需求，请慎用该功能。 | 默认：2（适用通话时两个人对话的场景）                        |
| language         | string | 否   | 语种 cn:中英文&中文（默认） en:英文（英文不支持热词） 其他小语种：可到控制台-语音转写-方言/语种处添加试用或购买，添加后会显示该小语种参数值。若未授权，使用将会报错26607。 | cn                                                           |
| eng_rlang        | string | 否   | 控制广东话（粤语）返回的文本结果为繁体还是简体 简体：0 繁体：1 | 默认：1（返回繁体文本）                                      |
| pd               | string | 否   | 垂直领域个性化参数: 法院: court 教育: edu 金融: finance 医疗: medical 科技: tech 体育: sport 政府: gov 游戏: game 电商: ecom 汽车: car | 设置示例：prepareParam.put("pd", "edu") pd为非必须设置参数，不设置参数默认为通用 |
| hotWord          | string | 否   | 会话级热词（**使用此参数后appid对应控制台热词不生效**）用以提升专业词汇的识别率，注意点如下： 1、单个热词设置：热词 2、多个热词设置：热词1\|热词2\|热词3 3、单个热词长度不得大于16 4、热词个数限制200个 | 设置示例 1、prepareParam.put("hotWord", "梁育生") 2、prepareParam.put("hotWord", "梁育生\|开心") |



#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值)返回值

成功

```json
{"code": "0", "data": {"task_id": "319df53dc0504c468474bf1c31f31a30"}, "desc": "success"}
```

失败

```json
{"code": "10105", "data": null, "desc": "illegal access"}
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#结果说明)结果说明

调用成功，task_id（任务ID），是后续接口的必传参数。


### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_5、获取结果接口)2、获取结果接口

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#概述-5)概述

```txt
	提交任务id（task_id）, 获取语音识别结果
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#url-5)url

```http
	GET  http[s]://ai.abcpen.com/v1/asr/long
```


#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#参数说明-5)参数说明

| 参数    | 类型   | 必须 | 说明                       | 示例                             |
| :------ | :----- | :--- | :------------------------- | :------------------------------- |
| app_id  | string | 是   | 笔声开放平台应用ID         | 595f23df                         |
| signa   | string | 是   | 加密数字签名               | BFQEcN3SgZNC4eECvq0LFUPVHvI=     |
| ts      | string | 是   | 时间戳                     | 1512041814                       |
| task_id | string | 是   | 任务ID（预处理接口返回值） | 4b705edda27a4140b31b462df0033cfa |

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值-5)返回值

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#转写结果字段说明)转写结果字段说明

| 字段名          | 说明                                                         |
| :-------------- | :----------------------------------------------------------- |
| bg              | 句子相对于本音频的起始时间，单位为ms                         |
| ed              | 句子相对于本音频的终止时间，单位为ms                         |
| onebest         | 句子内容                                                     |
| speaker         | 说话人编号，从1开始，未开启说话人分离时speaker都为0          |
| si              | 句子标识，相同si表示同一句话，从0开始 注：仅开启分词或者多候选时返回 |
| wordsResultList | 分词列表 注：仅开启分词或者多候选时返回                      |
| alternativeList | 多候选列表，按置信度排名 注：仅开启分词或者多候选时返回      |
| wordBg          | 词的起始帧，对于本句子的起始帧，其中一帧是10ms 注：仅开启分词或者多候选时返回 |
| wordEd          | 词的终止帧，对于本句子的起始帧，其中一帧是10ms 注：仅开启分词或者多候选时返回 |
| wordsName       | 词内容 注：仅开启分词或者多候选时返回                        |
| wc              | 句子置信度，范围为[0,1] 注：仅开启分词或者多候选时返回       |
| wp              | 词属性，n代表普通词，r代表人名，d代表数字，m代表量词，s代表顺滑词（语气词），t代表地名&多音字，p代表标点，g代表分段标识 注：仅开启分词或者多候选时返回 |

成功返回实例

```json
{'code': '0', 'data': {'data': {'speechResult': {'onebest': '2022年海南省普通高考普通类考生成绩分布表显示。', 'duration': 4679, 'detail': [{'sentences': '2022年海南省普通高考普通类考生成绩分布表显示。', 'wordBg': '160', 'wordEd': '4540', 'speakerId': '0', 'wordsResultList': [{'words': '2022年', 'speaker': 0, 'wordBg': '160', 'wordEd': '900', 'wp': '4'}, {'words': '海', 'speaker': 0, 'wordBg': '1040', 'wordEd': '1140', 'wp': '1'}, {'words': '南', 'speaker': 0, 'wordBg': '1240', 'wordEd': '1340', 'wp': '1'}, {'words': '省', 'speaker': 0, 'wordBg': '1440', 'wordEd': '1540', 'wp': '1'}, {'words': '普', 'speaker': 0, 'wordBg': '1680', 'wordEd': '1780', 'wp': '1'}, {'words': '通', 'speaker': 0, 'wordBg': '1840', 'wordEd': '1940', 'wp': '1'}, {'words': '高', 'speaker': 0, 'wordBg': '2000', 'wordEd': '2100', 'wp': '1'}, {'words': ' 考', 'speaker': 0, 'wordBg': '2200', 'wordEd': '2300', 'wp': '1'}, {'words': '普', 'speaker': 0, 'wordBg': '2400', 'wordEd': '2500', 'wp': '1'}, {'words': '通', 'speaker': 0, 'wordBg': '2600', 'wordEd': '2700', 'wp': '1'}, {'words': '类', 'speaker': 0, 'wordBg': '2760', 'wordEd': '2860', 'wp': '1'}, {'words': '考', 'speaker': 0, 'wordBg': '2960', 'wordEd': '3060', 'wp': '1'}, {'words': '生', 'speaker': 0, 'wordBg': '3160', 'wordEd': '3260', 'wp': '1'}, {'words': '成', 'speaker': 0, 'wordBg': '3400', 'wordEd': '3500', 'wp': '1'}, {'words': '绩', 'speaker': 0, 'wordBg': '3600', 'wordEd': '3700', 'wp': '1'}, {'words': '分', 'speaker': 0, 'wordBg': '3760', 'wordEd': '3860', 'wp': '1'}, {'words': '布', 'speaker': 0, 'wordBg': '3880', 'wordEd': '3980', 'wp': '1'}, {'words': '表', 'speaker': 0, 'wordBg': '4040', 'wordEd': '4140', 'wp': '1'}, {'words': '显', 'speaker': 0, 'wordBg': '4240', 'wordEd': '4340', 'wp': '1'}, {'words': '示', 'speaker': 0, 'wordBg': '4440', 'wordEd': '4540', 'wp': '1'}, {'words': '。', 'speaker': 0, 'wordBg': '4540', 'wordEd': '4540', 'wp': '2'}]}]}}, 'task_id': '319df53dc0504c468474bf1c31f31a30'}, 'desc': 'success'}
```

失败返回实例

```json
{
    "ok":"10105",
    "err_no":26601,
    "failed":"illegal access",
    "data":null
}
```

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#附录)附录

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#错误码)错误码


| 错误码 | 描述                    | 说明                  | 处理方式                              |
| :----- | :---------------------- | :-------------------- | :------------------------------------ |
| 0      | success                 | 成功                  |                                       |
| 10105  | illegal access          | 没有权限              | 检查apiKey，ip，ts等授权参数是否正确  |
| 10106  | invalid parameter       | 无效参数              | 上传必要的参数， 检查参数格式以及编码 |
| 10107  | illegal parameter       | 非法参数值            | 检查参数值是否超过范围或不符合要求    |
| 10110  | no license              | 无授权许可            | 检查参数值是否超过范围或不符合要求    |
| 10700  | engine error            | 引擎错误              | 提供接口返回值，向服务提供商反馈      |
| 10202  | websocket connect error | websocket连接错误     | 检查网络是否正常                      |
| 10204  | websocket write error   | 服务端websocket写错误 | 检查网络是否正常，向服务提供商反馈    |
| 10205  | websocket read error    | 服务端websocket读错误 | 检查网络是否正常，向服务提供商反馈    |
| 16003  | basic component error   | 基础组件异常          | 重试或向服务提供商反馈                |
| 10800  | over max connect limit  | 超过授权的连接数      | 确认连接数是否超过授权的连接数        |

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#调用示例)调用示例

*注: demo只是一个简单的调用示例，不适合直接放在复杂多变的生产环境使用*

笔声开放平台AI能力-SDK: [Github地址](https://github.com/zmeet-ai/asr_demo)



## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#常见问题)常见问题

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#语音转写支持哪些音频格式)语音转写支持哪些音频格式？

> 答：目前语音转写支持的音频格式为：已录制音频（5小时内），wav,flac,opus,m4a,mp3，单声道&多声道，支持语种：中文普通话、英语、开通的小语种以及中文方言，采样率：8KHz,16KHz

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#语音转写支不支持并发)语音转写支不支持并发？

> 答：支持，要保证同一个appid每秒请求接口次数最大值在20次以下。

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#语音转写可以试用吗)语音转写可以试用吗？

> 答：可以领取新用户礼包，根据您认证的程度，提供最多50小时的免费时长，有效期为一年。

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#语音转写支持什么语言)语音转写支持什么语言？

> 答：支持语种：中文普通话、英语，小语种以及中文方言可以到控制台-语音转写-方言/语种处添加试用或购买；设置方式参考上述语言参数切换即可

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#语音转写的套餐扣费顺序是怎样的)语音转写的套餐扣费顺序是怎样的？

> 答：扣量优先级：免费试用＞批量购买，即在“批量购买”的套餐额度剩余的情况下，又领取了免费试用的体验包，则领取的免费试用体验包立即生效，并被设定为当前扣量套餐。而之前购买的套餐包的额度和到期日不变。