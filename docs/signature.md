## 一. 公共参数

公共参数是用于标识用户和接口签名的参数，如非必要，在每个接口单独的文档中不再对这些参数进行说明，但每次请求均需要携带这些参数，才能正常发起请求。

### 1. 数据协议总则

* 通讯协议：平台向外开放的通讯协议采用HTTPS协议和WSS
* 编码：默认使用UTF-8，否则中文字符可能为乱码

### 2. 签名key

客户首先需要与商务沟通，获得X-App-Key和X-App-Secret：

* X-App-Key
  唯一的用户ID， 举例 "zmeet"；一般俗称为 application id 或 application key.
* X-App-Secret
  用户密匙， 举例 "ba9e07dc-1d79-4f7a-ab49-0205d3c0e073", 一般俗称为 application secret.

### 3. 请求数据格式

JSON, Form(multipart/form-data), GET

### 4. 响应数据格式

JSON

### 5.认证 请求参数说明

在调用任何业务接口前，必须先取得授权，通过认证。取得授权的方式为在HTTP的请求头(HTTP HEADER)中输入正确的账号、时间戳及签名（X-App-Key、X-App-Signature、X-Timestamp）(同时也兼容在url参数中携带appid, ts, signa这三个参数，分别对应X-App-Key, X-Timestamp, X-App-Signature这三个头部字段)。说明如下：

| **序号** | **参数名**      | **类型** | **是否必填** | **说明**                                                     |
| -------- | --------------- | -------- | ------------ | ------------------------------------------------------------ |
| 1        | X-Timestamp     | string   | 是           | HTTP 请求头：X-Timestamp。当前 UNIX 时间戳，可记录发起 API 请求的时间。例如 1529223702。**注意：如果与服务器时间相差超过5分钟，会引起签名过期错误。** |
| 2        | X-App-Signature | string   | 是           | 根据客户拿到的Application Key和Application Secret计算出的数字签名，计算具体规则参考下述的示例代码 |
| 3        | X-App-Key       | string   | 是           | 客户申请到的Application Key                                  |

### 6. **响应参数说明**

| **序号** | **元素名称** | **父元素** | **类型** | **描述**                             |
| -------- | ------------ | ---------- | -------- | ------------------------------------ |
| 1        | code         | --         | string   | 响应状态码                           |
| 2        | msg          | --         | string   | 响应说明                             |
| 3        | result       | --         | string   | 响应结果，翻译出的内容存储在这个字段 |

## 二. 授权码生成

### 1. python

```python
import hashlib
import hmac
import time
import base64

def get_signature_flytek(ts, app_id, app_secret):
    tt = (app_id + ts).encode('utf-8')
    md5 = hashlib.md5()
    md5.update(tt)
    baseString = md5.hexdigest()
    baseString = bytes(baseString, encoding='utf-8')

    apiKey = app_secret.encode('utf-8')
    signa = hmac.new(apiKey, baseString, hashlib.sha1).digest()
    signa = base64.b64encode(signa)
    signa = str(signa, 'utf-8')
    return signa
```

### 2. Java

* Java示例(具体参考github Java目录代码)

```java
    // 生成握手参数
    public static String getHandShakeParams(String appId, String secretKey) {
        String ts = System.currentTimeMillis() / 1000 + "";
        String signa = "";
        try {
            signa = EncryptUtil.HmacSHA1Encrypt(EncryptUtil.MD5(appId + ts), secretKey);
            return "?appid=" + appId + "&ts=" + ts + "&signa=" + URLEncoder.encode(signa, "UTF-8");
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }
```

* Java基础工具类

```java
package com.abcpen.ai.rtasr.util;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;

public class EncryptUtil {

    /**
     * 加密数字签名（基于HMACSHA1算法）
     *
     * @param encryptText
     * @param encryptKey
     * @return
     * @throws SignatureException
     */
    public static String HmacSHA1Encrypt(String encryptText, String encryptKey) throws SignatureException {
        byte[] rawHmac = null;
        try {
            byte[] data = encryptKey.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(data, "HmacSHA1");
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(secretKey);
            byte[] text = encryptText.getBytes(StandardCharsets.UTF_8);
            rawHmac = mac.doFinal(text);
        } catch (InvalidKeyException e) {
            throw new SignatureException("InvalidKeyException:" + e.getMessage());
        } catch (NoSuchAlgorithmException e) {
            throw new SignatureException("NoSuchAlgorithmException:" + e.getMessage());
        }
        String oauth = new String(Base64.encodeBase64(rawHmac));

        return oauth;
    }

    public final static String MD5(String pstr) {
        char[] md5String = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};
        try {
            byte[] btInput = pstr.getBytes();
            MessageDigest mdInst = MessageDigest.getInstance("MD5");
            mdInst.update(btInput);
            byte[] md = mdInst.digest();
            int j = md.length;
            char[] str = new char[j * 2];
            int k = 0;
            for (int i = 0; i < j; i++) { // i = 0
                byte byte0 = md[i]; // 95
                str[k++] = md5String[byte0 >>> 4 & 0xf]; // 5
                str[k++] = md5String[byte0 & 0xf]; // F
            }

            return new String(str);
        } catch (Exception e) {
            return null;
        }
    }
}
```

### 3. kotlin

```kotlin
import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import java.util.Base64

fun getSignatureFlytek(ts: String, appId: String, appSecret: String): String {
    val tt = (appId + ts).toByteArray(Charsets.UTF_8)
    val md5 = MessageDigest.getInstance("MD5")
    val baseString = md5.digest(tt).joinToString("") { "%02x".format(it) }
        .toByteArray(Charsets.UTF_8)

    val apiKey = appSecret.toByteArray(Charsets.UTF_8)
    val hmac = Mac.getInstance("HmacSHA1")
    val secretKey = SecretKeySpec(apiKey, "HmacSHA1")
    hmac.init(secretKey)
    val signa = hmac.doFinal(baseString)
    val encodedSigna = Base64.getEncoder().encodeToString(signa)
    return encodedSigna
}

fun main() {
    val ts = System.currentTimeMillis().toString()
    val appId = "your_app_id"
    val appSecret = "your_app_secret"
    val signature = getSignatureFlytek(ts, appId, appSecret)
    println("Signature: $signature")
}

```

### 4. NodeJs

```js
const crypto = require('crypto');

function getSignatureFlytek(ts, appId, appSecret) {
    const tt = (appId + ts);
    const baseString = crypto.createHash('md5').update(tt, 'utf-8').digest('hex');

    const apiKey = Buffer.from(appSecret, 'utf-8');
    const hmac = crypto.createHmac('sha1', apiKey);
    const signa = hmac.update(baseString, 'utf-8').digest('binary');

    const encodedSigna = Buffer.from(signa, 'binary').toString('base64');
    return encodedSigna;
}

// Example usage:
const ts = Date.now().toString();
const appId = 'your_app_id';
const appSecret = 'your_app_secret';
const signature = getSignatureFlytek(ts, appId, appSecret);
console.log(`Signature: ${signature}`);

```

### 5. C++

```c++
#include <iostream>
#include <sstream>
#include <iomanip>
#include <openssl/md5.h>
#include <openssl/hmac.h>
#include <openssl/bio.h>
#include <openssl/evp.h>

std::string getSignatureFlytek(const std::string& ts, const std::string& appId, const std::string& appSecret) {
    std::string tt = appId + ts;

    // Calculate MD5
    unsigned char md5Result[MD5_DIGEST_LENGTH];
    MD5(reinterpret_cast<const unsigned char*>(tt.c_str()), tt.length(), md5Result);

    std::stringstream md5Stream;
    for (int i = 0; i < MD5_DIGEST_LENGTH; ++i) {
        md5Stream << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(md5Result[i]);
    }
    std::string baseString = md5Stream.str();

    // Calculate HMAC-SHA1
    unsigned char hmacResult[EVP_MAX_MD_SIZE];
    unsigned int hmacLen;
    HMAC(EVP_sha1(), appSecret.c_str(), appSecret.length(), reinterpret_cast<const unsigned char*>(baseString.c_str()), baseString.length(), hmacResult, &hmacLen);

    // Encode to base64
    BIO *bio, *b64;
    BIO_new(&bio);
    BIO_new(BIO_f_base64());
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    BIO_push(b64, bio);
    BIO_write(b64, hmacResult, hmacLen);
    BIO_flush(b64);

    char* encodedResult;
    long encodedLen = BIO_get_mem_data(b64, &encodedResult);
    std::string encodedSigna(encodedResult, encodedLen);

    // Clean up
    BIO_free_all(b64);

    return encodedSigna;
}

int main() {
    std::string ts = std::to_string(std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count());
    std::string appId = "your_app_id";
    std::string appSecret = "your_app_secret";

    std::string signature = getSignatureFlytek(ts, appId, appSecret);
    std::cout << "Signature: " << signature << std::endl;

    return 0;
}

```

### 6. Go

```golang
package main

import (
	"crypto/hmac"
	"crypto/md5" 
	"crypto/sha1"
	"encoding/base64"
	"encoding/hex"
	"fmt"
)

func getSignatureFlytek(ts string, appID string, appSecret string) string {
	
	tt := []byte(appID + ts)
	
	hash := md5.New()
	hash.Write(tt)
	baseString := hex.EncodeToString(hash.Sum(nil))
	
	apiKey := []byte(appSecret)
	h := hmac.New(sha1.New, apiKey)
	h.Write([]byte(baseString))
	signa := h.Sum(nil)
	
	return base64.StdEncoding.EncodeToString(signa)
}

func main() {
   ts := "1674496098"
   appID := "xxx"
   appSecret := "xxx"
   
   sign := getSignatureFlytek(ts, appID, appSecret)
   fmt.Println(sign)
}
```

### 7. Php

```php
<?php

function getSignatureFlytek($ts, $app_id, $app_secret) {

  $tt = $app_id . $ts;
  
  $md5 = md5($tt);
  $baseString = $md5;

  $apiKey = $app_secret;
  $signa = hash_hmac('sha1', $baseString, $apiKey, true);
  
  $signa = base64_encode($signa);

  return $signa; 

}


$ts = "1674496098";
$app_id = "xxx";
$app_secret = "xxx";

$sign = getSignatureFlytek($ts, $app_id, $app_secret);

echo $sign;

?>
```



### 8. C#

````c#
using System;
using System.Security.Cryptography;
using System.Text;

class SignatureGenerator 
{
  static string GetSignatureFlytek(string ts, string appId, string appSecret) 
  {
    byte[] tt = Encoding.UTF8.GetBytes(appId + ts);
    
    MD5 md5 = MD5.Create();
    byte[] hash = md5.ComputeHash(tt);

    string baseString = BitConverter.ToString(hash).Replace("-", "").ToLower();

    byte[] apiKey = Encoding.UTF8.GetBytes(appSecret);
   
    using (HMACSHA1 hmac = new HMACSHA1(apiKey))
    {
      byte[] signa = hmac.ComputeHash(Encoding.UTF8.GetBytes(baseString));
      return Convert.ToBase64String(signa);  
    }
  }

  static void Main() 
  {
    string ts = "1674496098";
    string appId = "xxx";
    string appSecret = "xxx";
      
    string sign = GetSignatureFlytek(ts, appId, appSecret); 
    Console.WriteLine(sign);
  }
}
````

