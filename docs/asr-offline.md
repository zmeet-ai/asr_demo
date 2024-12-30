## 录音文件识别请求

### zmeet语音识别优势

- **业界领先的声纹识别，返回结果字段中精准识别说话人ID**
- **优秀的人声分离算法，可从人的对话从嘈杂的背景噪音中分离出清晰的人声对话**
- **业界领先的降噪算法，返回的音视频文件，可包含降噪后的清晰语音**
- **业界领先的高精准中英文等语音识别算法**
- 支持超过100个国家语言的实时同声传译，同步输出和客户母语对应的实时同传翻译文本和语音合成数据
- 语音识别支持如下类型
  - asr: 只做语音识别
  - asr_sd: 语音识别+说话人区分
  - asr_sd_id: 语音识别+说话人区分+说话人识别（说话人识别目前可单独调用，合并后的算法目前文档没更新）
  - audio_separate: 人声分离
  - audio_separate_asr: 语音识别+说话人区分
  - audio_separate_asr_sd: 语音识别+说话人区分+人声分离
  - audio_separate_asr_sd_id（说话人识别目前可单独调用，合并后的算法目前文档没更新）


### 1. 接口描述

接口请求域名： 
- 创建任务：https://asr-pre.abcpen.com:8443/asr-rec/v2/long/create
- 查询任务：https://asr-pre.abcpen.com:8443/asr-rec/v2/long/query
- 本接口可对较长的录音文件进行识别。
- 接口默认限频：20次/秒。此处仅限制任务提交频次，与识别结果返回时效无关
- 返回时效：异步回调，非实时返回。最长3小时返回识别结果，**大多数情况下，1小时的音频1-3分钟即可完成识别**。请注意：上述返回时长不含音频下载时延，且30分钟内发送超过1000小时录音或2万条任务的情况除外
- 媒体文件格式：**支持几乎所有音视频文件格式**，如mp4, avi, mkv, mov, wmv, flv, webm, mpeg, mpg, h264, hevc, wav、mp3、m4a、flv、mp4、wma、3gp、amr、aac、ogg-opus、flac
- 支持语言：[支持100种国家语言](https://github.com/zmeet-ai/asr-sdk-v2/blob/main/docs/country_code.md)
-  音频提交方式：本接口支持**音频 URL**。推荐使用[阿里云对象存储OSS](https://www.aliyun.com/product/oss?spm=5176.28508143.J_4VYgf18xNlTAyFFbOuOQe.60.e939154aMOdAFn) 、[亚马逊S3](about:blank)和 [腾讯云COS](https://cloud.tencent.com/document/product/436/38484) 等对象存储来存储、生成URL并提交任务，存储桶权限需要设置公有读私有写，或URL设置外部可访问
-  音频限制：音频 URL 时长不能大于5小时，文件大小不超过1GB；本地音频文件不能大于5MB
-  如何获取识别结果：支持**回调或轮询**的方式获取结果，具体请参考 [录音文件识别结果查询](https://cloud.tencent.com/document/product/1093/37822)
-  识别结果有效时间：在服务端保存7天
-  签名方法参考 [公共参数](https://github.com/zmeet-ai/asr-sdk-v2/blob/main/docs/signature.md) 中签名方法

默认接口请求频率限制：20次/秒。

* 备注-下面2个接口是目前版本的加速版本
    * 接口请求域名： 
    - 创建任务：https://asr-pre.abcpen.com:8443/asr-rec/v1/long/create
    	- 接口说明
            - 必传参数： 验证信息和v2接口相似
            - 必传参数：audio_url, 音频文件的url
            - 采用mutpart form提交数据
            - 返回task_id, 用作下个接口的查询任务结果 
    
    - 查询任务：https://asr-pre.abcpen.com:8443/asr-rec/v1/long/query
    	- 接口说明
            - 必传参数： 验证信息和v2接口相似
            - 必传参数：task_id (创建任务的返回结果)
            - 采用json方式提交。
            - 返回结果同v2接口
            - 返回“code"为“0”，表示识别完毕；"code"为“100”表示识别中，"code"为“-1”表示识别失败
    * 注意点
        * 只接受音频文件做识别，识别速度相比v2版本速度提升4倍以上
        * 返回接口类似v2接口	


### 2. 输入参数

以下请求参数列表仅列出了接口请求参数，完整公共参数列表见 [公共请求参数](https://github.com/zmeet-ai/asr-sdk-v2/blob/main/docs/signature.md)。

| 参数名称           | 必选 | 类型    | 描述                                                         | 默认值 |
| :----------------- | :--- | :------ | :----------------------------------------------------------- | ------ |
| pd              | 否   | String  | 通用: general <br/>法律: law <br/>教育: edu <br/>金融: finance <br/>医疗: medical <br/>科技: tech <br/>运营商: isp <br/>政府: gov <br/>电商: ecom <br/>军事: mil <br/>企业: com <br/>生活: life <br/>汽车: car<br/>游戏: game<br/>历史: history<br/>互联网: com<br/>娱乐: amuse<br/> | general |
| input_audio_url                | 是   | String  | 音频URL的地址（需要公网环境浏览器可下载） 注意： 1. 请确保录音文件时长在5个小时（含）之内，否则可能识别失败； 2. 请保证文件的下载速度，否则可能下载失败 示例值：https://audio.cos.ap-guangzhou.myqcloud.com/example.wav |        |
| callback_url        | 否   | String  | 回调 URL 用户自行搭建的用于接收识别结果的服务URL 回调格式和内容详见：[录音识别回调说明](https://cloud.tencent.com/document/product/1093/52632)  注意： 如果用户使用轮询方式获取识别结果，则无需提交该参数 |        |
| min_speaker_num      | 否   | Integer | 最小发言者数量 **需配合开启说话人分离使用，不开启无效**，取值范围：0-10 0：自动分离（最多分离出20个人）； 1-10：指定人数分离； 默认值为 0 示例值：0 | 0 |
| max_speaker_num      | 否   | Integer | 最大发言者数量 **需配合开启说话人分离使用，不开启无效**，取值范围：0-10 0：自动分离（最多分离出20个人）； 1-10：指定人数分离； 默认值为 0 示例值：0 | 0 |
| language        | 否   | String  | 语言 默认zh |    |
| words_output        | 否   | String  | 是否输出单词 false：不开启；true：开启    ||
| audio_type | 否 | String | asr: 只做语音识别 <br/>asr_sd: 语音识别+说话人区分 <br/>asr_sd_id: 语音识别+说话人区分+说话人识别 <br/>audio_separate: 人声分离 <br/>audio_separate_asr: 语音识别+说话人区分 <br/>audio_separate_asr_sd: 语音识别+说话人区分+人声分离 <br/>audio_separate_asr_sd_id: 语音识别+说话人区分+说话人识别+人声分离 |asr|

### 3. 输出参数

| 参数名称  | 类型                                                         | 描述                                                         |
| :-------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| data      | {"taskId": String} | 录音文件识别的请求返回结果，包含结果查询需要的TaskId         |
| msg | String                                                       | 接口状态信息 |
| code | String                                                       | 状态码：0为成功，-1未完成|

### 4. 示例

#### 输入示例
```python
"""
流程：
1. 创建离线识别任务
2. 根据taskId查询识别任务状态及结果
"""

# 创建离线识别任务
url_create = f"{baseUrl}/asr-rec/v2/long/create"
url_query = f"{baseUrl}/asr-rec/v2/long/query"

headers = {
    "X-App-Key": app_id,
    "X-App-Signature": signature,
    "X-Timestamp": ts,
    "Content-Type": "application/json"
}
json = {
    "sd": "true",
    "input_audio_url": "https://zos.abcpen.com/tts/zmeet/20221023/b6a2c7ac-52c8-11ed-961e-00155dc6cbed.mp3",
    "language": "zh"
}
response = requests.post(url_create, headers=headers, data=json)
response_json = json.loads(response.text)

# 查询任务
query_task_body = {"task_id": response_json["data"]["task_id"]}
query_response = requests.post(url_query, headers=headers, data=query_task_body)
```

#### 创建离线识别任务返回
```json
{
    "code": "0",
    "data": {
        "task_id": "f591ce70-900b-42c4-87ca-53a43dd31f52"
    },
    "msg": "success"
}
```

#### 查询识别任务返回
```json
{"asr":{"speechResult":{"onebest":"敦煌莫高窟的一幅壁画中描述了汉朝使节。张骞即将出使西域的场景。公元前一百三十八年，张骞率领一百多人组成的使团浩浩荡荡，从长安启程，这就是丝绸之路的开端。随着张骞出使西域一条以丝绸为主要货物的商路，从汉帝国的都城长安出发，经过河西走廊，越过被古代中国人称为聪岭的帕米尔高原，走向中亚西亚，直至地中海陕西博物馆昂首远眺的鎏金铜蚕，来自拜占庭帝国的金币，共同见证了古丝绸之路的繁华。古罗马作家普灵尼在博物志中写道，为了获得中国的丝绸，罗马每年的花费不少于一亿罗马金币。在当时一磅中国丝绸的最高价值相当于十二两黄金苏丹大客栈、土耳其境内现存的最大商队客栈，也是古丝绸之路进入欧洲前最重要的驿站。公元十三世纪，塞尔柱王朝为了保护丝路贸易，每隔三十至四十公里，就修建一间客栈。客栈为过往商队提供免费住宿三天，还为他们提供货物保险。一支支驼队将丝绸、瓷器、茶叶等送往西方，也为中国带来亚麻、胡椒、香料等物产，跟着稀奇物品奔走在商道上的，还有不同地域特色的记忆、音乐和文化。在唐代，这支乐队使用的乐器来自中原和西域等，他们演奏的是胡月赞美的，是他们身处的时代。","duration":178.0,"detail":[{"sentences":"敦煌莫高窟的一幅壁画中描述了汉朝使节。","wordBg":750,"wordEd":5250,"speaker_id":[0],"words":[{"words":"敦","start":750,"end":990},{"words":"煌","start":1010,"end":1230},{"words":"莫","start":1230,"end":1410},{"words":"高","start":1410,"end":1590},{"words":"窟","start":1590,"end":1830},{"words":"的","start":1830,"end":1910},{"words":"一","start":1910,"end":1990},{"words":"幅","start":1990,"end":2190},{"words":"壁","start":2190,"end":2330},{"words":"画","start":2330,"end":2570},{"words":"中","start":2570,"end":2955},{"words":"描","start":3870,"end":4090},{"words":"述","start":4090,"end":4250},{"words":"了","start":4250,"end":4390},{"words":"汉","start":4390,"end":4610},{"words":"朝","start":4610,"end":4850},{"words":"使","start":4850,"end":5070},{"words":"节","start":5070,"end":5250}]},{"sentences":"张骞即将出使西域的场景。","wordBg":5250,"wordEd":8875,"speaker_id":[0],"words":[{"words":"张","start":5250,"end":5470},{"words":"骞","start":5470,"end":5825},{"words":"即","start":6830,"end":7050},{"words":"将","start":7050,"end":7290},{"words":"出","start":7290,"end":7530},{"words":"使","start":7570,"end":7810},{"words":"西","start":7850,"end":8090},{"words":"域","start":8090,"end":8270},{"words":"的","start":8270,"end":8390},{"words":"场","start":8390,"end":8610},{"words":"景","start":8610,"end":8875}]},{"sentences":"公元前一百三十八年，","wordBg":8875,"wordEd":17135,"speaker_id":[0],"words":[{"words":"公","start":14920,"end":15100},{"words":"元","start":15100,"end":15320},{"words":"前","start":15320,"end":15560},{"words":"一","start":15860,"end":16040},{"words":"百","start":16040,"end":16280},{"words":"三","start":16280,"end":16440},{"words":"十","start":16440,"end":16600},{"words":"八","start":16600,"end":16780},{"words":"年","start":16780,"end":17135}]},{"sentences":"张骞率领一百多人组成的使团浩浩荡荡，","wordBg":17135,"wordEd":23550,"speaker_id":[0],"words":[{"words":"张","start":18440,"end":18640},{"words":"骞","start":18640,"end":18880},{"words":"率","start":18980,"end":19100},{"words":"领","start":19100,"end":19340},{"words":"一","start":19360,"end":19520},{"words":"百","start":19520,"end":19760},{"words":"多","start":19760,"end":19920},{"words":"人","start":19920,"end":20120},{"words":"组","start":20120,"end":20280},{"words":"成","start":20280,"end":20380},{"words":"的","start":20380,"end":20520},{"words":"使","start":20520,"end":20680},{"words":"团","start":20680,"end":21095},{"words":"浩","start":22530,"end":22770},{"words":"浩","start":22790,"end":23030},{"words":"荡","start":23110,"end":23310},{"words":"荡","start":23310,"end":23550}]},{"sentences":"从长安启程，","wordBg":23550,"wordEd":25455,"speaker_id":[0],"words":[{"words":"从","start":23870,"end":24110},{"words":"长","start":24250,"end":24490},{"words":"安","start":24490,"end":24730},{"words":"启","start":24770,"end":25010},{"words":"程","start":25010,"end":25455}]},{"sentences":"这就是丝绸之路的开端。","wordBg":25455,"wordEd":29555,"speaker_id":[0],"words":[{"words":"这","start":26940,"end":27100},{"words":"就","start":27100,"end":27280},{"words":"是","start":27280,"end":27520},{"words":"丝","start":27560,"end":27800},{"words":"绸","start":27860,"end":28100},{"words":"之","start":28220,"end":28440},{"words":"路","start":28440,"end":28620},{"words":"的","start":28620,"end":28860},{"words":"开","start":28940,"end":29180},{"words":"端","start":29200,"end":29555}]},{"sentences":"随着张骞出使西域一条以丝绸为主要货物的商路，","wordBg":29555,"wordEd":42085,"speaker_id":[0],"words":[{"words":"随","start":36290,"end":36530},{"words":"着","start":36530,"end":36650},{"words":"张","start":36650,"end":36870},{"words":"骞","start":36870,"end":37110},{"words":"出","start":37130,"end":37330},{"words":"使","start":37330,"end":37570},{"words":"西","start":37650,"end":37850},{"words":"域","start":37850,"end":38145},{"words":"一","start":39360,"end":39540},{"words":"条","start":39540,"end":39720},{"words":"以","start":39720,"end":39920},{"words":"丝","start":39920,"end":40160},{"words":"绸","start":40180,"end":40420},{"words":"为","start":40420,"end":40620},{"words":"主","start":40620,"end":40760},{"words":"要","start":40760,"end":40960},{"words":"货","start":40960,"end":41180},{"words":"物","start":41180,"end":41340},{"words":"的","start":41340,"end":41480},{"words":"商","start":41480,"end":41720},{"words":"路","start":41760,"end":42085}]},{"sentences":"从汉帝国的都城长安出发，","wordBg":42085,"wordEd":45485,"speaker_id":[0],"words":[{"words":"从","start":42790,"end":43030},{"words":"汉","start":43050,"end":43290},{"words":"帝","start":43330,"end":43490},{"words":"国","start":43490,"end":43670},{"words":"的","start":43670,"end":43810},{"words":"都","start":43810,"end":44010},{"words":"城","start":44010,"end":44250},{"words":"长","start":44450,"end":44690},{"words":"安","start":44730,"end":44970},{"words":"出","start":44990,"end":45190},{"words":"发","start":45190,"end":45485}]},{"sentences":"经过河西走廊，","wordBg":45485,"wordEd":47995,"speaker_id":[0],"words":[{"words":"经","start":46510,"end":46690},{"words":"过","start":46690,"end":46930},{"words":"河","start":46970,"end":47210},{"words":"西","start":47210,"end":47450},{"words":"走","start":47470,"end":47670},{"words":"廊","start":47670,"end":47995}]},{"sentences":"越过被古代中国人称为聪岭的帕米尔高原，","wordBg":47995,"wordEd":52595,"speaker_id":[0],"words":[{"words":"越","start":48860,"end":49060},{"words":"过","start":49060,"end":49300},{"words":"被","start":49320,"end":49500},{"words":"古","start":49500,"end":49660},{"words":"代","start":49660,"end":49860},{"words":"中","start":49860,"end":50000},{"words":"国","start":50000,"end":50180},{"words":"人","start":50180,"end":50380},{"words":"称","start":50380,"end":50520},{"words":"为","start":50520,"end":50720},{"words":"聪","start":50720,"end":50940},{"words":"岭","start":50940,"end":51180},{"words":"的","start":51180,"end":51400},{"words":"帕","start":51400,"end":51580},{"words":"米","start":51580,"end":51760},{"words":"尔","start":51760,"end":52000},{"words":"高","start":52020,"end":52240},{"words":"原","start":52240,"end":52595}]},{"sentences":"走向中亚西亚，","wordBg":52595,"wordEd":55265,"speaker_id":[0],"words":[{"words":"走","start":53690,"end":53930},{"words":"向","start":53930,"end":54170},{"words":"中","start":54310,"end":54510},{"words":"亚","start":54510,"end":54750},{"words":"西","start":54810,"end":54970},{"words":"亚","start":54970,"end":55265}]},{"sentences":"直至地中海陕西博物馆昂首远眺的鎏金铜蚕，","wordBg":55265,"wordEd":67255,"speaker_id":[0],"words":[{"words":"直","start":56100,"end":56340},{"words":"至","start":56340,"end":56580},{"words":"地","start":56600,"end":56840},{"words":"中","start":56860,"end":57080},{"words":"海","start":57080,"end":57495},{"words":"陕","start":62670,"end":62910},{"words":"西","start":62950,"end":63190},{"words":"博","start":63190,"end":63290},{"words":"物","start":63290,"end":63450},{"words":"馆","start":63450,"end":63835},{"words":"昂","start":65080,"end":65280},{"words":"首","start":65280,"end":65520},{"words":"远","start":65520,"end":65740},{"words":"眺","start":65740,"end":65980},{"words":"的","start":65980,"end":66160},{"words":"鎏","start":66160,"end":66320},{"words":"金","start":66320,"end":66560},{"words":"铜","start":66640,"end":66840},{"words":"蚕","start":66840,"end":67255}]},{"sentences":"来自拜占庭帝国的金币，","wordBg":67255,"wordEd":70355,"speaker_id":[0],"words":[{"words":"来","start":68210,"end":68410},{"words":"自","start":68410,"end":68630},{"words":"拜","start":68630,"end":68810},{"words":"占","start":68810,"end":69050},{"words":"庭","start":69050,"end":69250},{"words":"帝","start":69250,"end":69450},{"words":"国","start":69450,"end":69630},{"words":"的","start":69630,"end":69770},{"words":"金","start":69770,"end":69970},{"words":"币","start":69970,"end":70355}]},{"sentences":"共同见证了古丝绸之路的繁华。","wordBg":70355,"wordEd":74935,"speaker_id":[0],"words":[{"words":"共","start":71460,"end":71700},{"words":"同","start":71700,"end":71940},{"words":"见","start":72100,"end":72280},{"words":"证","start":72280,"end":72520},{"words":"了","start":72520,"end":72760},{"words":"古","start":73000,"end":73240},{"words":"丝","start":73380,"end":73580},{"words":"绸","start":73580,"end":73820},{"words":"之","start":73840,"end":74060},{"words":"路","start":74060,"end":74160},{"words":"的","start":74160,"end":74320},{"words":"繁","start":74320,"end":74560},{"words":"华","start":74580,"end":74935}]},{"sentences":"古罗马作家普灵尼在博物志中写道，","wordBg":74935,"wordEd":80530,"speaker_id":[0],"words":[{"words":"古","start":77350,"end":77510},{"words":"罗","start":77510,"end":77670},{"words":"马","start":77670,"end":77890},{"words":"作","start":77890,"end":78090},{"words":"家","start":78090,"end":78330},{"words":"普","start":78330,"end":78510},{"words":"灵","start":78510,"end":78690},{"words":"尼","start":78690,"end":78930},{"words":"在","start":79030,"end":79270},{"words":"博","start":79330,"end":79530},{"words":"物","start":79530,"end":79690},{"words":"志","start":79690,"end":79870},{"words":"中","start":79870,"end":80090},{"words":"写","start":80090,"end":80290},{"words":"道","start":80290,"end":80530}]},{"sentences":"为了获得中国的丝绸，","wordBg":80530,"wordEd":82670,"speaker_id":[0],"words":[{"words":"为","start":81010,"end":81190},{"words":"了","start":81190,"end":81330},{"words":"获","start":81330,"end":81550},{"words":"得","start":81550,"end":81710},{"words":"中","start":81710,"end":81910},{"words":"国","start":81910,"end":82070},{"words":"的","start":82070,"end":82210},{"words":"丝","start":82210,"end":82430},{"words":"绸","start":82430,"end":82670}]},{"sentences":"罗马每年的花费不少于一亿罗马金币。","wordBg":82670,"wordEd":87565,"speaker_id":[0],"words":[{"words":"罗","start":83150,"end":83390},{"words":"马","start":83390,"end":83630},{"words":"每","start":83630,"end":83870},{"w
```
