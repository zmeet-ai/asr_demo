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
| 请求地址         | http[s]: //ai.abcpen.com/api/xxx *注：服务器IP不固定，为保证您的接口稳定，请勿通过指定IP的方式调用接口，使用域名方式调用* |
| 请求方式         | POST                                                         |
| 接口鉴权         | 签名机制，详见下方[2、文件分片上传接口]                      |
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
| SLA保障时长      | 返回时长最大不超过5小时，赔偿标准等详情请参考[SLA协议](https://api.abcpen.com/doc/policy/SLA.html) |

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#接口调用流程)接口调用流程

转写 API 包括以下接口： 预处理、 文件分片上传、 合并文件、 查询处理进度、 获取结果。

- 预处理 **/prepare**:
- 文件分片上传 **/upload**:
- 合并文件 **/merge**:
- 查询处理进度 **/getProgress**:
- 获取结果 **/getResult**:

![转写流程图](https://api.abcpen.com/doc/old_imges/rest_api_images/raasr/%E8%BD%AC%E5%86%99%E6%B5%81%E7%A8%8B%E5%9B%BE.jpg)

通用返回说明：

| 参数    | 类型   | 说明                                                         |
| :------ | :----- | :----------------------------------------------------------- |
| ok      | int    | 调用成功标志（0：成功，-1：失败）                            |
| err_no  | int    | 错误码，详见附录[错误码](https://api.abcpen.com/doc/asr/lfasr/API.html#错误码) |
| failed  | string | 错误描述（null：未出错）                                     |
| data    | string | 数据，具体含义见各接口返回说明（null：无返回值）             |
| task_id | string | 任务id，此字段只在主动回调的结果中存在                       |

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_1、预处理接口)1、预处理接口

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#概述)概述

```txt
	首先调用预处理接口，上传待转写音频文件的基本信息（文件名、大小）和分片信息（建议分片大小设置为10M，若无需分片，slice_num=1）和相关的可配置参数。
	调用成功，返回任务ID（task_id，转写任务的唯一标识），是后续接口的必传参数。
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#url)URL

```http
	POST  http[s]://ai.abcpen.com/api/prepare
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
| file_len         | string | 是   | 文件大小（单位：字节）                                       | 160044                                                       |
| file_name        | string | 是   | 文件名称（带后缀）                                           | lfasr_audio.wav                                              |
| slice_num        | int    | 是   | 文件分片数目（建议分片大小为10M，若文件<10M，则slice_num=1） | 1                                                            |
| lfasr_type       | string | 否   | 转写类型，默认 0 0: (标准版，格式: wav,flac,opus,mp3,m4a) 2: (电话版，已取消) | 0                                                            |
| has_participle   | string | 否   | 转写结果是否包含分词信息                                     | false或true， 默认false                                      |
| max_alternatives | string | 否   | 转写结果中最大的候选词个数                                   | 默认：0，最大不超过5                                         |
| eng_vad_margin   | int    | 否   | 首尾是否带静音信息，不带静音信息可以使得词相对于本句子的起始帧更精确 0：不显示 1：显示 | 默认为 1，带静音信息                                         |
| has_smooth       | string | 否   | 开启或关闭顺滑词（目前只有中文、英文支持顺滑词，其他方言和小语种暂不支持顺滑词，也不支持顺滑词的关闭） 开启：true 关闭：false | 默认：true（开启顺滑词）                                     |
| track_mode       | string | 否   | 声道分轨转写模式，可选值：1，2 1: 表示不分轨 2: 表示分轨 *注*：此功能适用于双声道音频发音人分离场景，要求双声道音频每个声道是独立发音人，开启该功能后，参数speaker_number失效 | 默认：1（适用通话时两个人对话的场景）                        |
| speaker_number   | string | 否   | 发音人个数，可选值：0-10，0表示盲分 *注*：发音人分离目前还是测试效果达不到商用标准，如测试无法满足您的需求，请慎用该功能。 | 默认：2（适用通话时两个人对话的场景）                        |
| has_seperate     | string | 否   | 转写结果中是否包含发音人分离信息                             | false或true，默认为false                                     |
| role_type        | string | 否   | 支持参数如下 1: 通用角色分离                                 | 该字段只有在开通了角色分离功能的前提下才会生效，正确传入该参数后角色分离效果会有所提升。 如果该字段不传，默认采用 1 类型 |
| language         | string | 否   | 语种 cn:中英文&中文（默认） en:英文（英文不支持热词） 其他小语种：可到控制台-语音转写-方言/语种处添加试用或购买，添加后会显示该小语种参数值。若未授权，使用将会报错26607。 | cn                                                           |
| eng_rlang        | string | 否   | 控制广东话（粤语）返回的文本结果为繁体还是简体 简体：0 繁体：1 | 默认：1（返回繁体文本）                                      |
| pd               | string | 否   | 垂直领域个性化参数: 法院: court 教育: edu 金融: finance 医疗: medical 科技: tech 体育: sport 政府: gov 游戏: game 电商: ecom 汽车: car | 设置示例：prepareParam.put("pd", "edu") pd为非必须设置参数，不设置参数默认为通用 |
| hotWord          | string | 否   | 会话级热词（**使用此参数后appid对应控制台热词不生效**）用以提升专业词汇的识别率，注意点如下： 1、单个热词设置：热词 2、多个热词设置：热词1\|热词2\|热词3 3、单个热词长度不得大于16 4、热词个数限制200个 | 设置示例 1、prepareParam.put("hotWord", "梁育生") 2、prepareParam.put("hotWord", "梁育生\|开心") |

*注：*

```txt
	标准版和电话版本的已经合并，现在购买的都是标准版的订单，lfasr_type传0即可；
	发音人分离可通过"has_seperate=true"和"speaker_number=个数"来配置。
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值)返回值

成功

```json
{
    "ok":0,
    "err_no":0,
    "failed":null,
    "data":"383e72a47557490aa05a344074117a9d"
}
```

失败

```json
{
    "ok":-1,
    "err_no":26601,
    "failed":"非法应用信息",
    "data":null
}
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#结果说明)结果说明

调用成功，data即为taskId（任务ID），是后续接口的必传参数。

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_2、文件分片上传接口)2、文件分片上传接口

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#概述-2)概述

```txt
	预处理成功，调用文件上传接口；
	按预处理设置的分片信息（slice_num）依次上传音频切片（文件以二进制方式读取上传），直到全部切片上传成功（如预处理时 slice_num=2，则需将音频切分成两部分，slice_id=aaaaaaaaaa和aaaaaaaaab，并按顺序调用该接口）；
	上一切片成功上传，才可进行下一切片的上传操作。调用过程中若出现异常，可重试若干次。
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#url-2)url

```http
	POST  http[s]://ai.abcpen.com/api/upload
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#请求头-2)请求头

```http
	Content-Type: multipart/form-data;
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#参数说明-2)参数说明

| 参数     | 类型     | 必须 | 说明                       | 示例                             |
| :------- | :------- | :--- | :------------------------- | :------------------------------- |
| app_id   | string   | 是   | 笔声开放平台应用ID         | 595f23df                         |
| signa    | string   | 是   | 加密数字签名，详见下方     | BFQEcN3SgZNC4eECvq0LFUPVHvI=     |
| ts       | string   | 是   | 时间戳                     | 1512041814                       |
| task_id  | string   | 是   | 任务ID（预处理接口返回值） | 4b705edda27a4140b31b462df0033cfa |
| slice_id | string   | 是   | 分片序号                   | aaaaaaaaaa，aaaaaaaaab           |
| content  | 字节数组 | 是   | 分片文件内容               |                                  |

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

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值-2)返回值

成功

```json
{
    "ok":0,
    "err_no":0,
    "failed":null,
    "data":null
}
```

失败

```json
{
    "ok":-1,
    "err_no":26602,
    "failed":"任务ID不存在",
    "data":null
}
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#slice-id生成代码-python-示例)slice_id生成代码(python)示例

```python
class SliceIdGenerator:
    """slice id生成器"""
    def __init__(self):
        self.__ch = 'aaaaaaaaa`'

    def getNextSliceId(self):
        ch = self.__ch
        j = len(ch) - 1
        while j >= 0:
            cj = ch[j]
            if cj != 'z':
                ch = ch[:j] + chr(ord(cj) + 1) + ch[j+1:]
                break
            else:
                ch = ch[:j] + 'a' + ch[j+1:]
                j = j -1
        self.__ch = ch
        return self.__ch
```

注：每个转写任务上传开始前创建一个SliceIdGenerator，根据分片的顺序依次调用getNextSliceId生成对应的slice_id

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_3、合并文件接口)3、合并文件接口

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#概述-3)概述

```txt
	全部文件切片上传成功后，调用该接口，通知服务端进行文件合并与转写操作。
	该接口不会返回转写结果，而是通知服务端将任务列入转写计划。转写的结果通过 getResult 接口获取。
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#url-3)url

```http
	POST  http[s]://ai.abcpen.com/api/merge
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#请求头-3)请求头

```http
	Content-Type: application/x-www-form-urlencoded; charset=UTF-8
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#参数说明-3)参数说明

| 参数    | 类型   | 必须 | 说明                       | 示例                             |
| :------ | :----- | :--- | :------------------------- | :------------------------------- |
| app_id  | string | 是   | 笔声开放平台应用ID         | 595f23df                         |
| signa   | string | 是   | 加密数字签名               | BFQEcN3SgZNC4eECvq0LFUPVHvI=     |
| ts      | string | 是   | 时间戳                     | 1512041814                       |
| task_id | string | 是   | 任务ID（预处理接口返回值） | 4b705edda27a4140b31b462df0033cfa |

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值-3)返回值

成功

```json
{
    "ok":0,
    "err_no":0,
    "failed":null,
    "data":null
}
```

失败

```json
{
    "ok":-1,
    "err_no":26602,
    "failed":"任务ID不存在",
    "data":null
}
```

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_4、查询处理进度接口)4、查询处理进度接口

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#概述-4)概述

```txt
	在调用方发出合并文件请求后，服务端已将任务列入计划。在获取结果前，调用方需轮询该接口查询任务当前状态。
	当且仅当任务状态=9（转写结果上传完成），才可调用获取结果接口获取转写结果。
	轮询策略由调用方决定，建议每隔10分钟轮询一次。状态码说明见附录。
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#url-4)url

```http
	POST  http[s]://ai.abcpen.com/api/getProgress
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#请求头-4)请求头

```http
	Content-Type: application/x-www-form-urlencoded; charset=UTF-8
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#参数说明-4)参数说明

| 参数    | 类型   | 必须 | 说明                       | 示例                             |
| :------ | :----- | :--- | :------------------------- | :------------------------------- |
| app_id  | string | 是   | 笔声开放平台应用ID         | 595f23df                         |
| signa   | string | 是   | 加密数字签名               | BFQEcN3SgZNC4eECvq0LFUPVHvI=     |
| ts      | string | 是   | 时间戳                     | 1512041814                       |
| task_id | string | 是   | 任务ID（预处理接口返回值） | 4b705edda27a4140b31b462df0033cfa |

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值-4)返回值

成功

```json
{
    "ok":0,
    "err_no":0,
    "failed":null,
    "data":"{\"desc\":\"任务创建成功\",\"status\":0}"
}
```

失败

```json
{
    "ok":-1,
    "err_no":26640,
    "failed":"文件上传失败",
    "data":null
}
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#处理流程)处理流程

![转写-查询处理进度流程图](https://api.abcpen.com/doc/old_imges/rest_api_images/raasr/%E6%9F%A5%E8%AF%A2%E5%A4%84%E7%90%86%E8%BF%9B%E5%BA%A6%E6%B5%81%E7%A8%8B%E5%9B%BE.jpg)

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#_5、获取结果接口)5、获取结果接口

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#概述-5)概述

```txt
	当任务处理进度状态=9（见查询处理进度接口），调用该接口获取转写结果。这是转写流程的最后一步。
	转写结果各字段的详细说明见转写结果说明文档。
	服务端也支持主动回调，转写完成之后主动发送转写结果到用户配置的回调地址，配置回调地址请联系技术支持。
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#url-5)url

```http
	POST  http[s]://ai.abcpen.com/api/getResult
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#请求头-5)请求头

```http
	Content-Type: application/x-www-form-urlencoded; charset=UTF-8
```

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#参数说明-5)参数说明

| 参数    | 类型   | 必须 | 说明                       | 示例                             |
| :------ | :----- | :--- | :------------------------- | :------------------------------- |
| app_id  | string | 是   | 笔声开放平台应用ID         | 595f23df                         |
| signa   | string | 是   | 加密数字签名               | BFQEcN3SgZNC4eECvq0LFUPVHvI=     |
| ts      | string | 是   | 时间戳                     | 1512041814                       |
| task_id | string | 是   | 任务ID（预处理接口返回值） | 4b705edda27a4140b31b462df0033cfa |

#### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#返回值-5)返回值

成功

```json
{
    "ok":0,
    "err_no":0,
    "failed":null,
    "data":"[{\"bg\":\"0\",\"ed\":\"4950\",\"onebest\":\"笔声是中国的智能语音技术提供商。\",\"speaker\":\"0\"}]"
}
```

失败

```json
{
    "ok":-1,
    "err_no":26601,
    "failed":"非法应用信息",
    "data":null
}
```

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#附录)附录

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

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#错误码)错误码

| 错误码 | 错误码描述                                                   |
| :----- | :----------------------------------------------------------- |
| 0      | 成功                                                         |
| 26000  | 转写内部通用错误                                             |
| 26100  | 转写配置文件错误                                             |
| 26101  | 转写配置文件app_id/secret_key为空                            |
| 26102  | 转写配置文件lfasr_host错误                                   |
| 26103  | 转写配置文件file_piece_size错误                              |
| 26104  | 转写配置文件file_piece_size建议设置10M-30M之间               |
| 26105  | 转写配置文件store_path错误，或目录不可读写                   |
| 26201  | 转写参数上传文件不能为空或文件不存在                         |
| 26202  | 转写参数类型不能为空                                         |
| 26203  | 转写参数客户端生成签名错误                                   |
| 26301  | 转写断点续传持久化文件读写错误                               |
| 26302  | 转写断点续传文件夹读写错误                                   |
| 26303  | 转写恢复断点续传流程错误,请见日志                            |
| 26401  | 转写上传文件路径错误                                         |
| 26402  | 转写上传文件类型不支持错误                                   |
| 26403  | 转写本地文件上传超过限定大小500M                             |
| 26404  | 转写上传文件读取错误                                         |
| 26500  | HTTP请求失败                                                 |
| 26501  | 转写获取版本号接口错误                                       |
| 26502  | 转写预处理接口错误                                           |
| 26503  | 转写上传文件接口错误                                         |
| 26504  | 转写合并文件接口错误                                         |
| 26505  | 转写获取进度接口错误                                         |
| 26506  | 转写获取结果接口错误                                         |
| 26600  | 转写业务通用错误                                             |
| 26601  | 非法应用信息                                                 |
| 26602  | 任务ID不存在                                                 |
| 26603  | 接口访问频率受限（默认1秒内不得超过20次）                    |
| 26604  | 获取结果次数超过限制，最多100次                              |
| 26605  | 任务正在处理中，请稍后重试                                   |
| 26606  | 空音频，请检查                                               |
| 26610  | 请求参数错误                                                 |
| 26621  | 预处理文件大小受限（500M）                                   |
| 26622  | 预处理音频时长受限（5小时）                                  |
| 26623  | 预处理音频格式受限                                           |
| 26625  | 预处理服务时长不足。您剩余的可用服务时长不足，请移步产品页http://www.xfyun.cn/services/lfasr 进行购买或者免费领取 |
| 26631  | 音频文件大小受限（500M）                                     |
| 26632  | 音频时长受限（5小时）                                        |
| 26633  | 音频服务时长不足。您剩余的可用服务时长不足，请移步产品页http://www.xfyun.cn/services/lfasr 进行购买或者免费领 |
| 26634  | 文件下载失败                                                 |
| 26635  | 文件长度校验失败                                             |
| 26640  | 文件上传失败                                                 |
| 26641  | 上传分片超过限制                                             |
| 26642  | 分片合并失败                                                 |
| 26643  | 计算音频时长失败,请检查您的音频是否加密或者损坏              |
| 26650  | 音频格式转换失败,请检查您的音频是否加密或者损坏              |
| 26660  | 计费计量失败                                                 |
| 26670  | 转写结果集解析失败                                           |
| 26680  | 引擎处理阶段错误                                             |
| 26607  | 转写语种未授权或已过有效期                                   |

### [#](https://api.abcpen.com/doc/asr/lfasr/API.html#任务状态码)任务状态码

| 状态ID | 状态描述         |
| :----- | :--------------- |
| 0      | 任务创建成功     |
| 1      | 音频上传完成     |
| 2      | 音频合并完成     |
| 3      | 音频转写中       |
| 4      | 转写结果处理中   |
| 5      | 转写完成         |
| 9      | 转写结果上传完成 |

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#调用示例)调用示例

*注: demo只是一个简单的调用示例，不适合直接放在复杂多变的生产环境使用*

[语音转写demo python3语言](https://xfyun-doc.cn-bj.ufileos.com/1564736425808301/weblfasr_python3_demo.zip)

[语音转写demo java语言](https://xfyun-doc.cn-bj.ufileos.com/1597712975873821/weblfasr_java_demo.zip)

[语音转写demo nodejs语言](https://xfyun-doc.cn-bj.ufileos.com/1620627546585218/weblfasr_nodejs_demo.zip)

[语音转写demo php语言](https://xfyun-doc.cn-bj.ufileos.com/1615866152559535/weblfasr_php_demo.zip)

笔声开放平台AI能力-JAVASDK: [Github地址](https://github.com/iFLYTEK-OP/websdk-java)

笔声开放平台AI能力-PHPSDK: [Github地址](https://github.com/iFLYTEK-OP/websdk-php)

## [#](https://api.abcpen.com/doc/asr/lfasr/API.html#教学视频)教学视频

[语音转写技术入门系列课](https://www.aidaxue.com/course/courseDetail?id=384&ch=WZsp384)

[语音转写WebAPI接口接入实战](https://www.aidaxue.com/course/courseDetail?id=516&ch=WZsp516)

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