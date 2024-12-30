# 声纹识别API文档
## 注册声纹
###  POST /register
注册说话人的声纹信息到系统中。
- 请求参数:

| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| spk_name | string | 是 | 说话人名称,在org_id和tag_id组合内唯一 |
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| audio_preprocess | string | 否 | 是否进行音频预处理,默认"false" |
| audio | file | 是 | 音频文件 |
| app_id | string | 是 | 应用ID(通过认证获取) |
- 响应:
```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "audio_url": "音频文件URL"
    }
}
```

## 更新声纹
### POST /update
更新已存在说话人的声纹信息。
-  请求参数:
| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| spk_name | string | 是 | 说话人名称 |
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| audio | file | 是 | 新的音频文件 |
| app_id | string | 是 | 应用ID(通过认证获取) |

- 响应:
```json
{
    "code": "0", 
    "msg": "success",
    "data": {
        "audio_url": "音频文件URL"
    }
}
```

## 声纹识别
### POST /recognize
对上传的音频进行声纹识别。
- 请求参数:
| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| audio | file | 是 | 待识别的音频文件 |
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| audio_preprocess | string | 否 | 是否进行音频预处理,默认"false" |
| vad_splits | string | 否 | 是否进行语音活动检测分段,默认"true" |
| app_id | string | 是 | 应用ID(通过认证获取) |
- 响应:
```json
{
    "code": "0",
    "msg": "success", 
    "data": [
        {
            "spk_name": "说话人名称",
            "audio_path": "音频路径",
            "score": "匹配得分",
            "tag_id": "标签ID"
        }
    ]
}
```
## 获取声纹音频URL
### GET /voice-url
- 请求参数:
| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| spk_name | string | 是 | 说话人名称 |
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| app_id | string | 是 | 应用ID(通过认证获取) |
- 响应:
```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "audio_path": "音频文件路径"
    }
}
```
## 获取声纹列表
### GET /list
- 请求参数:
| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| offset | integer | 否 | 分页偏移量,默认0 |
| limit | integer | 否 | 每页记录数,默认20 |
| app_id | string | 是 | 应用ID(通过认证获取) |
- 响应:
```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "spk_name": "说话人名称",
            "audio_path": "音频路径"
        }
    ]
}
```
获取声纹数量
GET /count
- 请求参数:
| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| app_id | string | 是 | 应用ID(通过认证获取) |

- 响应:
```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "count": 声纹数量
    }
}
```

删除声纹
GET /delete-speakers
- 请求参数:
| 参数名 | 类型 | 是否必需 | 描述 |
|--------|------|----------|------|
| org_id | string | 是 | 组织ID |
| tag_id | string | 是 | 标签ID |
| speakers | array | 否 | 要删除的说话人列表 |
| app_id | string | 是 | 应用ID(通过认证获取) |
- 响应:
```json
{
    "code": "0",
    "msg": "success",
    "data": "删除结果"
}
```

## 注意事项:

* 所有接口的参数名称(spk_name、app_id、org_id、tag_id)只能包含字母数字,不能包含特殊字符

* 所有接口都需要通过认证获取app_id

* 错误码说明:
    * 0: 成功
    * 10002: 操作失败
    * 10003: 识别失败
    * 10106: 系统错误
    * 10111: HTTP异常