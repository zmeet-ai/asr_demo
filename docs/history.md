
## 接口变动
从2024年起，主路径接口发生如下变动
### 语音识别接口(在线)
```json
/v1/asr 修改为 /asr/v1 #暂时不要调用，有待维护
/v2/asr 修改为 /asr/v2 
```
### 语音识别接口(离线)
```json
从"/v2/asr"和"/v1/asr"统一修改为"/asr-rec/v2" 
```

### nlp接口
```json
/v2/nlp 修改为  /nlp/v2
```

### 给天翼云的鉴权接口
```json
/v2/auth 修改为 /auth/v2
```

### 说话人分离接口
```
/v1/asr/sd 和 /v2/asr/sd 开通的api路径 统一合并到 /asr/v2/long/create
```

## 离线识别接口
### 离线识别接口发生了重大变动，该接口涵盖如下功能，具体以audio_type这个字段做区分
* asr: 只做语音识别
* asr_sd: 语音识别+说话人区分
* asr_sd_id: 语音识别+说话人区分+说话人识别
* audio_separate: 人声分离
* audio_separate_asr: 语音识别+说话人区分
* audio_separate_asr_sd: 语音识别+说话人区分+人声分离
* audio_separate_asr_sd_id: 语音识别+说话人区分+说话人识别+人声分离
具体变动参考 <a>https://github.com/zmeet-ai/asr-sdk-v2/blob/main/docs/asr-offline.md</a>
